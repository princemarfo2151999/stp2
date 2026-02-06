"use client"

import React from "react"

import { useState, useEffect } from "react"
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
import { type Station, amenitiesList, paymentMethodsList } from "@/lib/data/stations"

interface EditStationDialogProps {
  station: Station | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditStationDialog({ station, open, onOpenChange }: EditStationDialogProps) {
  const { updateStation } = useStationsStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [pricePerKwh, setPricePerKwh] = useState("")
  const [operatingHours, setOperatingHours] = useState("")
  const [status, setStatus] = useState<"active" | "inactive" | "maintenance">("active")
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([])

  // Populate form when station changes
  useEffect(() => {
    if (station) {
      setName(station.name)
      setAddress(station.address)
      setCity(station.city)
      setPricePerKwh(station.pricePerKwh.toString())
      setOperatingHours(station.operatingHours)
      setStatus(station.status)
      setSelectedAmenities(station.amenities)
      setSelectedPaymentMethods(station.paymentMethods)
    }
  }, [station])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!station) return
    
    setIsSubmitting(true)

    try {
      updateStation(station.id, {
        name,
        address,
        city,
        pricePerKwh: parseFloat(pricePerKwh),
        operatingHours,
        status,
        amenities: selectedAmenities,
        paymentMethods: selectedPaymentMethods,
      })

      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
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
          <DialogTitle>Edit Station</DialogTitle>
          <DialogDescription>
            Update station information and configuration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Basic Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Station Name *</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-city">City *</Label>
                <Input
                  id="edit-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address *</Label>
              <Input
                id="edit-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Pricing & Operations */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Pricing & Operations</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price per kWh (MAD) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={pricePerKwh}
                  onChange={(e) => setPricePerKwh(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-hours">Operating Hours</Label>
                <Input
                  id="edit-hours"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                  <SelectTrigger id="edit-status">
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
