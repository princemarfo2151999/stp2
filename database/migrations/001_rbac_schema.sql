-- CPMS Multi-Tenant RBAC Schema
-- Part 1: Tenancy & Identity Tables

-- Organizations (Multi-Tenant)
CREATE TABLE IF NOT EXISTS organizations (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  type ENUM('platform', 'cpo') DEFAULT 'cpo',
  status ENUM('active', 'suspended', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_type (type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Organization Memberships (Many-to-Many with Roles)
CREATE TABLE IF NOT EXISTS user_org_memberships (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  organization_id CHAR(36) NOT NULL,
  role_id CHAR(36) NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  UNIQUE KEY unique_user_org_role (user_id, organization_id, role_id),
  INDEX idx_user (user_id),
  INDEX idx_org (organization_id),
  INDEX idx_role (role_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Roles
INSERT INTO roles (id, name, display_name, description, permissions) VALUES
  (UUID(), 'platform_admin', 'Platform Admin', 'WATTSC super-admin with full access to all features and all tenants', 
   JSON_OBJECT(
     'dashboard', JSON_ARRAY('view_all'),
     'stations', JSON_ARRAY('view_all', 'create', 'edit', 'delete'),
     'sessions', JSON_ARRAY('view_all', 'manage'),
     'users', JSON_ARRAY('view_all', 'create', 'edit', 'delete'),
     'settings', JSON_ARRAY('general', 'pricing', 'notifications', 'integrations', 'ocpp', 'webhooks', 'database')
   )),
  (UUID(), 'cpo_admin', 'CPO Admin', 'Tenant admin managing their organization', 
   JSON_OBJECT(
     'dashboard', JSON_ARRAY('view_own'),
     'stations', JSON_ARRAY('view_own', 'create', 'edit', 'delete'),
     'sessions', JSON_ARRAY('view_own', 'manage'),
     'users', JSON_ARRAY('view_own', 'create', 'edit', 'delete'),
     'settings', JSON_ARRAY('general', 'pricing', 'notifications')
   )),
  (UUID(), 'operator', 'Operator', 'Operations staff monitoring sessions and handling incidents', 
   JSON_OBJECT(
     'dashboard', JSON_ARRAY('view_own'),
     'stations', JSON_ARRAY('view_own'),
     'sessions', JSON_ARRAY('view_own', 'approve', 'handle_incidents')
   )),
  (UUID(), 'driver', 'Driver', 'EV user/driver using the charging network', 
   JSON_OBJECT(
     'app', JSON_ARRAY('find_chargers', 'reserve', 'charge', 'view_history', 'payments')
   ))
ON DUPLICATE KEY UPDATE 
  display_name = VALUES(display_name),
  description = VALUES(description),
  permissions = VALUES(permissions);

-- Seed Platform Organization
INSERT INTO organizations (id, name, slug, type, status) VALUES
  (UUID(), 'WATTSC Platform', 'wattsc-platform', 'platform', 'active')
ON DUPLICATE KEY UPDATE 
  name = VALUES(name),
  type = VALUES(type);
