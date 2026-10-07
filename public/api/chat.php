<?php
/**
 * Offerhost sales chat — POST /api/chat.php
 *
 * Request:  {"messages": [{"role": "user"|"assistant", "content": "..."}]}
 * Response: {"reply": "...", "leadCaptured": bool}
 *
 * Runs on the same cPanel/Apache host as the static site. Requires PHP 8.1+ and
 * `composer install` in this directory. Secrets live in config.local.php or env vars.
 */

declare(strict_types=1);

use Anthropic\Client;
use Anthropic\Core\Exceptions\APIConnectionException;
use Anthropic\Core\Exceptions\APIStatusException;
use Anthropic\Core\Exceptions\AuthenticationException;
use Anthropic\Core\Exceptions\BadRequestException;
use Anthropic\Core\Exceptions\InternalServerException;
use Anthropic\Core\Exceptions\RateLimitException;
use Anthropic\Messages\ToolUseBlock;

const MODEL = 'claude-opus-5-5';
const MAX_HISTORY = 20;          // messages kept from the client
const MAX_MESSAGE_CHARS = 2000;  // per message
const MAX_TOOL_ROUNDS = 3;
const RATE_LIMIT = 30;           // requests …
const RATE_WINDOW = 600;         // … per 10 minutes per IP

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

// --- Request guards ---------------------------------------------------------

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = array_filter(array_map('trim', explode(',', config('ALLOWED_ORIGINS'))));
$host = $_SERVER['HTTP_HOST'] ?? '';
$sameOrigin = $origin === '' || parse_url($origin, PHP_URL_HOST) === $host;
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

// Simple file-based rate limit per IP.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$bucket = sys_get_temp_dir() . '/offerhost-chat-' . hash('sha256', $ip);
$now = time();
$hits = array_filter(
    is_file($bucket) ? (array) json_decode((string) file_get_contents($bucket), true) : [],
    fn($t) => is_int($t) && $t > $now - RATE_WINDOW,
);
if (count($hits) >= RATE_LIMIT) {
    respond(429, ['error' => 'Too many messages — please wait a few minutes or email us.']);
}
$hits[] = $now;
file_put_contents($bucket, json_encode(array_values($hits)), LOCK_EX);

$input = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($input) || !is_array($input['messages'] ?? null)) {
    respond(400, ['error' => 'Invalid request']);
}

// Keep only well-formed text turns, trimmed to a sane size, starting with a user turn.
$messages = [];
foreach (array_slice($input['messages'], -MAX_HISTORY) as $m) {
    $role = $m['role'] ?? '';
    $content = $m['content'] ?? '';
    if (!in_array($role, ['user', 'assistant'], true) || !is_string($content) || trim($content) === '') {
        continue;
    }
    $messages[] = ['role' => $role, 'content' => mb_substr($content, 0, MAX_MESSAGE_CHARS)];
}
while ($messages && $messages[0]['role'] !== 'user') {
    array_shift($messages);
}
if (!$messages || end($messages)['role'] !== 'user') {
    respond(400, ['error' => 'Invalid request']);
}

$apiKey = config('ANTHROPIC_API_KEY');
if ($apiKey === '' || !is_file(__DIR__ . '/vendor/autoload.php')) {
    error_log('offerhost-chat: missing ANTHROPIC_API_KEY or vendor/ (run composer install)');
    respond(503, ['error' => 'Chat is temporarily unavailable.']);
}
require __DIR__ . '/vendor/autoload.php';

// --- Prompt -----------------------------------------------------------------

$knowledgePath = __DIR__ . '/chat-knowledge.json';
$knowledge = is_file($knowledgePath) ? (string) file_get_contents($knowledgePath) : '{}';
$salesEmail = config('SALES_EMAIL', 'sales@offerhost.com');

// Kept byte-stable between requests so the prompt cache can reuse it.
$system = <<<PROMPT
You are the Offerhost online assistant, available 24/7 on offerhost.com. You help visitors with
sales questions about dedicated servers, ASN & IP services, network and data center locations, and
general pre-sales or support questions.

How to behave:
- Be friendly, concise and specific. Answer in the visitor's language. Keep replies short enough to
  read in a chat bubble; use short lists for specs or comparisons. Plain text, no markdown headings.
- Recommend a plan that fits the visitor's workload, and explain why in a sentence.
- Only state facts found in the company information below. Never invent prices, discounts, stock,
  SLAs, IP ranges, setup times or features. If you don't know, say so and offer to have the team
  follow up.
