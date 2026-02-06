'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [verifying, setVerifying] = useState(true)
    const [sessionId, setSessionId] = useState<string | null>(null)

    useEffect(() => {
        const session = searchParams.get('session')
        const transactionId = searchParams.get('transaction_id')

        if (session) {
            setSessionId(session)
        }

        // Verify payment if transaction ID is present
        if (transactionId) {
            verifyPayment(transactionId)
        } else {
            setVerifying(false)
        }
    }, [searchParams])

    const verifyPayment = async (transactionId: string) => {
        try {
            // Try YouCan Pay verification first
            const youcanResponse = await fetch('/api/payment/youcan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'verify-payment',
                    transactionId,
                }),
            })

            if (youcanResponse.ok) {
                const result = await youcanResponse.json()
                console.log('Payment verified:', result)
            }
        } catch (error) {
            console.error('Payment verification error:', error)
        } finally {
            setVerifying(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        {verifying ? (
                            <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                        ) : (
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        )}
                    </div>
                    <CardTitle className="text-2xl text-green-700">
                        {verifying ? 'Verifying Payment...' : 'Payment Successful!'}
                    </CardTitle>
                    <CardDescription>
                        {verifying
                            ? 'Please wait while we confirm your payment'
                            : 'Your charging session payment has been processed successfully'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {sessionId && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Session ID</p>
                            <p className="font-mono text-sm font-semibold">{sessionId}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Button
                            onClick={() => router.push('/dashboard/sessions')}
                            className="w-full"
                            disabled={verifying}
                        >
                            View Session Details
                        </Button>
                        <Button
                            onClick={() => router.push('/dashboard')}
                            variant="outline"
                            className="w-full"
                            disabled={verifying}
                        >
                            Return to Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
