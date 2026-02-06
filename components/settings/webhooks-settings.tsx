"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2, Webhook, Plus, Trash2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface WebhookConfig {
    id: string
    url: string
    events: string[]
    secret: string
    retryPolicy: string
}

export function WebhooksSettings() {
    const [loading, setLoading] = useState(false)
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>([])
    const [newWebhook, setNewWebhook] = useState({
        url: "",
        events: [] as string[],
        secret: "",
        retryPolicy: "exponential",
    })

    const availableEvents = [
        "session.started",
        "session.completed",
        "session.failed",
        "payment.authorized",
        "payment.captured",
        "payment.refunded",
        "station.created",
        "station.updated",
        "connector.status_changed",
    ]

    // Load existing webhooks
    useEffect(() => {
        const loadWebhooks = async () => {
            try {
                const response = await fetch('/api/settings?category=webhooks')
                if (response.ok) {
                    const data = await response.json()
                    if (data.webhooks && Array.isArray(data.webhooks)) {
                        setWebhooks(data.webhooks)
                    }
                }
            } catch (error) {
                console.error('Failed to load webhooks:', error)
            }
        }

        loadWebhooks()
    }, [])

    const handleAddWebhook = () => {
        if (!newWebhook.url) {
            toast.error("Please enter a webhook URL")
            return
        }

        const webhook: WebhookConfig = {
            id: Date.now().toString(),
            url: newWebhook.url,
            events: newWebhook.events,
            secret: newWebhook.secret,
            retryPolicy: newWebhook.retryPolicy,
        }

        setWebhooks([...webhooks, webhook])
        setNewWebhook({
            url: "",
            events: [],
            secret: "",
            retryPolicy: "exponential",
        })
        toast.success("Webhook added")
    }

    const handleDeleteWebhook = (id: string) => {
        setWebhooks(webhooks.filter(w => w.id !== id))
        toast.success("Webhook removed")
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: 'webhooks',
                    key: 'webhooks',
                    value: webhooks,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to save')
            }

            toast.success("Webhook settings saved successfully")
        } catch (error) {
            console.error('Error saving webhook settings:', error)
            toast.error("Failed to save webhook settings")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Webhook className="h-5 w-5" />
                        <div>
                            <CardTitle>Webhooks Settings</CardTitle>
                            <CardDescription>
                                Configure outbound webhooks for event notifications
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="rounded-lg border border-border p-4 space-y-4">
                        <h3 className="text-sm font-medium">Add New Webhook</h3>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="webhook-url">Webhook URL</Label>
                            <Input
                                id="webhook-url"
                                type="url"
                                placeholder="https://your-server.com/webhook"
                                value={newWebhook.url}
                                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="webhook-secret">Secret Key</Label>
                            <Input
                                id="webhook-secret"
                                type="password"
                                placeholder="Enter secret for HMAC signature"
                                value={newWebhook.secret}
                                onChange={(e) => setNewWebhook({ ...newWebhook, secret: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Used to sign webhook payloads for verification
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="retry-policy">Retry Policy</Label>
                            <Select
                                value={newWebhook.retryPolicy}
                                onValueChange={(value) => setNewWebhook({ ...newWebhook, retryPolicy: value })}
                            >
                                <SelectTrigger id="retry-policy">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Retry</SelectItem>
                                    <SelectItem value="linear">Linear (1, 2, 3 min)</SelectItem>
                                    <SelectItem value="exponential">Exponential (1, 2, 4, 8 min)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Events to Subscribe</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {availableEvents.map((event) => (
                                    <label key={event} className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={newWebhook.events.includes(event)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setNewWebhook({
                                                        ...newWebhook,
                                                        events: [...newWebhook.events, event]
                                                    })
                                                } else {
                                                    setNewWebhook({
                                                        ...newWebhook,
                                                        events: newWebhook.events.filter(ev => ev !== event)
                                                    })
                                                }
                                            }}
                                            className="rounded"
                                        />
                                        <span className="text-muted-foreground">{event}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <Button onClick={handleAddWebhook} variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Webhook
                        </Button>
                    </div>

                    {webhooks.length > 0 && (
                        <div className="rounded-lg border border-border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>URL</TableHead>
                                        <TableHead>Events</TableHead>
                                        <TableHead>Retry Policy</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {webhooks.map((webhook) => (
                                        <TableRow key={webhook.id}>
                                            <TableCell className="font-mono text-xs">{webhook.url}</TableCell>
                                            <TableCell className="text-xs">
                                                {webhook.events.length} events
                                            </TableCell>
                                            <TableCell className="text-xs">{webhook.retryPolicy}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteWebhook(webhook.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

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
                        <p className="font-medium mb-1">Webhook Configuration:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>Webhooks are sent as POST requests with JSON payload</li>
                            <li>Payloads are signed with HMAC-SHA256 using the secret key</li>
                            <li>Failed deliveries are retried based on the retry policy</li>
                            <li>Delivery logs are available for troubleshooting</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
