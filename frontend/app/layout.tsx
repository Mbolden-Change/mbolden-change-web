import type { Metadata } from 'next';
import './globals.css';
import { Archivo_Narrow, Roboto } from 'next/font/google';
import { Footer as FooterType } from '@/sanity/types';
import { getFooter } from '@/lib/getFooter';
import Footer from '@/components/Footer';
import { Header as HeaderType } from '@/sanity/types';
import { getHeader } from '@/lib/getHeader';
import Header from '@/components/Header';
import { PopUpModal as PopUpModalType } from '@/sanity/types';
import { getPopUpModal } from '@/lib/getPopUpModal';
import PopUpModal from '@/components/PopUpModal';

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
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32' },
      { url: '/favicon-16x16.png', sizes: '16x16' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: { // card preview when sharing social media link
    title: 'mBOLDen CHANGE',
    description:
      'Bold, community-led solutions for a more equitable world.',
    url: 'https://www.mboldenchange.org',
    siteName: 'mBOLDen CHANGE',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'mBOLDen CHANGE social banner',
      },
    ],
    type: 'website',
  },
  twitter: { // card preview when sharing social media link
    card: 'summary_large_image',
    title: 'mBOLDen CHANGE',
    description:
      'Bold, community-led solutions for a more equitable world.',
    images: ['/og-image.png'],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const footerData = (await getFooter()) as FooterType;
  const headerData = (await getHeader()) as HeaderType;
  const popUpModalData = (await getPopUpModal()) as PopUpModalType;

  return (
    <html lang="en">
      <body className={`${roboto.variable} ${archivoNarrow.variable}`}>
        <Header headerData={headerData} />
        {children}
        <PopUpModal popUpModalData={popUpModalData}/>
        <Footer footerData={footerData} />
      </body>
    </html>
  );
}
