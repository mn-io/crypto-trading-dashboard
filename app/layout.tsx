import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import Head from 'next/head';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Crypto Trading Dashboard',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const consoleError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('hydrated but some attributes')) {
      return; // ignore hydration mismatch warnings
    }
    consoleError(...args);
  };

  return (
    <html lang="de">
      <Head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
