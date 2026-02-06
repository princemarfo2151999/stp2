"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  Zap,
  DollarSign,
  Car,
  CreditCard,
  Shield,
  UserCog,
  Users,
  Activity,
} from "lucide-react"
import type { User } from "@/lib/data/users"

interface UserDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

const roleIcons = {
  admin: Shield,
  operator: UserCog,
  driver: Users,
}

const roleColors = {
  admin: "bg-chart-4/10 text-chart-4",
  operator: "bg-chart-3/10 text-chart-3",
  driver: "bg-chart-2/10 text-chart-2",
}

const statusColors = {
  active: "bg-primary/10 text-primary",
  inactive: "bg-muted text-muted-foreground",
  suspended: "bg-destructive/10 text-destructive",
}

export function UserDetailSheet({ open, onOpenChange, user }: UserDetailSheetProps) {
  const RoleIcon = roleIcons[user.role]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>User Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-6">
          {/* User Header */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.id}</p>
              <div className="mt-2 flex gap-2">
                <Badge variant="secondary" className={roleColors[user.role]}>
                  <RoleIcon className="mr-1 h-3 w-3" />
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
                <Badge variant="secondary" className={statusColors[user.status]}>
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h4 className="mb-3 text-sm font-medium text-foreground">Contact Information</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{user.phone}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Details */}
          <div>
            <h4 className="mb-3 text-sm font-medium text-foreground">Account Details</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created</span>
                </div>
                <span className="text-foreground">{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last Login</span>
                </div>
                <span className="text-foreground">{formatDateTime(user.lastLogin)}</span>
              </div>
            </div>
          </div>

          {user.role === "driver" && (
            <>
              <Separator />

              {/* Vehicle & RFID */}
              <div>
                <h4 className="mb-3 text-sm font-medium text-foreground">Vehicle & Access</h4>
                <div className="flex flex-col gap-3">
                  {user.vehicleInfo && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Vehicle</span>
                      </div>
                      <span className="text-foreground">{user.vehicleInfo}</span>
                    </div>
                  )}
                  {user.rfidTag && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">RFID Tag</span>
                      </div>
                      <span className="font-mono text-foreground">{user.rfidTag}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Usage Statistics */}
              <div>
                <h4 className="mb-3 text-sm font-medium text-foreground">Usage Statistics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border border-border bg-secondary/50 p-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Sessions</span>
                    </div>
                    <p className="mt-1 text-xl font-semibold text-foreground">
                      {user.totalSessions}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/50 p-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-chart-3" />
                      <span className="text-xs text-muted-foreground">Energy</span>
                    </div>
                    <p className="mt-1 text-xl font-semibold text-foreground">
                      {user.totalEnergy.toFixed(1)}
                      <span className="text-xs font-normal text-muted-foreground"> kWh</span>
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/50 p-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-chart-2" />
                      <span className="text-xs text-muted-foreground">Spent</span>
                    </div>
                    <p className="mt-1 text-xl font-semibold text-foreground">
                      {user.totalSpent.toFixed(0)}
                      <span className="text-xs font-normal text-muted-foreground"> MAD</span>
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent">
              View Sessions
            </Button>
            <Button className="flex-1">Send Notification</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
