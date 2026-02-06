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
import { type Station } from "@/lib/data/stations"
import { MapPin, Zap, Clock, CreditCard, Wifi, Calendar } from "lucide-react"

interface StationDetailSheetProps {
  station: Station | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StationDetailSheet({ station, open, onOpenChange }: StationDetailSheetProps) {
  if (!station) return null

  const getConnectorStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-primary/20 text-primary border-primary/30"
      case "charging":
        return "bg-chart-2/20 text-chart-2 border-chart-2/30"
      case "offline":
        return "bg-destructive/20 text-destructive border-destructive/30"
      case "reserved":
        return "bg-warning/20 text-warning border-warning/30"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            {station.name}
          </SheetTitle>
          <SheetDescription>
            Station ID: {station.id}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status & Price */}
          <div className="flex items-center justify-between">
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                station.status === "active" && "bg-primary/20 text-primary border-primary/30",
                station.status === "inactive" && "bg-muted text-muted-foreground",
                station.status === "maintenance" && "bg-warning/20 text-warning border-warning/30"
              )}
            >
              {station.status}
            </Badge>
            <span className="text-lg font-semibold text-primary">
              {station.pricePerKwh.toFixed(2)} MAD/kWh
            </span>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Location
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{station.address}</p>
              <p>{station.city}</p>
              <p className="font-mono text-xs">
                {station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Operating Hours */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Operating Hours
            </h3>
            <p className="text-sm text-muted-foreground">{station.operatingHours}</p>
          </div>

          <Separator />

          {/* Connectors */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Connectors ({station.availableConnectors}/{station.totalConnectors} available)
            </h3>
            <div className="space-y-3">
              {station.evses.map((evse) => (
                <div key={evse.id} className="rounded-lg border border-border p-3 space-y-2">
                  <p className="text-xs font-mono text-muted-foreground">{evse.evseId}</p>
                  <div className="space-y-2">
                    {evse.connectors.map((connector) => (
                      <div
                        key={connector.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-foreground">{connector.type}</span>
                          <span className="text-muted-foreground">
                            {connector.power} kW
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn("text-xs", getConnectorStatusColor(connector.status))}
                        >
                          {connector.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Payment Methods */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment Methods
            </h3>
            <div className="flex flex-wrap gap-2">
              {station.paymentMethods.map((method) => (
                <Badge key={method} variant="outline" className="text-xs">
                  {method}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Amenities */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Wifi className="h-4 w-4 text-primary" />
              Amenities
            </h3>
            <div className="flex flex-wrap gap-2">
              {station.amenities.map((amenity) => (
                <Badge key={amenity} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Timeline
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Created: {new Date(station.createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(station.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
