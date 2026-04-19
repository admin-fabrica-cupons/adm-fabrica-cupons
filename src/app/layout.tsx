import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Providers from '@/components/Providers';
import { AuthProvider } from '@/contexts/AuthContext';

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Fábrica de Cupons - Admin',
  description: 'Painel administrativo da Fábrica de Cupons',
  icons: {
    icon: '/logo.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FCEE21' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Preconnect para recursos externos críticos */}
        <link rel="preconnect" href="https://gaovlxpoqvsyapeffmqr.supabase.co" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${plusJakartaSans.className} min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-200`}>
        <AuthProvider>
          <Providers>
            <Suspense fallback={<div className="min-h-screen" />}>
              {children}
            </Suspense>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
