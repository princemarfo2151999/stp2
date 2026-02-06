"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Save, FileText, Calendar, Clock, Mail, Download } from "lucide-react"

interface ScheduledReport {
  id: string
  name: string
  type: string
  frequency: "daily" | "weekly" | "monthly"
  recipients: string[]
  lastRun?: string
  nextRun: string
  enabled: boolean
}

const mockReports: ScheduledReport[] = [
  {
    id: "RPT-001",
    name: "Daily Revenue Summary",
    type: "revenue",
    frequency: "daily",
    recipients: ["admin@watt.ma", "finance@watt.ma"],
    lastRun: "2025-02-03T23:59:00",
    nextRun: "2025-02-04T23:59:00",
    enabled: true,
  },
  {
    id: "RPT-002",
    name: "Weekly Station Performance",
    type: "stations",
    frequency: "weekly",
    recipients: ["operations@watt.ma"],
    lastRun: "2025-01-28T00:00:00",
    nextRun: "2025-02-04T00:00:00",
    enabled: true,
  },
  {
    id: "RPT-003",
    name: "Monthly Usage Report",
    type: "usage",
    frequency: "monthly",
    recipients: ["admin@watt.ma", "ceo@watt.ma"],
    lastRun: "2025-01-01T00:00:00",
    nextRun: "2025-02-01T00:00:00",
    enabled: false,
  },
]

export function ReportsSettings() {
  const [reports, setReports] = useState<ScheduledReport[]>(mockReports)
  const [settings, setSettings] = useState({
    defaultFormat: "pdf",
    includeCharts: true,
    compressionEnabled: true,
    retentionDays: 90,
    timezone: "Africa/Casablanca",
  })

  const toggleReport = (id: string) => {
    setReports(reports.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Report Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Default settings for generated reports</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="defaultFormat">Default Format</Label>
              <Select
                value={settings.defaultFormat}
                onValueChange={(value) => setSettings({ ...settings, defaultFormat: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                  <SelectItem value="Africa/Casablanca">Africa/Casablanca (GMT+1)</SelectItem>
                  <SelectItem value="Europe/Paris">Europe/Paris (GMT+1)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="retentionDays">Retention (days)</Label>
              <Input
                id="retentionDays"
                type="number"
                value={settings.retentionDays}
                onChange={(e) =>
                  setSettings({ ...settings, retentionDays: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium text-foreground">Include Charts</p>
                <p className="text-sm text-muted-foreground">
                  Add visual charts to PDF reports
                </p>
              </div>
              <Switch
                checked={settings.includeCharts}
                onCheckedChange={(checked) => setSettings({ ...settings, includeCharts: checked })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium text-foreground">Compress Attachments</p>
                <p className="text-sm text-muted-foreground">
                  Compress reports before emailing
                </p>
              </div>
              <Switch
                checked={settings.compressionEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, compressionEnabled: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Scheduled Reports</CardTitle>
            <CardDescription>Automated reports sent on a recurring schedule</CardDescription>
          </div>
          <Button size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule New Report
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className={`rounded-lg border p-4 ${
                  report.enabled ? "border-border" : "border-border bg-secondary/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        report.enabled ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      <FileText
                        className={`h-5 w-5 ${
                          report.enabled ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{report.name}</p>
                        <Badge
                          variant="secondary"
                          className={
                            report.frequency === "daily"
                              ? "bg-chart-2/10 text-chart-2"
                              : report.frequency === "weekly"
                                ? "bg-chart-3/10 text-chart-3"
                                : "bg-chart-4/10 text-chart-4"
                          }
                        >
                          {report.frequency.charAt(0).toUpperCase() + report.frequency.slice(1)}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {report.recipients.length} recipient
                          {report.recipients.length !== 1 ? "s" : ""}
                        </span>
                        {report.lastRun && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last: {formatDate(report.lastRun)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Next: {formatDate(report.nextRun)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Run Now
                    </Button>
                    <Switch
                      checked={report.enabled}
                      onCheckedChange={() => toggleReport(report.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Report Types */}
      <Card>
        <CardHeader>
          <CardTitle>Available Report Types</CardTitle>
          <CardDescription>Reports you can generate or schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                name: "Revenue Report",
                description: "Financial summary with revenue breakdown",
                type: "revenue",
              },
              {
                name: "Station Performance",
                description: "Uptime, usage, and efficiency metrics",
                type: "stations",
              },
              {
                name: "Usage Analytics",
                description: "Energy delivered, sessions, and trends",
                type: "usage",
              },
              {
                name: "User Activity",
                description: "Driver engagement and behavior patterns",
                type: "users",
              },
              {
                name: "Maintenance Log",
                description: "Service history and upcoming maintenance",
                type: "maintenance",
              },
              {
                name: "Error Report",
                description: "Faults, errors, and resolution times",
                type: "errors",
              },
            ].map((reportType) => (
              <div
                key={reportType.type}
                className="rounded-lg border border-border p-4 hover:border-primary/50"
              >
                <p className="font-medium text-foreground">{reportType.name}</p>
                <p className="text-sm text-muted-foreground">{reportType.description}</p>
                <Button variant="outline" size="sm" className="mt-3 w-full bg-transparent">
                  Generate Report
                </Button>
              </div>
            ))}
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
