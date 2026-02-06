import { NextRequest, NextResponse } from 'next/server'
import { CMIService } from '@/lib/payment/cmi'
import { query } from '@/lib/db/mariadb'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const callbackData: Record<string, string> = {}

        // Convert FormData to object
        formData.forEach((value, key) => {
            callbackData[key] = value.toString()
        })

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

        // Verify the callback
        const verification = service.verifyCallback(callbackData)

        if (!verification.isValid) {
            console.error('Invalid CMI callback signature')
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            )
        }

        // Update session based on payment status
        if (verification.status === 'success') {
            await query(
                'UPDATE sessions SET payment_status = ?, total_cost = ? WHERE payment_intent_id = ?',
                ['completed', verification.amount, verification.transactionId]
            )
        } else {
            await query(
                'UPDATE sessions SET payment_status = ? WHERE payment_intent_id = ?',
                ['failed', verification.transactionId]
            )
        }

        // Log the callback
        console.log('CMI callback processed:', {
            transactionId: verification.transactionId,
            status: verification.status,
            amount: verification.amount,
        })

        // Return success response to CMI
        return new NextResponse('ACTION=POSTAUTH', {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
            },
        })
    } catch (error) {
        console.error('CMI callback error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
