<?php
/**
 * Offerhost contact form handler — receives POSTs from /contact/.
 *
 * Each message is saved to the database (Admin → Messages) when the database is configured,
 * and emailed to `mail.contact_to` when that is set. Settings live in the private config file
 * outside public_html (see server/offerhost-config.example.php).
 *
 * Responds with JSON: { ok: true } or { ok: false, error: "...", fields?: { name: "..." } }.
 */

declare(strict_types=1);

require __DIR__ . '/_lib/bootstrap.php';

const TOPICS = [
    'sales' => 'Sales / Dedicated Servers',
    'network' => 'ASN & IP / Network',
    'support' => 'Technical Support',
    'billing' => 'Billing',
    'abuse' => 'Abuse Report',
    'other' => 'Other',
];

const MAX = ['name' => 100, 'email' => 200, 'company' => 120, 'message' => 5000];

guard_request(['POST'], false);

// Honeypot: pretend success so bots don't retry.
if (str_in('website', 200) !== '') {
    respond(200, ['ok' => true]);
}

// --- Validation (mirrors the client-side rules) -----------------------------

$name = one_line(str_in('name', 1000));
$email = one_line(str_in('email', 1000));
$company = one_line(str_in('company', 1000));
$topic = str_in('topic', 20);
$plan = one_line(str_in('plan', 100));
$message = str_in('message', 20000);

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
    fail(422, 'Please check the highlighted fields.', $errors);
}

// --- Rate limit & configuration ---------------------------------------------

$ip = client_ip();
if (!rate_limit("contact:ip:$ip", 5, 3600)) {
    fail(429, 'Too many messages from your network. Please try again later.');
}

$recipient = (string) config('mail.contact_to', '');
if (!db_configured() && $recipient === '') {
    fail(503, 'The contact form is not configured yet. Please try again later.');
}

// --- Store & send -----------------------------------------------------------

$stored = false;
if (db_configured()) {
    q(
        'INSERT INTO contact_messages (name, email, company, topic, plan, message, ip, user_agent, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
        [$name, $email, $company, $topic, $plan, $message, $ip, mb_substr(user_agent(), 0, 300), now_utc()]
    );
    $stored = true;
}

$sent = false;
if ($recipient !== '') {
    $topicLabel = TOPICS[$topic];
    $sent = send_mail($recipient, "[Offerhost] {$topicLabel} — {$name}", implode("\n", [
        'New message from the Offerhost contact form',
        str_repeat('-', 44),
        "Name:    {$name}",
        "Email:   {$email}",
        'Company: ' . ($company !== '' ? $company : '—'),
        "Topic:   {$topicLabel}",
        'Plan:    ' . ($plan !== '' ? $plan : '—'),
        '',
        $message,
        '',
        str_repeat('-', 44),
        'IP:         ' . $ip,
        'User agent: ' . user_agent(),
        'Sent:       ' . gmdate('Y-m-d H:i:s') . ' UTC',
    ]), $email);
}

if (!$stored && !$sent) {
    fail(500, "We couldn't send your message. Please try again in a moment.");
}

respond(200, ['ok' => true]);
