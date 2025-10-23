'use client';

import { useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import styles from './page.module.css';

export default function NotFoundWithRedirect() {
    const [timer, setTimer] = useState(5);
    const router = useRouter();

    useEffect(()=>{
        if(timer === 0){
            router.push('/');
            return;
        }
        const interval = setInterval(()=> setTimer(t => t-1),1000);
        return () => clearInterval(interval);
    }, [timer, router]);
    return (
        <div className = {styles.PageNotFound}>
            Page Not Found <br />
            Redirecting to home page in {timer} second{timer !== 1 ? 's' : ''}
        </div>
    );


}