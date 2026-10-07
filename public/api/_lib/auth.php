<?php
/**
 * Staff authentication: password hashing, DB-backed sessions, CSRF, roles,
 * TOTP two-factor and the audit log.
 */

declare(strict_types=1);

defined('OH_API') || exit;

const ROLES = ['admin', 'editor'];

// Idle / absolute session lifetimes (seconds).
const SESSION_IDLE = 2 * 3600;
const SESSION_MAX = 12 * 3600;
const REMEMBER_IDLE = 7 * 86400;
const REMEMBER_MAX = 30 * 86400;

// ---------------------------------------------------------------------------
// Passwords
// ---------------------------------------------------------------------------

function password_algo()
{
    return defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
}

function hash_password(string $password): string
{
    return password_hash($password, password_algo());
}

/** Returns an error message, or null when the password is acceptable. */
function password_problem(string $password, string $email = ''): ?string
{
    $len = mb_strlen($password);
    if ($len < 12) {
        return 'Use at least 12 characters.';
    }
    if ($len > 128) {
        return 'Use 128 characters or fewer.';
    }
    if (count(array_unique(mb_str_split($password))) < 5) {
        return 'This password is too simple.';
    }
    $local = (string) strstr($email, '@', true);
    if (mb_strlen($local) >= 4 && stripos($password, $local) !== false) {
        return "Don't include your email address in your password.";
    }
    return null;
}

/** Creates a single-use reset token (only its hash is stored) and returns the raw token. */
function issue_reset_token(int $userId, int $ttl): string
{
    $token = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    q('UPDATE password_resets SET used_at = ? WHERE user_id = ? AND used_at IS NULL', [now_utc(), $userId]);
    q('INSERT INTO password_resets (user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)', [
        $userId, hash('sha256', $token), gmdate('Y-m-d H:i:s', time() + $ttl), now_utc(),
    ]);
    return $token;
}

// ---------------------------------------------------------------------------
// Sessions (token in an HttpOnly cookie, only its SHA-256 stored server-side)
// ---------------------------------------------------------------------------

function session_cookie_name(): string
{
    // The __Host- prefix makes browsers enforce Secure + Path=/ + no Domain.
    return is_https() ? '__Host-oh_session' : 'oh_session';
}

function set_cookie(string $name, string $value, int $expires, bool $httpOnly, string $sameSite): void
{
    setcookie($name, $value, [
        'expires' => $expires,
        'path' => '/',
        'secure' => is_https(),
        'httponly' => $httpOnly,
        'samesite' => $sameSite,
    ]);
}

/**
 * Non-secret hint cookie so the public header can show an "Admin" link.
 * It grants nothing: every API call is still checked against the real session.
 */
function set_staff_hint(bool $on, int $expires = 0): void
{
    set_cookie('oh_staff', $on ? '1' : '', $on ? $expires : time() - 3600, false, 'Lax');
}

function create_session(array $user, bool $remember): array
{
    $token = bin2hex(random_bytes(32));
    $csrf = bin2hex(random_bytes(32));
    $now = time();
    $expires = $now + ($remember ? REMEMBER_MAX : SESSION_MAX);

    q(
        'INSERT INTO sessions (id, user_id, csrf_token, remember, ip, user_agent, created_at, last_seen_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [hash('sha256', $token), $user['id'], $csrf, $remember ? 1 : 0, client_ip(), user_agent(), now_utc(), now_utc(), gmdate('Y-m-d H:i:s', $expires)]
    );
    q('UPDATE users SET last_login_at = ? WHERE id = ?', [now_utc(), $user['id']]);

    $cookieExpiry = $remember ? $expires : 0; // 0 = browser-session cookie
    set_cookie(session_cookie_name(), $token, $cookieExpiry, true, 'Strict');
    set_staff_hint(true, $cookieExpiry);

    // Occasionally purge expired sessions.
    if (random_int(1, 20) === 1) {
        q('DELETE FROM sessions WHERE expires_at < ?', [now_utc()]);
    }
    return ['csrf' => $csrf];
}

/** @return array{session: array, user: array}|null */
function current_session(): ?array
{
    static $cache = false;
    if ($cache !== false) {
        return $cache;
    }
    $cache = null;

    $token = $_COOKIE[session_cookie_name()] ?? '';
    if (!is_string($token) || !preg_match('/^[a-f0-9]{64}$/', $token)) {
        return null;
    }
    $row = q(
        'SELECT s.id AS sid, s.csrf_token, s.remember, s.last_seen_at, s.expires_at,
                u.id, u.email, u.name, u.role, u.is_active, u.totp_enabled
           FROM sessions s JOIN users u ON u.id = s.user_id
          WHERE s.id = ?',
        [hash('sha256', $token)]
    )->fetch();
    if (!$row) {
        return null;
    }

    $now = time();
    $idle = $row['remember'] ? REMEMBER_IDLE : SESSION_IDLE;
    $expired = strtotime($row['expires_at'] . ' UTC') < $now || strtotime($row['last_seen_at'] . ' UTC') < $now - $idle;
    if ($expired || !(int) $row['is_active']) {
        q('DELETE FROM sessions WHERE id = ?', [$row['sid']]);
        return null;
    }
    if (strtotime($row['last_seen_at'] . ' UTC') < $now - 60) {
        q('UPDATE sessions SET last_seen_at = ? WHERE id = ?', [now_utc(), $row['sid']]);
    }

    $cache = [
        'session' => ['id' => $row['sid'], 'csrf' => $row['csrf_token']],
        'user' => [
            'id' => (int) $row['id'],
            'email' => $row['email'],
            'name' => $row['name'],
            'role' => $row['role'],
            'totp_enabled' => (bool) $row['totp_enabled'],
        ],
    ];
    return $cache;
}

