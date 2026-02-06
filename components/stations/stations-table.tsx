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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { useStations, type Station } from "@/hooks/use-stations"
import { MoreHorizontal, Edit, Trash2, Eye, MapPin, Zap } from "lucide-react"
import { EditStationDialog } from "./edit-station-dialog"
import { StationDetailSheet } from "./station-detail-sheet"

interface StationsTableProps {
  stations: Station[]
}

export function StationsTable({ stations }: StationsTableProps) {
  const { deleteStation } = useStationsStore()
  const [editingStation, setEditingStation] = useState<Station | null>(null)
  const [viewingStation, setViewingStation] = useState<Station | null>(null)
  const [deletingStation, setDeletingStation] = useState<Station | null>(null)

  const handleDelete = () => {
    if (deletingStation) {
      deleteStation(deletingStation.id)
      setDeletingStation(null)
    }
  }

  const getStatusBadge = (status: Station["status"]) => {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "text-xs",
          status === "active" && "bg-primary/20 text-primary border-primary/30",
          status === "inactive" && "bg-muted text-muted-foreground",
          status === "maintenance" && "bg-warning/20 text-warning border-warning/30"
        )}
      >
        {status}
      </Badge>
    )
  }

  if (stations.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No stations found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filters, or add a new station.
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
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Station</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">City</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Connectors</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Price</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((station) => (
                <tr
                  key={station.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {station.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {station.address}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <span className="text-sm text-foreground">{station.city}</span>
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">
                        {station.availableConnectors}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / {station.totalConnectors}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <span className="text-sm text-foreground">
                      {station.pricePerKwh.toFixed(2)} MAD/kWh
                    </span>
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(station.status)}</td>
                  <td className="py-4 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewingStation(station)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingStation(station)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingStation(station)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditStationDialog
        station={editingStation}
        open={!!editingStation}
        onOpenChange={(open) => !open && setEditingStation(null)}
      />

      {/* Detail Sheet */}
      <StationDetailSheet
        station={viewingStation}
        open={!!viewingStation}
        onOpenChange={(open) => !open && setViewingStation(null)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingStation} onOpenChange={(open) => !open && setDeletingStation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Station</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingStation?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
