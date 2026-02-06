import { query, queryOne, insert, execute, transaction } from '@/lib/db/mariadb'
import type { PoolConnection } from 'mysql2/promise'

export interface Session {
    id: string
    station_id: string | null
    connector_id: string | null
    user_id: string | null
    transaction_id: string | null
    status: 'active' | 'completed' | 'failed' | 'stopped'
    start_time: string
    end_time: string | null
    energy_kwh: number
    duration_minutes: number
    cost: number
    currency: string
    tariff_id: string | null
    payment_method: 'wallet' | 'cmi' | 'stripe' | 'rfid' | 'free' | 'youcan' | null
    payment_status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'
    payment_reference: string | null
    meter_start: number | null
    meter_stop: number | null
    stop_reason: string | null
    vehicle_info: any | null
    created_at: string
}

export interface SessionWithDetails extends Session {
    station_name?: string
    connector_number?: number
    user_email?: string
}

// Get all sessions (with optional user filter)
export async function getSessions(userId?: string): Promise<SessionWithDetails[]> {
    let sql = `
    SELECT 
      s.*,
      st.name as station_name,
      c.connector_number,
      u.email as user_email
    FROM sessions s
    LEFT JOIN stations st ON s.station_id = st.id
    LEFT JOIN connectors c ON s.connector_id = c.id
    LEFT JOIN users u ON s.user_id = u.id
  `
    const params: any[] = []

    if (userId) {
        sql += ' WHERE s.user_id = ?'
        params.push(userId)
    }

    sql += ' ORDER BY s.start_time DESC'

    const sessions = await query<SessionWithDetails>(sql, params)

    return sessions.map(session => ({
        ...session,
        vehicle_info: session.vehicle_info ? JSON.parse(session.vehicle_info as any) : null
    }))
}

// Get a single session by ID
export async function getSessionById(id: string): Promise<SessionWithDetails | null> {
    const session = await queryOne<SessionWithDetails>(`
    SELECT 
      s.*,
      st.name as station_name,
      c.connector_number,
      u.email as user_email
    FROM sessions s
    LEFT JOIN stations st ON s.station_id = st.id
    LEFT JOIN connectors c ON s.connector_id = c.id
    LEFT JOIN users u ON s.user_id = u.id
    WHERE s.id = ?
  `, [id])

    if (!session) {
        return null
    }

    return {
        ...session,
        vehicle_info: session.vehicle_info ? JSON.parse(session.vehicle_info as any) : null
    }
}

// Create a new charging session
export async function createSession(data: {
    station_id: string
    connector_id: string
    user_id: string
    transaction_id?: string
    tariff_id?: string
    payment_method?: 'wallet' | 'cmi' | 'stripe' | 'rfid' | 'free' | 'youcan'
    meter_start?: number
    vehicle_info?: any
}): Promise<string> {
    return await transaction(async (conn: PoolConnection) => {
        // Create the session
        const [result] = await conn.execute(`
      INSERT INTO sessions (
        station_id, connector_id, user_id, transaction_id,
        tariff_id, payment_method, meter_start, vehicle_info
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            data.station_id,
            data.connector_id,
            data.user_id,
            data.transaction_id || null,
            data.tariff_id || null,
            data.payment_method || null,
            data.meter_start || null,
            data.vehicle_info ? JSON.stringify(data.vehicle_info) : null
        ])

        const insertResult = result as any
        const sessionId = insertResult.insertId.toString()

        // Update connector status to 'charging'
        await conn.execute(`
      UPDATE connectors
      SET status = 'charging', current_session_id = ?
      WHERE id = ?
    `, [sessionId, data.connector_id])

        return sessionId
    })
}

// Update a session (typically to end it)
export async function updateSession(
    id: string,
    data: {
        status?: 'active' | 'completed' | 'failed' | 'stopped'
        end_time?: string
        energy_kwh?: number
        duration_minutes?: number
        cost?: number
        payment_status?: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'
        payment_reference?: string
        meter_stop?: number
        stop_reason?: string
    }
): Promise<boolean> {
    return await transaction(async (conn: PoolConnection) => {
        // Get the session first to update connector
        const [sessions] = await conn.execute<any>(
            'SELECT connector_id FROM sessions WHERE id = ?',
            [id]
        )

        if (sessions.length === 0) {
            return false
        }

        const session = sessions[0]

        // Build update query
        const updates: string[] = []
        const values: any[] = []

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                updates.push(`${key} = ?`)
                values.push(value)
            }
        })

        if (updates.length === 0) {
            return false
        }

        values.push(id)

        // Update the session
        await conn.execute(`
      UPDATE sessions
      SET ${updates.join(', ')}
      WHERE id = ?
    `, values)

        // If session is completed or stopped, update connector status
        if (data.status === 'completed' || data.status === 'stopped' || data.status === 'failed') {
            await conn.execute(`
        UPDATE connectors
        SET status = 'available', current_session_id = NULL
        WHERE id = ?
      `, [session.connector_id])
        }

        return true
    })
}

// Get active session for a user
export async function getActiveSession(userId: string): Promise<SessionWithDetails | null> {
    const session = await queryOne<SessionWithDetails>(`
    SELECT 
      s.*,
      st.name as station_name,
      c.connector_number,
      u.email as user_email
    FROM sessions s
    LEFT JOIN stations st ON s.station_id = st.id
    LEFT JOIN connectors c ON s.connector_id = c.id
    LEFT JOIN users u ON s.user_id = u.id
    WHERE s.user_id = ? AND s.status = 'active'
    ORDER BY s.start_time DESC
    LIMIT 1
  `, [userId])

    if (!session) {
        return null
    }

    return {
        ...session,
        vehicle_info: session.vehicle_info ? JSON.parse(session.vehicle_info as any) : null
    }
}

// Get recent sessions (last N sessions)
export async function getRecentSessions(limit: number = 10): Promise<SessionWithDetails[]> {
    const sessions = await query<SessionWithDetails>(`
    SELECT 
      s.*,
      st.name as station_name,
      c.connector_number,
      u.email as user_email
    FROM sessions s
    LEFT JOIN stations st ON s.station_id = st.id
    LEFT JOIN connectors c ON s.connector_id = c.id
    LEFT JOIN users u ON s.user_id = u.id
    ORDER BY s.start_time DESC
    LIMIT ?
  `, [limit])

    return sessions.map(session => ({
        ...session,
        vehicle_info: session.vehicle_info ? JSON.parse(session.vehicle_info as any) : null
    }))
}

// Get sessions by station
export async function getSessionsByStation(stationId: string): Promise<SessionWithDetails[]> {
    const sessions = await query<SessionWithDetails>(`
    SELECT 
      s.*,
      st.name as station_name,
      c.connector_number,
      u.email as user_email
    FROM sessions s
    LEFT JOIN stations st ON s.station_id = st.id
    LEFT JOIN connectors c ON s.connector_id = c.id
    LEFT JOIN users u ON s.user_id = u.id
    WHERE s.station_id = ?
    ORDER BY s.start_time DESC
  `, [stationId])

    return sessions.map(session => ({
        ...session,
        vehicle_info: session.vehicle_info ? JSON.parse(session.vehicle_info as any) : null
    }))
}
