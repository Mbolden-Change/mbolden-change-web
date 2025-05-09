import type { Metadata } from 'next';
import './globals.css';
import { Archivo_Narrow, Roboto } from 'next/font/google';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${archivoNarrow.variable}`}>
        {children}
      </body>
    </html>
  );
}
