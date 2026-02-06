import { NextRequest, NextResponse } from 'next/server'
import {
    getSessions,
    getSessionById,
    createSession,
    updateSession,
    getActiveSession,
    getRecentSessions,
    getSessionsByStation,
} from '@/lib/api/sessions'
import {
    getTenantContextFromRequest,
    checkPermission,
} from '@/lib/rbac/tenant-context'

// GET /api/sessions
export async function GET(request: NextRequest) {
    try {
        const tenantContext = await getTenantContextFromRequest(request)

        // Check read permission
        if (!checkPermission(tenantContext, 'sessions', 'view_all') &&
            !checkPermission(tenantContext, 'sessions', 'view_own')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const userId = searchParams.get('userId')
        const stationId = searchParams.get('stationId')
        const active = searchParams.get('active')
        const limit = searchParams.get('limit')

        // Get single session
        if (id) {
            const session = await getSessionById(id)
            if (!session) {
                return NextResponse.json({ error: 'Session not found' }, { status: 404 })
            }
            return NextResponse.json(session)
        }

        // Get active session for user
        if (active && userId) {
            const session = await getActiveSession(userId)
            return NextResponse.json(session)
        }

        // Get sessions by station
        if (stationId) {
            const sessions = await getSessionsByStation(stationId)
            return NextResponse.json(sessions)
        }

        // Get recent sessions with limit
        if (limit) {
            const sessions = await getRecentSessions(parseInt(limit))
            return NextResponse.json(sessions)
        }

        // Get all sessions (optionally filtered by user)
        const sessions = await getSessions(userId || undefined)
        return NextResponse.json(sessions)
    } catch (error) {
        console.error('Error fetching sessions:', error)
        return NextResponse.json(
            { error: 'Failed to fetch sessions' },
            { status: 500 }
        )
    }
}

// POST /api/sessions
export async function POST(request: NextRequest) {
    try {
        const tenantContext = await getTenantContextFromRequest(request)

        // Check manage permission for creating sessions
        if (!checkPermission(tenantContext, 'sessions', 'manage') &&
            !checkPermission(tenantContext, 'sessions', 'view_all')) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 })
        }

        const body = await request.json()

        // Validate required fields
        if (!body.station_id || !body.connector_id || !body.user_id) {
            return NextResponse.json(
                { error: 'Missing required fields: station_id, connector_id, user_id' },
                { status: 400 }
            )
        }

        const sessionId = await createSession(body)
        const session = await getSessionById(sessionId)

        return NextResponse.json(session, { status: 201 })
    } catch (error) {
        console.error('Error creating session:', error)
        return NextResponse.json(
            { error: 'Failed to create session' },
            { status: 500 }
        )
    }
}

// PUT /api/sessions
export async function PUT(request: NextRequest) {
    try {
        const tenantContext = await getTenantContextFromRequest(request)

        // Check manage permission for updating sessions
        if (!checkPermission(tenantContext, 'sessions', 'manage')) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 })
        }

        const body = await request.json()
        const { id, ...data } = body

        if (!id) {
            return NextResponse.json(
                { error: 'Missing session id' },
                { status: 400 }
            )
        }

        const success = await updateSession(id, data)
        if (!success) {
            return NextResponse.json(
                { error: 'Session not found or no changes made' },
                { status: 404 }
            )
        }

        const session = await getSessionById(id)
        return NextResponse.json(session)
    } catch (error) {
        console.error('Error updating session:', error)
        return NextResponse.json(
            { error: 'Failed to update session' },
            { status: 500 }
        )
    }
}
