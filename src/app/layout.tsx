import type { Metadata, Viewport } from 'next'
import './globals.css'
import SessionRefresher from '@/components/SessionRefresher'
import PWAProvider from '@/components/PWAProvider'
import ThemeProvider from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'KasRT — Kelola RT Lebih Mudah',
  description: 'Aplikasi pencatat kas, arisan digital, dan iuran warga untuk ketua RT/RW Indonesia',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'KasRT' },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0F9E78' },
    { media: '(prefers-color-scheme: dark)',  color: '#1C1B19' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Script anti-flash — jalankan sebelum render, mencegah kedip saat load */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('kasrt-theme') || 'system';
              var isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
              if (isDark) document.documentElement.classList.add('dark');
            } catch(e) {}
          })();
        `}} />
      </head>
      <body>
        <ThemeProvider>
          <SessionRefresher />
          <PWAProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
