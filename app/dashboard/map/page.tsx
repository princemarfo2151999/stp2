"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Filter,
  Zap,
  MapPin,
  Battery,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { useStations, type Station } from "@/hooks/use-stations"

// Dynamic import to avoid SSR issues with Leaflet
const StationMap = dynamic(
  () => import("@/components/stations/station-map").then((mod) => mod.StationMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-secondary/30 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
)

const statusColors: Record<string, string> = {
  active: "bg-primary text-primary-foreground",
  inactive: "bg-destructive text-destructive-foreground",
  maintenance: "bg-warning text-warning-foreground",
  online: "bg-primary text-primary-foreground",
  offline: "bg-muted text-muted-foreground",
  coming_soon: "bg-chart-3 text-chart-3-foreground",
}

const statusLabels: Record<string, string> = {
  active: "Online",
  inactive: "Offline",
  maintenance: "Maintenance",
  online: "Online",
  offline: "Offline",
  coming_soon: "Coming Soon",
}

export default function MapPage() {
  const { stations, isLoading } = useStations()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedStation, setSelectedStation] = useState<string | null>(null)

  const filteredStations = useMemo(
    () =>
      stations.filter((station) => {
        const matchesSearch =
          station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (station.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (station.city || "").toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || station.status === statusFilter
        return matchesSearch && matchesStatus
      }),
    [stations, searchQuery, statusFilter]
  )

  // Convert to the format that StationMap expects
  const mapStations = useMemo(
    () =>
      filteredStations
        .filter((s) => s.latitude != null && s.longitude != null)
        .map((s) => ({
          id: s.id,
          name: s.name,
          address: s.address || "",
          city: s.city || "",
          latitude: s.latitude!,
          longitude: s.longitude!,
          status: s.status as "online" | "offline" | "maintenance" | "coming_soon",
          connectors: s.connectors || [],
        })),
    [filteredStations]
  )

  const selected = selectedStation
    ? stations.find((s) => s.id === selectedStation) ?? null
    : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* Sidebar */}
      <div className="flex w-[360px] shrink-0 flex-col rounded-lg border border-border bg-card">
        {/* Search & Filters */}
        <div className="flex flex-col gap-3 border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search stations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Station List */}
        <div className="flex-1 overflow-y-auto">
          {filteredStations.length === 0 ? (
            <div className="p-8 text-center">
              <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No stations found</p>
            </div>
          ) : (
            filteredStations.map((station) => {
              const connectors = station.connectors || []
              return (
                <div
                  key={station.id}
                  className={`cursor-pointer border-b border-border p-4 transition-colors hover:bg-secondary/50 ${
                    selectedStation === station.id ? "bg-secondary/50" : ""
                  }`}
                  onClick={() => setSelectedStation(station.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{station.name}</h3>
                        <Badge
                          className={`text-xs ${
                            statusColors[station.status] ?? "bg-muted text-muted-foreground"
                          }`}
                        >
                          {statusLabels[station.status] ?? station.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{station.address}</p>
                      <p className="text-sm text-muted-foreground">{station.city}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {connectors.length} connectors
                    </span>
                    <span className="flex items-center gap-1">
                      <Battery className="h-3 w-3" />
                      {connectors.filter((c) => c.status === "available").length} available
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Stats Footer */}
        <div className="border-t border-border p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-semibold text-foreground">{filteredStations.length}</p>
              <p className="text-xs text-muted-foreground">Stations</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-primary">
                {filteredStations.filter((s) => s.status === "active" || s.status === "online").length}
              </p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-foreground">
                {filteredStations.reduce((acc, s) => acc + (s.connectors?.length || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Connectors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="relative flex-1 overflow-hidden rounded-lg border border-border bg-card">
        <StationMap
          stations={mapStations as any}
          onStationClick={(station) => setSelectedStation(station.id)}
        />

        {/* Selected Station Panel */}
        {selected && (
          <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-border bg-card p-4 shadow-lg z-[1001]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">{selected.name}</h3>
                  <Badge
                    className={
                      statusColors[selected.status] ?? "bg-muted text-muted-foreground"
                    }
                  >
                    {statusLabels[selected.status] ?? selected.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selected.address}, {selected.city}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setSelectedStation(null)}>
                Close
              </Button>
            </div>

            {selected.connectors && selected.connectors.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {selected.connectors.map((connector) => (
                  <div
                    key={connector.id}
                    className={`rounded-lg border p-3 ${
                      connector.status === "available"
                        ? "border-primary/50 bg-primary/10"
                        : connector.status === "charging"
                          ? "border-chart-3/50 bg-chart-3/10"
                          : "border-border bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {connector.connector_type || "N/A"}
                      </span>
                      <Badge
                        variant="secondary"
                        className={
                          connector.status === "available"
                            ? "bg-primary/20 text-primary"
                            : connector.status === "charging"
                              ? "bg-chart-3/20 text-chart-3"
                              : "bg-muted text-muted-foreground"
                        }
                      >
                        {connector.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      {connector.power_kw || "?"} kW
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {selected.latitude?.toFixed(4)}, {selected.longitude?.toFixed(4)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {selected.operating_hours || "N/A"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