- When a visitor wants to order, get a custom quote, needs anything not listed, or asks for a human,
  ask for their name and email (plus company and requirements if they're willing) and then call the
  capture_lead tool. Confirm to them that the team will reply by email. Never call capture_lead
  without a real email address the visitor gave you.
- For existing-customer support issues (outages, billing, account access), point them to the status
  page at /status/ and to {$salesEmail}, and offer to pass a message to the team via capture_lead.
- Stay on topic. Politely decline unrelated requests.

Company information (authoritative, prices in EUR per month):
{$knowledge}
PROMPT;

$tools = [
    [
        'name' => 'capture_lead',
        'description' => 'Send the visitor\'s contact details and request to the Offerhost sales team, '
            . 'who reply by email. Use once the visitor has given at least their email address and wants '
            . 'to order, get a quote, or talk to a person.',
        'inputSchema' => [
            'type' => 'object',
            'properties' => [
                'name' => ['type' => 'string', 'description' => 'Visitor name'],
                'email' => ['type' => 'string', 'description' => 'Visitor email address'],
                'company' => ['type' => 'string', 'description' => 'Company, if given'],
                'interest' => ['type' => 'string', 'description' => 'Plan or service they are interested in'],
                'summary' => ['type' => 'string', 'description' => 'Short summary of their requirements and the conversation'],
            ],
            'required' => ['email', 'summary'],
        ],
    ],
];

function captureLead(array $lead): string
{
    $email = filter_var(trim((string) ($lead['email'] ?? '')), FILTER_VALIDATE_EMAIL);
    if ($email === false) {
        return 'ERROR: that email address looks invalid. Ask the visitor to double-check it.';
    }
    $clean = fn(string $k) => trim(str_replace(["\r", "\n"], ' ', mb_substr((string) ($lead[$k] ?? ''), 0, 200)));
    $body = implode("\n", [
        'New lead from the website chat assistant',
        '',
        'Name:     ' . $clean('name'),
        'Email:    ' . $email,
        'Company:  ' . $clean('company'),
        'Interest: ' . $clean('interest'),
        '',
        'Summary:',
        mb_substr((string) ($lead['summary'] ?? ''), 0, 4000),
        '',
        'IP: ' . ($_SERVER['REMOTE_ADDR'] ?? '') . ' · ' . gmdate('Y-m-d H:i') . ' UTC',
    ]);
    $headers = 'From: ' . config('MAIL_FROM', 'no-reply@offerhost.com') . "\r\n"
        . 'Reply-To: ' . $email . "\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\n";
    $subject = 'Chat lead: ' . ($clean('interest') ?: $clean('name') ?: $email);

    if (!mail(config('SALES_EMAIL', 'sales@offerhost.com'), $subject, $body, $headers)) {
        error_log('offerhost-chat: mail() failed for lead ' . $email);
        return 'ERROR: the message could not be delivered. Ask the visitor to email '
            . config('SALES_EMAIL', 'sales@offerhost.com') . ' directly.';
    }
    return 'Lead delivered to the sales team.';
}

// --- Conversation -----------------------------------------------------------

$client = new Client(apiKey: $apiKey);
$fallbackReply = "Sorry, I can't help with that here. Please email {$salesEmail} and our team will get back to you.";
$leadCaptured = false;

try {
    for ($round = 0; ; $round++) {
        $response = $client->messages->create(
            model: MODEL,
            maxTokens: 8000,
            outputConfig: ['effort' => 'low'],
            system: [['type' => 'text', 'text' => $system, 'cacheControl' => ['type' => 'ephemeral']]],
            tools: $tools,
            messages: $messages,
        );

        if ($response->stopReason === 'refusal') {
            respond(200, ['reply' => $fallbackReply, 'leadCaptured' => $leadCaptured]);
        }
        if ($response->stopReason !== 'tool_use' || $round >= MAX_TOOL_ROUNDS) {
            break;
        }

        $results = [];
        foreach ($response->content as $block) {
            if ($block instanceof ToolUseBlock) {
                $out = $block->name === 'capture_lead'
                    ? captureLead((array) $block->input)
                    : 'ERROR: unknown tool';
                $leadCaptured = $leadCaptured || !str_starts_with($out, 'ERROR');
                $results[] = [
                    'type' => 'tool_result',
                    'toolUseID' => $block->id,
                    'content' => $out,
                    'isError' => str_starts_with($out, 'ERROR'),
                ];
            }
        }
        $messages[] = ['role' => 'assistant', 'content' => $response->content];
        $messages[] = ['role' => 'user', 'content' => $results];
    }
} catch (RateLimitException | InternalServerException | APIConnectionException $e) {
    error_log('offerhost-chat: transient API error: ' . $e->getMessage());
    respond(503, ['error' => "I'm getting a lot of questions right now — please try again in a moment."]);
} catch (AuthenticationException | BadRequestException $e) {
    error_log('offerhost-chat: configuration/request error: ' . $e->getMessage());
    respond(500, ['error' => 'Chat is temporarily unavailable.']);
} catch (APIStatusException $e) {
    error_log('offerhost-chat: API error ' . ($e->type?->value ?? '') . ': ' . $e->getMessage());
    respond(500, ['error' => 'Chat is temporarily unavailable.']);
}

$reply = '';
foreach ($response->content as $block) {
    if ($block->type === 'text') {
        $reply .= $block->text;
    }
}

respond(200, ['reply' => trim($reply) ?: $fallbackReply, 'leadCaptured' => $leadCaptured]);
