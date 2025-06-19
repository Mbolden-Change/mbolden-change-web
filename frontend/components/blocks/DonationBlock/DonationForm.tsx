import styles from './DonationBlock.module.css';
import ButtonComponent from '../../atoms/ButtonComponent';
import Headline from '../../atoms/Headline';


function getTextColorFromTheme(theme: string) {
    const darkThemes = ['var(--brand-black)', 'var(--brand-fuchsia)', 'var(--brand-aqua-teal)'];
    const lightThemes = ['var(--brand-warm-yellow)', 'var(--brand-white)', 'var(--brand-light-gray)'];

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

    return (
        <>
            <div style={{ backgroundColor: formTheme, color: contrastColor }} className={styles.formHeader}>
                <Headline tag="h2" text="Choose amount" className={styles.formHeadline}/>
            </div>

            <div  className={styles.contentWrapper}>
                <div style={{ border: `2px solid ${formTheme}` }} className={styles.frequencyToggle}>
                    <ButtonComponent variant="unstyled" className={styles.freqButton}>One-time</ButtonComponent>
                    <ButtonComponent variant="unstyled" className={styles.freqButton}>Monthly</ButtonComponent>
                    <ButtonComponent variant="unstyled" className={styles.freqButton}>Annually</ButtonComponent>
                </div>

                <div className={styles.amountGrid}>
                    {[35, 50, 100, 250, 500, 1000].map((value) => (
                    <ButtonComponent key={value} variant="unstyled" className={styles.amountButton}>${value}</ButtonComponent>
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
                        Next <span className={styles.arrow}> &rarr;</span>
                    </ButtonComponent>
                </div>
            </div>
        </>
    );
}
