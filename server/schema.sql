-- Offerhost site database (admin panel, contact messages, plans, status page).
-- Import once via cPanel → phpMyAdmin → (select database) → Import.
-- Requires MySQL 5.7+ or MariaDB 10.3+. All timestamps are stored in UTC.

SET NAMES utf8mb4;

CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(190) NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','editor') NOT NULL DEFAULT 'editor',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  totp_secret VARCHAR(255) NULL,          -- encrypted with app_key
  totp_enabled TINYINT(1) NOT NULL DEFAULT 0,
  totp_last_step BIGINT NULL,             -- prevents code replay
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sessions (
  id CHAR(64) NOT NULL,                   -- SHA-256 of the cookie token (token itself is never stored)
  user_id INT UNSIGNED NOT NULL,
  csrf_token CHAR(64) NOT NULL,
  remember TINYINT(1) NOT NULL DEFAULT 0,
  ip VARCHAR(45) NOT NULL,
  user_agent VARCHAR(255) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL,
  last_seen_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY ix_sessions_user (user_id),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE password_resets (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_resets_token (token_hash),
  KEY ix_resets_user (user_id),
  CONSTRAINT fk_resets_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rate_limits (
  bucket CHAR(64) NOT NULL,               -- SHA-256 of e.g. "login:ip:1.2.3.4"
  hits INT UNSIGNED NOT NULL,
  window_start INT UNSIGNED NOT NULL,     -- unix time
  PRIMARY KEY (bucket)
) ENGINE=InnoDB DEFAULT CHARSET=ascii;

CREATE TABLE audit_log (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NULL,
  user_email VARCHAR(190) NULL,           -- snapshot, survives user deletion
  action VARCHAR(64) NOT NULL,
  target VARCHAR(190) NULL,
  details TEXT NULL,                      -- JSON
  ip VARCHAR(45) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_audit_created (created_at),
  KEY ix_audit_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE contact_messages (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(200) NOT NULL,
  company VARCHAR(120) NOT NULL DEFAULT '',
  topic VARCHAR(20) NOT NULL,
  plan VARCHAR(60) NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  ip VARCHAR(45) NOT NULL,
  user_agent VARCHAR(300) NOT NULL DEFAULT '',
  status ENUM('new','handled') NOT NULL DEFAULT 'new',
  note TEXT NULL,
  handled_by INT UNSIGNED NULL,
  handled_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_messages_status (status, created_at),
  CONSTRAINT fk_messages_handler FOREIGN KEY (handled_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE plans (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(60) NOT NULL,
  name VARCHAR(80) NOT NULL,
  summary VARCHAR(160) NOT NULL DEFAULT '',
  cpu VARCHAR(80) NOT NULL,
  ram VARCHAR(80) NOT NULL,
  storage VARCHAR(80) NOT NULL,
  network VARCHAR(80) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  location VARCHAR(10) NOT NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  badge VARCHAR(30) NOT NULL DEFAULT '',
  order_url VARCHAR(300) NOT NULL DEFAULT '',  -- e.g. HostBill cart link; empty = /contact/?plan=
  visible TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_plans_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE status_groups (
  id VARCHAR(40) NOT NULL,
  title VARCHAR(100) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE status_components (
  id VARCHAR(40) NOT NULL,
  group_id VARCHAR(40) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(200) NOT NULL DEFAULT '',
  status ENUM('operational','degraded','partial_outage','major_outage','maintenance') NOT NULL DEFAULT 'operational',
  sort_order INT NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_components_group (group_id),
  CONSTRAINT fk_components_group FOREIGN KEY (group_id) REFERENCES status_groups (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE incidents (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  impact ENUM('degraded','partial_outage','major_outage','maintenance') NOT NULL,
  components TEXT NOT NULL,               -- JSON array of component ids
  started_at DATETIME NOT NULL,
  resolved_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_incidents_started (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE incident_updates (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  incident_id INT UNSIGNED NOT NULL,
  status ENUM('investigating','identified','monitoring','resolved') NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY ix_updates_incident (incident_id),
  CONSTRAINT fk_updates_incident FOREIGN KEY (incident_id) REFERENCES incidents (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE maintenance (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  components TEXT NOT NULL,               -- JSON array of component ids
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_maintenance_starts (starts_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Seed: the current plans and status components from src/lib/site.ts / status.ts
-- ---------------------------------------------------------------------------

INSERT INTO plans (slug, name, summary, cpu, ram, storage, network, price, location, featured, badge, sort_order) VALUES
  ('ryzen-5-3600',  'Ryzen 5 3600',  'Efficient 6-core for hosting and apps', 'AMD Ryzen 5 3600',  '128 GB DDR4', '2 × 1 TB NVMe', '1 Gbps IN / Unmetered OUT',  90.00, 'nl', 0, '',             10),
  ('ryzen-7-3700x', 'Ryzen 7 3700X', '8 cores for business workloads',        'AMD Ryzen 7 3700X', '128 GB DDR4', '2 × 1 TB NVMe', '1 Gbps IN / Unmetered OUT', 100.00, 'nl', 0, '',             20),
  ('ryzen-9-5950x', 'Ryzen 9 5950X', '16 cores for demanding applications',   'AMD Ryzen 9 5950X', '128 GB DDR4', '2 × 1 TB NVMe', '1 Gbps IN / Unmetered OUT', 150.00, 'nl', 1, 'MOST POPULAR', 30),
  ('ryzen-9-7950x', 'Ryzen 9 7950X', 'Latest-gen Zen 4 with DDR5',            'AMD Ryzen 9 7950X', '192 GB DDR5', '2 × 1 TB NVMe', '1 Gbps IN / Unmetered OUT', 200.00, 'nl', 0, '',             40);

INSERT INTO status_groups (id, title, sort_order) VALUES
  ('network',   'Network — AS208220',    10),
  ('locations', 'Data Center Locations', 20),
  ('services',  'Services',              30);

INSERT INTO status_components (id, group_id, name, description, sort_order) VALUES
  ('bgp',       'network',   'BGP Routing',             'Announcements and upstream sessions', 10),
  ('transit',   'network',   'IP Transit & Peering',    'Upstream connectivity',               20),
  ('ipv4',      'network',   'IPv4 Connectivity',       '',                                    30),
  ('ipv6',      'network',   'IPv6 Connectivity',       '',                                    40),
  ('ddos',      'network',   'DDoS Protection',         'Network-level mitigation',            50),
  ('ams',       'locations', 'Amsterdam, Netherlands',  '',                                    10),
  ('fra',       'locations', 'Frankfurt, Germany',      '',                                    20),
  ('lon',       'locations', 'London, United Kingdom',  '',                                    30),
  ('nyc',       'locations', 'New York, United States', '',                                    40),
  ('dedicated', 'services',  'Dedicated Servers',       '',                                    10),
  ('portal',    'services',  'Customer Portal',         '',                                    20),
  ('support',   'services',  'Support Desk',            '',                                    30);
