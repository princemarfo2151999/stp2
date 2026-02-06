"use client"

import { KPICard } from "@/components/dashboard/kpi-card"
import { 
  Activity, 
  MapPin, 
  Zap, 
  Users, 
  TrendingUp,
  Clock,
  Battery,
  Wallet
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecentSessionsTable } from "@/components/dashboard/recent-sessions-table"
import { StationStatusChart } from "@/components/dashboard/station-status-chart"
import { RevenueChart } from "@/components/dashboard/revenue-chart"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="lg:pt-0 pt-12">
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your EV charging network
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Stations"
          value="24"
          change="+2"
          changeType="positive"
          icon={MapPin}
          description="this month"
        />
        <KPICard
          title="Active Sessions"
          value="8"
          icon={Activity}
          description="live now"
        />
        <KPICard
          title="Energy Delivered"
          value="4,523 kWh"
          change="+12.5%"
          changeType="positive"
          icon={Zap}
          description="vs last month"
        />
        <KPICard
          title="Revenue"
          value="45,230 MAD"
          change="+8.2%"
          changeType="positive"
          icon={Wallet}
          description="this month"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Users"
          value="1,284"
          change="+156"
          changeType="positive"
          icon={Users}
          description="new users"
        />
        <KPICard
          title="Avg. Session Time"
          value="42 min"
          change="-3 min"
          changeType="neutral"
          icon={Clock}
          description="vs last week"
        />
        <KPICard
          title="Charger Uptime"
          value="98.5%"
          change="+0.3%"
          changeType="positive"
          icon={Battery}
          description="this month"
        />
        <KPICard
          title="Sessions Today"
          value="127"
          change="+15%"
          changeType="positive"
          icon={TrendingUp}
          description="vs yesterday"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue in MAD</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Station Status</CardTitle>
            <CardDescription>Current connector availability</CardDescription>
          </CardHeader>
          <CardContent>
            <StationStatusChart />
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Recent Sessions</CardTitle>
          <CardDescription>Latest charging sessions across all stations</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentSessionsTable />
        </CardContent>
      </Card>
    </div>
  )
}
