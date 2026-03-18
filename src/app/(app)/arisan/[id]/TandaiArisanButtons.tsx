'use client'
import { useState } from 'react'
import { tandaiArisanLunas } from '@/lib/actions'
import { useRouter } from 'next/navigation'

export default function TandaiArisanButtons({ paymentId }: { paymentId: string }) {
  const router = useRouter()
  const [loading, setLoading]     = useState(false)
  const [showMetode, setShowMetode] = useState(false)

  async function tandai(metode: string) {
    setLoading(true)
    setShowMetode(false)
    await tandaiArisanLunas(paymentId, metode)
    setLoading(false)
    router.refresh()
  }

  if (loading) return (
    <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>Menyimpan...</span>
  )

  if (showMetode) return (
    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
      {['tunai', 'transfer', 'qris'].map(m => (
        <button key={m} onClick={() => tandai(m)} style={{
          fontSize: 10, padding: '3px 7px', borderRadius: 6,
          border: '1px solid var(--border)', background: '#fff',
          cursor: 'pointer', fontWeight: 600, color: 'var(--text2)',
          fontFamily: 'inherit',
        }}>
          {m}
        </button>
      ))}
      <button onClick={() => setShowMetode(false)} style={{
        fontSize: 10, padding: '3px 7px', borderRadius: 6,
        border: '1px solid var(--border)', background: 'none',
        cursor: 'pointer', color: 'var(--text3)', fontFamily: 'inherit',
      }}>✕</button>
    </div>
  )

  return (
    <button onClick={() => setShowMetode(true)} style={{
      fontSize: 11, padding: '5px 10px', borderRadius: 6,
      border: '1px solid var(--teal)', background: 'var(--teal-light)',
      cursor: 'pointer', fontWeight: 600, color: 'var(--teal)',
      fontFamily: 'inherit', flexShrink: 0,
    }}>
      Tandai Lunas
    </button>
  )
}
