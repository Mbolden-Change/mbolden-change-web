import type { Metadata } from 'next';
import './globals.css';
import { Archivo_Narrow, Roboto } from 'next/font/google';
import { Footer as FooterType } from '@/sanity/types';
import { getFooter } from '@/lib/getFooter';
import Footer from '@/components/Footer';
import { Header as HeaderType } from '@/sanity/types';
import { getHeader } from '@/lib/getHeader';
import Header from '@/components/Header';
import ZeffyScript from '../components/blocks/DonationBlock/ZeffyScript';

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
  description: 'mBOLDen CHANGE',
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
        <ZeffyScript />
      </body>
    </html>
  );
}
