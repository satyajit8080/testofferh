<?php
/**
 * Offerhost chat lead form — POST /api/lead.php
 *
 * Request:  {"name": "...", "email": "...", "telegram": "@handle" (optional), "page": "/path"}
 * Response: {"ok": true, "visitor": {"name", "email", "telegram"}} or {"error": "..."}
 *
 * The chat widget shows this form before the conversation starts; the details are emailed to
 * sales straight away so a lead is never lost even if the visitor never sends a chat message.
 */

declare(strict_types=1);

require __DIR__ . '/common.php';

$input = guardRequest('lead', 10, 3600);

// Honeypot: real visitors never see or fill this field.
if (cleanLine($input['website'] ?? '') !== '') {
    respond(200, ['ok' => true, 'visitor' => null]);
}

[$visitor, $error] = validateVisitor($input);
if ($visitor === null) {
    respond(422, ['error' => $error]);
}

$sent = sendLead(
    'Chat lead: ' . $visitor['name'],
    [
        'Name' => $visitor['name'],
        'Email' => $visitor['email'],
        'Telegram' => $visitor['telegram'] ?: '—',
        'Page' => cleanLine($input['page'] ?? '', 300),
    ],
    'The visitor filled in the chat contact form. Any questions they ask the assistant will follow.',
);
if (!$sent) {
    respond(502, ['error' => 'We could not save your details. Please email '
        . config('SALES_EMAIL', 'sales@offerhost.com') . ' directly.']);
}

respond(200, ['ok' => true, 'visitor' => $visitor]);
