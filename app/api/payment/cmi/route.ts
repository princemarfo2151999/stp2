import { NextRequest, NextResponse } from 'next/server'
import { CMIService } from '@/lib/payment/cmi'
import { query } from '@/lib/db/mariadb'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action, ...params } = body

        // Get CMI configuration from settings
        const settings = await query(
            'SELECT setting_value FROM settings WHERE setting_key = ? AND category = ?',
            ['cmi', 'payment']
        )

        if (!settings || settings.length === 0) {
            return NextResponse.json(
                { error: 'CMI Gateway not configured' },
                { status: 400 }
            )
        }

        const config = JSON.parse(settings[0].setting_value)
        const service = new CMIService(config)

        switch (action) {
            case 'test': {
                const isConnected = await service.testConnection()
                return NextResponse.json({ success: isConnected })
            }

            case 'create-payment': {
                const { sessionId, amount, email } = params

                if (!sessionId || !amount) {
                    return NextResponse.json(
                        { error: 'Missing required fields: sessionId, amount' },
                        { status: 400 }
                    )
                }

                const paymentRequest = await service.createPaymentRequest({
                    amount,
                    orderId: sessionId,
                    email,
                    okUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session=${sessionId}`,
                    failUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed?session=${sessionId}`,
                    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/cmi/callback`,
                })

                // Update session with transaction ID
                await query(
                    'UPDATE sessions SET payment_intent_id = ?, payment_status = ? WHERE id = ?',
                    [paymentRequest.transactionId, 'pending', sessionId]
                )

                return NextResponse.json(paymentRequest)
            }

            case 'capture': {
                const { transactionId, amount } = params

                if (!transactionId || !amount) {
                    return NextResponse.json(
                        { error: 'Missing transactionId or amount' },
                        { status: 400 }
                    )
                }

                const success = await service.capturePayment(transactionId, amount)

                if (success) {
                    await query(
                        'UPDATE sessions SET payment_status = ? WHERE payment_intent_id = ?',
                        ['completed', transactionId]
                    )
                }

                return NextResponse.json({ success })
            }

            case 'refund': {
                const { transactionId, amount } = params

                if (!transactionId || !amount) {
                    return NextResponse.json(
                        { error: 'Missing transactionId or amount' },
                        { status: 400 }
                    )
                }

                const success = await service.refund(transactionId, amount)

                if (success) {
                    await query(
                        'UPDATE sessions SET payment_status = ? WHERE payment_intent_id = ?',
                        ['refunded', transactionId]
                    )
                }

                return NextResponse.json({ success })
            }

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                )
        }
    } catch (error) {
        console.error('CMI API error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
