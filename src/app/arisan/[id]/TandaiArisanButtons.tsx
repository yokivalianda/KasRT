'use client'
import { useState } from 'react'
import { tandaiArisanLunas } from '@/lib/actions'
import { useRouter } from 'next/navigation'

export default function TandaiArisanButtons({ paymentId }: { paymentId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function tandai(metode: string) {
    setLoading(true)
    await tandaiArisanLunas(paymentId, metode)
    setLoading(false)
    router.refresh()
  }

  return (
    <div style={{ display:'flex', gap:4 }}>
      <button onClick={() => tandai('tunai')} disabled={loading}
        style={{ fontSize:11, padding:'4px 8px', borderRadius:6, border:'1px solid var(--border)', background:'#fff', cursor:'pointer', fontWeight:600, color:'var(--teal)' }}>
        {loading ? '...' : 'Lunas'}
      </button>
    </div>
  )
}
