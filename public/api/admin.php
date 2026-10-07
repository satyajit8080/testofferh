<?php
/**
 * Admin API. Every action is authorised server-side via ACTIONS below:
 * the session, the role and (for POST) the CSRF token are checked before any handler runs.
 */

declare(strict_types=1);

require __DIR__ . '/_lib/bootstrap.php';
require __DIR__ . '/_lib/auth.php';
require __DIR__ . '/_lib/content.php';

const STATUSES = ['operational', 'degraded', 'partial_outage', 'major_outage', 'maintenance'];
const INCIDENT_IMPACTS = ['degraded', 'partial_outage', 'major_outage', 'maintenance'];
const INCIDENT_STEPS = ['investigating', 'identified', 'monitoring', 'resolved'];
const PLAN_LOCATIONS = ['nl', 'de', 'gb', 'us'];
const PAGE_SIZE = 25;

/** action => [HTTP method, allowed roles] */
const ACTIONS = [
    'dashboard' => ['GET', ROLES],

    'messages' => ['GET', ROLES],
    'message' => ['GET', ROLES],
    'message_update' => ['POST', ROLES],
    'message_delete' => ['POST', ['admin']],

    'plans' => ['GET', ROLES],
    'plan_save' => ['POST', ROLES],
    'plan_delete' => ['POST', ['admin']],
    'plans_reorder' => ['POST', ROLES],

    'status' => ['GET', ROLES],
    'group_save' => ['POST', ROLES],
    'component_save' => ['POST', ROLES],
    'component_delete' => ['POST', ['admin']],
    'incident_save' => ['POST', ROLES],
    'incident_update' => ['POST', ROLES],
    'incident_delete' => ['POST', ['admin']],
    'maintenance_save' => ['POST', ROLES],
    'maintenance_delete' => ['POST', ROLES],

    'users' => ['GET', ['admin']],
    'user_create' => ['POST', ['admin']],
    'user_update' => ['POST', ['admin']],
    'user_reset_2fa' => ['POST', ['admin']],
    'user_send_reset' => ['POST', ['admin']],

    'audit' => ['GET', ['admin']],
];

$method = guard_request(['GET', 'POST']);
$action = query('action', 40);
if (!isset(ACTIONS[$action])) {
    fail(404, 'Unknown action.');
}
[$allowedMethod, $roles] = ACTIONS[$action];
if ($method !== $allowedMethod) {
    fail(405, 'Method not allowed.');
}
$me = require_auth($roles);

$handler = 'action_' . $action;
$handler($me);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function like(string $s): string
{
    return '%' . addcslashes($s, '%_\\') . '%';
}

function page(): int
{
    return max(1, int_in('page', 1));
}

/** @return string[] valid component ids from a JSON array input */
function component_ids_in(string $key): array
{
    $raw = input()[$key] ?? [];
    if (!is_array($raw)) {
        return [];
    }
    $known = q('SELECT id FROM status_components')->fetchAll(PDO::FETCH_COLUMN);
    return array_values(array_unique(array_filter($raw, fn ($id) => is_string($id) && in_array($id, $known, true))));
}


// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

function action_dashboard(array $me): void
{
    $now = now_utc();
    $data = [
        'counts' => [
            'newMessages' => (int) q("SELECT COUNT(*) FROM contact_messages WHERE status = 'new'")->fetchColumn(),
            'messages7d' => (int) q('SELECT COUNT(*) FROM contact_messages WHERE created_at >= ?', [gmdate('Y-m-d H:i:s', time() - 7 * 86400)])->fetchColumn(),
            'activeStaff' => (int) q('SELECT COUNT(*) FROM users WHERE is_active = 1')->fetchColumn(),
            'openIncidents' => (int) q('SELECT COUNT(*) FROM incidents WHERE resolved_at IS NULL')->fetchColumn(),
            'upcomingMaintenance' => (int) q('SELECT COUNT(*) FROM maintenance WHERE ends_at >= ?', [$now])->fetchColumn(),
            'visiblePlans' => (int) q('SELECT COUNT(*) FROM plans WHERE visible = 1')->fetchColumn(),
            'componentsNotOperational' => (int) q("SELECT COUNT(*) FROM status_components WHERE status <> 'operational'")->fetchColumn(),
        ],
        'recentMessages' => array_map('message_row', q('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 5')->fetchAll()),
        'recentActivity' => $me['role'] === 'admin'
            ? array_map('audit_row', q('SELECT * FROM audit_log ORDER BY id DESC LIMIT 8')->fetchAll())
            : null,
    ];
    respond(200, ['ok' => true] + $data);
}

