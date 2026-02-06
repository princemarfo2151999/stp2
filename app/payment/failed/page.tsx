'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, AlertCircle } from 'lucide-react'

export default function PaymentFailedPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string>('')

    useEffect(() => {
        const session = searchParams.get('session')
        const error = searchParams.get('error')

        if (session) {
            setSessionId(session)
        }

        if (error) {
            setErrorMessage(decodeURIComponent(error))
        }
    }, [searchParams])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl text-red-700">Payment Failed</CardTitle>
                    <CardDescription>
                        We were unable to process your payment. Please try again.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {errorMessage && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-red-800">Error Details</p>
                                <p className="text-sm text-red-700">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    {sessionId && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Session ID</p>
                            <p className="font-mono text-sm font-semibold">{sessionId}</p>
                        </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-blue-800 mb-2">Common Issues:</p>
                        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                            <li>Insufficient funds</li>
                            <li>Incorrect card details</li>
                            <li>Card expired or blocked</li>
                            <li>Network connection issues</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <Button
                            onClick={() => router.push(`/dashboard/sessions/${sessionId}`)}
                            className="w-full"
                            disabled={!sessionId}
                        >
                            Try Again
                        </Button>
                        <Button
                            onClick={() => router.push('/dashboard')}
                            variant="outline"
                            className="w-full"
                        >
                            Return to Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
