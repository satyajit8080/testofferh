<?php
/**
 * Staff authentication API.
 *   GET  ?action=me            → current user + CSRF token (401 if signed out)
 *   GET  ?action=setup_status  → whether first-admin setup is available
 *   POST ?action=login | logout | forgot | reset | setup | change_password
 *   POST ?action=totp_begin | totp_enable | totp_disable
 */

declare(strict_types=1);

require __DIR__ . '/_lib/bootstrap.php';
require __DIR__ . '/_lib/auth.php';

const GENERIC_LOGIN_ERROR = 'Incorrect email or password.';
const GENERIC_RESET_ERROR = 'This reset link is invalid or has expired. Please request a new one.';

$action = query('action', 40);
$method = guard_request(['GET', 'POST']);

switch ($method . ' ' . $action) {
    case 'GET me':
        $s = current_session();
        if (!$s) {
            set_staff_hint(false);
            fail(401, 'Not signed in.');
        }
        respond(200, ['ok' => true, 'user' => public_user($s['user']), 'csrf' => $s['session']['csrf']]);

    case 'GET setup_status':
        respond(200, ['ok' => true, 'available' => setup_available()]);

    case 'POST login':
        login();

    case 'POST logout':
        $user = require_auth();
        audit($user, 'auth.logout');
        destroy_current_session();
        respond(200, ['ok' => true]);

    case 'POST forgot':
        forgot();

    case 'POST reset':
        reset_password();

    case 'POST setup':
        setup();

    case 'POST change_password':
        change_password();

    case 'POST totp_begin':
        $user = require_auth();
        if ($user['totp_enabled']) {
            fail(409, 'Two-factor authentication is already enabled.');
        }
        $secret = base32_encode(random_bytes(20));
        q('UPDATE users SET totp_secret = ? WHERE id = ? AND totp_enabled = 0', [encrypt_secret($secret), $user['id']]);
        $label = rawurlencode('Offerhost:' . $user['email']);
        respond(200, [
            'ok' => true,
            'secret' => $secret,
            'uri' => "otpauth://totp/$label?secret=$secret&issuer=Offerhost&algorithm=SHA1&digits=6&period=30",
        ]);

    case 'POST totp_enable':
        $user = require_auth();
        $row = q('SELECT totp_secret, totp_enabled FROM users WHERE id = ?', [$user['id']])->fetch();
        $secret = $row && $row['totp_secret'] ? decrypt_secret($row['totp_secret']) : null;
        if (!$secret || $row['totp_enabled']) {
            fail(409, 'Start two-factor setup again.');
        }
        $step = totp_verify($secret, str_in('code', 10), null);
        if ($step === null) {
            fail(422, 'That code is not valid. Check the time on your device and try again.', ['code' => 'Invalid code.']);
        }
        q('UPDATE users SET totp_enabled = 1, totp_last_step = ? WHERE id = ?', [$step, $user['id']]);
        audit($user, 'auth.2fa_enabled');
        respond(200, ['ok' => true]);

    case 'POST totp_disable':
        $user = require_auth();
        $row = q('SELECT password_hash, totp_secret, totp_last_step FROM users WHERE id = ?', [$user['id']])->fetch();
        $secret = $row['totp_secret'] ? decrypt_secret($row['totp_secret']) : null;
        if (!password_verify(str_in('password', 200), $row['password_hash'])
            || !$secret || totp_verify($secret, str_in('code', 10), $row['totp_last_step'] !== null ? (int) $row['totp_last_step'] : null) === null) {
            fail(422, 'Your password or authentication code is incorrect.');
        }
        q('UPDATE users SET totp_enabled = 0, totp_secret = NULL, totp_last_step = NULL WHERE id = ?', [$user['id']]);
        audit($user, 'auth.2fa_disabled');
        respond(200, ['ok' => true]);

    default:
        fail(404, 'Unknown action.');
}

// ---------------------------------------------------------------------------

function login(): void
{
    $email = strtolower(line_in('email', 190));
    $password = str_in('password', 200);
    $code = str_in('code', 10);
    $ip = client_ip();

    if ($email === '' || $password === '') {
        fail(422, 'Enter your email and password.');
    }

    // Per-IP and per-account limits. Applied to every email, existing or not, so the
    // response never reveals whether an account exists.
    if (!rate_limit("login:ip:$ip", 30, 900) || !rate_limit("login:email:$email", 8, 900)) {
        fail(429, 'Too many sign-in attempts. Please wait 15 minutes and try again.');
    }

    $user = q('SELECT * FROM users WHERE email = ?', [$email])->fetch();
    if (!$user) {
        hash_password($password); // equalise timing with the real check
        fail(401, GENERIC_LOGIN_ERROR);
    }
    if (!password_verify($password, $user['password_hash']) || !(int) $user['is_active']) {
        audit(['id' => $user['id'], 'email' => $user['email']], 'auth.login_failed');
        fail(401, GENERIC_LOGIN_ERROR);
    }

    if ((int) $user['totp_enabled']) {
        if ($code === '') {
            respond(200, ['ok' => false, 'mfaRequired' => true]);
        }
        $secret = $user['totp_secret'] ? decrypt_secret($user['totp_secret']) : null;
        $step = $secret ? totp_verify($secret, $code, $user['totp_last_step'] !== null ? (int) $user['totp_last_step'] : null) : null;
        if ($step === null) {
            audit(['id' => $user['id'], 'email' => $user['email']], 'auth.login_failed_2fa');
            respond(401, ['ok' => false, 'mfaRequired' => true, 'error' => 'That authentication code is not valid.']);
        }
        q('UPDATE users SET totp_last_step = ? WHERE id = ?', [$step, $user['id']]);
    }

    if (password_needs_rehash($user['password_hash'], password_algo())) {
        q('UPDATE users SET password_hash = ? WHERE id = ?', [hash_password($password), $user['id']]);
    }

    rate_limit_reset("login:email:$email");
    $session = create_session($user, bool_in('remember'));
    audit($user, 'auth.login', '', ['remember' => bool_in('remember')]);
    respond(200, ['ok' => true, 'user' => public_user($user), 'csrf' => $session['csrf']]);
}

