// RBAC Utilities and Type Definitions

export type RoleName = 'platform_admin' | 'cpo_admin' | 'operator' | 'driver';

export interface UserRole {
    id: string;
    name: RoleName;
    displayName: string;
    description: string;
    permissions: Record<string, string[]>;
}

export interface TenantContext {
    userId: string;
    organizationId: string;
    roleId: string;
    roleName: RoleName;
}

export interface Organization {
    id: string;
    name: string;
    slug: string;
    type: 'platform' | 'cpo';
    status: 'active' | 'suspended' | 'inactive';
}

// Role Permissions
export const ROLE_PERMISSIONS = {
    platform_admin: {
        dashboard: ['view_all'],
        stations: ['view_all', 'create', 'edit', 'delete'],
        sessions: ['view_all', 'manage'],
        users: ['view_all', 'create', 'edit', 'delete'],
        settings: ['general', 'pricing', 'notifications', 'integrations', 'ocpp', 'webhooks', 'database'],
    },
    cpo_admin: {
        dashboard: ['view_own'],
        stations: ['view_own', 'create', 'edit', 'delete'],
        sessions: ['view_own', 'manage'],
        users: ['view_own', 'create', 'edit', 'delete'],
        settings: ['general', 'pricing', 'notifications'],
    },
    operator: {
        dashboard: ['view_own'],
        stations: ['view_own'],
        sessions: ['view_own', 'approve', 'handle_incidents'],
    },
    driver: {
        app: ['find_chargers', 'reserve', 'charge', 'view_history', 'payments'],
    },
} as const;

// Check if user has permission
export function hasPermission(
    roleName: RoleName,
    resource: string,
    action: string
): boolean {
    const permissions = ROLE_PERMISSIONS[roleName];
    if (!permissions) return false;

    const resourcePermissions = permissions[resource as keyof typeof permissions];
    if (!resourcePermissions) return false;

    return resourcePermissions.includes(action);
}

// Check if user can access a settings tab
export function canAccessSettingsTab(
    roleName: RoleName,
    tabName: string
): boolean {
    const settingsPermissions = ROLE_PERMISSIONS[roleName]?.settings;
    if (!settingsPermissions) return false;

    return settingsPermissions.includes(tabName);
}

// Get navigation items for role
export function getNavigationForRole(roleName: RoleName) {
    const allNavItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: 'LayoutDashboard',
            roles: ['platform_admin', 'cpo_admin', 'operator'],
        },
        {
            name: 'Stations',
            href: '/dashboard/stations',
            icon: 'MapPin',
            roles: ['platform_admin', 'cpo_admin', 'operator'],
        },
        {
            name: 'Map',
            href: '/dashboard/map',
            icon: 'MapPin',
            roles: ['platform_admin', 'cpo_admin', 'operator'],
        },
        {
            name: 'Sessions',
            href: '/dashboard/sessions',
            icon: 'Activity',
            roles: ['platform_admin', 'cpo_admin', 'operator'],
        },
        {
            name: 'Users',
            href: '/dashboard/users',
            icon: 'Users',
            roles: ['platform_admin', 'cpo_admin'],
        },
        {
            name: 'Settings',
            href: '/dashboard/settings',
            icon: 'Settings',
            roles: ['platform_admin', 'cpo_admin'],
        },
    ];

    return allNavItems.filter((item) => item.roles.includes(roleName));
}

// Get settings tabs for role
export function getSettingsTabsForRole(roleName: RoleName) {
    const allTabs = [
        { value: 'general', label: 'General', icon: 'Building2', roles: ['platform_admin', 'cpo_admin'] },
        { value: 'pricing', label: 'Pricing', icon: 'DollarSign', roles: ['platform_admin', 'cpo_admin'] },
        { value: 'notifications', label: 'Notifications', icon: 'Bell', roles: ['platform_admin', 'cpo_admin'] },
        { value: 'integrations', label: 'Integrations', icon: 'Plug2', roles: ['platform_admin'] },
        { value: 'ocpp', label: 'OCPP/CitrineOS', icon: 'Server', roles: ['platform_admin'] },
        { value: 'webhooks', label: 'Webhooks', icon: 'Webhook', roles: ['platform_admin'] },
        { value: 'database', label: 'Database', icon: 'Database', roles: ['platform_admin'] },
    ];

    return allTabs.filter((tab) => tab.roles.includes(roleName));
}

// Mock function to get current user's tenant context
// In production, this would fetch from session/JWT
export async function getTenantContext(): Promise<TenantContext> {
    // TODO: Replace with actual session/JWT parsing
    return {
        userId: 'user-123',
        organizationId: 'org-123',
        roleId: 'role-123',
        roleName: 'platform_admin', // Default to platform_admin for development
    };
}

// Check if user is platform admin
export function isPlatformAdmin(roleName: RoleName): boolean {
    return roleName === 'platform_admin';
}

// Check if user is CPO admin
export function isCPOAdmin(roleName: RoleName): boolean {
    return roleName === 'cpo_admin';
}

// Check if user is operator
export function isOperator(roleName: RoleName): boolean {
    return roleName === 'operator';
}

// Check if user is driver
export function isDriver(roleName: RoleName): boolean {
    return roleName === 'driver';
}
