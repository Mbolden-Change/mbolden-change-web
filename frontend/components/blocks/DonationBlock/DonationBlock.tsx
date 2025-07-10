import { DonationBlock as DonationBlockType } from "@/sanity/types";
import DonationForm from './DonationForm';
import Grid from '../../Grid';
import GridItem from '../../GridItem';
import { PortableTextBlock } from 'next-sanity';
import PortableTextComponent from '../../PortableTextComponent';
import Headline from '../../atoms/Headline';
import styles from './DonationBlock.module.css';

import StripeProvider from '@/components/StripeProvider';


function getTextColorFromTheme(theme: string) {
    const darkThemes = ['var(--brand-black)', 'var(--brand-fuchsia)', 'var(--brand-aqua-teal)'];
    const lightThemes = ['var(--brand-warm-yellow)', 'var(--brand-white)', 'var(--brand-light-gray)'];

    if (darkThemes.includes(theme)) return 'var(--brand-white)';
    if (lightThemes.includes(theme)) return 'var(--brand-black)';
    return 'var(--brand-black)';
}

export default function DonationBlock({
    headline,
    text,
    blockTheme,
    formTheme,
    paymentsPlatform
}: DonationBlockType) {
    const contrastColor = getTextColorFromTheme(blockTheme || 'var(--brand-white)');

    if (paymentsPlatform === "stripe") {
        return (
            <section style={{ backgroundColor: blockTheme }} className={styles.donationBlock}>
                <Grid>
                    <GridItem desktopSpan={6} mobileSpan={6}>
                        <div style={{ color: contrastColor }} className={styles.textContent}>
                            {headline && <Headline tag='h1' text={headline} className={styles.headline}/>}
                            {text && (
                                <div className={styles.pText}>
                                    <PortableTextComponent value={text as PortableTextBlock[]} />
                                </div>
                            )}
                        </div>
                    </GridItem>

                    <GridItem desktopSpan={6} mobileSpan={6}>
                        <StripeProvider>
                            <DonationForm formTheme={formTheme} paymentsPlatform={paymentsPlatform}/>
                        </StripeProvider>
                    </GridItem>
                </Grid>
            </section>
        );

    } else if (paymentsPlatform === "stripe-compact") {
        return (
            <section style={{ backgroundColor: blockTheme }} className={styles.compactDonationBlock}>
                <Grid>
                    <GridItem desktopSpan={5} mobileSpan={6}>
                        <div style={{ color: contrastColor }} className={styles.textContent}>
                            {headline && <Headline tag='h1' text={headline} className={styles.compactHeadline}/>}
                            {text && (
                                <div className={styles.pText}>
                                    <PortableTextComponent value={text as PortableTextBlock[]} />
                                </div>
                            )}
                        </div>
                    </GridItem>

                    <GridItem desktopSpan={7} mobileSpan={6}>
                        {/* <div className={styles.formWrapper}> */}
                            <StripeProvider>
                                <DonationForm formTheme={formTheme} paymentsPlatform={paymentsPlatform}/>
                            </StripeProvider>
                        {/* </div> */}
                    </GridItem>
                </Grid>
            </section>
        );
    }

};
