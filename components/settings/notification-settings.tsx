"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save, Mail, MessageSquare, Bell, AlertTriangle } from "lucide-react"

export function NotificationSettings() {
  const [emailSettings, setEmailSettings] = useState({
    enabled: true,
    smtpHost: "smtp.watt.ma",
    smtpPort: 587,
    smtpUser: "notifications@watt.ma",
    smtpPassword: "********",
    fromAddress: "noreply@watt.ma",
    fromName: "watt.ma",
  })

  const [smsSettings, setSmsSettings] = useState({
    enabled: true,
    provider: "Twilio",
    apiKey: "AC***************",
    senderId: "watt.ma",
  })

  const [triggers, setTriggers] = useState({
    sessionStart: { email: true, sms: false, push: true },
    sessionComplete: { email: true, sms: false, push: true },
    sessionError: { email: true, sms: true, push: true },
    lowBalance: { email: true, sms: true, push: true },
    stationOffline: { email: true, sms: true, push: true },
    maintenanceDue: { email: true, sms: false, push: true },
    invoiceGenerated: { email: true, sms: false, push: false },
    passwordReset: { email: true, sms: false, push: false },
  })

  const triggerLabels: Record<string, { label: string; description: string; icon: React.ElementType }> = {
    sessionStart: { label: "Session Started", description: "When a charging session begins", icon: Bell },
    sessionComplete: { label: "Session Complete", description: "When a charging session ends", icon: Bell },
    sessionError: { label: "Session Error", description: "When a session encounters an error", icon: AlertTriangle },
    lowBalance: { label: "Low Balance", description: "When user balance falls below threshold", icon: AlertTriangle },
    stationOffline: { label: "Station Offline", description: "When a station goes offline", icon: AlertTriangle },
    maintenanceDue: { label: "Maintenance Due", description: "When maintenance is scheduled", icon: Bell },
    invoiceGenerated: { label: "Invoice Generated", description: "When a new invoice is created", icon: Mail },
    passwordReset: { label: "Password Reset", description: "When password reset is requested", icon: Mail },
  }

  const handleTriggerChange = (
    trigger: keyof typeof triggers,
    channel: "email" | "sms" | "push",
    value: boolean
  ) => {
    setTriggers({
      ...triggers,
      [trigger]: { ...triggers[trigger], [channel]: value },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Email Configuration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure SMTP settings for email delivery</CardDescription>
            </div>
          </div>
          <Switch
            checked={emailSettings.enabled}
            onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, enabled: checked })}
          />
        </CardHeader>
        {emailSettings.enabled && (
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={emailSettings.smtpHost}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={emailSettings.smtpPort}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, smtpPort: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input
                  id="smtpUser"
                  value={emailSettings.smtpUser}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={emailSettings.smtpPassword}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="fromAddress">From Address</Label>
                <Input
                  id="fromAddress"
                  value={emailSettings.fromAddress}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, fromAddress: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={emailSettings.fromName}
                  onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                />
              </div>
            </div>
            <Button variant="outline" className="w-fit bg-transparent">
              Send Test Email
            </Button>
          </CardContent>
        )}
      </Card>

      {/* SMS Configuration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
              <MessageSquare className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <CardTitle>SMS Notifications</CardTitle>
              <CardDescription>Configure SMS gateway for text messages</CardDescription>
            </div>
          </div>
          <Switch
            checked={smsSettings.enabled}
            onCheckedChange={(checked) => setSmsSettings({ ...smsSettings, enabled: checked })}
          />
        </CardHeader>
        {smsSettings.enabled && (
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="provider">SMS Provider</Label>
                <Input
                  id="provider"
                  value={smsSettings.provider}
                  onChange={(e) => setSmsSettings({ ...smsSettings, provider: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={smsSettings.apiKey}
                  onChange={(e) => setSmsSettings({ ...smsSettings, apiKey: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="senderId">Sender ID</Label>
              <Input
                id="senderId"
                value={smsSettings.senderId}
                onChange={(e) => setSmsSettings({ ...smsSettings, senderId: e.target.value })}
                className="max-w-xs"
              />
            </div>
            <Button variant="outline" className="w-fit bg-transparent">
              Send Test SMS
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Notification Triggers */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Triggers</CardTitle>
          <CardDescription>Configure which events trigger notifications and through which channels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {/* Header */}
            <div className="flex items-center border-b border-border pb-2">
              <div className="flex-1" />
              <div className="grid w-[300px] grid-cols-3 text-center text-sm font-medium text-muted-foreground">
                <span>Email</span>
                <span>SMS</span>
                <span>Push</span>
              </div>
            </div>
            {/* Triggers */}
            {Object.entries(triggers).map(([key, channels]) => {
              const trigger = triggerLabels[key]
              const TriggerIcon = trigger.icon
              return (
                <div key={key} className="flex items-center py-3">
                  <div className="flex flex-1 items-center gap-3">
                    <TriggerIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{trigger.label}</p>
                      <p className="text-xs text-muted-foreground">{trigger.description}</p>
                    </div>
                  </div>
                  <div className="grid w-[300px] grid-cols-3 justify-items-center">
                    <Switch
                      checked={channels.email}
                      onCheckedChange={(checked) =>
                        handleTriggerChange(key as keyof typeof triggers, "email", checked)
                      }
                      disabled={!emailSettings.enabled}
                    />
                    <Switch
                      checked={channels.sms}
                      onCheckedChange={(checked) =>
                        handleTriggerChange(key as keyof typeof triggers, "sms", checked)
                      }
                      disabled={!smsSettings.enabled}
                    />
                    <Switch
                      checked={channels.push}
                      onCheckedChange={(checked) =>
                        handleTriggerChange(key as keyof typeof triggers, "push", checked)
                      }
                    />
                  </div>
                </div>
              )
            })}
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
