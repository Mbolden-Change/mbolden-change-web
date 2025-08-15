import { stripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { amount, frequency, coverFees, isDedicated, dedicationName } = await req.json();
        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL;

        if (!amount || typeof amount !== 'number') {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const isSubscription = frequency !== 'One-time';

        const session = await stripe.checkout.sessions.create({
            mode: isSubscription ? 'subscription' :'payment',
            ui_mode: 'embedded',
            line_items: [
                {
                price_data: {
                    currency: 'usd',
                    unit_amount: amount,
                    product_data: {
                        name: `${frequency} Donation `,
                        description: (isDedicated ? `Dedicated to ${dedicationName}` : undefined),
                    },
                    ...(isSubscription && {
                        recurring: {
                            interval: frequency === 'Monthly' ? 'month' : 'year',
                        },
                    }),
                },
                quantity: 1,
                },
            ],
            return_url: `${origin}/return?session_id={CHECKOUT_SESSION_ID}`,
            metadata: {
                frequency,
                coverFees: coverFees ? 'yes' : 'no',
                isDedicated: isDedicated ? 'yes' : 'no',
                dedicationName: dedicationName || ''
            }
        });

        return NextResponse.json({ clientSecret: session.client_secret });
    } catch (err: any) {
        console.error('Stripe Checkout Session error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
