import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { host, port, user, password, database } = body

        if (!host || !user || !database) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Test database connection
        const connection = await mysql.createConnection({
            host,
            port: parseInt(port) || 3306,
            user,
            password,
            database,
        })

        // Simple query to verify connection
        await connection.query('SELECT 1')
        await connection.end()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Database connection test failed:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Connection failed' },
            { status: 500 }
        )
    }
}
