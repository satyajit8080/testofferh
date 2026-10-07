<?php
/**
 * Shared bootstrap for every API endpoint: config, JSON responses, request checks,
 * database, rate limiting and mail. Endpoints include this file first.
 */

declare(strict_types=1);

const OH_API = true;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: same-origin');

// Never leak warnings/stack traces into responses; they go to the server error log.
ini_set('display_errors', '0');
error_reporting(E_ALL);

set_exception_handler(function (Throwable $e): void {
    error_log('[offerhost-api] ' . get_class($e) . ': ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    respond(500, ['ok' => false, 'error' => 'Something went wrong. Please try again.']);
});

// ---------------------------------------------------------------------------
// Config — lives OUTSIDE public_html (see server/offerhost-config.example.php)
// ---------------------------------------------------------------------------

function config(string $path, $default = null)
{
    static $cfg = null;
    if ($cfg === null) {
        $file = getenv('OFFERHOST_CONFIG') ?: dirname(__DIR__, 3) . '/offerhost-config.php';
        $cfg = is_file($file) ? (require $file) : [];
        if (!is_array($cfg)) {
            $cfg = [];
        }
    }
    $node = $cfg;
    foreach (explode('.', $path) as $key) {
        if (!is_array($node) || !array_key_exists($key, $node)) {
            return $default;
        }
        $node = $node[$key];
    }
    return $node;
}

// ---------------------------------------------------------------------------
// Responses & input
// ---------------------------------------------------------------------------

/** @return never */
function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** @return never */
function fail(int $status, string $error, array $fields = []): void
{
    $body = ['ok' => false, 'error' => $error];
    if ($fields) {
        $body['fields'] = $fields;
    }
    respond($status, $body);
}

/** JSON body (admin/auth APIs) or form fields (contact form). */
function input(): array
{
    static $data = null;
    if ($data !== null) {
        return $data;
    }
    $type = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($type, 'application/json') !== false) {
        $raw = file_get_contents('php://input', false, null, 0, 1_000_000);
        $decoded = json_decode((string) $raw, true);
        $data = is_array($decoded) ? $decoded : [];
    } else {
        $data = $_POST;
    }
    return $data;
}

function str_in(string $key, int $max = 1000): string
{
    $v = input()[$key] ?? '';
    if (is_int($v) || is_float($v)) {
        $v = (string) $v;
    }
    if (!is_string($v)) {
        return '';
    }
    // Strip control characters except newlines/tabs; normalise line endings.
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', str_replace("\r\n", "\n", $v)) ?? '';
    return mb_substr(trim($v), 0, $max);
}

/** Single-line string: also removes newlines (safe for mail headers, names, titles). */
function line_in(string $key, int $max = 200): string
{
    $v = trim(preg_replace('/\s+/u', ' ', str_in($key, $max * 2)) ?? '');
    return mb_substr($v, 0, $max);
}

function bool_in(string $key): bool
{
    $v = input()[$key] ?? false;
    return $v === true || $v === 1 || $v === '1' || $v === 'true' || $v === 'on';
}

function int_in(string $key, int $default = 0): int
{
    $v = input()[$key] ?? ($_GET[$key] ?? null);
    return is_numeric($v) ? (int) $v : $default;
}

function query(string $key, int $max = 200): string
{
    $v = $_GET[$key] ?? '';
    return is_string($v) ? mb_substr(trim($v), 0, $max) : '';
}

// ---------------------------------------------------------------------------
// Request security
// ---------------------------------------------------------------------------

function is_https(): bool
{
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        return true;
    }
    if (config('trust_cloudflare', true)) {
        if (strtolower($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https') {
            return true;
        }
        if (strpos($_SERVER['HTTP_CF_VISITOR'] ?? '', '"https"') !== false) {
            return true;
        }
    }
    return false;
}

function client_ip(): string
{
    $ip = config('trust_cloudflare', true) && !empty($_SERVER['HTTP_CF_CONNECTING_IP'])
        ? $_SERVER['HTTP_CF_CONNECTING_IP']
        : ($_SERVER['REMOTE_ADDR'] ?? '');
    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
}

function user_agent(): string
{
    return mb_substr(preg_replace('/[\x00-\x1F\x7F]/', '', (string) ($_SERVER['HTTP_USER_AGENT'] ?? '')) ?? '', 0, 255);
}

/**
 * Baseline checks for every endpoint: HTTPS, allowed methods, and for state-changing
 * requests a same-origin Origin/Referer (blocks cross-site form posts).
 */
function guard_request(array $methods, bool $requireOrigin = true): string
{
    if (config('require_https', true) && !is_https()) {
        fail(403, 'HTTPS is required.');
    }
    if (is_https()) {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
    }

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($method, $methods, true)) {
        header('Allow: ' . implode(', ', $methods));
        fail(405, 'Method not allowed.');
    }

    if ($method !== 'GET') {
        $source = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
        if ($source === '' && $requireOrigin) {
            fail(403, 'Forbidden.');
        }
        if ($source !== '') {
            $host = strtolower((string) parse_url($source, PHP_URL_HOST));
            if (!in_array($host, config('allowed_hosts', []), true)) {
                fail(403, 'Forbidden.');
            }
        }
    }
    return $method;
}

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

