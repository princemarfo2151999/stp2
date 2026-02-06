// CMI Payment Gateway integration service
// CMI is a Moroccan payment gateway

import crypto from 'crypto'

interface CMIConfig {
    storeId: string
    clientId: string
    secretKey: string
    gatewayUrl: string
    enabled: boolean
}

interface PaymentRequest {
    amount: number
    currency?: string
    orderId: string
    customerId?: string
    email?: string
    okUrl?: string
    failUrl?: string
    callbackUrl?: string
}

interface PaymentResponse {
    paymentUrl: string
    transactionId: string
}

export class CMIService {
    private config: CMIConfig

    constructor(config: CMIConfig) {
        this.config = config
    }

    /**
     * Test the connection to CMI gateway
     */
    async testConnection(): Promise<boolean> {
        try {
            // CMI doesn't have a specific test endpoint
            // We can verify the configuration is valid
            if (!this.config.storeId || !this.config.clientId || !this.config.secretKey || !this.config.gatewayUrl) {
                return false
            }

            // TODO: Optionally ping the gateway URL
            const response = await fetch(this.config.gatewayUrl, {
                method: 'HEAD',
            })

            return response.ok || response.status === 405 // Some gateways return 405 for HEAD
        } catch (error) {
            console.error('CMI connection test failed:', error)
            return false
        }
    }

    /**
     * Generate HASH for CMI request (security signature)
     * CMI uses HMAC-SHA512 for request signing
     */
    private generateHash(data: Record<string, string>): string {
        // Sort keys alphabetically
        const sortedKeys = Object.keys(data).sort()

        // Concatenate values
        const dataString = sortedKeys.map(key => data[key]).join('|')

        // Generate HMAC-SHA512 hash
        const hmac = crypto.createHmac('sha512', this.config.secretKey)
        hmac.update(dataString)

        return hmac.digest('base64')
    }

    /**
     * Create a payment request
     */
    async createPaymentRequest(request: PaymentRequest): Promise<PaymentResponse> {
        if (!this.config.enabled) {
            throw new Error('CMI Payment Gateway is not enabled')
        }

        const transactionId = `TXN_${Date.now()}_${request.orderId}`

        // Prepare CMI request data
        const requestData = {
            clientid: this.config.clientId,
            storetype: '3D_PAY_HOSTING',
            amount: (request.amount * 100).toString(), // Convert to cents
            currency: request.currency || '504', // 504 = MAD
            oid: request.orderId,
            okUrl: request.okUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
            failUrl: request.failUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`,
            callbackUrl: request.callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`,
            trantype: 'PreAuth', // or 'Auth' for immediate capture
            BillToName: request.email || '',
            email: request.email || '',
            rnd: Date.now().toString(),
            encoding: 'UTF-8',
            lang: 'en',
        }

        // Generate hash
        const hash = this.generateHash(requestData)

        // Build payment URL with form parameters
        const params = new URLSearchParams({
            ...requestData,
            HASH: hash,
        })

        const paymentUrl = `${this.config.gatewayUrl}?${params.toString()}`

        return {
            paymentUrl,
            transactionId,
        }
    }

    /**
     * Verify callback from CMI
     */
    verifyCallback(callbackData: Record<string, string>): {
        isValid: boolean
        status: 'success' | 'failed'
        transactionId: string
        amount: number
    } {
        const receivedHash = callbackData.HASH
        const { HASH, ...dataForHash } = callbackData

        const calculatedHash = this.generateHash(dataForHash)

        const isValid = receivedHash === calculatedHash

        return {
            isValid,
            status: callbackData.ProcReturnCode === '00' ? 'success' : 'failed',
            transactionId: callbackData.oid,
            amount: parseFloat(callbackData.amount) / 100, // Convert back from cents
        }
    }

    /**
     * Capture a pre-authorized payment
     */
    async capturePayment(transactionId: string, amount: number): Promise<boolean> {
        try {
            const requestData = {
                clientid: this.config.clientId,
                amount: (amount * 100).toString(),
                currency: '504', // MAD
                oid: transactionId,
                trantype: 'PostAuth',
            }

            const hash = this.generateHash(requestData)

            const response = await fetch(this.config.gatewayUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    ...requestData,
                    HASH: hash,
                }),
            })

            const text = await response.text()

            // CMI returns specific response codes
            return text.includes('00') // 00 = success
        } catch (error) {
            console.error('Failed to capture payment:', error)
            return false
        }
    }

    /**
     * Process a refund
     */
    async refund(transactionId: string, amount: number): Promise<boolean> {
        try {
            const requestData = {
                clientid: this.config.clientId,
                amount: (amount * 100).toString(),
                currency: '504', // MAD
                oid: transactionId,
                trantype: 'Credit', // Refund transaction type
            }

            const hash = this.generateHash(requestData)

            const response = await fetch(this.config.gatewayUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    ...requestData,
                    HASH: hash,
                }),
            })

            const text = await response.text()

            return text.includes('00')
        } catch (error) {
            console.error('Failed to process refund:', error)
            return false
        }
    }
}

/**
 * Helper function to get CMI service instance from settings
 */
export async function getCMIService(): Promise<CMIService | null> {
    try {
        const response = await fetch('/api/settings?category=payment')
        if (!response.ok) {
            return null
        }

        const data = await response.json()

        if (!data.cmi || !data.cmi.enabled) {
            return null
        }

        return new CMIService(data.cmi)
    } catch (error) {
        console.error('Failed to initialize CMI service:', error)
        return null
    }
}
