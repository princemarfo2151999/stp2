"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { type Session, type SessionStatus, sessionStatusLabels } from "@/lib/data/sessions"
import { Activity, MapPin, User, Zap, Clock, CreditCard, Server } from "lucide-react"

interface SessionDetailSheetProps {
  session: Session | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SessionDetailSheet({ session, open, onOpenChange }: SessionDetailSheetProps) {
  if (!session) return null

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

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }

  const calculateDuration = (start: string, end: string | null) => {
    const startDate = new Date(start)
    const endDate = end ? new Date(end) : new Date()
    const diffMs = endDate.getTime() - startDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 60) {
      return `${diffMins} minutes`
    }
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours}h ${mins}m`
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            {session.id}
          </SheetTitle>
          <SheetDescription>Charging session details</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <Badge
              variant="secondary"
              className={cn("text-sm", statusColors[session.status])}
            >
              {sessionStatusLabels[session.status]}
            </Badge>
            <span className="text-lg font-semibold text-primary">
              {session.costTotal.toFixed(2)} MAD
            </span>
          </div>

          <Separator />

          {/* Station Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Station
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="text-foreground font-medium">{session.stationName}</p>
              <p>Connector: {session.connectorType}</p>
              <p className="font-mono text-xs">Station ID: {session.stationId}</p>
            </div>
          </div>

          <Separator />

          {/* User Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              User
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="text-foreground font-medium">{session.userName}</p>
              <p className="capitalize">Auth: {session.authMode.replace("_", " ")}</p>
              {session.userId && (
                <p className="font-mono text-xs">User ID: {session.userId}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Charging Stats */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Charging Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Energy Delivered</p>
                <p className="text-lg font-semibold text-foreground">
                  {session.energyKwh.toFixed(1)} kWh
                </p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold text-foreground">
                  {calculateDuration(session.startTime, session.endTime)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timing */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Timeline
            </h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex justify-between">
                <span>Started</span>
                <span className="text-foreground">{formatDateTime(session.startTime)}</span>
              </div>
              {session.endTime && (
                <div className="flex justify-between">
                  <span>Ended</span>
                  <span className="text-foreground">{formatDateTime(session.endTime)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Created</span>
                <span className="text-foreground">{formatDateTime(session.createdAt)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Amount</span>
                <span className="text-foreground font-medium">
                  {session.costTotal.toFixed(2)} {session.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Currency</span>
                <span className="text-foreground">{session.currency}</span>
              </div>
            </div>
          </div>

          {session.ocppTransactionId && (
            <>
              <Separator />
              {/* OCPP Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  OCPP Transaction
                </h3>
                <p className="text-sm font-mono text-muted-foreground">
                  {session.ocppTransactionId}
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
