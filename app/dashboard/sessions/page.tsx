"use client"

import { useState } from "react"
import { KPICard } from "@/components/dashboard/kpi-card"
import { Activity, Zap, CheckCircle, Wallet, Search, Filter, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SessionsTable } from "@/components/sessions/sessions-table"
import { useSessionsStore } from "@/lib/stores/sessions-store"
import { type SessionStatus, sessionStatusLabels } from "@/lib/data/sessions"

export default function SessionsPage() {
  const { sessions } = useSessionsStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Calculate KPIs
  const totalSessions = sessions.length
  const activeSessions = sessions.filter(
    (s) => s.status === "charging" || s.status === "starting"
  ).length
  const completedSessions = sessions.filter((s) => s.status === "completed").length
  const totalRevenue = sessions
    .filter((s) => s.status === "completed" || s.status === "captured")
    .reduce((sum, s) => sum + s.costTotal, 0)
  const totalEnergy = sessions
    .filter((s) => s.status === "completed" || s.status === "captured" || s.status === "charging")
    .reduce((sum, s) => sum + s.energyKwh, 0)

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.userName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || session.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleExport = () => {
    const csv = [
      ["Session ID", "Station", "User", "Status", "Energy (kWh)", "Cost (MAD)", "Start Time", "End Time"],
      ...filteredSessions.map((s) => [
        s.id,
        s.stationName,
        s.userName,
        s.status,
        s.energyKwh.toString(),
        s.costTotal.toString(),
        s.startTime,
        s.endTime || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sessions-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:pt-0 pt-12">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sessions</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage charging sessions
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Total Sessions"
          value={totalSessions}
          icon={Activity}
        />
        <KPICard
          title="Active Now"
          value={activeSessions}
          icon={Zap}
          description="charging in progress"
        />
        <KPICard
          title="Completed"
          value={completedSessions}
          icon={CheckCircle}
        />
        <KPICard
          title="Revenue"
          value={`${totalRevenue.toLocaleString()} MAD`}
          icon={Wallet}
        />
        <KPICard
          title="Energy Delivered"
          value={`${totalEnergy.toFixed(1)} kWh`}
          icon={Zap}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(sessionStatusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sessions Table */}
      <SessionsTable sessions={filteredSessions} />
    </div>
  )
}
