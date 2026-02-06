import { query, queryOne, execute } from '@/lib/db/mariadb'

export interface Setting {
    id: string
    key: string
    value: any
    category: string | null
    updated_at: string
    updated_by: string | null
}

// Get a setting by key
export async function getSetting(key: string): Promise<Setting | null> {
    const setting = await queryOne<Setting>(`
    SELECT * FROM settings
    WHERE \`key\` = ?
  `, [key])

    if (!setting) {
        return null
    }

    return {
        ...setting,
        value: setting.value ? JSON.parse(setting.value as any) : null
    }
}

// Get all settings by category
export async function getSettingsByCategory(category: string): Promise<Setting[]> {
    const settings = await query<Setting>(`
    SELECT * FROM settings
    WHERE category = ?
    ORDER BY \`key\`
  `, [category])

    return settings.map(setting => ({
        ...setting,
        value: setting.value ? JSON.parse(setting.value as any) : null
    }))
}

// Get all settings
export async function getAllSettings(): Promise<Setting[]> {
    const settings = await query<Setting>(`
    SELECT * FROM settings
    ORDER BY category, \`key\`
  `)

    return settings.map(setting => ({
        ...setting,
        value: setting.value ? JSON.parse(setting.value as any) : null
    }))
}

// Update or create a setting (UPSERT)
export async function updateSetting(
    key: string,
    value: any,
    category?: string,
    updatedBy?: string
): Promise<boolean> {
    const jsonValue = JSON.stringify(value)

    const affectedRows = await execute(`
    INSERT INTO settings (\`key\`, \`value\`, category, updated_by)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      \`value\` = VALUES(\`value\`),
      category = VALUES(category),
      updated_by = VALUES(updated_by),
      updated_at = CURRENT_TIMESTAMP
  `, [key, jsonValue, category || null, updatedBy || null])

    return affectedRows > 0
}

// Delete a setting
export async function deleteSetting(key: string): Promise<boolean> {
    const affectedRows = await execute(`
    DELETE FROM settings WHERE \`key\` = ?
  `, [key])

    return affectedRows > 0
}

// Helper functions for specific setting types

// Payment settings
export async function getPaymentSettings(): Promise<{
    youcanPay?: {
        clientId?: string
        clientSecret?: string
        enabled?: boolean
    }
    cmi?: {
        storeId?: string
        clientId?: string
        secretKey?: string
        gatewayUrl?: string
        enabled?: boolean
    }
}> {
    const settings = await getSettingsByCategory('payment')
    const paymentSettings: any = {}

    settings.forEach(setting => {
        if (setting.key === 'youcan_pay') {
            paymentSettings.youcanPay = setting.value
        } else if (setting.key === 'cmi') {
            paymentSettings.cmi = setting.value
        }
    })

    return paymentSettings
}

export async function updatePaymentSetting(
    provider: 'youcan_pay' | 'cmi',
    config: any,
    updatedBy?: string
): Promise<boolean> {
    return await updateSetting(provider, config, 'payment', updatedBy)
}

// Company settings
export async function getCompanySettings(): Promise<any> {
    const setting = await getSetting('company_info')
    return setting ? setting.value : null
}

export async function updateCompanySettings(
    config: any,
    updatedBy?: string
): Promise<boolean> {
    return await updateSetting('company_info', config, 'general', updatedBy)
}
