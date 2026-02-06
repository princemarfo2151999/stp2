import { NextRequest, NextResponse } from 'next/server'
import {
    getSetting,
    getSettingsByCategory,
    getAllSettings,
    updateSetting,
    deleteSetting,
    getPaymentSettings,
    updatePaymentSetting,
} from '@/lib/api/settings'
import {
    getTenantContextFromRequest,
    checkPermission,
} from '@/lib/rbac/tenant-context'

// GET /api/settings
export async function GET(request: NextRequest) {
    try {
        const tenantContext = await getTenantContextFromRequest(request)

        // Settings requires at least some settings permission
        const hasAnySettingsAccess = checkPermission(tenantContext, 'settings', 'general') ||
            checkPermission(tenantContext, 'settings', 'pricing') ||
            checkPermission(tenantContext, 'settings', 'notifications') ||
            checkPermission(tenantContext, 'settings', 'integrations') ||
            checkPermission(tenantContext, 'settings', 'ocpp') ||
            checkPermission(tenantContext, 'settings', 'webhooks') ||
            checkPermission(tenantContext, 'settings', 'database')

        if (!hasAnySettingsAccess) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const key = searchParams.get('key')
        const category = searchParams.get('category')

        // Get single setting
        if (key) {
            const setting = await getSetting(key)
            if (!setting) {
                return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
            }
            return NextResponse.json(setting)
        }

        // Get payment settings
        if (category === 'payment') {
            const settings = await getPaymentSettings()
            return NextResponse.json(settings)
        }

        // Get settings by category
        if (category) {
            const settings = await getSettingsByCategory(category)
            return NextResponse.json(settings)
        }

        // Get all settings
        const settings = await getAllSettings()
        return NextResponse.json(settings)
    } catch (error) {
        console.error('Error fetching settings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        )
    }
}

// PUT /api/settings
export async function PUT(request: NextRequest) {
    try {
        const tenantContext = await getTenantContextFromRequest(request)

        // Check if user has settings write access (platform_admin or cpo_admin for their tabs)
        const hasAnySettingsAccess = checkPermission(tenantContext, 'settings', 'general') ||
            checkPermission(tenantContext, 'settings', 'pricing') ||
            checkPermission(tenantContext, 'settings', 'notifications')

        if (!hasAnySettingsAccess) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 })
        }

        const body = await request.json()
        const { key, value, category, updatedBy } = body

        if (!key || value === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields: key, value' },
                { status: 400 }
            )
        }

        // Handle payment settings specifically
        if (key === 'youcan_pay' || key === 'cmi') {
            const success = await updatePaymentSetting(key, value, updatedBy)
            if (!success) {
                return NextResponse.json(
                    { error: 'Failed to update payment setting' },
                    { status: 500 }
                )
            }
        } else {
            const success = await updateSetting(key, value, category, updatedBy)
            if (!success) {
                return NextResponse.json(
                    { error: 'Failed to update setting' },
                    { status: 500 }
                )
            }
        }

        const setting = await getSetting(key)
        return NextResponse.json(setting)
    } catch (error) {
        console.error('Error updating setting:', error)
        return NextResponse.json(
            { error: 'Failed to update setting' },
            { status: 500 }
        )
    }
}

// DELETE /api/settings
export async function DELETE(request: NextRequest) {
    try {
        const tenantContext = await getTenantContextFromRequest(request)

        // Only platform admins can delete settings
        if (tenantContext.roleName !== 'platform_admin') {
            return NextResponse.json({ error: 'Forbidden: only platform admins can delete settings' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const key = searchParams.get('key')

        if (!key) {
            return NextResponse.json(
                { error: 'Missing setting key' },
                { status: 400 }
            )
        }

        const success = await deleteSetting(key)
        if (!success) {
            return NextResponse.json(
                { error: 'Setting not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting setting:', error)
        return NextResponse.json(
            { error: 'Failed to delete setting' },
            { status: 500 }
        )
    }
}
