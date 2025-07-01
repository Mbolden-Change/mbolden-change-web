import { stripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { amount, frequency } = await req.json();
        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        if (!amount || typeof amount !== 'number') {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            ui_mode: 'embedded',
            line_items: [
                {
                price_data: {
                    currency: 'usd',
                    unit_amount: amount,
                    product_data: { name: `Donation (${frequency})` },
                },
                quantity: 1,
                },
            ],
            return_url: `${origin}/return?session_id={CHECKOUT_SESSION_ID}`,
        });

        return NextResponse.json({ clientSecret: session.client_secret });
    } catch (err: any) {
        console.error('Stripe Checkout Session error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