// ---------------------------------------------------------------------------
// Contact messages
// ---------------------------------------------------------------------------

function message_row(array $r, bool $full = false): array
{
    $out = [
        'id' => (int) $r['id'],
        'name' => $r['name'],
        'email' => $r['email'],
        'company' => $r['company'],
        'topic' => $r['topic'],
        'plan' => $r['plan'],
        'status' => $r['status'],
        'createdAt' => iso($r['created_at']),
        'preview' => mb_substr(preg_replace('/\s+/u', ' ', $r['message']) ?? '', 0, 140),
    ];
    if ($full) {
        $out += [
            'message' => $r['message'],
            'note' => $r['note'] ?? '',
            'ip' => $r['ip'],
            'userAgent' => $r['user_agent'],
            'handledAt' => iso($r['handled_at']),
            'handledBy' => $r['handler_name'] ?? null,
        ];
    }
    return $out;
}

function action_messages(array $me): void
{
    $where = [];
    $params = [];
    $status = query('status', 10);
    if (in_array($status, ['new', 'handled'], true)) {
        $where[] = 'status = ?';
        $params[] = $status;
    }
    if (($term = query('q', 100)) !== '') {
        $where[] = '(name LIKE ? OR email LIKE ? OR company LIKE ? OR message LIKE ?)';
        array_push($params, like($term), like($term), like($term), like($term));
    }
    $sqlWhere = $where ? 'WHERE ' . implode(' AND ', $where) : '';
    $total = (int) q("SELECT COUNT(*) FROM contact_messages $sqlWhere", $params)->fetchColumn();
    $offset = (page() - 1) * PAGE_SIZE;
    $rows = q("SELECT * FROM contact_messages $sqlWhere ORDER BY created_at DESC, id DESC LIMIT " . PAGE_SIZE . " OFFSET $offset", $params)->fetchAll();
    respond(200, ['ok' => true, 'items' => array_map('message_row', $rows), 'total' => $total, 'pageSize' => PAGE_SIZE]);
}

function load_message(int $id): array
{
    $row = q('SELECT m.*, u.name AS handler_name FROM contact_messages m LEFT JOIN users u ON u.id = m.handled_by WHERE m.id = ?', [$id])->fetch();
    if (!$row) {
        fail(404, 'Message not found.');
    }
    return $row;
}

function action_message(array $me): void
{
    respond(200, ['ok' => true, 'item' => message_row(load_message(int_in('id')), true)]);
}

function action_message_update(array $me): void
{
    $id = int_in('id');
    $current = load_message($id);
    $status = str_in('status', 10);
    if (!in_array($status, ['new', 'handled'], true)) {
        fail(422, 'Invalid status.');
    }
    $note = str_in('note', 2000);
    if ($status === 'handled') {
        q('UPDATE contact_messages SET status = ?, note = ?, handled_by = ?, handled_at = COALESCE(handled_at, ?) WHERE id = ?', [$status, $note, $me['id'], now_utc(), $id]);
    } else {
        q('UPDATE contact_messages SET status = ?, note = ?, handled_by = NULL, handled_at = NULL WHERE id = ?', [$status, $note, $id]);
    }
    if ($current['status'] !== $status) {
        audit($me, 'message.' . ($status === 'handled' ? 'handled' : 'reopened'), "message #$id");
    } elseif (($current['note'] ?? '') !== $note) {
        audit($me, 'message.note', "message #$id");
    }
    respond(200, ['ok' => true, 'item' => message_row(load_message($id), true)]);
}

function action_message_delete(array $me): void
{
    $m = load_message(int_in('id'));
    q('DELETE FROM contact_messages WHERE id = ?', [$m['id']]);
    audit($me, 'message.deleted', "message #{$m['id']}", ['from' => $m['email']]);
    respond(200, ['ok' => true]);
}

// ---------------------------------------------------------------------------
// Server plans
// ---------------------------------------------------------------------------

