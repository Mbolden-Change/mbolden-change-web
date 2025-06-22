'use client'

import { useState } from 'react';
import styles from './DonationBlock.module.css';
import ButtonComponent from '../../atoms/ButtonComponent';
import Headline from '../../atoms/Headline';
import { FaArrowRightLong } from "react-icons/fa6";



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


    return (
        <>
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
                            onClick={() => setSelectedAmount(value)}
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
                    placeholder="$ Custom Amount"
                />

                <label className={styles.checkboxLabel}>
                    <input type="checkbox" className={styles.checkbox} />
                    Dedicate my donation in honor or in memory of someone
                </label>

                <div className={styles.actionButtonBox}>
                    <ButtonComponent variant="primary" style={{ backgroundColor: formTheme, color: contrastColor }} className={styles.nextButton}>
                        Next <span className={styles.arrow}><FaArrowRightLong /></span>
                    </ButtonComponent>
                </div>
            </div>
        </>
    );
}
