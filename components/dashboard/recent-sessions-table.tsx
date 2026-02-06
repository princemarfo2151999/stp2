"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const sessions = [
  {
    id: "SES-001",
    station: "Casa Marina Mall",
    connector: "CCS2 - 150kW",
    user: "Ahmed B.",
    energy: "32.5 kWh",
    duration: "45 min",
    cost: "162.50 MAD",
    status: "completed",
    startTime: "14:30",
  },
  {
    id: "SES-002",
    station: "Rabat Agdal",
    connector: "Type 2 - 22kW",
    user: "Sarah M.",
    energy: "18.2 kWh",
    duration: "1h 12min",
    cost: "91.00 MAD",
    status: "charging",
    startTime: "13:45",
  },
  {
    id: "SES-003",
    station: "Marrakech Guéliz",
    connector: "CHAdeMO - 50kW",
    user: "Guest",
    energy: "25.8 kWh",
    duration: "35 min",
    cost: "129.00 MAD",
    status: "completed",
    startTime: "12:20",
  },
  {
    id: "SES-004",
    station: "Tanger Med Port",
    connector: "CCS2 - 350kW",
    user: "Mohammed K.",
    energy: "45.0 kWh",
    duration: "18 min",
    cost: "270.00 MAD",
    status: "charging",
    startTime: "14:55",
  },
  {
    id: "SES-005",
    station: "Fès Ville Nouvelle",
    connector: "Type 2 - 11kW",
    user: "Fatima Z.",
    energy: "8.5 kWh",
    duration: "52 min",
    cost: "42.50 MAD",
    status: "completed",
    startTime: "11:30",
  },
]

export function RecentSessionsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Session ID</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Station</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Connector</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Energy</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Duration</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cost</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
              <td className="py-3 px-4">
                <span className="text-sm font-mono text-foreground">{session.id}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-foreground">{session.station}</span>
              </td>
              <td className="py-3 px-4 hidden md:table-cell">
                <span className="text-sm text-muted-foreground">{session.connector}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-foreground">{session.user}</span>
              </td>
              <td className="py-3 px-4 hidden lg:table-cell">
                <span className="text-sm text-foreground">{session.energy}</span>
              </td>
              <td className="py-3 px-4 hidden lg:table-cell">
                <span className="text-sm text-muted-foreground">{session.duration}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-foreground">{session.cost}</span>
              </td>
              <td className="py-3 px-4">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    session.status === "charging" && "bg-primary/20 text-primary border-primary/30",
                    session.status === "completed" && "bg-muted text-muted-foreground"
                  )}
                >
                  {session.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