function plan_row(array $r): array
{
    return [
        'id' => (int) $r['id'],
        'slug' => $r['slug'],
        'name' => $r['name'],
        'summary' => $r['summary'],
        'cpu' => $r['cpu'],
        'ram' => $r['ram'],
        'storage' => $r['storage'],
        'network' => $r['network'],
        'price' => (float) $r['price'],
        'location' => $r['location'],
        'featured' => (bool) $r['featured'],
        'badge' => $r['badge'],
        'orderUrl' => $r['order_url'],
        'visible' => (bool) $r['visible'],
        'sortOrder' => (int) $r['sort_order'],
        'updatedAt' => iso($r['updated_at']),
    ];
}

function action_plans(array $me): void
{
    $rows = q('SELECT * FROM plans ORDER BY sort_order, id')->fetchAll();
    respond(200, ['ok' => true, 'items' => array_map('plan_row', $rows)]);
}

function action_plan_save(array $me): void
{
    $id = int_in('id');
    $p = [
        'slug' => strtolower(line_in('slug', 60)),
        'name' => line_in('name', 80),
        'summary' => line_in('summary', 160),
        'cpu' => line_in('cpu', 80),
        'ram' => line_in('ram', 80),
        'storage' => line_in('storage', 80),
        'network' => line_in('network', 80),
        'price' => str_in('price', 20),
        'location' => line_in('location', 10),
        'featured' => bool_in('featured') ? 1 : 0,
        'badge' => line_in('badge', 30),
        'order_url' => line_in('orderUrl', 300),
        'visible' => bool_in('visible') ? 1 : 0,
    ];

    $e = [];
    if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $p['slug']) || strlen($p['slug']) < 2) {
        $e['slug'] = 'Use lowercase letters, numbers and hyphens.';
    } elseif (q('SELECT COUNT(*) FROM plans WHERE slug = ? AND id <> ?', [$p['slug'], $id])->fetchColumn()) {
        $e['slug'] = 'Another plan already uses this ID.';
    }
    foreach (['name' => 'Name', 'cpu' => 'CPU', 'ram' => 'Memory', 'storage' => 'Storage', 'network' => 'Network'] as $k => $label) {
        if ($p[$k] === '') {
            $e[$k] = "$label is required.";
        }
    }
    if (!is_numeric($p['price']) || (float) $p['price'] <= 0 || (float) $p['price'] >= 100000) {
        $e['price'] = 'Enter a price between 0 and 100000.';
    }
    if (!in_array($p['location'], PLAN_LOCATIONS, true)) {
        $e['location'] = 'Choose a location.';
    }
    if ($p['order_url'] !== '' && !preg_match('#^(/[^/\\\\]|https://)#', $p['order_url'])) {
        $e['orderUrl'] = 'Use a site path starting with / or an https:// link.';
    }
    if ($e) {
        fail(422, 'Please check the highlighted fields.', $e);
    }
    $p['price'] = round((float) $p['price'], 2);

    if ($id > 0) {
        $before = q('SELECT * FROM plans WHERE id = ?', [$id])->fetch();
        if (!$before) {
            fail(404, 'Plan not found.');
        }
        q('UPDATE plans SET slug=?, name=?, summary=?, cpu=?, ram=?, storage=?, network=?, price=?, location=?, featured=?, badge=?, order_url=?, visible=? WHERE id=?',
            [...array_values($p), $id]);
        $changes = [];
        foreach ($p as $k => $v) {
            if ((string) $before[$k] !== (string) $v && !($k === 'price' && (float) $before[$k] === (float) $v)) {
                $changes[$k] = ['from' => $before[$k], 'to' => $v];
            }
        }
        if ($changes) {
            audit($me, 'plan.updated', $p['slug'], $changes);
        }
    } else {
        $sort = (int) q('SELECT COALESCE(MAX(sort_order), 0) + 10 FROM plans')->fetchColumn();
        q('INSERT INTO plans (slug, name, summary, cpu, ram, storage, network, price, location, featured, badge, order_url, visible, sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [...array_values($p), $sort]);
        $id = (int) db()->lastInsertId();
        audit($me, 'plan.created', $p['slug'], ['price' => $p['price']]);
    }
    respond(200, ['ok' => true, 'item' => plan_row(q('SELECT * FROM plans WHERE id = ?', [$id])->fetch())]);
}

function action_plan_delete(array $me): void
{
    $plan = q('SELECT * FROM plans WHERE id = ?', [int_in('id')])->fetch();
    if (!$plan) {
        fail(404, 'Plan not found.');
    }
    q('DELETE FROM plans WHERE id = ?', [$plan['id']]);
    audit($me, 'plan.deleted', $plan['slug'], plan_row($plan));
    respond(200, ['ok' => true]);
}

