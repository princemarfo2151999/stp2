import { NextRequest, NextResponse } from 'next/server'
import {
    getStations,
    getStationById,
    createStation,
    updateStation,
    deleteStation,
    getStationsByCity,
    getStationsByStatus,
} from '@/lib/api/stations'
import {
    getTenantContextFromRequest,
    checkPermission,
} from '@/lib/rbac/tenant-context'

// GET /api/stations
export async function GET(request: NextRequest) {
    try {
        const tenantContext = await getTenantContextFromRequest(request)

        // Check read permission
        if (!checkPermission(tenantContext, 'stations', 'view_all') &&
            !checkPermission(tenantContext, 'stations', 'view_own')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const city = searchParams.get('city')
        const status = searchParams.get('status') as 'online' | 'offline' | 'maintenance' | 'coming_soon' | null
        const id = searchParams.get('id')

        // Get single station
        if (id) {
            const station = await getStationById(id)
            if (!station) {
                return NextResponse.json({ error: 'Station not found' }, { status: 404 })
            }
            return NextResponse.json(station)
        }

        // Filter by city
        if (city) {
            const stations = await getStationsByCity(city)
            return NextResponse.json(stations)
        }

        // Filter by status
        if (status) {
            const stations = await getStationsByStatus(status)
            return NextResponse.json(stations)
        }

        // Get all stations
        const stations = await getStations()
        return NextResponse.json(stations)
    } catch (error) {
        console.error('Error fetching stations:', error)
        return NextResponse.json(
            { error: 'Failed to fetch stations' },
            { status: 500 }
        )
    }
}

// POST /api/stations
export async function POST(request: NextRequest) {
    try {
        const tenantContext = await getTenantContextFromRequest(request)

        // Check create permission
        if (!checkPermission(tenantContext, 'stations', 'create')) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 })
        }

        const body = await request.json()

        // Validate required fields
        if (!body.name || !body.address || !body.city || body.latitude === undefined || body.longitude === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields: name, address, city, latitude, longitude' },
                { status: 400 }
            )
        }

        const stationId = await createStation(body)
        const station = await getStationById(stationId)

        return NextResponse.json(station, { status: 201 })
    } catch (error) {
        console.error('Error creating station:', error)
        return NextResponse.json(
            { error: 'Failed to create station' },
            { status: 500 }
        )
    }
}

// PUT /api/stations
export async function PUT(request: NextRequest) {
    try {
        const tenantContext = await getTenantContextFromRequest(request)

        // Check edit permission
        if (!checkPermission(tenantContext, 'stations', 'edit')) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 })
        }

        const body = await request.json()
        const { id, ...data } = body

        if (!id) {
            return NextResponse.json(
                { error: 'Missing station id' },
                { status: 400 }
            )
        }

        const success = await updateStation(id, data)
        if (!success) {
            return NextResponse.json(
                { error: 'Station not found or no changes made' },
                { status: 404 }
            )
        }

        const station = await getStationById(id)
        return NextResponse.json(station)
    } catch (error) {
        console.error('Error updating station:', error)
        return NextResponse.json(
            { error: 'Failed to update station' },
            { status: 500 }
        )
    }
}

// DELETE /api/stations
export async function DELETE(request: NextRequest) {
    try {
        const tenantContext = await getTenantContextFromRequest(request)

        // Check delete permission
        if (!checkPermission(tenantContext, 'stations', 'delete')) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: 'Missing station id' },
                { status: 400 }
            )
        }

        const success = await deleteStation(id)
        if (!success) {
            return NextResponse.json(
                { error: 'Station not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting station:', error)
        return NextResponse.json(
            { error: 'Failed to delete station' },
            { status: 500 }
        )
    }
}