function destroy_current_session(): void
{
    $s = current_session();
    if ($s) {
        q('DELETE FROM sessions WHERE id = ?', [$s['session']['id']]);
    }
    set_cookie(session_cookie_name(), '', time() - 3600, true, 'Strict');
    set_staff_hint(false);
}

/**
 * Authorisation gate for every protected endpoint. Checks the session, the role
 * and — for anything that changes state — the CSRF token header.
 */
function require_auth(array $roles = ROLES): array
{
    $s = current_session();
    if (!$s) {
        fail(401, 'Your session has expired. Please sign in again.');
    }
    if (!in_array($s['user']['role'], $roles, true)) {
        fail(403, "You don't have permission to do that.");
    }
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
        $sent = (string) ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
        if ($sent === '' || !hash_equals($s['session']['csrf'], $sent)) {
            fail(403, 'Security token mismatch. Reload the page and try again.');
        }
    }
    return $s['user'];
}

// ---------------------------------------------------------------------------
// TOTP two-factor (RFC 6238, 30 s steps, 6 digits)
// ---------------------------------------------------------------------------

function base32_encode(string $bin): string
{
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $bits = '';
    foreach (str_split($bin) as $c) {
        $bits .= str_pad(decbin(ord($c)), 8, '0', STR_PAD_LEFT);
    }
    $out = '';
    foreach (str_split($bits, 5) as $chunk) {
        $out .= $alphabet[bindec(str_pad($chunk, 5, '0'))];
    }
    return $out;
}

function base32_decode(string $b32): string
{
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $bits = '';
    foreach (str_split(strtoupper(rtrim($b32, '='))) as $c) {
        $i = strpos($alphabet, $c);
        if ($i === false) {
            return '';
        }
        $bits .= str_pad(decbin($i), 5, '0', STR_PAD_LEFT);
    }
    $out = '';
    foreach (str_split($bits, 8) as $byte) {
        if (strlen($byte) === 8) {
            $out .= chr(bindec($byte));
        }
    }
    return $out;
}

function totp_at(string $secretB32, int $step): string
{
    $hash = hash_hmac('sha1', pack('J', $step), base32_decode($secretB32), true);
    $offset = ord($hash[19]) & 0x0f;
    $code = ((ord($hash[$offset]) & 0x7f) << 24) | (ord($hash[$offset + 1]) << 16) | (ord($hash[$offset + 2]) << 8) | ord($hash[$offset + 3]);
    return str_pad((string) ($code % 1000000), 6, '0', STR_PAD_LEFT);
}

/** Returns the matched time step (±1 step of drift), or null. Rejects steps already used. */
function totp_verify(string $secretB32, string $code, ?int $lastStep): ?int
{
    $code = preg_replace('/\s+/', '', $code) ?? '';
    if (!preg_match('/^\d{6}$/', $code)) {
        return null;
    }
    $now = intdiv(time(), 30);
    foreach ([0, -1, 1] as $drift) {
        $step = $now + $drift;
        if ($lastStep !== null && $step <= $lastStep) {
            continue;
        }
        if (hash_equals(totp_at($secretB32, $step), $code)) {
            return $step;
        }
    }
    return null;
}

function app_key(): string
{
    $raw = (string) config('app_key', '');
    if (strlen($raw) < 32) {
        fail(503, 'Two-factor authentication is not configured on the server (app_key).');
    }
    return hash('sha256', $raw, true);
}

function encrypt_secret(string $plain): string
{
    $iv = random_bytes(12);
    $tag = '';
    $cipher = openssl_encrypt($plain, 'aes-256-gcm', app_key(), OPENSSL_RAW_DATA, $iv, $tag);
    return base64_encode($iv . $tag . $cipher);
}

function decrypt_secret(string $stored): ?string
{
    $bin = base64_decode($stored, true);
    if ($bin === false || strlen($bin) < 29) {
        return null;
    }
    $plain = openssl_decrypt(substr($bin, 28), 'aes-256-gcm', app_key(), OPENSSL_RAW_DATA, substr($bin, 0, 12), substr($bin, 12, 16));
    return $plain === false ? null : $plain;
}

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

function audit(?array $user, string $action, string $target = '', array $details = []): void
{
    q(
        'INSERT INTO audit_log (user_id, user_email, action, target, details, ip, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
            $user['id'] ?? null,
            $user['email'] ?? null,
            $action,
            $target !== '' ? mb_substr($target, 0, 190) : null,
            $details ? json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null,
            client_ip(),
            now_utc(),
        ]
    );
}

function public_user(array $u): array
{
    return [
        'id' => (int) $u['id'],
        'email' => $u['email'],
        'name' => $u['name'],
        'role' => $u['role'],
        'totpEnabled' => (bool) ($u['totp_enabled'] ?? false),
    ];
}
