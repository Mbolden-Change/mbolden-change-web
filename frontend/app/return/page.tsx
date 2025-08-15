'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Headline from '@/components/atoms/Headline'
import ButtonComponent from '@/components/atoms/ButtonComponent'
import Link from 'next/link'
import styles from './page.module.css'

export default function ReturnPage() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const [session, setSession] = useState<any>(null)

    useEffect(() => {
        if (!sessionId) return

        const fetchSession = async () => {
        try {
            const res = await fetch(`/api/session?session_id=${sessionId}`)
            const data = await res.json()
            setSession(data)
        } catch (err) {
            console.error('Failed to fetch session:', err)
        }
        }

        fetchSession()
    }, [sessionId])

    return (
        <div className={styles.confirmationContainer}>
        <Headline tag="h1" text="Thank You for Making a Difference." className={styles.transactionHeadlines}/>
        {session ? (
            <div className={styles.transactionDetails}>
                <p style={{paddingBottom: "10px"}}>Your {session.mode} donation was successful.</p>
                <p>Amount: ${(session.amount_total / 100).toFixed(2)} USD</p>
                <p>Payment Status: {session.payment_status}</p>
            </div>
        ) : (
            <p>Loading session details...</p>
        )}
        <Link href="/our-work">
            <ButtonComponent variant="primary" style={{ marginTop: '2rem' }}>Learn more about your impact</ButtonComponent>
        </Link>
        </div>
    )
}
