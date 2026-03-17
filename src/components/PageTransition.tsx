'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Komponen ini wrap konten halaman dan trigger animasi
// saat pathname berubah (navigasi antar halaman)
// Murni CSS transform — tidak ada library, tidak berat
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Reset animasi dengan cara yang benar — tidak pakai setTimeout
    el.style.animation = 'none'
    // Force reflow — baca offsetHeight supaya browser reset animasi
    void el.offsetHeight
    el.style.animation = ''
  }, [pathname])

  return (
    <div
      ref={ref}
      style={{
        animation: 'pageEnter 0.22s ease-out both',
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </div>
  )
}
