"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function GeneralSettings() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    platformName: "WATTSC",
    defaultCurrency: "MAD",
    vatRate: "20",
    supportEmail: "support@wattsc.ma",
    supportPhone: "+212 5XX-XXXXXX",
  })

  // Load existing settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings?category=general')
        if (response.ok) {
          const data = await response.json()
          if (data.general) {
            setSettings({
              platformName: data.general.platformName || "WATTSC",
              defaultCurrency: data.general.defaultCurrency || "MAD",
              vatRate: data.general.vatRate || "20",
              supportEmail: data.general.supportEmail || "support@wattsc.ma",
              supportPhone: data.general.supportPhone || "+212 5XX-XXXXXX",
            })
          }
        }
      } catch (error) {
        console.error('Failed to load general settings:', error)
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
          category: 'general',
          key: 'general',
          value: settings,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save')
      }

      toast.success("General settings saved successfully")
    } catch (error) {
      console.error('Error saving general settings:', error)
      toast.error("Failed to save general settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure basic platform settings
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input
                id="platform-name"
                placeholder="WATTSC"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="default-currency">Default Currency</Label>
              <Input
                id="default-currency"
                placeholder="MAD"
                value={settings.defaultCurrency}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="vat-rate">VAT Rate (%)</Label>
              <Input
                id="vat-rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="20"
                value={settings.vatRate}
                onChange={(e) => setSettings({ ...settings, vatRate: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="support-email">Support Email</Label>
              <Input
                id="support-email"
                type="email"
                placeholder="support@wattsc.ma"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="support-phone">Support Phone</Label>
            <Input
              id="support-phone"
              type="tel"
              placeholder="+212 600 000 000"
              value={settings.supportPhone}
              onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
              className="max-w-sm"
            />
          </div>

          <div className="flex gap-2 pt-2">
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
        </CardContent>
      </Card>
    </div>
  )
}
