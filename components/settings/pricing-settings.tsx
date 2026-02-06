"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save, Loader2, DollarSign } from "lucide-react"
import { toast } from "sonner"

export function PricingSettings() {
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState({
        defaultPricePerKwh: "2.50",
        peakHourStart: "18:00",
        peakHourEnd: "22:00",
        peakHourMultiplier: "1.5",
        dynamicPricingEnabled: false,
    })

    // Load existing settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await fetch('/api/settings?category=pricing')
                if (response.ok) {
                    const data = await response.json()
                    if (data.pricing) {
                        setSettings({
                            defaultPricePerKwh: data.pricing.defaultPricePerKwh || "2.50",
                            peakHourStart: data.pricing.peakHourStart || "18:00",
                            peakHourEnd: data.pricing.peakHourEnd || "22:00",
                            peakHourMultiplier: data.pricing.peakHourMultiplier || "1.5",
                            dynamicPricingEnabled: data.pricing.dynamicPricingEnabled || false,
                        })
                    }
                }
            } catch (error) {
                console.error('Failed to load pricing settings:', error)
            }
        }

        loadSettings()
    }, [])

    const handleSave = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: 'pricing',
                    key: 'pricing',
                    value: settings,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to save')
            }

            toast.success("Pricing settings saved successfully")
        } catch (error) {
            console.error('Error saving pricing settings:', error)
            toast.error("Failed to save pricing settings")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        <div>
                            <CardTitle>Pricing Settings</CardTitle>
                            <CardDescription>
                                Configure default pricing and tariff rules
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="default-price">Default Price per kWh (MAD)</Label>
                        <Input
                            id="default-price"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="2.50"
                            value={settings.defaultPricePerKwh}
                            onChange={(e) => setSettings({ ...settings, defaultPricePerKwh: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                            Base price for energy consumption (can be overridden per station)
                        </p>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-sm font-medium mb-3">Peak Hour Pricing</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="peak-start">Peak Hour Start</Label>
                                <Input
                                    id="peak-start"
                                    type="time"
                                    value={settings.peakHourStart}
                                    onChange={(e) => setSettings({ ...settings, peakHourStart: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="peak-end">Peak Hour End</Label>
                                <Input
                                    id="peak-end"
                                    type="time"
                                    value={settings.peakHourEnd}
                                    onChange={(e) => setSettings({ ...settings, peakHourEnd: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                            <Label htmlFor="peak-multiplier">Peak Hour Multiplier</Label>
                            <Input
                                id="peak-multiplier"
                                type="number"
                                min="1"
                                step="0.1"
                                placeholder="1.5"
                                value={settings.peakHourMultiplier}
                                onChange={(e) => setSettings({ ...settings, peakHourMultiplier: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Multiply base price by this factor during peak hours (e.g., 1.5 = 50% increase)
                            </p>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="dynamic-pricing">Dynamic Pricing</Label>
                                <p className="text-xs text-muted-foreground">
                                    Enable real-time pricing based on demand and grid conditions
                                </p>
                            </div>
                            <Switch
                                id="dynamic-pricing"
                                checked={settings.dynamicPricingEnabled}
                                onCheckedChange={(checked) => setSettings({ ...settings, dynamicPricingEnabled: checked })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="rounded-lg border border-border bg-secondary/30 p-3 text-sm">
                        <p className="font-medium mb-1">Pricing Notes:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>Pricing changes apply to new sessions only</li>
                            <li>Station-specific tariffs override these defaults</li>
                            <li>Dynamic pricing requires additional configuration and integration</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
