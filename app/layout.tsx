import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Innovasión - Asesor Inmobiliario',
  description: 'Inversiones inmobiliarias en la costa que trascienden',
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#121212] text-gray-200 antialiased flex flex-col w-full overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}