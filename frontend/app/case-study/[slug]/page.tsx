import Grid from '@/components/Grid';
import GridItem from '@/components/GridItem';
import { getCaseStudy } from '@/lib/getCaseStudy';
import styles from './page.module.css';
import CaseStudyReport from '@/components/blocks/CaseStudyReport/CaseStudyReport';

export default async function CaseStudyPage({
params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const caseStudy = await getCaseStudy((await params).slug);
console.log(caseStudy)
  if (!caseStudy) {
    return <div>Case Study not found</div>;
  }
return(
    <Grid className={styles.caseWrapper}>
      <GridItem desktopSpan={12} mobileSpan={12}>

        <CaseStudyReport caseStudyData={caseStudy}/>
      </GridItem>
    </Grid>
);
}
