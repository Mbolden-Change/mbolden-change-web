'use client'

import { useState } from 'react';
import styles from './DonationForm.module.css';
import ButtonComponent from '../../atoms/ButtonComponent';
import Headline from '../../atoms/Headline';
import { useEffect, useRef } from 'react';
import { MdCheckBoxOutlineBlank } from "react-icons/md";
import { MdCheckBox } from "react-icons/md";

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
    paymentsPlatform?: 'stripe' | 'stripe-compact' | 'zeffy';
};

export default function DonationForm({ formTheme = 'var(--brand-black)', paymentsPlatform='stripe' }: DonationFormProps) {
    // const isDarkTheme = ['var(--brand-black)', 'var(--brand-fuchsia)', 'var(--brand-aqua-teal)'].includes(formTheme);
    // const contrastColor = isDarkTheme ? 'var(--brand-white)' : 'var(--brand-black)';
    const contrastColor = getTextColorFromTheme(formTheme);


    const frequencies = ['One-time', 'Monthly', 'Annually'];
    const amounts = [100, 250, 500, 1000, 2500, 5000];
    const compactAmounts = [100, 500, 1000];

    const [selectedFreq, setSelectedFreq] = useState<string>(frequencies[0]);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [coverFees, setCoverFees] = useState<boolean>(false);
    const [isDedicated, setIsDedicated] = useState<boolean>(false);
    const [dedicationName, setDedicationName] = useState<string>("");
    const liveAmount = (selectedAmount ?? parseFloat(customAmount)) || 0;

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

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setClientSecret(null);
            }
        };
        if (clientSecret) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [clientSecret]);


    if (paymentsPlatform === "stripe") {
        return (
            <div className={styles.formWrapper}>
                <div className={styles.formContainer}>
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
                            placeholder="$ Other amount"
                            min="5"
                            max="25001"
                            onChange={(e) => {setCustomAmount(e.target.value); setSelectedAmount(null);}}
                        />

                        <div className={styles.checkbox} onClick={() => setCoverFees(!coverFees)}>
                            {coverFees ? (
                                <MdCheckBox  color={formTheme}/>
                            ) : (
                                <MdCheckBoxOutlineBlank  color={formTheme}/>
                            )}<span style={{width: "80%", paddingTop: "2px"}}>Add 3% to cover fees</span>
                        </div>
                        <div className={styles.checkbox} onClick={() => setIsDedicated(!isDedicated)}>
                            {isDedicated ? (
                                <MdCheckBox  color={formTheme} />
                            ) : (
                                <MdCheckBoxOutlineBlank  color={formTheme} />
                            )}<span style={{width: "80%", paddingTop: "2px"}}>Dedicate my donation in honor or in memory of someone</span>
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
            </div>

            {clientSecret && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalInner} ref={modalRef}>
                        <StripeEmbedModal clientSecret={clientSecret} />
                    </div>
                </div>
            )}
            </div>
        );


    } else if (paymentsPlatform === "stripe-compact") {
        return (
            <div className={styles.compactFormWrapper}>
                <div className={styles.compactFormContainer} style={{ color: contrastColor }}>
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <div  className={styles.compactContentWrapper}>

                        <div style={{ border: `2px solid ${formTheme}` }} className={styles.compactFrequencyToggle}>
                            {frequencies.map(freq => (
                                <ButtonComponent
                                    key={freq}
                                    variant="unstyled"
                                    className={`${styles.compactFreqButton} ${selectedFreq === freq ? styles.compactSelectedButton : ''}`}
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

                        <div className={styles.compactAmountGridWrapper}>
                            <div className={styles.compactAmountGrid}>
                                {compactAmounts.map((value) => (
                                    <ButtonComponent
                                        key={value}
                                        variant="unstyled"
                                        className={`${styles.compactAmountButton} ${selectedAmount === value ? styles.compactSelectedButton : ''}`}
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

                            <div className={styles.compactAmountInputWrapper} style={{'--border-color': formTheme} as React.CSSProperties}>
                                <span className={styles.currencySymbol}>$</span>
                                <input
                                    className={styles.compactAmountInputField}
                                    type="number"
                                    value={customAmount}
                                    // placeholder="Other"
                                    min="5"
                                    max="25001"
                                    onChange={(e) => {setCustomAmount(e.target.value); setSelectedAmount(null);}}
                                    style={{
                                        '--border-color': formTheme
                                    } as React.CSSProperties}
                                    />
                                <span className={styles.currencyLabel}>USD</span>
                            </div>
                        </div>

                        <div className={styles.checkboxMenu} style={{'--border-color': formTheme} as React.CSSProperties}>
                            <div className={styles.checkbox} onClick={() => setCoverFees(!coverFees)}>
                                {coverFees ? (
                                    <MdCheckBox  color={formTheme}/>
                                ) : (
                                    <MdCheckBoxOutlineBlank  color={formTheme}/>
                                )}<span style={{width: "80%", paddingTop: "2px"}}>Add 3% to cover fees</span>
                            </div>
                            <div className={styles.checkbox} onClick={() => setIsDedicated(!isDedicated)}>
                                {isDedicated ? (
                                    <MdCheckBox  color={formTheme} />
                                ) : (
                                    <MdCheckBoxOutlineBlank  color={formTheme} />
                                )}<span style={{width: "80%", paddingTop: "2px"}}>Dedicate your donation to someone</span>
                            </div>
                            {isDedicated && (
                                <input
                                    className={styles.compactDedicationField}
                                    style={{'--text-color': contrastColor, '--border-bottom': formTheme} as React.CSSProperties}
                                    value={dedicationName}
                                    placeholder="Name of the person"
                                    onChange={(e) => setDedicationName(e.target.value)}
                                />
                            )}
                        </div>



                        <div className={styles.compactActionButtonBox}>
                            <ButtonComponent type="submit" variant="primary" style={{ backgroundColor: formTheme, color: contrastColor }} className={styles.compactNavButton}>
                                Donate {liveAmount > 0 ? `$${liveAmount}` : ""}
                            </ButtonComponent>
                        </div>
                    </div>
                </form>
            </div>

            {clientSecret && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalInner} ref={modalRef}>
                        <StripeEmbedModal clientSecret={clientSecret} />
                    </div>
                </div>
            )}
            </div>
        );
    } else {
        return (
            <div className={styles.zeffyContainer}>
                <ButtonComponent variant='unstyled' zeffy-form-link="https://www.zeffy.com/en-US/peer-to-peer/mbolden-change-formerly-my-new-red-shoes" className={styles.zeffyButton}>
                    Donate
                </ButtonComponent>
            </div>
        );
    }
}
