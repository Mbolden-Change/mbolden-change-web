import { notFound } from 'next/navigation';
import { PageBuilder } from '@/components/PageBuilder';
import { getPage } from '@/lib/getPage';
import styles from './page.module.css';

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const page = await getPage((await params).slug);
  if (!page) {
    notFound();
  }

  return (
    <div className={styles.page}>
      {page.content && <PageBuilder content={page.content} />}
    </div>
  );
}
