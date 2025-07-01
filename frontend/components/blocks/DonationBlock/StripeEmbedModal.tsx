'use client'

import { useEffect, useRef, useState } from 'react'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import styles from './StripeEmbedModal.module.css'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function StripeEmbedModal({ clientSecret }: { clientSecret: string }) {
    const checkoutRef = useRef<HTMLDivElement>(null)
    const mountedRef = useRef<boolean>(false)

    useEffect(() => {
        let stripeInstance: Stripe | null = null

        const mountCheckout = async () => {
            if (mountedRef.current) {
                console.warn('[StripeEmbedModal] Already mounted')
                return
            }

            stripeInstance = await stripePromise
            if (!stripeInstance || !checkoutRef.current) return

            try {
                const checkout = await stripeInstance.initEmbeddedCheckout({ clientSecret })
                checkout.mount(checkoutRef.current)
                mountedRef.current = true
            } catch (err) {
                console.error('[StripeEmbedModal] Mount error:', err)
            }
        }

        mountCheckout()

        return () => {
            mountedRef.current = false
        }
    }, [clientSecret])

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
            <div ref={checkoutRef} className={styles.scrollableContent}/>
            </div>
        </div>
    )
}
