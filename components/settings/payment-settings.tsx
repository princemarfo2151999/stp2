"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function PaymentSettings() {
    const [loading, setLoading] = useState(false)
    const [testing, setTesting] = useState<'youcan' | 'cmi' | null>(null)

    const [youcanPay, setYoucanPay] = useState({
        clientId: "",
        clientSecret: "",
        enabled: false,
    })

    const [cmi, setCmi] = useState({
        storeId: "",
        clientId: "",
        secretKey: "",
        gatewayUrl: "",
        enabled: false,
    })

    // Load existing settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await fetch('/api/settings?category=payment')
                if (response.ok) {
                    const data = await response.json()

                    if (data.youcanPay) {
                        setYoucanPay({
                            clientId: data.youcanPay.clientId || "",
                            clientSecret: data.youcanPay.clientSecret || "",
                            enabled: data.youcanPay.enabled || false,
                        })
                    }

                    if (data.cmi) {
                        setCmi({
                            storeId: data.cmi.storeId || "",
                            clientId: data.cmi.clientId || "",
                            secretKey: data.cmi.secretKey || "",
                            gatewayUrl: data.cmi.gatewayUrl || "",
                            enabled: data.cmi.enabled || false,
                        })
                    }
                }
            } catch (error) {
                console.error('Failed to load payment settings:', error)
                toast.error("Failed to load payment settings")
            }
        }

        loadSettings()
    }, [])

    const handleSaveYoucanPay = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'youcan_pay',
                    value: youcanPay,
                    category: 'payment',
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to save')
            }

            toast.success("YouCan Pay settings saved successfully")
        } catch (error) {
            console.error('Error saving YouCan Pay settings:', error)
            toast.error("Failed to save YouCan Pay settings")
        } finally {
            setLoading(false)
        }
    }

    const handleSaveCMI = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'cmi',
                    value: cmi,
                    category: 'payment',
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to save')
            }

            toast.success("CMI settings saved successfully")
        } catch (error) {
            console.error('Error saving CMI settings:', error)
            toast.error("Failed to save CMI settings")
        } finally {
            setLoading(false)
        }
    }

    const handleTestConnection = async (provider: 'youcan' | 'cmi') => {
        setTesting(provider)
        try {
            const endpoint = provider === 'youcan' ? '/api/payment/youcan' : '/api/payment/cmi'
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'test' }),
            })

            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    toast.success(`${provider === 'youcan' ? 'YouCan Pay' : 'CMI'} connection successful!`)
                } else {
                    toast.error(`Failed to connect to ${provider === 'youcan' ? 'YouCan Pay' : 'CMI'}`)
                }
            } else {
                toast.error(`Failed to connect to ${provider === 'youcan' ? 'YouCan Pay' : 'CMI'}`)
            }
        } catch (error) {
            toast.error(`Failed to connect to ${provider === 'youcan' ? 'YouCan Pay' : 'CMI'}`)
        } finally {
            setTesting(null)
        }
    }


    return (
        <div className="flex flex-col gap-6">
            {/* YouCan Pay */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>YouCan Pay</CardTitle>
                            <CardDescription>
                                Configure YouCan Pay payment gateway credentials
                            </CardDescription>
                        </div>
                        <Switch
                            checked={youcanPay.enabled}
                            onCheckedChange={(checked) => setYoucanPay({ ...youcanPay, enabled: checked })}
                        />
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="youcan-client-id">OAuth Client ID (4-digit API Key)</Label>
                            <Input
                                id="youcan-client-id"
                                placeholder="1234"
                                value={youcanPay.clientId}
                                onChange={(e) => setYoucanPay({ ...youcanPay, clientId: e.target.value })}
                                disabled={!youcanPay.enabled}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="youcan-client-secret">Client Secret</Label>
                            <Input
                                id="youcan-client-secret"
                                type="password"
                                placeholder="••••••••••••"
                                value={youcanPay.clientSecret}
                                onChange={(e) => setYoucanPay({ ...youcanPay, clientSecret: e.target.value })}
                                disabled={!youcanPay.enabled}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleTestConnection('youcan')}
                            disabled={!youcanPay.enabled || !youcanPay.clientId || !youcanPay.clientSecret || testing !== null}
                        >
                            {testing === 'youcan' ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                'Test Connection'
                            )}
                        </Button>
                        <Button
                            onClick={handleSaveYoucanPay}
                            disabled={!youcanPay.enabled || loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save YouCan Pay Settings
                                </>
                            )}
                        </Button>
                    </div>

                    {youcanPay.enabled && (
                        <div className="rounded-lg border border-border bg-secondary/30 p-3 text-sm">
                            <p className="font-medium mb-1">Configuration Help:</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>The OAuth Client ID is the 4-digit API key provided by YouCan Pay</li>
                                <li>The Client Secret is your authentication secret key</li>
                                <li>Test the connection before saving to verify credentials</li>
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* CMI Payment Gateway */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>CMI Payment Gateway</CardTitle>
                            <CardDescription>
                                Configure CMI payment gateway credentials
                            </CardDescription>
                        </div>
                        <Switch
                            checked={cmi.enabled}
                            onCheckedChange={(checked) => setCmi({ ...cmi, enabled: checked })}
                        />
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="cmi-store-id">Store / Merchant ID</Label>
                            <Input
                                id="cmi-store-id"
                                placeholder="Your Store ID"
                                value={cmi.storeId}
                                onChange={(e) => setCmi({ ...cmi, storeId: e.target.value })}
                                disabled={!cmi.enabled}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="cmi-client-id">Client ID</Label>
                            <Input
                                id="cmi-client-id"
                                placeholder="Your Client ID"
                                value={cmi.clientId}
                                onChange={(e) => setCmi({ ...cmi, clientId: e.target.value })}
                                disabled={!cmi.enabled}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="cmi-secret-key">API Secret Key</Label>
                            <Input
                                id="cmi-secret-key"
                                type="password"
                                placeholder="••••••••••••"
                                value={cmi.secretKey}
                                onChange={(e) => setCmi({ ...cmi, secretKey: e.target.value })}
                                disabled={!cmi.enabled}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="cmi-gateway-url">Gateway URL</Label>
                            <Input
                                id="cmi-gateway-url"
                                placeholder="https://gateway.cmi.ma/..."
                                value={cmi.gatewayUrl}
                                onChange={(e) => setCmi({ ...cmi, gatewayUrl: e.target.value })}
                                disabled={!cmi.enabled}
                            />
                            <p className="text-xs text-muted-foreground">Test or Production endpoint</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleTestConnection('cmi')}
                            disabled={
                                !cmi.enabled ||
                                !cmi.storeId ||
                                !cmi.clientId ||
                                !cmi.secretKey ||
                                testing !== null
                            }
                        >
                            {testing === 'cmi' ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                'Test Connection'
                            )}
                        </Button>
                        <Button
                            onClick={handleSaveCMI}
                            disabled={!cmi.enabled || loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save CMI Settings
                                </>
                            )}
                        </Button>
                    </div>

                    {cmi.enabled && (
                        <div className="rounded-lg border border-border bg-secondary/30 p-3 text-sm">
                            <p className="font-medium mb-1">Configuration Help:</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>Store ID is your unique merchant identifier from CMI</li>
                                <li>Client ID and Secret Key are provided during CMI registration</li>
                                <li>Use test gateway URL for development, production URL for live</li>
                                <li>Test the connection before saving to verify credentials</li>
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20">
                <CardContent className="pt-6">
                    <div className="flex gap-3">
                        <div className="text-orange-600 dark:text-orange-400">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-1">Security Notice</h4>
                            <p className="text-sm text-orange-800 dark:text-orange-200">
                                Payment credentials are encrypted and stored securely in the database. Never share these credentials publicly or commit them to version control.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
