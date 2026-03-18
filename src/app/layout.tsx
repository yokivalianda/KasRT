import type { Metadata, Viewport } from 'next'
import './globals.css'
import SessionRefresher from '@/components/SessionRefresher'
import PWAProvider from '@/components/PWAProvider'

export const metadata: Metadata = {
  title: 'KasRT — Kelola RT Lebih Mudah',
  description: 'Aplikasi pencatat kas, arisan digital, dan iuran warga untuk ketua RT/RW Indonesia',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KasRT',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    title: 'KasRT',
    description: 'Kelola RT lebih mudah — kas, arisan, iuran warga',
  },
}

export const viewport: Viewport = {
  themeColor: '#0F9E78',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        {/* iOS Safari PWA support */}
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <SessionRefresher />
        <PWAProvider />
        {children}
      </body>
    </html>
  )
}
