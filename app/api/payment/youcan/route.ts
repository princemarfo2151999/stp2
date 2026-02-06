import { NextRequest, NextResponse } from 'next/server'
import { YouCanPayService } from '@/lib/payment/youcan-pay'
import { query } from '@/lib/db/mariadb'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action, ...params } = body

        // Get YouCan Pay configuration from settings
        const settings = await query(
            'SELECT setting_value FROM settings WHERE setting_key = ? AND category = ?',
            ['youcanPay', 'payment']
        )

        if (!settings || settings.length === 0) {
            return NextResponse.json(
                { error: 'YouCan Pay not configured' },
                { status: 400 }
            )
        }

        const config = JSON.parse(settings[0].setting_value)
        const service = new YouCanPayService(config)

        switch (action) {
            case 'test': {
                const isConnected = await service.testConnection()
                return NextResponse.json({ success: isConnected })
            }

            case 'create-payment': {
                const { sessionId, amount, customerId } = params

                if (!sessionId || !amount || !customerId) {
                    return NextResponse.json(
                        { error: 'Missing required fields: sessionId, amount, customerId' },
                        { status: 400 }
                    )
                }

                const paymentIntent = await service.createPaymentIntent({
                    amount,
                    orderId: sessionId,
                    customerId,
                    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session=${sessionId}`,
                    errorUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed?session=${sessionId}`,
                })

                // Update session with payment intent ID
                await query(
                    'UPDATE sessions SET payment_intent_id = ?, payment_status = ? WHERE id = ?',
                    [paymentIntent.id, 'pending', sessionId]
                )

                return NextResponse.json(paymentIntent)
            }

            case 'verify-payment': {
                const { transactionId } = params

                if (!transactionId) {
                    return NextResponse.json(
                        { error: 'Missing transactionId' },
                        { status: 400 }
                    )
                }

                const result = await service.verifyPayment(transactionId)

                // Update session payment status
                if (result.status === 'success') {
                    await query(
                        'UPDATE sessions SET payment_status = ?, total_cost = ? WHERE payment_intent_id = ?',
                        ['completed', result.amount, transactionId]
                    )
                } else if (result.status === 'failed') {
                    await query(
                        'UPDATE sessions SET payment_status = ? WHERE payment_intent_id = ?',
                        ['failed', transactionId]
                    )
                }

                return NextResponse.json(result)
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
        console.error('YouCan Pay API error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
