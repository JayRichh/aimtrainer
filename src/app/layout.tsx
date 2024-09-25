import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Aim Trainer',
  description: 'Improve your aiming skills with our interactive Aim Trainer',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aimtrainer-zeta.vercel.app/',
    siteName: 'Aim Trainer',
    images: [
      {
        url: '/aimtrain-logo.png',
        width: 800,
        height: 600,
        alt: 'Aim Trainer Logo',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