function action_plans_reorder(array $me): void
{
    $ids = input()['ids'] ?? [];
    if (!is_array($ids)) {
        fail(422, 'Invalid order.');
    }
    $pdo = db();
    $pdo->beginTransaction();
    foreach (array_values($ids) as $i => $id) {
        q('UPDATE plans SET sort_order = ? WHERE id = ?', [($i + 1) * 10, (int) $id]);
    }
    $pdo->commit();
    audit($me, 'plan.reordered');
    respond(200, ['ok' => true]);
}

// ---------------------------------------------------------------------------
// Status page
// ---------------------------------------------------------------------------

function action_status(array $me): void
{
    respond(200, ['ok' => true] + status_payload());
}

function action_group_save(array $me): void
{
    $id = line_in('id', 40);
    $title = line_in('title', 100);
    if ($title === '') {
        fail(422, 'Enter a title.', ['title' => 'Enter a title.']);
    }
    $before = q('SELECT title FROM status_groups WHERE id = ?', [$id])->fetchColumn();
    if ($before === false) {
        fail(404, 'Group not found.');
    }
    q('UPDATE status_groups SET title = ? WHERE id = ?', [$title, $id]);
    audit($me, 'status.group_renamed', $id, ['from' => $before, 'to' => $title]);
    respond(200, ['ok' => true] + status_payload());
}

function action_component_save(array $me): void
{
    $original = line_in('originalId', 40);
    $c = [
        // IDs are fixed once created: incidents and maintenance reference them.
        'id' => $original !== '' ? $original : strtolower(line_in('id', 40)),
        'group_id' => line_in('groupId', 40),
        'name' => line_in('name', 100),
        'description' => line_in('description', 200),
        'status' => line_in('status', 20),
    ];
    $e = [];
    if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $c['id'])) {
        $e['id'] = 'Use lowercase letters, numbers and hyphens.';
    } elseif ($c['id'] !== $original && q('SELECT COUNT(*) FROM status_components WHERE id = ?', [$c['id']])->fetchColumn()) {
        $e['id'] = 'Another component already uses this ID.';
    }
    if ($c['name'] === '') {
        $e['name'] = 'Enter a name.';
    }
    if (!in_array($c['status'], STATUSES, true)) {
        $e['status'] = 'Choose a status.';
    }
    if (!q('SELECT COUNT(*) FROM status_groups WHERE id = ?', [$c['group_id']])->fetchColumn()) {
        $e['groupId'] = 'Choose a group.';
    }
    if ($e) {
        fail(422, 'Please check the highlighted fields.', $e);
    }

    if ($original !== '') {
        $before = q('SELECT * FROM status_components WHERE id = ?', [$original])->fetch();
        if (!$before) {
            fail(404, 'Component not found.');
        }
        q('UPDATE status_components SET id=?, group_id=?, name=?, description=?, status=? WHERE id=?', [...array_values($c), $original]);
        $details = [];
        foreach ($c as $k => $v) {
            if ($before[$k] !== $v) {
                $details[$k] = ['from' => $before[$k], 'to' => $v];
            }
        }
        audit($me, $before['status'] !== $c['status'] ? 'status.component_status' : 'status.component_updated', $c['id'], $details);
    } else {
        $sort = (int) q('SELECT COALESCE(MAX(sort_order), 0) + 10 FROM status_components WHERE group_id = ?', [$c['group_id']])->fetchColumn();
        q('INSERT INTO status_components (id, group_id, name, description, status, sort_order) VALUES (?,?,?,?,?,?)', [...array_values($c), $sort]);
        audit($me, 'status.component_created', $c['id']);
    }
    respond(200, ['ok' => true] + status_payload());
}

function action_component_delete(array $me): void
{
    $id = line_in('id', 40);
    $c = q('SELECT * FROM status_components WHERE id = ?', [$id])->fetch();
    if (!$c) {
        fail(404, 'Component not found.');
    }
    q('DELETE FROM status_components WHERE id = ?', [$id]);
    audit($me, 'status.component_deleted', $id, ['name' => $c['name']]);
    respond(200, ['ok' => true] + status_payload());
}