function forgot(): void
{
    $email = strtolower(line_in('email', 190));
    $generic = ['ok' => true, 'message' => "If an account exists for that email, we've sent a link to reset the password. It expires in 1 hour."];

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        fail(422, 'Enter a valid email address.', ['email' => 'Enter a valid email address.']);
    }
    if (!rate_limit('forgot:ip:' . client_ip(), 10, 3600)) {
        fail(429, 'Too many requests. Please try again later.');
    }
    // Silently stop repeated mails to one address, but answer the same way.
    if (!rate_limit("forgot:email:$email", 3, 3600)) {
        respond(200, $generic);
    }

    $user = q('SELECT id, email, name, is_active FROM users WHERE email = ?', [$email])->fetch();
    if ($user && (int) $user['is_active']) {
        $token = issue_reset_token((int) $user['id'], 3600);
        $link = rtrim((string) config('site_url', ''), '/') . '/admin/reset-password/?token=' . $token;
        send_mail($user['email'], 'Reset your Offerhost admin password', implode("\n", [
            "Hello {$user['name']},",
            '',
            'Someone (hopefully you) asked to reset the password for your Offerhost admin account.',
            'Open this link within 1 hour to choose a new password:',
            '',
            $link,
            '',
            "If you didn't request this, you can ignore this email; your password won't change.",
        ]));
        audit(['id' => $user['id'], 'email' => $user['email']], 'auth.reset_requested');
    }
    respond(200, $generic);
}

function reset_password(): void
{
    if (!rate_limit('reset:ip:' . client_ip(), 10, 3600)) {
        fail(429, 'Too many attempts. Please try again later.');
    }
    $token = str_in('token', 100);
    $password = str_in('password', 200);
    if (!preg_match('/^[A-Za-z0-9_-]{40,60}$/', $token)) {
        fail(400, GENERIC_RESET_ERROR);
    }
    $row = q(
        'SELECT r.id AS rid, u.id, u.email, u.is_active FROM password_resets r JOIN users u ON u.id = r.user_id
          WHERE r.token_hash = ? AND r.used_at IS NULL AND r.expires_at > ?',
        [hash('sha256', $token), now_utc()]
    )->fetch();
    if (!$row || !(int) $row['is_active']) {
        fail(400, GENERIC_RESET_ERROR);
    }
    if ($problem = password_problem($password, $row['email'])) {
        fail(422, $problem, ['password' => $problem]);
    }

    q('UPDATE users SET password_hash = ? WHERE id = ?', [hash_password($password), $row['id']]);
    q('UPDATE password_resets SET used_at = ? WHERE id = ?', [now_utc(), $row['rid']]);
    q('DELETE FROM sessions WHERE user_id = ?', [$row['id']]); // sign out everywhere
    audit(['id' => $row['id'], 'email' => $row['email']], 'auth.password_reset');
    respond(200, ['ok' => true]);
}

function setup_available(): bool
{
    if ((string) config('setup_token', '') === '' || !db_configured()) {
        return false;
    }
    return (int) q('SELECT COUNT(*) FROM users')->fetchColumn() === 0;
}

function setup(): void
{
    if (!rate_limit('setup:ip:' . client_ip(), 10, 3600)) {
        fail(429, 'Too many attempts. Please try again later.');
    }
    if (!setup_available()) {
        fail(403, 'Setup is not available.');
    }
    if (!hash_equals((string) config('setup_token'), str_in('token', 200))) {
        fail(403, 'The setup token is incorrect.', ['token' => 'Incorrect setup token.']);
    }

    $name = line_in('name', 100);
    $email = strtolower(line_in('email', 190));
    $password = str_in('password', 200);
    $errors = [];
    if ($name === '') {
        $errors['name'] = 'Enter your name.';
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Enter a valid email address.';
    }
    if ($problem = password_problem($password, $email)) {
        $errors['password'] = $problem;
    }
    if ($errors) {
        fail(422, 'Please check the highlighted fields.', $errors);
    }

    q('INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)', [$email, $name, hash_password($password), 'admin']);
    $id = (int) db()->lastInsertId();
    audit(['id' => $id, 'email' => $email], 'auth.setup_first_admin');
    respond(200, ['ok' => true]);
}

function change_password(): void
{
    $user = require_auth();
    if (!rate_limit('chpw:user:' . $user['id'], 10, 3600)) {
        fail(429, 'Too many attempts. Please try again later.');
    }
    $row = q('SELECT password_hash FROM users WHERE id = ?', [$user['id']])->fetch();
    if (!password_verify(str_in('current', 200), $row['password_hash'])) {
        fail(422, 'Your current password is incorrect.', ['current' => 'Incorrect password.']);
    }
    $password = str_in('password', 200);
    if ($problem = password_problem($password, $user['email'])) {
        fail(422, $problem, ['password' => $problem]);
    }
    $s = current_session();
    q('UPDATE users SET password_hash = ? WHERE id = ?', [hash_password($password), $user['id']]);
    // Keep this session, sign out every other device.
    q('DELETE FROM sessions WHERE user_id = ? AND id <> ?', [$user['id'], $s['session']['id']]);
    audit($user, 'auth.password_changed');
    respond(200, ['ok' => true]);
}
