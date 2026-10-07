<?php
/**
 * Public, read-only site data used by the static pages to show the latest content:
 *   GET ?r=plans   → visible server plans
 *   GET ?r=status  → status components, incidents and maintenance
 */

declare(strict_types=1);

require __DIR__ . '/_lib/bootstrap.php';
require __DIR__ . '/_lib/content.php';

guard_request(['GET']);

if (!db_configured()) {
    fail(503, 'Not configured.');
}

switch (query('r', 20)) {
    case 'plans':
        $rows = q('SELECT * FROM plans WHERE visible = 1 ORDER BY sort_order, id')->fetchAll();
        respond(200, ['ok' => true, 'items' => array_map(fn ($r) => [
            'id' => $r['slug'],
            'name' => $r['name'],
            'summary' => $r['summary'],
            'specs' => array_values(array_filter([$r['cpu'], $r['ram'], $r['storage'], $r['network']], 'strlen')),
            'price' => (float) $r['price'],
            'featured' => (bool) $r['featured'],
            'badge' => $r['badge'] !== '' ? $r['badge'] : null,
            'location' => $r['location'],
            'orderUrl' => $r['order_url'] !== '' ? $r['order_url'] : null,
        ], $rows)]);

    case 'status':
        $data = status_payload();
        // Only what the public page needs: last 90 days of incidents, upcoming/current maintenance.
        $since = gmdate('Y-m-d\TH:i:s\Z', time() - 90 * 86400);
        $now = gmdate('Y-m-d\TH:i:s\Z');
        $data['incidents'] = array_values(array_filter($data['incidents'], fn ($i) => $i['resolvedAt'] === null || $i['startedAt'] >= $since));
        $data['maintenance'] = array_values(array_filter($data['maintenance'], fn ($m) => $m['endsAt'] >= $now));
        $data['updatedAt'] = gmdate('Y-m-d\TH:i:s\Z');
        respond(200, ['ok' => true] + $data);

    default:
        fail(404, 'Unknown resource.');
}