function action_incident_save(array $me): void
{
    $id = int_in('id');
    $title = line_in('title', 200);
    $impact = line_in('impact', 20);
    $components = component_ids_in('components');
    $started = parse_dt(str_in('startedAt', 40)) ?? now_utc();

    $e = [];
    if ($title === '') {
        $e['title'] = 'Enter a title.';
    }
    if (!in_array($impact, INCIDENT_IMPACTS, true)) {
        $e['impact'] = 'Choose an impact.';
    }
    if (!$components) {
        $e['components'] = 'Choose at least one affected component.';
    }

    if ($id > 0) {
        if ($e) {
            fail(422, 'Please check the highlighted fields.', $e);
        }
        if (!q('SELECT COUNT(*) FROM incidents WHERE id = ?', [$id])->fetchColumn()) {
            fail(404, 'Incident not found.');
        }
        q('UPDATE incidents SET title = ?, impact = ?, components = ?, started_at = ? WHERE id = ?', [$title, $impact, json_encode($components), $started, $id]);
        audit($me, 'status.incident_edited', "incident #$id", ['title' => $title]);
    } else {
        $step = line_in('status', 20);
        $message = str_in('message', 2000);
        if (!in_array($step, INCIDENT_STEPS, true) || $step === 'resolved') {
            $e['status'] = 'Choose a status.';
        }
        if ($message === '') {
            $e['message'] = 'Write a first update for customers.';
        }
        if ($e) {
            fail(422, 'Please check the highlighted fields.', $e);
        }
        $pdo = db();
        $pdo->beginTransaction();
        q('INSERT INTO incidents (title, impact, components, started_at) VALUES (?, ?, ?, ?)', [$title, $impact, json_encode($components), $started]);
        $id = (int) $pdo->lastInsertId();
        q('INSERT INTO incident_updates (incident_id, status, message, created_at) VALUES (?, ?, ?, ?)', [$id, $step, $message, now_utc()]);
        $pdo->commit();
        audit($me, 'status.incident_created', "incident #$id", ['title' => $title, 'impact' => $impact]);
    }
    respond(200, ['ok' => true] + status_payload());
}

function action_incident_update(array $me): void
{
    $id = int_in('id');
    $step = line_in('status', 20);
    $message = str_in('message', 2000);
    if (!q('SELECT COUNT(*) FROM incidents WHERE id = ?', [$id])->fetchColumn()) {
        fail(404, 'Incident not found.');
    }
    $e = [];
    if (!in_array($step, INCIDENT_STEPS, true)) {
        $e['status'] = 'Choose a status.';
    }
    if ($message === '') {
        $e['message'] = 'Write an update.';
    }
    if ($e) {
        fail(422, 'Please check the highlighted fields.', $e);
    }
    $now = now_utc();
    q('INSERT INTO incident_updates (incident_id, status, message, created_at) VALUES (?, ?, ?, ?)', [$id, $step, $message, $now]);
    q('UPDATE incidents SET resolved_at = ? WHERE id = ?', [$step === 'resolved' ? $now : null, $id]);
    audit($me, $step === 'resolved' ? 'status.incident_resolved' : 'status.incident_update', "incident #$id", ['status' => $step]);
    respond(200, ['ok' => true] + status_payload());
}

function action_incident_delete(array $me): void
{
    $id = int_in('id');
    $title = q('SELECT title FROM incidents WHERE id = ?', [$id])->fetchColumn();
    if ($title === false) {
        fail(404, 'Incident not found.');
    }
    q('DELETE FROM incidents WHERE id = ?', [$id]);
    audit($me, 'status.incident_deleted', "incident #$id", ['title' => $title]);
    respond(200, ['ok' => true] + status_payload());
}

