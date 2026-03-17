'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { tutupTagihan, bukaTagihan, hapusTagihan } from '@/lib/actions'
import { Lock, LockOpen, Trash2 } from 'lucide-react'

interface Props {
  billId: string
  status: 'buka' | 'tutup'
}

export default function TagihanActions({ billId, status }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [konfirmHapus, setKonfirmHapus] = useState(false)

  async function handleTutup() {
    setLoading(true)
    await tutupTagihan(billId)
    setLoading(false)
    router.refresh()
  }

  async function handleBuka() {
    setLoading(true)
    await bukaTagihan(billId)
    setLoading(false)
    router.refresh()
  }

  async function handleHapus() {
    setLoading(true)
    await hapusTagihan(billId)
    router.push('/warga/tagihan')
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

      {/* Tutup / Buka tagihan */}
      {status === 'buka' ? (
        <button
          onClick={handleTutup}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '11px 0', borderRadius: 10,
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            background: 'var(--teal-light)', color: 'var(--teal)',
            border: '1px solid #a7f0d8', transition: 'all .15s',
          }}
        >
          <Lock size={15} />
          {loading ? 'Memproses...' : 'Tutup tagihan (selesai)'}
        </button>
      ) : (
        <button
          onClick={handleBuka}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '11px 0', borderRadius: 10,
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            background: '#f5f5f3', color: 'var(--text2)',
            border: '1px solid var(--border)', transition: 'all .15s',
          }}
        >
          <LockOpen size={15} />
          {loading ? 'Memproses...' : 'Buka kembali tagihan'}
        </button>
      )}

      {/* Hapus tagihan */}
      {!konfirmHapus ? (
        <button
          onClick={() => setKonfirmHapus(true)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '10px 0', borderRadius: 10,
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            background: 'none', color: '#dc2626',
            border: '1px solid #fecaca', transition: 'all .15s',
          }}
        >
          <Trash2 size={14} /> Hapus tagihan ini
        </button>
      ) : (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 12, padding: 14,
          animation: 'fadeUp .2s ease-out both',
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#dc2626', margin: '0 0 4px' }}>
            Hapus tagihan ini?
          </p>
          <p style={{ fontSize: 12, color: '#dc2626', opacity: .8, margin: '0 0 14px', lineHeight: 1.5 }}>
            Semua data pembayaran warga untuk tagihan ini akan ikut terhapus dan tidak bisa dipulihkan.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setKonfirmHapus(false)}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 8,
                border: '1px solid var(--border)', background: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                color: 'var(--text2)', fontFamily: 'inherit',
              }}
            >
              Batal
            </button>
            <button
              onClick={handleHapus}
              disabled={loading}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 8,
                border: 'none', background: '#dc2626',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                color: '#fff', fontFamily: 'inherit',
                opacity: loading ? .6 : 1,
              }}
            >
              {loading ? 'Menghapus...' : 'Ya, hapus'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
