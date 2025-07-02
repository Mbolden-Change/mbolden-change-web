'use client'

import { useState } from 'react';
import styles from './DonationBlock.module.css';
import ButtonComponent from '../../atoms/ButtonComponent';
import Headline from '../../atoms/Headline';
import { FaArrowRightLong } from "react-icons/fa6";

import StripeEmbedModal from './StripeEmbedModal';

function getTextColorFromTheme(theme: string) {
    const darkThemes = ['var(--brand-black)', 'var(--brand-fuchsia)', 'var(--brand-aqua-teal)'];
    const lightThemes = ['var(--brand-warm-yellow)', 'var(--brand-white)', 'var(--brand-light-gray)', 'var(--brand-creamy-beige)'];

    if (darkThemes.includes(theme)) return 'var(--brand-white)';
    if (lightThemes.includes(theme)) return 'var(--brand-black)';
    return 'var(--brand-black)';
}

type DonationFormProps = {
    formTheme?: string;
};

export default function DonationForm({ formTheme = 'var(--brand-black'}: DonationFormProps) {
    const isDarkTheme = ['var(--brand-black)', 'var(--brand-fuchsia)', 'var(--brand-aqua-teal)'].includes(formTheme);
    const contrastColor = isDarkTheme ? 'var(--brand-white)' : 'var(--brand-black)';

    const frequencies = ['One-time', 'Monthly', 'Annually'];
    const amounts = [100, 250, 500, 1000, 2500, 5000];

    const [selectedFreq, setSelectedFreq] = useState<string>(frequencies[0]);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [coverFees, setCoverFees] = useState<boolean>(false);
    const [isDedicated, setIsDedicated] = useState<boolean>(false);
    const [dedicationName, setDedicationName] = useState<string>("");


    const [clientSecret, setClientSecret] = useState<string | null>(null)

    const handleSubmit = async () => {
        const amountToDonate = selectedAmount ?? parseFloat(customAmount);
        if (!amountToDonate || amountToDonate < 1) {
            alert("Please enter a valid donation amount.");
            return;
        }
        const finalAmount = Math.round(amountToDonate * (coverFees ? 1.03 : 1) * 100);

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: finalAmount, frequency: selectedFreq, coverFees, isDedicated, dedicationName})
            });
            const data = await response.json();

            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
            } else {
                console.warn('No client_secret in response:', data);
            }

        } catch (err) {
            console.error(err);
            alert("Something went wrong. Please try again.");
        }
    };

    const liveAmount = (selectedAmount ?? parseFloat(customAmount)) || 0;

    return (
        <>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div style={{ backgroundColor: formTheme, color: contrastColor }} className={styles.formHeader}>
                <Headline tag="h2" text="Choose amount" className={styles.formHeadline}/>
            </div>

            <div  className={styles.contentWrapper}>
                <div style={{ border: `2px solid ${formTheme}` }} className={styles.frequencyToggle}>
                    {frequencies.map(freq => (
                        <ButtonComponent
                            key={freq}
                            variant="unstyled"
                            className={`${styles.freqButton} ${selectedFreq === freq ? styles.selectedButton : ''}`}
                            onClick={() => setSelectedFreq(freq)}
                            style={{
                                '--bg-color': formTheme,
                                '--text-color': contrastColor,
                                '--border-color': formTheme
                            } as React.CSSProperties}
                        >
                            {freq}
                        </ButtonComponent>
                    ))}
                </div>

                <div className={styles.amountGrid}>
                    {amounts.map((value) => (
                        <ButtonComponent
                            key={value}
                            variant="unstyled"
                            className={`${styles.amountButton} ${selectedAmount === value ? styles.selectedButton : ''}`}
                            onClick={() => {setSelectedAmount(value); setCustomAmount("");}}
                            style={{
                                '--bg-color': formTheme,
                                '--text-color': contrastColor,
                                '--border-color': formTheme
                            } as React.CSSProperties}
                        >
                            ${value}
                        </ButtonComponent>
                    ))}
                </div>

                <input
                    className={styles.amountInputField}
                    type="number"
                    value={customAmount}
                    placeholder="$ Custom Amount"
                    min="5"
                    max="25001"
                    onChange={(e) => {setCustomAmount(e.target.value); setSelectedAmount(null);}}
                />

                <label className={styles.checkboxLabel}>
                    <input type="checkbox" className={styles.checkbox} style={{ accentColor: formTheme }} onChange={() => setCoverFees(!coverFees)}/>
                    Add 3% to the donation amount to cover fees and make each dollar work harder
                </label>
                <div>
                    <label className={styles.checkboxLabel}>
                        <input type="checkbox" className={styles.checkbox} style={{ accentColor: formTheme }} onChange={() => setIsDedicated(!isDedicated)}/>
                        Dedicate my donation in honor or in memory of someone
                    </label>
                </div>
                {isDedicated && (
                    <input
                        className={styles.amountInputField}
                        value={dedicationName}
                        placeholder="Name of the person"
                        onChange={(e) => setDedicationName(e.target.value)}
                    />
                )}


                <div className={styles.actionButtonBox}>
                    <ButtonComponent type="submit" variant="primary" style={{ backgroundColor: formTheme, color: contrastColor }} className={styles.navButton}>
                        Donate {liveAmount > 0 ? `$${liveAmount}` : ""}
                    </ButtonComponent>
                </div>
            </div>
        </form>

        {clientSecret && (
            <div className={styles.modalOverlay}>
                <StripeEmbedModal clientSecret={clientSecret}/>
            </div>
        )}
        </>
    );
}
