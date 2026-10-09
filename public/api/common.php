<?php
/**
 * Shared helpers for the chat endpoints (chat.php, lead.php). Not an endpoint itself;
 * direct requests are blocked by .htaccess.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function config(string $key, string $default = ''): string
{
    static $file = null;
    if ($file === null) {
        $path = __DIR__ . '/config.local.php';
        $file = is_file($path) ? (array) require $path : [];
    }
    $env = getenv($key);
    if ($env !== false && $env !== '') {
        return $env;
    }
    return isset($file[$key]) ? (string) $file[$key] : $default;
}

/** Origin/method checks, a simple file-based per-IP rate limit, and the decoded JSON body. */
function guardRequest(string $bucketName, int $limit, int $window): array
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = array_filter(array_map('trim', explode(',', config('ALLOWED_ORIGINS'))));
    $host = $_SERVER['HTTP_HOST'] ?? '';
    // Compare host and port: Origin is scheme://host[:port], Host is host[:port].
    $sameOrigin = $origin === '' || preg_replace('~^https?://~i', '', $origin) === $host;
    if (!$sameOrigin && !in_array($origin, $allowed, true)) {
        respond(403, ['error' => 'Origin not allowed']);
    }
    if ($origin !== '' && !$sameOrigin) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header('Access-Control-Allow-Methods: POST');
        header('Access-Control-Allow-Headers: Content-Type');
        respond(204, []);
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        respond(405, ['error' => 'Method not allowed']);
    }

    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $bucket = sys_get_temp_dir() . '/offerhost-' . $bucketName . '-' . hash('sha256', $ip);
    $now = time();
    $hits = array_filter(
        is_file($bucket) ? (array) json_decode((string) file_get_contents($bucket), true) : [],
        fn($t) => is_int($t) && $t > $now - $window,
    );
    if (count($hits) >= $limit) {
        respond(429, ['error' => 'Too many requests — please wait a few minutes or email us.']);
    }
    $hits[] = $now;
    file_put_contents($bucket, json_encode(array_values($hits)), LOCK_EX);

    $input = json_decode((string) file_get_contents('php://input'), true);
    if (!is_array($input)) {
        respond(400, ['error' => 'Invalid request']);
    }
    return $input;
}

/** Single-line, length-capped text safe for mail headers and bodies. */
function cleanLine(mixed $value, int $max = 200): string
{
    return trim(str_replace(["\r", "\n"], ' ', mb_substr(is_string($value) ? $value : '', 0, $max)));
}

/**
 * Telegram usernames are 5–32 chars of letters, digits and underscores; numeric user IDs are
 * also accepted. Returns the normalised value ("@name" or the ID), '' if empty, null if invalid.
 */
function normalizeTelegram(mixed $value): ?string
{
    $t = ltrim(cleanLine($value, 64), '@');
    $t = preg_replace('~^(https?://)?(t\.me|telegram\.me)/~i', '', $t) ?? $t;
    if ($t === '') {
        return '';
    }
    if (preg_match('/^\d{5,15}$/', $t)) {
        return $t;
    }
    return preg_match('/^[A-Za-z][A-Za-z0-9_]{4,31}$/', $t) ? '@' . $t : null;
}

/**
 * Validate a visitor's contact details. Returns [visitor, null] on success or [null, error].
 * Name and email are required; Telegram is optional.
 */
function validateVisitor(mixed $raw): array
{
    $raw = is_array($raw) ? $raw : [];
    $name = cleanLine($raw['name'] ?? '', 100);
    $email = filter_var(cleanLine($raw['email'] ?? '', 254), FILTER_VALIDATE_EMAIL);
    $telegram = normalizeTelegram($raw['telegram'] ?? '');
    if ($name === '') {
        return [null, 'Please enter your name.'];
    }
    if ($email === false) {
        return [null, 'Please enter a valid email address.'];
    }
    if ($telegram === null) {
        return [null, 'Please enter a valid Telegram username (e.g. @offerhost) or numeric ID.'];
    }
    return [['name' => $name, 'email' => $email, 'telegram' => $telegram], null];
}

/** Email a lead to the sales team. Returns true when mail() accepted it. */
function sendLead(string $subject, array $fields, string $details): bool
{
    $width = max(array_map('strlen', array_keys($fields))) + 2;
    $lines = ['New lead from the website chat', ''];
    foreach ($fields as $label => $value) {
        $lines[] = str_pad($label . ':', $width) . cleanLine($value, 4000);
    }
    $lines[] = '';
    if ($details !== '') {
        $lines[] = mb_substr($details, 0, 4000);
        $lines[] = '';
    }
    $lines[] = 'IP: ' . ($_SERVER['REMOTE_ADDR'] ?? '') . ' · ' . gmdate('Y-m-d H:i') . ' UTC';

    $headers = 'From: ' . config('MAIL_FROM', 'no-reply@offerhost.com') . "\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\n";
    $email = filter_var($fields['Email'] ?? '', FILTER_VALIDATE_EMAIL);
    if ($email !== false) {
        $headers .= 'Reply-To: ' . $email . "\r\n";
    }

    $to = config('SALES_EMAIL', 'sales@offerhost.com');
    if (!mail($to, cleanLine($subject), implode("\n", $lines), $headers)) {
        error_log('offerhost-chat: mail() failed for lead ' . ($email ?: 'unknown'));
        return false;
    }
    return true;
}
