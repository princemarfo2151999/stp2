import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Build .env.local content
        const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ykpsxwxkaiweclazjxos.supabase.co'}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Xv4pvP2MUSgmBav6FOPcfQ_gnxbwMAp'}

# MariaDB/MySQL Configuration
DB_HOST=${body.DB_HOST || 'localhost'}
DB_PORT=${body.DB_PORT || '3306'}
DB_USER=${body.DB_USER || 'root'}
DB_PASSWORD=${body.DB_PASSWORD || ''}
DB_NAME=${body.DB_NAME || 'cpms'}

# Application URL
NEXT_PUBLIC_APP_URL=${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
`

        // Write to .env.local file
        const envPath = join(process.cwd(), '.env.local')
        await writeFile(envPath, envContent, 'utf-8')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to update .env.local:', error)
        return NextResponse.json(
            { error: 'Failed to update environment file' },
            { status: 500 }
        )
    }
}
