import { notFound } from 'next/navigation';
import Grid from '@/components/Grid';
import GridItem from '@/components/GridItem';
import PortableTextComponent from '@/components/PortableTextComponent';
import { getStatement } from '@/lib/getStatement';
import Link from 'next/link';
import styles from './page.module.css';

export default async function StatementPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const statement = await getStatement((await params).slug);

  if (!statement) {
    notFound();
  }

  return (
    <main className="statement-container">
      <Grid>
        <GridItem desktopOffset={2} desktopSpan={8} mobileSpan={6}>
          <header className={styles[`statement-header`]}>
            <h1>{statement.title}</h1>
            {/* @ts-ignore */}
            {statement.pdfDownload?.url && (
              <Link
                // @ts-ignore
                href={statement.pdfDownload.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles['statement-download']}
              >
                📄 Download PDF
              </Link>
            )}
          </header>

          <article className={styles[`statement-body`]}>
            <PortableTextComponent value={(statement.text as any[]) ?? []} />
          </article>
        </GridItem>
      </Grid>
    </main>
  );
}
