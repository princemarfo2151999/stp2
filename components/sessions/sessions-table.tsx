"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { type Session, type SessionStatus, sessionStatusLabels } from "@/lib/data/sessions"
import { useSessionsStore } from "@/lib/stores/sessions-store"
import { MoreHorizontal, Eye, Square, RefreshCw, Activity } from "lucide-react"
import { SessionDetailSheet } from "./session-detail-sheet"

interface SessionsTableProps {
  sessions: Session[]
}

export function SessionsTable({ sessions }: SessionsTableProps) {
  const { updateSessionStatus } = useSessionsStore()
  const [viewingSession, setViewingSession] = useState<Session | null>(null)

  const getStatusBadge = (status: SessionStatus) => {
    const statusColors: Record<SessionStatus, string> = {
      initiated: "bg-muted text-muted-foreground",
      awaiting_payment: "bg-warning/20 text-warning border-warning/30",
      authorized: "bg-primary/20 text-primary border-primary/30",
      awaiting_plug: "bg-warning/20 text-warning border-warning/30",
      awaiting_operator: "bg-warning/20 text-warning border-warning/30",
      starting: "bg-chart-2/20 text-chart-2 border-chart-2/30",
      charging: "bg-primary/20 text-primary border-primary/30",
      stopping: "bg-chart-2/20 text-chart-2 border-chart-2/30",
      completed: "bg-muted text-muted-foreground",
      captured: "bg-success/20 text-success border-success/30",
      failed: "bg-destructive/20 text-destructive border-destructive/30",
      refunded: "bg-chart-4/20 text-chart-4 border-chart-4/30",
    }

    return (
      <Badge variant="secondary" className={cn("text-xs", statusColors[status])}>
        {sessionStatusLabels[status]}
      </Badge>
    )
  }

  const formatDuration = (start: string, end: string | null) => {
    const startDate = new Date(start)
    const endDate = end ? new Date(end) : new Date()
    const diffMs = endDate.getTime() - startDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) {
      return `${diffMins} min`
    }
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours}h ${mins}m`
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    })
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No sessions found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filters.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Session</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Station</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Energy</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Duration</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Cost</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr
                  key={session.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm font-mono text-foreground">{session.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(session.startTime)} {formatTime(session.startTime)}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <div>
                      <p className="text-sm text-foreground">{session.stationName}</p>
                      <p className="text-xs text-muted-foreground">{session.connectorType}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm text-foreground">{session.userName}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {session.authMode.replace("_", " ")}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <span className="text-sm text-foreground">
                      {session.energyKwh.toFixed(1)} kWh
                    </span>
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {formatDuration(session.startTime, session.endTime)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium text-foreground">
                      {session.costTotal.toFixed(2)} MAD
                    </span>
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(session.status)}</td>
                  <td className="py-4 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewingSession(session)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {session.status === "charging" && (
                          <DropdownMenuItem
                            onClick={() => updateSessionStatus(session.id, "stopping")}
                          >
                            <Square className="h-4 w-4 mr-2" />
                            Stop Session
                          </DropdownMenuItem>
                        )}
                        {session.status === "completed" && (
                          <DropdownMenuItem
                            onClick={() => updateSessionStatus(session.id, "refunded")}
                            className="text-destructive focus:text-destructive"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Process Refund
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Sheet */}
      <SessionDetailSheet
        session={viewingSession}
        open={!!viewingSession}
        onOpenChange={(open) => !open && setViewingSession(null)}
      />
    </>
  )
}
