"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2, Server, CheckCircle, XCircle, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export function OcppSettings() {
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [settings, setSettings] = useState({
    enabled: true,
    citrineosBaseUrl: "",
    ocppVersion: "2.0.1",
    apiKey: "",
    webhookSecret: "",
    webhookEndpoint: "",
    heartbeatInterval: "300",
    meterValueInterval: "60",
    mappingRules: "{}",
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings?category=ocpp')
        if (response.ok) {
          const data = await response.json()
          if (data.ocpp) {
            setSettings((prev) => ({
              ...prev,
              ...data.ocpp,
            }))
          }
        }
      } catch (error) {
        console.error('Failed to load OCPP settings:', error)
      }
    }
    loadSettings()
  }, [])

  const handleTestConnection = async () => {
    if (!settings.citrineosBaseUrl) {
      toast.error("Please enter CitrineOS base URL first")
      return
    }

    setTesting(true)
    setConnectionStatus('idle')

    try {
      const response = await fetch(`${settings.citrineosBaseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`,
        },
      })

      if (response.ok) {
        setConnectionStatus('success')
        toast.success("CitrineOS connection successful!")
      } else {
        setConnectionStatus('error')
        toast.error("Failed to connect to CitrineOS")
      }
    } catch {
      setConnectionStatus('error')
      toast.error("Failed to connect to CitrineOS. Check the URL and ensure the server is running.")
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'ocpp',
          key: 'ocpp',
          value: settings,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save')
      }

      toast.success("OCPP/CitrineOS settings saved successfully")
    } catch {
      toast.error("Failed to save OCPP settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* CitrineOS Connection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>CitrineOS CSMS Connection</CardTitle>
                <CardDescription>
                  Connect to your CitrineOS Central System Management instance
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {connectionStatus === 'success' && (
                <Badge variant="secondary" className="bg-success/10 text-success gap-1">
                  <Wifi className="h-3 w-3" />
                  Connected
                </Badge>
              )}
              {connectionStatus === 'error' && (
                <Badge variant="secondary" className="bg-destructive/10 text-destructive gap-1">
                  <WifiOff className="h-3 w-3" />
                  Disconnected
                </Badge>
              )}
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="citrineos-url">CitrineOS Base URL</Label>
              <Input
                id="citrineos-url"
                type="url"
                placeholder="https://citrineos.example.com"
                value={settings.citrineosBaseUrl}
                onChange={(e) => setSettings({ ...settings, citrineosBaseUrl: e.target.value })}
                disabled={!settings.enabled}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ocpp-version">OCPP Version</Label>
              <Select
                value={settings.ocppVersion}
                onValueChange={(value) => setSettings({ ...settings, ocppVersion: value })}
                disabled={!settings.enabled}
              >
                <SelectTrigger id="ocpp-version">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.6">OCPP 1.6J</SelectItem>
                  <SelectItem value="2.0.1">OCPP 2.0.1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="api-key">API Key / Auth Token</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter API key"
                value={settings.apiKey}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                disabled={!settings.enabled}
              />
              <p className="text-xs text-muted-foreground">
                Authentication token for CitrineOS API
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="webhook-secret">Webhook Secret</Label>
              <Input
                id="webhook-secret"
                type="password"
                placeholder="Enter webhook secret"
                value={settings.webhookSecret}
                onChange={(e) => setSettings({ ...settings, webhookSecret: e.target.value })}
                disabled={!settings.enabled}
              />
              <p className="text-xs text-muted-foreground">
                For verifying inbound webhooks
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="webhook-endpoint">Webhook Callback URL</Label>
            <Input
              id="webhook-endpoint"
              type="url"
              placeholder="https://your-domain.com/api/ocpp/webhook"
              value={settings.webhookEndpoint}
              onChange={(e) => setSettings({ ...settings, webhookEndpoint: e.target.value })}
              disabled={!settings.enabled}
            />
            <p className="text-xs text-muted-foreground">
              The URL CitrineOS will call for status updates and events
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing || !settings.citrineosBaseUrl || !settings.enabled}
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Protocol Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Protocol Configuration</CardTitle>
          <CardDescription>
            Configure OCPP protocol timing and behavior settings
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="heartbeat-interval">Heartbeat Interval (seconds)</Label>
              <Input
                id="heartbeat-interval"
                type="number"
                min="30"
                step="30"
                placeholder="300"
                value={settings.heartbeatInterval}
                onChange={(e) => setSettings({ ...settings, heartbeatInterval: e.target.value })}
                disabled={!settings.enabled}
              />
              <p className="text-xs text-muted-foreground">
                How often charge points send heartbeat messages
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="meter-interval">Meter Value Interval (seconds)</Label>
              <Input
                id="meter-interval"
                type="number"
                min="10"
                step="10"
                placeholder="60"
                value={settings.meterValueInterval}
                onChange={(e) => setSettings({ ...settings, meterValueInterval: e.target.value })}
                disabled={!settings.enabled}
              />
              <p className="text-xs text-muted-foreground">
                How often meter values are reported during charging
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ID Mapping */}
      <Card>
        <CardHeader>
          <CardTitle>Charger ID Mapping</CardTitle>
          <CardDescription>
            Map CitrineOS charger identifiers to WATTSC station/EVSE/connector IDs
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="mapping-rules">Mapping Rules (JSON)</Label>
            <Textarea
              id="mapping-rules"
              placeholder={'{\n  "CP001": { "stationId": "st-001", "evseId": "evse-001" },\n  "CP002": { "stationId": "st-002", "evseId": "evse-002" }\n}'}
              rows={6}
              value={settings.mappingRules}
              onChange={(e) => setSettings({ ...settings, mappingRules: e.target.value })}
              className="font-mono text-sm"
              disabled={!settings.enabled}
            />
            <p className="text-xs text-muted-foreground">
              JSON mapping between CitrineOS charge point IDs and your WATTSC station identifiers
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={loading || !settings.enabled}>
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
    </div>
  )
}
