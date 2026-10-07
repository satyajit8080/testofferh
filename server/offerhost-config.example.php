<?php
/**
 * Offerhost server configuration — TEMPLATE.
 *
 * Copy to /home/offerhost/offerhost-config.php (one level ABOVE public_html, so it can
 * never be downloaded), fill in the values and set permissions to 0600.
 * The API finds it automatically; override the path with the OFFERHOST_CONFIG env var.
 *
 * NEVER commit the real file — it is listed in .gitignore.
 */
return [
    'db' => [
        'host' => 'localhost',
        'name' => '', // TODO cPanel → MySQL Databases, e.g. offerhost_site
        'user' => '', // TODO
        'pass' => '', // TODO
    ],

    /**
     * Random secret used to encrypt 2FA secrets. Generate once and keep it:
     *   php -r "echo base64_encode(random_bytes(32)), PHP_EOL;"
     * Changing it later disables every account's 2FA.
     */
    'app_key' => '', // TODO

    'site_url' => 'https://offerhost.com',

    /** Browser origins allowed to call the API. */
    'allowed_hosts' => ['offerhost.com', 'www.offerhost.com'],

    /** Reject API calls over plain HTTP. Only disable for local testing. */
    'require_https' => true,

    /** The site is behind Cloudflare: read the visitor IP and scheme from its headers. */
    'trust_cloudflare' => true,

    'mail' => [
        /** Sender for system mail (password resets, contact notifications). Must be a mailbox on your domain. */
        'from' => '', // TODO e.g. no-reply@…
        'from_name' => 'Offerhost',
        /** Where /contact/ form submissions are emailed. Empty = store in the admin panel only. */
        'contact_to' => '', // TODO e.g. sales@…
    ],

    /**
     * One-time token for creating the first admin at /admin/setup/.
     * Generate with: php -r "echo bin2hex(random_bytes(16)), PHP_EOL;"
     * Setup only works while no admin exists. Clear this value after setup.
     */
    'setup_token' => '',
];
