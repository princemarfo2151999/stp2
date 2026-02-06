"use client"

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { StationWithConnectors } from '@/lib/api/stations'

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom marker icons based on station status
const getMarkerIcon = (status: string) => {
    const color = {
        online: '#10b981', // green
        offline: '#6b7280', // gray
        maintenance: '#f59e0b', // orange
        coming_soon: '#3b82f6', // blue
    }[status] || '#6b7280'

    return L.divIcon({
        className: 'custom-marker',
        html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 16px;
          font-weight: bold;
        ">⚡</div>
      </div>
    `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    })
}

interface StationMapProps {
    stations: StationWithConnectors[]
    onStationClick?: (station: StationWithConnectors) => void
}

// Component to auto-fit bounds to show all markers
function MapBounds({ stations }: { stations: StationWithConnectors[] }) {
    const map = useMap()

    useEffect(() => {
        if (stations.length > 0) {
            const bounds = L.latLngBounds(
                stations.map(station => [station.latitude, station.longitude])
            )
            map.fitBounds(bounds, { padding: [50, 50] })
        }
    }, [stations, map])

    return null
}

export function StationMap({ stations, onStationClick }: StationMapProps) {
    // Default center (Morocco)
    const defaultCenter: [number, number] = [31.7917, -7.0926]

    const availableStations = stations.filter(s =>
        s.connectors.some(c => c.status === 'available')
    ).length

    return (
        <div className="relative h-full w-full min-h-[500px] rounded-lg overflow-hidden border border-border">
            <MapContainer
                center={defaultCenter}
                zoom={6}
                className="h-full w-full"
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapBounds stations={stations} />

                {stations.map((station) => (
                    <Marker
                        key={station.id}
                        position={[station.latitude, station.longitude]}
                        icon={getMarkerIcon(station.status)}
                        eventHandlers={{
                            click: () => onStationClick?.(station),
                        }}
                    >
                        <Popup>
                            <div className="p-2 min-w-[200px]">
                                <h3 className="font-semibold text-base mb-2">{station.name}</h3>
                                <div className="space-y-1 text-sm">
                                    <p className="text-muted-foreground">{station.address}</p>
                                    <p className="text-muted-foreground">{station.city}</p>

                                    <div className="flex items-center gap-2 pt-2">
                                        <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${station.status === 'online' ? 'bg-green-100 text-green-700' : ''}
                      ${station.status === 'offline' ? 'bg-gray-100 text-gray-700' : ''}
                      ${station.status === 'maintenance' ? 'bg-orange-100 text-orange-700' : ''}
                      ${station.status === 'coming_soon' ? 'bg-blue-100 text-blue-700' : ''}
                    `}>
                                            {station.status}
                                        </span>
                                    </div>

                                    <div className="pt-2 border-t mt-2">
                                        <p className="font-medium">
                                            {station.connectors.filter(c => c.status === 'available').length} / {station.connectors.length} available
                                        </p>
                                        <div className="mt-1 space-y-1">
                                            {station.connectors.map(connector => (
                                                <div key={connector.id} className="text-xs flex justify-between">
                                                    <span>{connector.connector_type} - {connector.power_kw}kW</span>
                                                    <span className={`
                            font-medium
                            ${connector.status === 'available' ? 'text-green-600' : ''}
                            ${connector.status === 'charging' ? 'text-blue-600' : ''}
                            ${connector.status === 'occupied' ? 'text-orange-600' : ''}
                            ${connector.status === 'faulted' ? 'text-red-600' : ''}
                            ${connector.status === 'unavailable' ? 'text-gray-600' : ''}
                          `}>
                                                        {connector.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {onStationClick && (
                                        <button
                                            onClick={() => onStationClick(station)}
                                            className="mt-3 w-full bg-primary text-primary-foreground px-3 py-1.5 rounded text-sm font-medium hover:bg-primary/90"
                                        >
                                            View Details
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Stats overlay */}
            <div className="absolute top-4 right-4 bg-card border border-border rounded-lg shadow-lg p-3 z-[1000]">
                <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>{stations.filter(s => s.status === 'online').length} Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        <span>{stations.filter(s => s.status === 'offline').length} Offline</span>
                    </div>
                    <div className="border-t pt-1 mt-1">
                        <span className="font-medium">{availableStations} with available chargers</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