function action_maintenance_save(array $me): void
{
    $id = int_in('id');
    $title = line_in('title', 200);
    $description = str_in('description', 2000);
    $components = component_ids_in('components');
    $starts = parse_dt(str_in('startsAt', 40));
    $ends = parse_dt(str_in('endsAt', 40));

    $e = [];
    if ($title === '') {
        $e['title'] = 'Enter a title.';
    }
    if ($description === '') {
        $e['description'] = 'Describe the work and its expected impact.';
    }
    if (!$components) {
        $e['components'] = 'Choose at least one affected component.';
    }
    if (!$starts) {
        $e['startsAt'] = 'Enter a start time.';
    }
    if (!$ends) {
        $e['endsAt'] = 'Enter an end time.';
    } elseif ($starts && $ends <= $starts) {
        $e['endsAt'] = 'The end must be after the start.';
    }
    if ($e) {
        fail(422, 'Please check the highlighted fields.', $e);
    }

    if ($id > 0) {
        if (!q('SELECT COUNT(*) FROM maintenance WHERE id = ?', [$id])->fetchColumn()) {
            fail(404, 'Maintenance window not found.');
        }
        q('UPDATE maintenance SET title=?, description=?, components=?, starts_at=?, ends_at=? WHERE id=?', [$title, $description, json_encode($components), $starts, $ends, $id]);
        audit($me, 'status.maintenance_updated', "maintenance #$id", ['title' => $title]);
    } else {
        q('INSERT INTO maintenance (title, description, components, starts_at, ends_at) VALUES (?,?,?,?,?)', [$title, $description, json_encode($components), $starts, $ends]);
        $id = (int) db()->lastInsertId();
        audit($me, 'status.maintenance_scheduled', "maintenance #$id", ['title' => $title, 'starts' => $starts, 'ends' => $ends]);
    }
    respond(200, ['ok' => true] + status_payload());
}

function action_maintenance_delete(array $me): void
{
    $id = int_in('id');
    $title = q('SELECT title FROM maintenance WHERE id = ?', [$id])->fetchColumn();
    if ($title === false) {
        fail(404, 'Maintenance window not found.');
    }
    q('DELETE FROM maintenance WHERE id = ?', [$id]);
    audit($me, 'status.maintenance_deleted', "maintenance #$id", ['title' => $title]);
    respond(200, ['ok' => true] + status_payload());
}

// ---------------------------------------------------------------------------
// Users (admin only)
// ---------------------------------------------------------------------------

function user_row(array $u): array
{
    return [
        'id' => (int) $u['id'],
        'email' => $u['email'],
        'name' => $u['name'],
        'role' => $u['role'],
        'active' => (bool) $u['is_active'],
        'totpEnabled' => (bool) $u['totp_enabled'],
        'lastLoginAt' => iso($u['last_login_at']),
        'createdAt' => iso($u['created_at']),
    ];
}

function action_users(array $me): void
{
    $params = [];
    $where = '';
    if (($term = query('q', 100)) !== '') {
        $where = 'WHERE name LIKE ? OR email LIKE ?';
        $params = [like($term), like($term)];
    }
    $rows = q("SELECT * FROM users $where ORDER BY is_active DESC, name", $params)->fetchAll();
    respond(200, ['ok' => true, 'items' => array_map('user_row', $rows)]);
}

function load_user(int $id): array
{
    $u = q('SELECT * FROM users WHERE id = ?', [$id])->fetch();
    if (!$u) {
        fail(404, 'User not found.');
    }
    return $u;
}

/** Emails a set-password link and also returns it, so it can be shared another way if mail fails. */
function send_set_password_link(array $u, int $ttl, string $subject, string $intro): array
{
    $token = issue_reset_token((int) $u['id'], $ttl);
    $link = rtrim((string) config('site_url', ''), '/') . '/admin/reset-password/?token=' . $token;
    $hours = intdiv($ttl, 3600);
    $sent = send_mail($u['email'], $subject, implode("\n", [
        "Hello {$u['name']},",
        '',
        $intro,
        "Open this link within $hours hours to choose your password:",
        '',
        $link,
    ]));
    return ['link' => $link, 'emailed' => $sent, 'expiresInHours' => $hours];
}

function action_user_create(array $me): void
{
    $name = line_in('name', 100);
    $email = strtolower(line_in('email', 190));
    $role = line_in('role', 20);
    $e = [];
    if ($name === '') {
        $e['name'] = 'Enter a name.';
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $e['email'] = 'Enter a valid email address.';
    } elseif (q('SELECT COUNT(*) FROM users WHERE email = ?', [$email])->fetchColumn()) {
        $e['email'] = 'A user with this email already exists.';
    }
    if (!in_array($role, ROLES, true)) {
        $e['role'] = 'Choose a role.';
    }
    if ($e) {
        fail(422, 'Please check the highlighted fields.', $e);
    }
    // Unusable random password until the invitee sets their own via the link.
    q('INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)', [$email, $name, hash_password(bin2hex(random_bytes(32))), $role]);
    $u = load_user((int) db()->lastInsertId());
    $invite = send_set_password_link($u, 72 * 3600, 'Your Offerhost admin account', 'An Offerhost admin account has been created for you.');
    audit($me, 'user.created', $email, ['role' => $role]);
    respond(200, ['ok' => true, 'item' => user_row($u), 'invite' => $invite]);
}

