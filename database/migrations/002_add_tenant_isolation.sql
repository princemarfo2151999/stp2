-- CPMS Multi-Tenant RBAC Schema
-- Part 2: Add Tenant Isolation to Existing Tables

-- Add organization_id to stations table
ALTER TABLE stations 
ADD COLUMN organization_id CHAR(36) AFTER id,
ADD INDEX idx_org_stations (organization_id);

-- Add foreign key constraint (if stations table exists)
-- ALTER TABLE stations 
-- ADD CONSTRAINT fk_stations_org 
-- FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organization_id to charge_sessions table
ALTER TABLE charge_sessions 
ADD COLUMN organization_id CHAR(36) AFTER id,
ADD INDEX idx_org_sessions (organization_id);

-- Add foreign key constraint (if charge_sessions table exists)
-- ALTER TABLE charge_sessions 
-- ADD CONSTRAINT fk_sessions_org 
-- FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organization_id to settings table
ALTER TABLE settings 
ADD COLUMN organization_id CHAR(36) AFTER id,
ADD INDEX idx_org_settings (organization_id);

-- Add foreign key constraint (if settings table exists)
-- ALTER TABLE settings 
-- ADD CONSTRAINT fk_settings_org 
-- FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Update unique constraint on settings to include organization_id
ALTER TABLE settings 
DROP INDEX IF EXISTS unique_category_key,
ADD UNIQUE KEY unique_org_category_key (organization_id, category, `key`);
