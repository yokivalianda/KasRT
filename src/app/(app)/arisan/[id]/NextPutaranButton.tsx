'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { nextPutaranArisan } from '@/lib/actions'
import { ChevronRight, Trophy, RefreshCw } from 'lucide-react'

interface Props {
  groupId: string
  currentRound: number
  totalRounds: number
  pemenangNama: string
  semualunas: boolean
}

export default function NextPutaranButton({
  groupId, currentRound, totalRounds, pemenangNama, semualunas,
}: Props) {
  const router = useRouter()
  const [loading, setLoading]     = useState(false)
  const [konfirm, setKonfirm]     = useState(false)
  const [error, setError]         = useState('')
  const isLast = currentRound >= totalRounds

  // Kalau belum semua lunas — tampilkan peringatan saja
  if (!semualunas) {
    return (
      <div style={{
        background: '#fffbeb', border: '1px solid #fde68a',
        borderRadius: 12, padding: 14,
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#92400e', margin: '0 0 4px' }}>
          ⚠ Belum semua anggota bayar
        </p>
        <p style={{ fontSize: 12, color: '#92400e', opacity: .85, margin: 0, lineHeight: 1.5 }}>
          Tandai semua anggota lunas sebelum lanjut ke putaran berikutnya.
        </p>
      </div>
    )
  }

  async function lanjut() {
    setError('')
    setLoading(true)
    const result = await nextPutaranArisan(groupId, currentRound, totalRounds)
    setLoading(false)
    if (result?.error) { setError(result.error); return }
    setKonfirm(false)
    router.refresh()
  }

  // Tampil konfirmasi
  if (konfirm) {
    return (
      <div style={{
        background: isLast ? '#ecfdf5' : 'var(--teal-light)',
        border: `1px solid ${isLast ? '#a7f3d0' : '#9fe3cc'}`,
        borderRadius: 12, padding: 16,
        animation: 'fadeUp .2s ease-out both',
      }}>
        {isLast ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 28 }}>🏆</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#065f46', margin: '0 0 2px' }}>
                  Putaran terakhir selesai!
                </p>
                <p style={{ fontSize: 12, color: '#065f46', opacity: .8, margin: 0 }}>
                  Arisan akan ditandai selesai setelah dikonfirmasi.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 24 }}>🎉</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal-dark,#0a7259)', margin: '0 0 2px' }}>
                  Lanjut ke putaran {currentRound + 1}?
                </p>
                <p style={{ fontSize: 12, color: 'var(--teal-dark,#0a7259)', opacity: .85, margin: 0 }}>
                  Pembayaran putaran baru akan otomatis dibuat untuk semua anggota.
                </p>
              </div>
            </div>
          </>
        )}

        {error && (
          <p style={{ fontSize: 12, color: '#dc2626', margin: '0 0 10px' }}>⚠ {error}</p>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setKonfirm(false); setError('') }}
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
            onClick={lanjut}
            disabled={loading}
            style={{
              flex: 2, padding: '9px 0', borderRadius: 8, border: 'none',
              background: isLast ? '#059669' : 'var(--teal)',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              color: '#fff', fontFamily: 'inherit',
              opacity: loading ? .7 : 1, transition: 'opacity .15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {loading ? (
              <><RefreshCw size={13} style={{ animation: 'spin .7s linear infinite' }} /> Memproses...</>
            ) : isLast ? (
              <><Trophy size={14} /> Selesaikan arisan</>
            ) : (
              <><ChevronRight size={14} /> Ya, lanjut putaran {currentRound + 1}</>
            )}
          </button>
        </div>
      </div>
    )
  }

  // Default — tombol lanjut
  return (
    <button
      onClick={() => setKonfirm(true)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', padding: '13px 0', borderRadius: 12, border: 'none',
        background: isLast
          ? 'linear-gradient(135deg, #059669, #047857)'
          : 'linear-gradient(135deg, var(--teal), var(--teal-dark,#0a7259))',
        fontSize: 14, fontWeight: 700, color: '#fff',
        cursor: 'pointer', fontFamily: 'inherit',
        boxShadow: '0 4px 14px rgba(15,158,120,0.3)',
        transition: 'transform .15s, box-shadow .15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(15,158,120,0.35)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = ''
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(15,158,120,0.3)'
      }}
    >
      {isLast ? (
        <><Trophy size={16} /> Selesaikan arisan ini</>
      ) : (
        <><ChevronRight size={16} /> Lanjut ke putaran {currentRound + 1} dari {totalRounds}</>
      )}
    </button>
  )
}
