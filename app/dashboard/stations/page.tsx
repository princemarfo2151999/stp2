"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { KPICard } from "@/components/dashboard/kpi-card"
import { MapPin, Zap, CheckCircle, AlertTriangle, Plus, Search, Filter, Map, Table, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StationsTable } from "@/components/stations/stations-table"
import { AddStationDialog } from "@/components/stations/add-station-dialog"
import { useStations } from "@/hooks/use-stations"

// Dynamic import to avoid SSR issues with Leaflet
const StationMap = dynamic(
  () => import("@/components/stations/station-map").then(mod => mod.StationMap),
  { ssr: false }
)

export default function StationsPage() {
  const { stations, isLoading } = useStations()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [cityFilter, setCityFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [view, setView] = useState<"table" | "map">("table")

  // Calculate KPIs
  const totalStations = stations.length
  const activeStations = stations.filter((s) => s.status === "active" || s.status === "online").length
  const totalConnectors = stations.reduce((sum, s) => sum + (s.connectors?.length || 0), 0)
  const availableConnectors = stations.reduce(
    (sum, s) => sum + (s.connectors?.filter(c => c.status === 'available').length || 0),
    0
  )

  // Get unique cities for filter
  const cities = [...new Set(stations.map((s) => s.city).filter(Boolean))] as string[]

  // Filter stations
  const filteredStations = stations.filter((station) => {
    const matchesSearch =
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (station.city || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (station.address || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || station.status === statusFilter
    const matchesCity = cityFilter === "all" || station.city === cityFilter
    return matchesSearch && matchesStatus && matchesCity
  })

  // Convert to map format
  const mapStations = filteredStations
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
    }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:pt-0 pt-12">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stations</h1>
          <p className="text-muted-foreground mt-1">
            Manage your charging stations and connectors
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Station
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Stations"
          value={totalStations}
          icon={MapPin}
        />
        <KPICard
          title="Active Stations"
          value={activeStations}
          icon={CheckCircle}
        />
        <KPICard
          title="Total Connectors"
          value={totalConnectors}
          icon={Zap}
        />
        <KPICard
          title="Available Now"
          value={availableConnectors}
          icon={AlertTriangle}
          description={totalConnectors > 0 ? `${Math.round((availableConnectors / totalConnectors) * 100)}% availability` : "No connectors"}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search stations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-36">
              <MapPin className="h-4 w-4 mr-2" />
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={view === "table" ? "default" : "outline"}
          onClick={() => setView("table")}
          className="gap-2"
        >
          <Table className="h-4 w-4" />
          Table View
        </Button>
        <Button
          variant={view === "map" ? "default" : "outline"}
          onClick={() => setView("map")}
          className="gap-2"
        >
          <Map className="h-4 w-4" />
          Map View
        </Button>
      </div>

      {/* Stations Table or Map */}
      {view === "table" ? (
        <StationsTable stations={filteredStations as any} />
      ) : (
        <div className="h-[600px]">
          <StationMap stations={mapStations as any} />
        </div>
      )}

      {/* Add Station Dialog */}
      <AddStationDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  )
}
