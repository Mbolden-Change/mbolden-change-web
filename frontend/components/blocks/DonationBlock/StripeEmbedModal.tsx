'use client'

import { useEffect, useRef } from 'react'
import { loadStripe, StripeEmbeddedCheckout } from '@stripe/stripe-js'
import styles from './StripeEmbedModal.module.css'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function StripeEmbedModal({ clientSecret }: { clientSecret: string }) {
    const checkoutRef = useRef<HTMLDivElement>(null)
    const checkoutInstanceRef = useRef<StripeEmbeddedCheckout | null>(null)

        useEffect(() => {
            const mountCheckout = async () => {
                const stripe = await stripePromise
                if (!stripe || !checkoutRef.current) return

                try {
                    const checkout = await stripe.initEmbeddedCheckout({ clientSecret })
                    checkout.mount(checkoutRef.current)
                    checkoutInstanceRef.current = checkout
                } catch (err) {
                    console.error('[StripeEmbedModal] Mount error:', err)
                }
            }

            mountCheckout()

            return () => {
                if (checkoutInstanceRef.current) {
                    checkoutInstanceRef.current.destroy()
                    checkoutInstanceRef.current = null
                }
            }
        }, [clientSecret])

    return (
        <div className={styles.modalContent}>
            <div ref={checkoutRef} className={styles.scrollableContent}/>
        </div>
    )
}
