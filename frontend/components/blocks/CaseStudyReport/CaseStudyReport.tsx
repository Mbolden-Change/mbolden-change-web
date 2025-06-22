import Grid from '@/components/Grid';
import GridItem from '@/components/GridItem';
import PortableTextComponent from '@/components/PortableTextComponent';
import Link from 'next/link';
import styles from './CaseStudyReport.module.css';
import Headline from '@/components/atoms/Headline';
import {CaseStudy as CaseStudyType} from '@/sanity/types';

export type caseStudy = {
    caseStudyData: CaseStudyType;
}


const CaseStudyReport = ( {caseStudyData}:caseStudy ) => {


    return (
        <main className="caseStudy-container">
            <Grid>
                <GridItem desktopOffset={2} desktopSpan={8} mobileSpan={6}>
                <header className={styles[`caseStudy-header`]}>
                    <Headline className={styles[`caseStudy-headline`]} tag="h1" text={caseStudyData.heading}></Headline>
                    <Headline className={styles[`caseStudy-subheadline`]} tag="h3" text={caseStudyData.subheading || ""}></Headline>
                    {/* @ts-ignore */}
                    {caseStudyData.pdfDownload?.url && (
                    <Link
                        // @ts-ignore
                        href={caseStudyData.pdfDownload.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles['caseStudy-download']}
                    >
                        📄 Download PDF
                    </Link>
                    )}
                </header>

                <article className={styles[`caseStudy-body`]}>
                    <PortableTextComponent value={(caseStudyData.text as any[]) ?? []} />
                </article>
                </GridItem>
            </Grid>
        </main>
    );
}


    export default CaseStudyReport;
