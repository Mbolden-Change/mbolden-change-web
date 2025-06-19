import styles from './DonationBlock.module.css';
import ButtonComponent from '../../atoms/ButtonComponent';
import Headline from '../../atoms/Headline';

export default function DonationForm() {
    return (
        <>
            <div className={styles.formHeader}>
                <Headline tag="h2" text="Choose amount" className={styles.title}/>
            </div>

            <div className={styles.contentWrapper}>

                <div className={styles.frequencyToggle}>
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
                    <ButtonComponent variant="primary" className={styles.nextButton}>
                        Next <span className={styles.arrow}> &rarr;</span>
                    </ButtonComponent>
                </div>
            </div>
        </>
    );
}
