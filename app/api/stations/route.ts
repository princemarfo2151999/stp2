import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/stations
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const status = searchParams.get('status')
    const id = searchParams.get('id')

    // Get single station
    if (id) {
      const { data: station, error } = await supabase
        .from('stations')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !station) {
        return NextResponse.json({ error: 'Station not found' }, { status: 404 })
      }

      const { data: connectors } = await supabase
        .from('connectors')
        .select('*')
        .eq('station_id', id)

      return NextResponse.json({ ...station, connectors: connectors || [] })
    }

    // Build query
    let query = supabase.from('stations').select('*').order('created_at', { ascending: false })

    if (city) {
      query = query.eq('city', city)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data: stations, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch connectors for all stations
    const stationIds = (stations || []).map((s) => s.id)
    const { data: allConnectors } = await supabase
      .from('connectors')
      .select('*')
      .in('station_id', stationIds.length > 0 ? stationIds : ['none'])

    // Attach connectors to stations
    const stationsWithConnectors = (stations || []).map((station) => ({
      ...station,
      connectors: (allConnectors || []).filter((c) => c.station_id === station.id),
    }))

    return NextResponse.json(stationsWithConnectors)
  } catch (error) {
    console.error('Error fetching stations:', error)
    return NextResponse.json({ error: 'Failed to fetch stations' }, { status: 500 })
  }
}

// POST /api/stations
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    if (!body.name || body.latitude === undefined || body.longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, latitude, longitude' },
        { status: 400 }
      )
    }

    const { data: station, error } = await supabase
      .from('stations')
      .insert({
        name: body.name,
        status: body.status || 'active',
        address: body.address,
        city: body.city,
        state: body.state,
        zip_code: body.zip_code,
        latitude: body.latitude,
        longitude: body.longitude,
        power_output_kw: body.power_output_kw,
        connector_types: body.connector_types || [],
        network: body.network,
        operating_hours: body.operating_hours || '24/7',
        pricing_model: body.pricing_model || 'per_kwh',
        price_per_kwh: body.price_per_kwh,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(station, { status: 201 })
  } catch (error) {
    console.error('Error creating station:', error)
    return NextResponse.json({ error: 'Failed to create station' }, { status: 500 })
  }
}

// PUT /api/stations
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing station id' }, { status: 400 })
    }

    const { data: station, error } = await supabase
      .from('stations')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(station)
  } catch (error) {
    console.error('Error updating station:', error)
    return NextResponse.json({ error: 'Failed to update station' }, { status: 500 })
  }
}

// DELETE /api/stations
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing station id' }, { status: 400 })
    }

    const { error } = await supabase.from('stations').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting station:', error)
    return NextResponse.json({ error: 'Failed to delete station' }, { status: 500 })
  }
}