function db_configured(): bool
{
    return (string) config('db.name', '') !== '' && (string) config('db.user', '') !== '';
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        if (!db_configured()) {
            fail(503, 'The site database is not configured yet.');
        }
        $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', config('db.host', 'localhost'), config('db.name'));
        $pdo = new PDO($dsn, (string) config('db.user'), (string) config('db.pass'), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false, // real prepared statements
        ]);
        $pdo->exec("SET time_zone = '+00:00'");
    }
    return $pdo;
}

/** Prepared statement helper — the ONLY way queries are run. */
function q(string $sql, array $params = []): PDOStatement
{
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return $stmt;
}

function now_utc(): string
{
    return gmdate('Y-m-d H:i:s');
}

/** DB datetime (UTC) → ISO 8601 for the browser. */
function iso(?string $dt): ?string
{
    return $dt ? str_replace(' ', 'T', $dt) . 'Z' : null;
}

/** ISO 8601 / datetime-local from the browser → DB datetime (UTC), or null if invalid. */
function parse_dt(string $s): ?string
{
    if ($s === '') {
        return null;
    }
    try {
        $d = new DateTimeImmutable($s, new DateTimeZone('UTC'));
    } catch (Exception $e) {
        return null;
    }
    return $d->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');
}

// ---------------------------------------------------------------------------
// Rate limiting (fixed window). Uses the DB when configured, else temp files.
// ---------------------------------------------------------------------------

/** Returns true if allowed; counts this hit. */
function rate_limit(string $key, int $limit, int $window): bool
{
    $bucket = hash('sha256', $key);
    $now = time();

    if (db_configured()) {
        $pdo = db();
        $pdo->beginTransaction();
        $row = q('SELECT hits, window_start FROM rate_limits WHERE bucket = ? FOR UPDATE', [$bucket])->fetch();
        if (!$row || (int) $row['window_start'] <= $now - $window) {
            q('REPLACE INTO rate_limits (bucket, hits, window_start) VALUES (?, 1, ?)', [$bucket, $now]);
            $pdo->commit();
            return true;
        }
        $allowed = (int) $row['hits'] < $limit;
        if ($allowed) {
            q('UPDATE rate_limits SET hits = hits + 1 WHERE bucket = ?', [$bucket]);
        }
        $pdo->commit();
        // Opportunistic cleanup of stale buckets.
        if (random_int(1, 50) === 1) {
            q('DELETE FROM rate_limits WHERE window_start < ?', [$now - 86400]);
        }
        return $allowed;
    }

    $dir = rtrim(sys_get_temp_dir(), '/') . '/offerhost-ratelimit';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        return true; // fail open rather than block real users if tmp isn't writable
    }
    $fh = @fopen("$dir/$bucket", 'c+');
    if (!$fh) {
        return true;
    }
    flock($fh, LOCK_EX);
    $state = json_decode((string) stream_get_contents($fh), true);
    if (!is_array($state) || ($state['start'] ?? 0) <= $now - $window) {
        $state = ['start' => $now, 'hits' => 0];
    }
    $allowed = $state['hits'] < $limit;
    if ($allowed) {
        $state['hits']++;
    }
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($state));
    flock($fh, LOCK_UN);
    fclose($fh);
    return $allowed;
}

/** Clears a bucket (e.g. after a successful login). */
function rate_limit_reset(string $key): void
{
    if (db_configured()) {
        q('DELETE FROM rate_limits WHERE bucket = ?', [hash('sha256', $key)]);
    }
}

// ---------------------------------------------------------------------------
// Mail
// ---------------------------------------------------------------------------

function one_line(string $s): string
{
    return trim(preg_replace('/[\r\n\t\x00-\x1F\x7F]+/u', ' ', $s) ?? '');
}

function send_mail(string $to, string $subject, string $body, string $replyTo = ''): bool
{
    $from = (string) config('mail.from', '');
    if ($from === '' || !filter_var($from, FILTER_VALIDATE_EMAIL) || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        return false;
    }
    $headers = [
        'From: ' . mb_encode_mimeheader(one_line((string) config('mail.from_name', 'Offerhost')), 'UTF-8') . " <$from>",
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];
    if ($replyTo !== '' && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $headers[] = 'Reply-To: ' . $replyTo;
    }
    $ok = @mail($to, mb_encode_mimeheader(one_line($subject), 'UTF-8', 'B', "\r\n"), $body, implode("\r\n", $headers), '-f' . $from);
    if (!$ok) {
        error_log('[offerhost-api] mail() failed sending "' . one_line($subject) . '"');
    }
    return $ok;
}
