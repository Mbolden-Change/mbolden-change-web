import { stripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const session_id = req.nextUrl.searchParams.get('session_id')

    if (!session_id) {
        return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id)
        return NextResponse.json(session)
    } catch (err) {
        console.error('Failed to fetch session:', err)
        return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 })
    }
}
