import { query, queryOne, insert, execute } from '@/lib/db/mariadb'

export interface Station {
    id: string
    name: string
    address: string
    city: string
    region: string | null
    country: string
    latitude: number
    longitude: number
    status: 'online' | 'offline' | 'maintenance' | 'coming_soon'
    power_type: 'AC' | 'DC' | 'AC/DC' | null
    max_power: number | null
    operator_id: string | null
    ocpp_identity: string | null
    model: string | null
    manufacturer: string | null
    serial_number: string | null
    firmware_version: string | null
    installation_date: string | null
    last_heartbeat: string | null
    is_public: boolean
    amenities: string[] | null
    opening_hours: any | null
    images: string[] | null
    created_at: string
    updated_at: string
    created_by: string | null
}

export interface Connector {
    id: string
    station_id: string
    connector_number: number
    connector_type: 'Type 2' | 'CCS2' | 'CHAdeMO' | 'Type 1' | 'CCS1' | 'Tesla' | null
    power_kw: number | null
    status: 'available' | 'charging' | 'occupied' | 'faulted' | 'unavailable'
    current_session_id: string | null
    last_status_change: string
    created_at: string
}

export interface StationWithConnectors extends Station {
    connectors: Connector[]
}

// Get all stations with their connectors
export async function getStations(): Promise<StationWithConnectors[]> {
    const stations = await query<Station>(`
    SELECT * FROM stations
    ORDER BY created_at DESC
  `)

    // Get connectors for all stations
    const stationsWithConnectors: StationWithConnectors[] = []

    for (const station of stations) {
        const connectors = await query<Connector>(`
      SELECT * FROM connectors
      WHERE station_id = ?
      ORDER BY connector_number
    `, [station.id])

        // Parse JSON fields
        const parsedStation = {
            ...station,
            amenities: station.amenities ? JSON.parse(station.amenities as any) : null,
            opening_hours: station.opening_hours ? JSON.parse(station.opening_hours as any) : null,
            images: station.images ? JSON.parse(station.images as any) : null,
        }

        stationsWithConnectors.push({
            ...parsedStation,
            connectors
        })
    }

    return stationsWithConnectors
}

// Get a single station by ID with connectors
export async function getStationById(id: string): Promise<StationWithConnectors | null> {
    const station = await queryOne<Station>(`
    SELECT * FROM stations
    WHERE id = ?
  `, [id])

    if (!station) {
        return null
    }

    const connectors = await query<Connector>(`
    SELECT * FROM connectors
    WHERE station_id = ?
    ORDER BY connector_number
  `, [id])

    // Parse JSON fields
    const parsedStation = {
        ...station,
        amenities: station.amenities ? JSON.parse(station.amenities as any) : null,
        opening_hours: station.opening_hours ? JSON.parse(station.opening_hours as any) : null,
        images: station.images ? JSON.parse(station.images as any) : null,
    }

    return {
        ...parsedStation,
        connectors
    }
}

// Create a new station (admin/operator only - authorization should be checked before calling)
export async function createStation(data: {
    name: string
    address: string
    city: string
    region?: string
    country?: string
    latitude: number
    longitude: number
    status?: 'online' | 'offline' | 'maintenance' | 'coming_soon'
    power_type?: 'AC' | 'DC' | 'AC/DC'
    max_power?: number
    operator_id?: string
    ocpp_identity?: string
    model?: string
    manufacturer?: string
    serial_number?: string
    firmware_version?: string
    installation_date?: string
    is_public?: boolean
    amenities?: string[]
    opening_hours?: any
    images?: string[]
    created_by?: string
}): Promise<string> {
    const id = await insert(`
    INSERT INTO stations (
      name, address, city, region, country, latitude, longitude,
      status, power_type, max_power, operator_id, ocpp_identity,
      model, manufacturer, serial_number, firmware_version,
      installation_date, is_public, amenities, opening_hours,
      images, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
        data.name,
        data.address,
        data.city,
        data.region || null,
        data.country || 'Morocco',
        data.latitude,
        data.longitude,
        data.status || 'offline',
        data.power_type || null,
        data.max_power || null,
        data.operator_id || null,
        data.ocpp_identity || null,
        data.model || null,
        data.manufacturer || null,
        data.serial_number || null,
        data.firmware_version || null,
        data.installation_date || null,
        data.is_public !== undefined ? data.is_public : true,
        data.amenities ? JSON.stringify(data.amenities) : null,
        data.opening_hours ? JSON.stringify(data.opening_hours) : null,
        data.images ? JSON.stringify(data.images) : null,
        data.created_by || null
    ])

    return id
}

// Update a station
export async function updateStation(
    id: string,
    data: Partial<Omit<Station, 'id' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
    const updates: string[] = []
    const values: any[] = []

    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
            updates.push(`${key} = ?`)
            // Stringify JSON fields
            if (['amenities', 'opening_hours', 'images'].includes(key) && value !== null) {
                values.push(JSON.stringify(value))
            } else {
                values.push(value)
            }
        }
    })

    if (updates.length === 0) {
        return false
    }

    values.push(id)

    const affectedRows = await execute(`
    UPDATE stations
    SET ${updates.join(', ')}
    WHERE id = ?
  `, values)

    return affectedRows > 0
}

// Delete a station
export async function deleteStation(id: string): Promise<boolean> {
    const affectedRows = await execute(`
    DELETE FROM stations WHERE id = ?
  `, [id])

    return affectedRows > 0
}

// Get stations by city
export async function getStationsByCity(city: string): Promise<StationWithConnectors[]> {
    const stations = await query<Station>(`
    SELECT * FROM stations
    WHERE city = ?
    ORDER BY name
  `, [city])

    const stationsWithConnectors: StationWithConnectors[] = []

    for (const station of stations) {
        const connectors = await query<Connector>(`
      SELECT * FROM connectors
      WHERE station_id = ?
      ORDER BY connector_number
    `, [station.id])

        const parsedStation = {
            ...station,
            amenities: station.amenities ? JSON.parse(station.amenities as any) : null,
            opening_hours: station.opening_hours ? JSON.parse(station.opening_hours as any) : null,
            images: station.images ? JSON.parse(station.images as any) : null,
        }

        stationsWithConnectors.push({
            ...parsedStation,
            connectors
        })
    }

    return stationsWithConnectors
}

// Get stations by status
export async function getStationsByStatus(
    status: 'online' | 'offline' | 'maintenance' | 'coming_soon'
): Promise<StationWithConnectors[]> {
    const stations = await query<Station>(`
    SELECT * FROM stations
    WHERE status = ?
    ORDER BY name
  `, [status])

    const stationsWithConnectors: StationWithConnectors[] = []

    for (const station of stations) {
        const connectors = await query<Connector>(`
      SELECT * FROM connectors
      WHERE station_id = ?
      ORDER BY connector_number
    `, [station.id])

        const parsedStation = {
            ...station,
            amenities: station.amenities ? JSON.parse(station.amenities as any) : null,
            opening_hours: station.opening_hours ? JSON.parse(station.opening_hours as any) : null,
            images: station.images ? JSON.parse(station.images as any) : null,
        }

        stationsWithConnectors.push({
            ...parsedStation,
            connectors
        })
    }

    return stationsWithConnectors
}
