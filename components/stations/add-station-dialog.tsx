"use client"

import React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useStationsStore } from "@/lib/stores/stations-store"
import { amenitiesList, paymentMethodsList, connectorTypes } from "@/lib/data/stations"
import { Plus, Trash2 } from "lucide-react"

interface AddStationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ConnectorInput {
  type: string
  power: number
}

export function AddStationDialog({ open, onOpenChange }: AddStationDialogProps) {
  const { addStation } = useStationsStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [pricePerKwh, setPricePerKwh] = useState("")
  const [operatingHours, setOperatingHours] = useState("24/7")
  const [status, setStatus] = useState<"active" | "inactive" | "maintenance">("active")
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([])
  const [connectors, setConnectors] = useState<ConnectorInput[]>([
    { type: "CCS2", power: 50 },
  ])

  const resetForm = () => {
    setName("")
    setAddress("")
    setCity("")
    setLatitude("")
    setLongitude("")
    setPricePerKwh("")
    setOperatingHours("24/7")
    setStatus("active")
    setSelectedAmenities([])
    setSelectedPaymentMethods([])
    setConnectors([{ type: "CCS2", power: 50 }])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Build EVSE and connectors
      const evseConnectors = connectors.map((c, index) => ({
        id: `C${index + 1}`,
        type: c.type as "CCS2" | "CHAdeMO" | "Type2" | "Type1",
        power: c.power,
        status: "available" as const,
      }))

      addStation({
        name,
        address,
        city,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        pricePerKwh: parseFloat(pricePerKwh),
        operatingHours,
        status,
        amenities: selectedAmenities,
        paymentMethods: selectedPaymentMethods,
        evses: [
          {
            id: `EVSE-NEW-A`,
            evseId: `WATTSC*ENEW*A`,
            connectors: evseConnectors,
          },
        ],
        totalConnectors: connectors.length,
        availableConnectors: connectors.length,
      })

      resetForm()
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addConnector = () => {
    setConnectors([...connectors, { type: "Type2", power: 22 }])
  }

  const removeConnector = (index: number) => {
    setConnectors(connectors.filter((_, i) => i !== index))
  }

  const updateConnector = (index: number, field: keyof ConnectorInput, value: string | number) => {
    const updated = [...connectors]
    updated[index] = { ...updated[index], [field]: value }
    setConnectors(updated)
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    )
  }

  const togglePaymentMethod = (method: string) => {
    setSelectedPaymentMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Station</DialogTitle>
          <DialogDescription>
            Create a new charging station with connectors and configuration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Basic Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Station Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Casa Marina Mall"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Casablanca"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full street address"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g., 33.5975"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g., -7.6698"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing & Operations */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Pricing & Operations</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price per kWh (MAD) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={pricePerKwh}
                  onChange={(e) => setPricePerKwh(e.target.value)}
                  placeholder="e.g., 5.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Operating Hours</Label>
                <Input
                  id="hours"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="e.g., 24/7"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Connectors */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Connectors</h3>
              <Button type="button" variant="outline" size="sm" onClick={addConnector}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-3">
              {connectors.map((connector, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Select
                    value={connector.type}
                    onValueChange={(v) => updateConnector(index, "type", v)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {connectorTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={connector.power}
                    onChange={(e) => updateConnector(index, "power", parseInt(e.target.value) || 0)}
                    className="w-24"
                    placeholder="kW"
                  />
                  <span className="text-sm text-muted-foreground">kW</span>
                  {connectors.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeConnector(index)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Amenities</h3>
            <div className="flex flex-wrap gap-3">
              {amenitiesList.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedAmenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <span className="text-sm text-foreground">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Payment Methods</h3>
            <div className="flex flex-wrap gap-3">
              {paymentMethodsList.map((method) => (
                <label
                  key={method}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedPaymentMethods.includes(method)}
                    onCheckedChange={() => togglePaymentMethod(method)}
                  />
                  <span className="text-sm text-foreground">{method}</span>
                </label>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Station"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
