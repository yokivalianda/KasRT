import type { Metadata } from 'next'
import './globals.css'
import SessionRefresher from '@/components/SessionRefresher'

export const metadata: Metadata = {
  title: 'KasRT',
  description: 'Kelola RT lebih mudah',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <SessionRefresher />
        {children}
      </body>
    </html>
  )
}
