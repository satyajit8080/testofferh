<?php
/**
 * Offerhost contact form handler — receives POSTs from /contact/ and emails them.
 *
 * Deployed as /api/contact.php (copied from public/ into out/ by `next build`).
 * Responds with JSON: { ok: true } or { ok: false, error: "...", fields?: { name: "..." } }.
 */

declare(strict_types=1);

// ---------------------------------------------------------------------------
// Configuration — TODO(offerhost): fill these in before deploying.
// ---------------------------------------------------------------------------

/** Where form submissions are delivered. Leave empty and the form returns "not configured". */
const RECIPIENT = ''; // TODO e.g. 'sales@your-domain'

/**
 * Sender address for the notification email. Must be a mailbox on a domain this
 * server is allowed to send for (SPF/DKIM), otherwise mail may land in spam.
 */
const FROM_ADDRESS = ''; // TODO e.g. 'no-reply@your-domain'
const FROM_NAME = 'Offerhost Website';

/** Browsers posting from any other origin are rejected. */
const ALLOWED_HOSTS = ['offerhost.com', 'www.offerhost.com'];

/** Max submissions per IP per window. */
const RATE_LIMIT = 5;
const RATE_WINDOW = 3600; // seconds

const TOPICS = [
    'sales' => 'Sales / Dedicated Servers',
    'network' => 'ASN & IP / Network',
    'support' => 'Technical Support',
    'billing' => 'Billing',
    'abuse' => 'Abuse Report',
    'other' => 'Other',
];

const MAX = ['name' => 100, 'email' => 200, 'company' => 120, 'message' => 5000];

// ---------------------------------------------------------------------------

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Collapse to a single line so user input can never inject mail headers. */
function one_line(string $s): string
{
    return trim(preg_replace('/[\r\n\t\x00-\x1F\x7F]+/u', ' ', $s) ?? '');
}

function field(string $key): string
{
    $v = $_POST[$key] ?? '';
    return is_string($v) ? $v : '';
}

function client_ip(): string
{
    // The site sits behind Cloudflare, which passes the visitor IP in this header.
    $ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : 'unknown';
}

/** File-based sliding-window limiter. Returns false when the IP is over the limit. */
function rate_limit_ok(string $ip): bool
{
    $dir = rtrim(sys_get_temp_dir(), '/') . '/offerhost-contact';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        return true; // Fail open rather than block real customers if tmp isn't writable.
    }
    $file = $dir . '/' . hash('sha256', $ip . '|' . __FILE__) . '.json';
    $fh = @fopen($file, 'c+');
    if (!$fh) {
        return true;
    }
    flock($fh, LOCK_EX);
    $now = time();
    $hits = json_decode((string) stream_get_contents($fh), true);
    $hits = array_values(array_filter(is_array($hits) ? $hits : [], fn ($t) => is_int($t) && $t > $now - RATE_WINDOW));
    $allowed = count($hits) < RATE_LIMIT;
    if ($allowed) {
        $hits[] = $now;
    }
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($hits));
    flock($fh, LOCK_UN);
    fclose($fh);
    return $allowed;
}

// --- Method & origin -------------------------------------------------------

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'Method not allowed.']);
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $host = strtolower((string) parse_url($origin, PHP_URL_HOST));
    if (!in_array($host, ALLOWED_HOSTS, true)) {
        respond(403, ['ok' => false, 'error' => 'Forbidden.']);
    }
}

// --- Honeypot: pretend success so bots don't retry --------------------------

if (field('website') !== '') {
    respond(200, ['ok' => true]);
}

// --- Validation (mirrors the client-side rules) -----------------------------

$name = one_line(field('name'));
$email = one_line(field('email'));
$company = one_line(field('company'));
$topic = field('topic');
$plan = one_line(field('plan'));
$message = trim(str_replace("\r\n", "\n", field('message')));

$errors = [];
if ($name === '') {
    $errors['name'] = 'Please enter your name.';
} elseif (mb_strlen($name) > MAX['name']) {
    $errors['name'] = 'Name must be ' . MAX['name'] . ' characters or fewer.';
}
if ($email === '') {
    $errors['email'] = 'Please enter your email address.';
} elseif (mb_strlen($email) > MAX['email'] || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid email address.';
}
if (mb_strlen($company) > MAX['company']) {
    $errors['company'] = 'Company must be ' . MAX['company'] . ' characters or fewer.';
}
if (!array_key_exists($topic, TOPICS)) {
    $errors['topic'] = 'Please choose a topic.';
}
if ($plan !== '' && !preg_match('/^[a-z0-9-]{1,60}$/', $plan)) {
    $plan = '';
}
if (mb_strlen($message) < 10) {
    $errors['message'] = 'Please tell us a little more (at least 10 characters).';
} elseif (mb_strlen($message) > MAX['message']) {
    $errors['message'] = 'Message must be ' . MAX['message'] . ' characters or fewer.';
}

if ($errors) {
    respond(422, ['ok' => false, 'error' => 'Please check the highlighted fields.', 'fields' => $errors]);
}

// --- Rate limit & configuration ---------------------------------------------

$ip = client_ip();
if (!rate_limit_ok($ip)) {
    respond(429, ['ok' => false, 'error' => 'Too many messages from your network. Please try again later.']);
}

if (RECIPIENT === '' || FROM_ADDRESS === '') {
    respond(503, ['ok' => false, 'error' => 'The contact form is not configured yet. Please try again later.']);
}

// --- Send -------------------------------------------------------------------

$topicLabel = TOPICS[$topic];
$subject = mb_encode_mimeheader("[Offerhost] {$topicLabel} — {$name}", 'UTF-8', 'B', "\r\n");

$body = implode("\n", [
    "New message from the Offerhost contact form",
    str_repeat('-', 44),
    "Name:    {$name}",
    "Email:   {$email}",
    "Company: " . ($company !== '' ? $company : '—'),
    "Topic:   {$topicLabel}",
    "Plan:    " . ($plan !== '' ? $plan : '—'),
    '',
    $message,
    '',
    str_repeat('-', 44),
    'IP:         ' . $ip,
    'User agent: ' . one_line(substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 300)),
    'Sent:       ' . gmdate('Y-m-d H:i:s') . ' UTC',
]);

$headers = implode("\r\n", [
    'From: ' . mb_encode_mimeheader(FROM_NAME, 'UTF-8') . ' <' . FROM_ADDRESS . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);

$sent = @mail(RECIPIENT, $subject, $body, $headers, '-f' . FROM_ADDRESS);

if (!$sent) {
    error_log('[offerhost-contact] mail() failed for submission from ' . $ip);
    respond(500, ['ok' => false, 'error' => "We couldn't send your message. Please try again in a moment."]);
}

respond(200, ['ok' => true]);
