// Tenant Context Middleware for API Routes

import { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';

export interface TenantContext {
    userId: string;
    organizationId: string;
    roleId: string;
    roleName: 'platform_admin' | 'cpo_admin' | 'operator' | 'driver';
}

// Get database connection
async function getDbConnection() {
    return await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'cpms',
    });
}

// Get tenant context from request
// In production, this would parse JWT token or session
export async function getTenantContextFromRequest(
    req: NextRequest
): Promise<TenantContext> {
    // TODO: Replace with actual JWT/session parsing
    // For now, return mock platform admin context

    // Example: Parse from Authorization header
    // const token = req.headers.get('authorization')?.replace('Bearer ', '');
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return {
        userId: 'user-123',
        organizationId: 'org-platform',
        roleId: 'role-platform-admin',
        roleName: 'platform_admin',
    };
}

// Apply tenant filter to SQL query
export function applyTenantFilter(
    baseQuery: string,
    tenantContext: TenantContext,
    tableAlias: string = ''
): { query: string; params: any[] } {
    const { roleName, organizationId } = tenantContext;

    // Platform admin sees all data
    if (roleName === 'platform_admin') {
        return { query: baseQuery, params: [] };
    }

    // Other roles see only their organization's data
    const orgColumn = tableAlias ? `${tableAlias}.organization_id` : 'organization_id';
    const whereClause = baseQuery.toLowerCase().includes('where')
        ? `AND ${orgColumn} = ?`
        : `WHERE ${orgColumn} = ?`;

    return {
        query: `${baseQuery} ${whereClause}`,
        params: [organizationId],
    };
}

// Check if user has permission
export function checkPermission(
    tenantContext: TenantContext,
    resource: string,
    action: string
): boolean {
    const { roleName } = tenantContext;

    const permissions: Record<string, Record<string, string[]>> = {
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
    };

    const rolePermissions = permissions[roleName];
    if (!rolePermissions) return false;

    const resourcePermissions = rolePermissions[resource];
    if (!resourcePermissions) return false;

    return resourcePermissions.includes(action);
}

// Middleware wrapper for API routes
export function withTenantContext(
    handler: (req: NextRequest, context: TenantContext) => Promise<Response>
) {
    return async (req: NextRequest) => {
        try {
            const tenantContext = await getTenantContextFromRequest(req);
            return await handler(req, tenantContext);
        } catch (error) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }
    };
}

// Get stations with tenant filtering
export async function getStationsForTenant(
    tenantContext: TenantContext
): Promise<any[]> {
    const connection = await getDbConnection();

    try {
        const baseQuery = 'SELECT * FROM stations';
        const { query, params } = applyTenantFilter(baseQuery, tenantContext);

        const [rows] = await connection.execute(query, params);
        return rows as any[];
    } finally {
        await connection.end();
    }
}

// Get sessions with tenant filtering
export async function getSessionsForTenant(
    tenantContext: TenantContext
): Promise<any[]> {
    const connection = await getDbConnection();

    try {
        const baseQuery = 'SELECT * FROM charge_sessions';
        const { query, params } = applyTenantFilter(baseQuery, tenantContext);

        const [rows] = await connection.execute(query, params);
        return rows as any[];
    } finally {
        await connection.end();
    }
}

// Get settings with tenant filtering
export async function getSettingsForTenant(
    tenantContext: TenantContext,
    category?: string
): Promise<any[]> {
    const connection = await getDbConnection();

    try {
        let baseQuery = 'SELECT * FROM settings';
        const params: any[] = [];

        if (category) {
            baseQuery += ' WHERE category = ?';
            params.push(category);
        }

        const { query, params: tenantParams } = applyTenantFilter(baseQuery, tenantContext);

        const [rows] = await connection.execute(query, [...params, ...tenantParams]);
        return rows as any[];
    } finally {
        await connection.end();
    }
}
