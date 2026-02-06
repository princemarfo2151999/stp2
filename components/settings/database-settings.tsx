"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Loader2, Database, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

export function DatabaseSettings() {
    const [loading, setLoading] = useState(false)
    const [testing, setTesting] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'failed'>('idle')

    const [dbConfig, setDbConfig] = useState({
        host: "localhost",
        port: "3306",
        user: "root",
        password: "",
        database: "cpms",
    })

    // Load existing settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await fetch('/api/settings?category=database')
                if (response.ok) {
                    const data = await response.json()

                    if (data.database) {
                        setDbConfig({
                            host: data.database.host || "localhost",
                            port: data.database.port || "3306",
                            user: data.database.user || "root",
                            password: "", // Never load password for security
                            database: data.database.database || "cpms",
                        })
                    }
                }
            } catch (error) {
                console.error('Failed to load database settings:', error)
            }
        }

        loadSettings()
    }, [])

    const handleTestConnection = async () => {
        setTesting(true)
        setConnectionStatus('idle')
        try {
            const response = await fetch('/api/settings/test-db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dbConfig),
            })

            if (response.ok) {
                setConnectionStatus('success')
                toast.success("Database connection successful!")
            } else {
                setConnectionStatus('failed')
                toast.error("Failed to connect to database")
            }
        } catch (error) {
            setConnectionStatus('failed')
            toast.error("Failed to connect to database")
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
                    category: 'database',
                    key: 'database',
                    value: dbConfig,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to save')
            }

            // Update .env.local file
            const envResponse = await fetch('/api/settings/update-env', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    DB_HOST: dbConfig.host,
                    DB_PORT: dbConfig.port,
                    DB_USER: dbConfig.user,
                    DB_PASSWORD: dbConfig.password,
                    DB_NAME: dbConfig.database,
                }),
            })

            if (!envResponse.ok) {
                console.warn('Failed to update .env.local file')
            }

            toast.success("Database settings saved successfully")
        } catch (error) {
            console.error('Error saving database settings:', error)
            toast.error("Failed to save database settings")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* MariaDB/MySQL Configuration */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        <div>
                            <CardTitle>Database Configuration</CardTitle>
                            <CardDescription>
                                Configure MariaDB/MySQL database connection settings
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="db-host">Host</Label>
                            <Input
                                id="db-host"
                                placeholder="localhost"
                                value={dbConfig.host}
                                onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">Database server address</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="db-port">Port</Label>
                            <Input
                                id="db-port"
                                placeholder="3306"
                                value={dbConfig.port}
                                onChange={(e) => setDbConfig({ ...dbConfig, port: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">Default: 3306</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="db-user">Username</Label>
                            <Input
                                id="db-user"
                                placeholder="root"
                                value={dbConfig.user}
                                onChange={(e) => setDbConfig({ ...dbConfig, user: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="db-password">Password</Label>
                            <Input
                                id="db-password"
                                type="password"
                                placeholder="••••••••••••"
                                value={dbConfig.password}
                                onChange={(e) => setDbConfig({ ...dbConfig, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="db-name">Database Name</Label>
                        <Input
                            id="db-name"
                            placeholder="cpms"
                            value={dbConfig.database}
                            onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                            Make sure this database exists before saving
                        </p>
                    </div>

                    {/* Connection Status */}
                    {connectionStatus !== 'idle' && (
                        <div className={`flex items-center gap-2 rounded-lg border p-3 ${connectionStatus === 'success'
                                ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20'
                                : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20'
                            }`}>
                            {connectionStatus === 'success' ? (
                                <>
                                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    <span className="text-sm font-medium text-green-900 dark:text-green-100">
                                        Connection successful!
                                    </span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    <span className="text-sm font-medium text-red-900 dark:text-red-100">
                                        Connection failed. Please check your credentials.
                                    </span>
                                </>
                            )}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleTestConnection}
                            disabled={!dbConfig.host || !dbConfig.user || !dbConfig.database || testing}
                        >
                            {testing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                'Test Connection'
                            )}
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={loading || !dbConfig.host || !dbConfig.user || !dbConfig.database}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Database Settings
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="rounded-lg border border-border bg-secondary/30 p-3 text-sm">
                        <p className="font-medium mb-1">Configuration Notes:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>Test the connection before saving to verify credentials</li>
                            <li>Settings are saved to both database and .env.local file</li>
                            <li>You may need to restart the application after changing database settings</li>
                            <li>Ensure the database exists: <code className="bg-muted px-1 rounded">CREATE DATABASE cpms;</code></li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
                <CardContent className="pt-6">
                    <div className="flex gap-3">
                        <div className="text-blue-600 dark:text-blue-400">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Security Information</h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                Database credentials are stored in your .env.local file and encrypted in the database. Never commit .env.local to version control or share credentials publicly.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
