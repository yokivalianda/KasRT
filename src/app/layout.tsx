import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KasRT',
  description: 'Kelola RT lebih mudah',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
