import Grid from '@/components/Grid';
import GridItem from '@/components/GridItem';
import PortableTextComponent from '@/components/PortableTextComponent';
import { getCaseStudy } from '@/lib/getCaseStudy';
import Link from 'next/link';
import styles from './page.module.css';

export default async function CaseStudyPage({
params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const caseStudy = await getCaseStudy((await params).slug);
console.log(caseStudy)
  if (!caseStudy) {
    return <div>Statement not found</div>;
  }
return(
    <div>Hello</div>
);
}