function action_user_update(array $me): void
{
    $u = load_user(int_in('id'));
    $role = line_in('role', 20);
    $active = bool_in('active');
    if (!in_array($role, ROLES, true)) {
        fail(422, 'Choose a role.');
    }
    if ((int) $u['id'] === $me['id'] && ($role !== $u['role'] || !$active)) {
        fail(422, "You can't change your own role or disable your own account.");
    }
    $removingAdmin = $u['role'] === 'admin' && (int) $u['is_active'] && ($role !== 'admin' || !$active);
    if ($removingAdmin && (int) q("SELECT COUNT(*) FROM users WHERE role = 'admin' AND is_active = 1")->fetchColumn() <= 1) {
        fail(422, 'At least one active admin is required.');
    }
    q('UPDATE users SET role = ?, is_active = ? WHERE id = ?', [$role, $active ? 1 : 0, $u['id']]);
    if (!$active) {
        q('DELETE FROM sessions WHERE user_id = ?', [$u['id']]);
    }
    $changes = [];
    if ($role !== $u['role']) {
        $changes['role'] = ['from' => $u['role'], 'to' => $role];
    }
    if ($active !== (bool) $u['is_active']) {
        $changes['active'] = ['from' => (bool) $u['is_active'], 'to' => $active];
    }
    if ($changes) {
        audit($me, isset($changes['active']) ? ($active ? 'user.enabled' : 'user.disabled') : 'user.role_changed', $u['email'], $changes);
    }
    respond(200, ['ok' => true, 'item' => user_row(load_user((int) $u['id']))]);
}

function action_user_reset_2fa(array $me): void
{
    $u = load_user(int_in('id'));
    if ((int) $u['id'] === $me['id']) {
        fail(422, 'Use your own account page to change your two-factor settings.');
    }
    q('UPDATE users SET totp_enabled = 0, totp_secret = NULL, totp_last_step = NULL WHERE id = ?', [$u['id']]);
    q('DELETE FROM sessions WHERE user_id = ?', [$u['id']]);
    audit($me, 'user.2fa_reset', $u['email']);
    respond(200, ['ok' => true, 'item' => user_row(load_user((int) $u['id']))]);
}

function action_user_send_reset(array $me): void
{
    $u = load_user(int_in('id'));
    if (!(int) $u['is_active']) {
        fail(422, 'Enable the account first.');
    }
    $reset = send_set_password_link($u, 24 * 3600, 'Reset your Offerhost admin password', 'An administrator has sent you a password reset link.');
    audit($me, 'user.reset_link_sent', $u['email']);
    respond(200, ['ok' => true, 'invite' => $reset]);
}

// ---------------------------------------------------------------------------
// Audit log (admin only)
// ---------------------------------------------------------------------------

function audit_row(array $r): array
{
    return [
        'id' => (int) $r['id'],
        'user' => $r['user_email'],
        'action' => $r['action'],
        'target' => $r['target'],
        'details' => $r['details'] ? json_decode($r['details'], true) : null,
        'ip' => $r['ip'],
        'at' => iso($r['created_at']),
    ];
}

function action_audit(array $me): void
{
    $where = [];
    $params = [];
    if (($prefix = query('area', 20)) !== '' && preg_match('/^[a-z]+$/', $prefix)) {
        $where[] = 'action LIKE ?';
        $params[] = $prefix . '.%';
    }
    if (($term = query('q', 100)) !== '') {
        $where[] = '(user_email LIKE ? OR target LIKE ? OR action LIKE ? OR ip LIKE ?)';
        array_push($params, like($term), like($term), like($term), like($term));
    }
    $sqlWhere = $where ? 'WHERE ' . implode(' AND ', $where) : '';
    $total = (int) q("SELECT COUNT(*) FROM audit_log $sqlWhere", $params)->fetchColumn();
    $offset = (page() - 1) * 50;
    $rows = q("SELECT * FROM audit_log $sqlWhere ORDER BY id DESC LIMIT 50 OFFSET $offset", $params)->fetchAll();
    respond(200, ['ok' => true, 'items' => array_map('audit_row', $rows), 'total' => $total, 'pageSize' => 50]);
}
