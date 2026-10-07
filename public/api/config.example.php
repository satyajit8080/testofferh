<?php
// Copy to config.local.php on the server (it is gitignored and blocked by .htaccess)
// and fill in the values. Environment variables with the same names take precedence.
return [
    // Anthropic API key — https://console.anthropic.com/
    'ANTHROPIC_API_KEY' => '',
    // Where captured sales leads are emailed.
    'SALES_EMAIL' => 'sales@offerhost.com',
    // "From" address for lead emails (should be a mailbox on this domain).
    'MAIL_FROM' => 'no-reply@offerhost.com',
    // Comma-separated origins allowed to call the endpoint. Empty = same origin only.
    'ALLOWED_ORIGINS' => 'https://offerhost.com,https://www.offerhost.com',
];
