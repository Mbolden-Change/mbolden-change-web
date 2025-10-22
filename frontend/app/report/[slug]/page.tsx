import { notFound } from 'next/navigation';
import Grid from '@/components/Grid';
import GridItem from '@/components/GridItem';
import PortableTextComponent from '@/components/PortableTextComponent';
import { getReport } from '@/lib/getReport';
import Link from 'next/link';
import styles from './page.module.css';

export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const report = await getReport((await params).slug);

  if (!report) {
    notFound();
  }

  return (
    <main className="report-container">
      <Grid>
        <GridItem desktopOffset={2} desktopSpan={8} mobileSpan={6}>
          <header className={styles[`report-header`]}>
            <h1>{report.title}</h1>
            {/* @ts-ignore */}
            {report.pdfDownload?.url && (
              <Link
                // @ts-ignore
                href={report.pdfDownload.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles['report-download']}
              >
                📄 Download PDF
              </Link>
            )}
          </header>

          <article className={styles[`report-body`]}>
            <PortableTextComponent value={(report.text as any[]) ?? []} />
          </article>
        </GridItem>
      </Grid>
    </main>
  );
}