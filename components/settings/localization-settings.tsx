"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Save, Globe, Languages, Clock, Calendar } from "lucide-react"

interface Language {
  code: string
  name: string
  nativeName: string
  enabled: boolean
  isDefault: boolean
}

const availableLanguages: Language[] = [
  { code: "fr", name: "French", nativeName: "Francais", enabled: true, isDefault: true },
  { code: "ar", name: "Arabic", nativeName: "عربي", enabled: true, isDefault: false },
  { code: "en", name: "English", nativeName: "English", enabled: true, isDefault: false },
  { code: "es", name: "Spanish", nativeName: "Espanol", enabled: false, isDefault: false },
  { code: "de", name: "German", nativeName: "Deutsch", enabled: false, isDefault: false },
]

export function LocalizationSettings() {
  const [languages, setLanguages] = useState<Language[]>(availableLanguages)
  const [settings, setSettings] = useState({
    defaultLanguage: "fr",
    timezone: "Africa/Casablanca",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    currency: "MAD",
    currencyPosition: "after",
    decimalSeparator: ",",
    thousandsSeparator: " ",
    measurementUnit: "metric",
  })

  const toggleLanguage = (code: string) => {
    setLanguages(
      languages.map((lang) =>
        lang.code === code ? { ...lang, enabled: !lang.enabled } : lang
      )
    )
  }

  const setDefaultLanguage = (code: string) => {
    setLanguages(
      languages.map((lang) => ({
        ...lang,
        isDefault: lang.code === code,
        enabled: lang.code === code ? true : lang.enabled,
      }))
    )
    setSettings({ ...settings, defaultLanguage: code })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Language Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Languages className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Languages</CardTitle>
              <CardDescription>
                Configure available languages for the platform
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {languages.map((lang) => (
              <div
                key={lang.code}
                className={`flex items-center justify-between rounded-lg border p-4 ${
                  lang.enabled ? "border-border" : "border-border bg-secondary/30"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold ${
                      lang.enabled
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {lang.code.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{lang.name}</p>
                      <span className="text-sm text-muted-foreground">({lang.nativeName})</span>
                      {lang.isDefault && (
                        <Badge className="bg-primary/10 text-primary">Default</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!lang.isDefault && lang.enabled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDefaultLanguage(lang.code)}
                    >
                      Set as Default
                    </Button>
                  )}
                  <Switch
                    checked={lang.enabled}
                    onCheckedChange={() => toggleLanguage(lang.code)}
                    disabled={lang.isDefault}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
              <Globe className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>Configure date, time, and number formats</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => setSettings({ ...settings, timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Casablanca">
                    Africa/Casablanca (GMT+1)
                  </SelectItem>
                  <SelectItem value="Europe/Paris">Europe/Paris (GMT+1)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="America/New_York">America/New York (GMT-5)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={settings.dateFormat}
                onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (04/02/2025)</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (02/04/2025)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2025-02-04)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select
                value={settings.timeFormat}
                onValueChange={(value) => setSettings({ ...settings, timeFormat: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24-hour (14:30)</SelectItem>
                  <SelectItem value="12h">12-hour (2:30 PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="measurementUnit">Measurement Units</Label>
              <Select
                value={settings.measurementUnit}
                onValueChange={(value) => setSettings({ ...settings, measurementUnit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (km, kWh)</SelectItem>
                  <SelectItem value="imperial">Imperial (mi, kWh)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Currency & Number Format</CardTitle>
          <CardDescription>Configure how currency and numbers are displayed</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => setSettings({ ...settings, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAD">MAD - Moroccan Dirham</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="currencyPosition">Currency Symbol Position</Label>
              <Select
                value={settings.currencyPosition}
                onValueChange={(value) => setSettings({ ...settings, currencyPosition: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before">Before (MAD 100)</SelectItem>
                  <SelectItem value="after">After (100 MAD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="decimalSeparator">Decimal Separator</Label>
              <Select
                value={settings.decimalSeparator}
                onValueChange={(value) => setSettings({ ...settings, decimalSeparator: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=".">Period (1.234,56)</SelectItem>
                  <SelectItem value=",">Comma (1 234,56)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="thousandsSeparator">Thousands Separator</Label>
              <Select
                value={settings.thousandsSeparator}
                onValueChange={(value) => setSettings({ ...settings, thousandsSeparator: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">Space (1 234)</SelectItem>
                  <SelectItem value=",">Comma (1,234)</SelectItem>
                  <SelectItem value=".">Period (1.234)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <p className="mb-2 text-sm font-medium text-foreground">Preview</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Number</p>
                <p className="font-medium text-foreground">
                  {settings.thousandsSeparator === " " ? "1 234" : "1,234"}
                  {settings.decimalSeparator}56
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Currency</p>
                <p className="font-medium text-foreground">
                  {settings.currencyPosition === "before"
                    ? `${settings.currency} 1${settings.thousandsSeparator === " " ? " " : ","}234${settings.decimalSeparator}56`
                    : `1${settings.thousandsSeparator === " " ? " " : ","}234${settings.decimalSeparator}56 ${settings.currency}`}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Date & Time</p>
                <p className="font-medium text-foreground">
                  {settings.dateFormat === "DD/MM/YYYY"
                    ? "04/02/2025"
                    : settings.dateFormat === "MM/DD/YYYY"
                      ? "02/04/2025"
                      : "2025-02-04"}{" "}
                  {settings.timeFormat === "24h" ? "14:30" : "2:30 PM"}
                </p>
              </div>
            </div>
          </div>
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
