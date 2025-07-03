import type { Metadata } from 'next';
import './globals.css';
import { Archivo_Narrow, Roboto } from 'next/font/google';
import { Footer as FooterType } from '@/sanity/types';
import { getFooter } from '@/lib/getFooter';
import Footer from '@/components/Footer';
import { Header as HeaderType } from '@/sanity/types';
import { getHeader } from '@/lib/getHeader';
import Header from '@/components/Header';

const archivoNarrow = Archivo_Narrow({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-headline',
  display: 'swap',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'mBOLDen CHANGE',
  description:
    'mBOLDen CHANGE is a national nonprofit that incubates bold, community-led solutions to dismantle barriers, close equity gaps, and drive lasting, stystems-level change.',
  keywords: [
    'mBOLDen Change',
    'Bay Area nonprofit',
    'youth empowerment',
    'education',
    'community support',
  ],
  authors: [{ name: 'mBOLDen Change', url: 'https://www.mboldenchange.org' }],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const footerData = (await getFooter()) as FooterType;
  const headerData = (await getHeader()) as HeaderType;

  return (
    <html lang="en">
      <body className={`${roboto.variable} ${archivoNarrow.variable}`}>
        <Header headerData={headerData} />
        {children}
        <Footer footerData={footerData} />
      </body>
    </html>
  );
}
