<?php
/**
 * Read models shared by the admin API and the public site API.
 */

declare(strict_types=1);

defined('OH_API') || exit;

function json_list(?string $json): array
{
    $v = json_decode((string) $json, true);
    return is_array($v) ? $v : [];
}

function status_payload(): array
{
    $groups = q('SELECT * FROM status_groups ORDER BY sort_order, id')->fetchAll();
    $components = q('SELECT * FROM status_components ORDER BY sort_order, id')->fetchAll();
    $updates = [];
    foreach (q('SELECT * FROM incident_updates ORDER BY created_at DESC, id DESC')->fetchAll() as $u) {
        $updates[$u['incident_id']][] = ['id' => (int) $u['id'], 'status' => $u['status'], 'message' => $u['message'], 'at' => iso($u['created_at'])];
    }
    return [
        'groups' => array_map(fn ($g) => [
            'id' => $g['id'],
            'title' => $g['title'],
            'components' => array_values(array_map(fn ($c) => [
                'id' => $c['id'],
                'name' => $c['name'],
                'description' => $c['description'],
                'status' => $c['status'],
                'updatedAt' => iso($c['updated_at']),
            ], array_filter($components, fn ($c) => $c['group_id'] === $g['id']))),
        ], $groups),
        'incidents' => array_map(fn ($i) => [
            'id' => (int) $i['id'],
            'title' => $i['title'],
            'impact' => $i['impact'],
            'components' => json_list($i['components']),
            'startedAt' => iso($i['started_at']),
            'resolvedAt' => iso($i['resolved_at']),
            'updates' => $updates[$i['id']] ?? [],
        ], q('SELECT * FROM incidents ORDER BY started_at DESC LIMIT 100')->fetchAll()),
        'maintenance' => array_map(fn ($m) => [
            'id' => (int) $m['id'],
            'title' => $m['title'],
            'description' => $m['description'],
            'components' => json_list($m['components']),
            'startsAt' => iso($m['starts_at']),
            'endsAt' => iso($m['ends_at']),
        ], q('SELECT * FROM maintenance ORDER BY starts_at DESC LIMIT 100')->fetchAll()),
    ];
}
