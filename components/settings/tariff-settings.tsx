"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, Save, Clock } from "lucide-react"

interface Tariff {
  id: string
  name: string
  type: "flat" | "time-of-use" | "dynamic"
  baseRate: number
  peakRate?: number
  offPeakRate?: number
  connectionFee: number
  idleFee: number
  isDefault: boolean
}

const mockTariffs: Tariff[] = [
  {
    id: "TAR-001",
    name: "Standard Rate",
    type: "flat",
    baseRate: 5.0,
    connectionFee: 0,
    idleFee: 2.0,
    isDefault: true,
  },
  {
    id: "TAR-002",
    name: "Time-of-Use",
    type: "time-of-use",
    baseRate: 4.5,
    peakRate: 7.0,
    offPeakRate: 3.5,
    connectionFee: 1.0,
    idleFee: 3.0,
    isDefault: false,
  },
  {
    id: "TAR-003",
    name: "Fast Charging Premium",
    type: "flat",
    baseRate: 8.0,
    connectionFee: 2.0,
    idleFee: 5.0,
    isDefault: false,
  },
]

export function TariffSettings() {
  const [tariffs, setTariffs] = useState<Tariff[]>(mockTariffs)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newTariff, setNewTariff] = useState({
    name: "",
    type: "flat" as Tariff["type"],
    baseRate: 5.0,
    peakRate: 7.0,
    offPeakRate: 3.5,
    connectionFee: 0,
    idleFee: 2.0,
  })

  const [globalSettings, setGlobalSettings] = useState({
    currency: "MAD",
    taxRate: 20,
    roundingPrecision: 2,
    enableDynamicPricing: false,
  })

  const handleAddTariff = () => {
    const id = `TAR-${String(tariffs.length + 1).padStart(3, "0")}`
    setTariffs([...tariffs, { ...newTariff, id, isDefault: false }])
    setIsAddDialogOpen(false)
    setNewTariff({
      name: "",
      type: "flat",
      baseRate: 5.0,
      peakRate: 7.0,
      offPeakRate: 3.5,
      connectionFee: 0,
      idleFee: 2.0,
    })
  }

  const handleSetDefault = (id: string) => {
    setTariffs(tariffs.map((t) => ({ ...t, isDefault: t.id === id })))
  }

  const handleDeleteTariff = (id: string) => {
    setTariffs(tariffs.filter((t) => t.id !== id))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Global Pricing Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Configuration</CardTitle>
          <CardDescription>
            Global settings that apply to all tariffs and invoicing
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={globalSettings.currency}
                onValueChange={(value) => setGlobalSettings({ ...globalSettings, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAD">MAD - Moroccan Dirham</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={globalSettings.taxRate}
                onChange={(e) =>
                  setGlobalSettings({ ...globalSettings, taxRate: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="precision">Rounding Precision</Label>
              <Select
                value={String(globalSettings.roundingPrecision)}
                onValueChange={(value) =>
                  setGlobalSettings({ ...globalSettings, roundingPrecision: Number(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 decimals</SelectItem>
                  <SelectItem value="1">1 decimal</SelectItem>
                  <SelectItem value="2">2 decimals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium text-foreground">Dynamic Pricing</p>
              <p className="text-sm text-muted-foreground">
                Enable real-time price adjustments based on demand and grid load
              </p>
            </div>
            <Switch
              checked={globalSettings.enableDynamicPricing}
              onCheckedChange={(checked) =>
                setGlobalSettings({ ...globalSettings, enableDynamicPricing: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Tariff Plans */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tariff Plans</CardTitle>
            <CardDescription>
              Define pricing structures for different charging scenarios
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Tariff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Tariff</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Tariff Name</Label>
                  <Input
                    value={newTariff.name}
                    onChange={(e) => setNewTariff({ ...newTariff, name: e.target.value })}
                    placeholder="e.g., Standard Rate"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Pricing Type</Label>
                  <Select
                    value={newTariff.type}
                    onValueChange={(value) =>
                      setNewTariff({ ...newTariff, type: value as Tariff["type"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat Rate</SelectItem>
                      <SelectItem value="time-of-use">Time-of-Use</SelectItem>
                      <SelectItem value="dynamic">Dynamic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newTariff.type === "flat" && (
                  <div className="flex flex-col gap-2">
                    <Label>Rate per kWh ({globalSettings.currency})</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newTariff.baseRate}
                      onChange={(e) =>
                        setNewTariff({ ...newTariff, baseRate: Number(e.target.value) })
                      }
                    />
                  </div>
                )}
                {newTariff.type === "time-of-use" && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label>Peak Rate</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newTariff.peakRate}
                        onChange={(e) =>
                          setNewTariff({ ...newTariff, peakRate: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Standard Rate</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newTariff.baseRate}
                        onChange={(e) =>
                          setNewTariff({ ...newTariff, baseRate: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Off-Peak Rate</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newTariff.offPeakRate}
                        onChange={(e) =>
                          setNewTariff({ ...newTariff, offPeakRate: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Connection Fee ({globalSettings.currency})</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newTariff.connectionFee}
                      onChange={(e) =>
                        setNewTariff({ ...newTariff, connectionFee: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Idle Fee per Hour ({globalSettings.currency})</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newTariff.idleFee}
                      onChange={(e) =>
                        setNewTariff({ ...newTariff, idleFee: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTariff}>Add Tariff</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Rate (per kWh)</TableHead>
                <TableHead className="text-muted-foreground">Connection Fee</TableHead>
                <TableHead className="text-muted-foreground">Idle Fee</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tariffs.map((tariff) => (
                <TableRow key={tariff.id} className="border-border">
                  <TableCell className="font-medium text-foreground">{tariff.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {tariff.type === "time-of-use" && <Clock className="mr-1 h-3 w-3" />}
                      {tariff.type.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {tariff.type === "time-of-use" ? (
                      <span className="text-xs">
                        {tariff.offPeakRate} - {tariff.peakRate} {globalSettings.currency}
                      </span>
                    ) : (
                      `${tariff.baseRate} ${globalSettings.currency}`
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tariff.connectionFee} {globalSettings.currency}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tariff.idleFee} {globalSettings.currency}/hr
                  </TableCell>
                  <TableCell>
                    {tariff.isDefault ? (
                      <Badge className="bg-primary/10 text-primary">Default</Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleSetDefault(tariff.id)}
                      >
                        Set Default
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteTariff(tariff.id)}
                        disabled={tariff.isDefault}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
