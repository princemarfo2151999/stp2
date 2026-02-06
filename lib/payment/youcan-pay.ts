// YouCan Pay integration service
// Documentation: https://youcanpay.com/docs

interface YouCanPayConfig {
    clientId: string
    clientSecret: string
    enabled: boolean
}

interface PaymentIntentRequest {
    amount: number
    currency?: string
    orderId: string
    customerId: string
    successUrl?: string
    errorUrl?: string
}

interface PaymentIntentResponse {
    id: string
    status: string
    paymentUrl: string
}

export class YouCanPayService {
    private config: YouCanPayConfig
    private baseUrl = 'https://api.youcanpay.com'

    constructor(config: YouCanPayConfig) {
        this.config = config
    }

    /**
     * Test the connection to YouCan Pay API
     */
    async testConnection(): Promise<boolean> {
        try {
            // TODO: Implement actual test connection endpoint
            // This would typically verify credentials with a minimal API call
            const response = await fetch(`${this.baseUrl}/auth/check`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.config.clientId}:${this.config.clientSecret}`,
                    'Content-Type': 'application/json',
                },
            })

            return response.ok
        } catch (error) {
            console.error('YouCan Pay connection test failed:', error)
            return false
        }
    }

    /**
     * Create a payment intent for a charging session
     */
    async createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntentResponse> {
        if (!this.config.enabled) {
            throw new Error('YouCan Pay is not enabled')
        }

        try {
            const response = await fetch(`${this.baseUrl}/tokenize`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.clientId}:${this.config.clientSecret}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pri_key: this.config.clientId,
                    amount: request.amount,
                    currency: request.currency || 'MAD',
                    order_id: request.orderId,
                    customer_id: request.customerId,
                    success_url: request.successUrl,
                    error_url: request.errorUrl,
                }),
            })

            if (!response.ok) {
                throw new Error(`YouCan Pay API error: ${response.statusText}`)
            }

            const data = await response.json()

            return {
                id: data.transaction_id,
                status: data.status,
                paymentUrl: data.payment_url,
            }
        } catch (error) {
            console.error('Failed to create YouCan Pay payment intent:', error)
            throw error
        }
    }

    /**
     * Verify payment status
     */
    async verifyPayment(transactionId: string): Promise<{
        status: 'success' | 'failed' | 'pending'
        amount: number
    }> {
        try {
            const response = await fetch(`${this.baseUrl}/transactions/${transactionId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.config.clientId}:${this.config.clientSecret}`,
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error(`Failed to verify payment: ${response.statusText}`)
            }

            const data = await response.json()

            return {
                status: data.status === 'paid' ? 'success' : data.status === 'failed' ? 'failed' : 'pending',
                amount: data.amount,
            }
        } catch (error) {
            console.error('Failed to verify payment:', error)
            throw error
        }
    }

    /**
     * Process a refund
     */
    async refund(transactionId: string, amount: number): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/refunds`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.clientId}:${this.config.clientSecret}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transaction_id: transactionId,
                    amount: amount,
                }),
            })

            return response.ok
        } catch (error) {
            console.error('Failed to process refund:', error)
            return false
        }
    }
}

/**
 * Helper function to get YouCan Pay service instance from settings
 */
export async function getYouCanPayService(): Promise<YouCanPayService | null> {
    try {
        const response = await fetch('/api/settings?category=payment')
        if (!response.ok) {
            return null
        }

        const data = await response.json()

        if (!data.youcanPay || !data.youcanPay.enabled) {
            return null
        }

        return new YouCanPayService(data.youcanPay)
    } catch (error) {
        console.error('Failed to initialize YouCan Pay service:', error)
        return null
    }
}
