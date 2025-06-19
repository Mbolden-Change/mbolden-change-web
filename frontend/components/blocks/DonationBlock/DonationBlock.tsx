import { DonationBlock as DonationBlockType } from "@/sanity/types";
import DonationForm from './DonationForm';
import Grid from '../../Grid';
import GridItem from '../../GridItem';
import { PortableTextBlock } from 'next-sanity';
import PortableTextComponent from '../../PortableTextComponent';
import Headline from '../../atoms/Headline';
import styles from './DonationBlock.module.css';


function getTextColorFromTheme(theme: string): 'black' | 'white' {
    const darkThemes = ['var(--brand-black)', 'var(--brand-fuchsia)', 'var(--brand-aqua)'];
    const lightThemes = ['var(--brand-warm-yellow)', 'var(--brand-white)', 'var(--brand-light-gray)'];

    if (darkThemes.includes(theme)) return 'white';
    if (lightThemes.includes(theme)) return 'black';

    return 'black';
}

export default function DonationBlock({
    headline,
    text,
    blockTheme,
    formTheme,
}: DonationBlockType) {
    const textColor = getTextColorFromTheme(blockTheme || 'var(--brand-white)');
    // const formTextColor = getTextColorFromTheme(formTheme || 'var(--brand-black)');

    return (
        <section style={{ backgroundColor: blockTheme }} className={styles.donationBlock}>
            <Grid>
                <GridItem desktopSpan={6} mobileSpan={6}>
                    <div style={{ color: textColor }} className={styles.textContent}>
                        {headline && <Headline tag='h1' text={headline} className={styles.headline}/>}
                        {text && (
                            <div className={styles.pText}>
                                <PortableTextComponent value={text as PortableTextBlock[]} />
                            </div>
                        )}
                    </div>
                </GridItem>

                <GridItem desktopSpan={6} mobileSpan={6}>
                    <div style={{ backgroundColor: formTheme }} className={styles.formWrapper}>
                        <DonationForm/>
                    </div>
                </GridItem>
            </Grid>
        </section>
    );
};
