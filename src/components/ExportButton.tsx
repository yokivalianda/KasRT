'use client'
import { useState } from 'react'
import { Download, FileSpreadsheet, FileText, X } from 'lucide-react'

interface Props {
  tipe: 'warga' | 'kas' | 'tagihan'
  label?: string
  variant?: 'btn' | 'outline' | 'minimal'
}

export default function ExportButton({ tipe, label, variant = 'outline' }: Props) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen]       = useState(false)
  const [activeFormat, setActiveFormat] = useState<string | null>(null)

  async function download(format: 'csv' | 'excel') {
    setLoading(true)
    setActiveFormat(format)
    setOpen(false)
    try {
      const res = await fetch(`/api/export?tipe=${tipe}&format=${format}`)
      if (!res.ok) {
        const err = await res.json()
        alert('Export gagal: ' + (err.error ?? 'Unknown error'))
        return
      }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      const cd   = res.headers.get('content-disposition') ?? ''
      const fn   = cd.match(/filename="(.+)"/)?.[1] ?? `export.${format === 'csv' ? 'csv' : 'xlsx'}`
      a.href = url; a.download = fn
      document.body.appendChild(a); a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      alert('Export gagal. Coba lagi.')
    } finally {
      setLoading(false)
      setActiveFormat(null)
    }
  }

  const btnLabel = label ?? 'Export'

  const LABEL_MAP: Record<string, string> = {
    warga:   'Data Warga',
    kas:     'Buku Kas',
    tagihan: 'Rekap Tagihan',
  }

  // Spinner SVG
  const Spinner = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      style={{ animation: 'spin .7s linear infinite', flexShrink: 0 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeOpacity=".3" strokeWidth="2"/>
      <path d="M7 2a5 5 0 0 1 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )

  // Tombol trigger
  const triggerStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit', borderRadius: 99,
    transition: 'all .15s', whiteSpace: 'nowrap',
    opacity: loading ? .6 : 1,
    border: 'none',
    ...(variant === 'btn'
      ? { background: 'var(--teal)', color: '#fff', padding: '11px 16px' }
      : variant === 'minimal'
      ? { background: 'none', color: 'var(--teal)', padding: '6px 0' }
      : { background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', padding: '10px 14px' }
    ),
  }

  return (
    <>
      <button
        onClick={() => !loading && setOpen(true)}
        disabled={loading}
        style={triggerStyle}
      >
        {loading ? <Spinner /> : <Download size={14} />}
        {loading ? 'Mengunduh...' : btnLabel}
      </button>

      {/* Bottom sheet — mobile friendly */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.45)',
              zIndex: 997,
              animation: 'fadeIn .15s ease-out both',
            }}
          />

          {/* Sheet */}
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: 480,
            background: 'var(--card-bg)',
            borderRadius: '20px 20px 0 0',
            zIndex: 998,
            animation: 'slideUpSheet .25s cubic-bezier(0.34, 1.2, 0.64, 1) both',
            paddingBottom: 'env(safe-area-inset-bottom, 16px)',
          }}>
            <style>{`
              @keyframes slideUpSheet {
                from { transform: translateX(-50%) translateY(100%); }
                to   { transform: translateX(-50%) translateY(0); }
              }
            `}</style>

            {/* Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '12px auto 0' }} />

            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 20px 10px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 2px' }}>
                  Export {LABEL_MAP[tipe]}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>
                  Pilih format file
                </p>
              </div>
              <button onClick={() => setOpen(false)} style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--bg)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <X size={15} color="var(--text3)" />
              </button>
            </div>

            {/* Pilihan format */}
            <div style={{ padding: '8px 12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>

              {/* Excel */}
              <button onClick={() => download('excel')} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                width: '100%', padding: '14px 16px',
                background: 'var(--bg)', border: '1.5px solid var(--border)',
                borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
                textAlign: 'left', transition: 'border-color .15s',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#ecfdf5', border: '1px solid #a7f3d0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <FileSpreadsheet size={22} color="#16a34a" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 2px' }}>
                    Excel (.xlsx)
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>
                    Buka di Microsoft Excel · Google Sheets
                  </p>
                </div>
                <Download size={16} color="var(--text3)" />
              </button>

              {/* CSV */}
              <button onClick={() => download('csv')} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                width: '100%', padding: '14px 16px',
                background: 'var(--bg)', border: '1.5px solid var(--border)',
                borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
                textAlign: 'left', transition: 'border-color .15s',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#eff6ff', border: '1px solid #bfdbfe',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <FileText size={22} color="#2563eb" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 2px' }}>
                    CSV (.csv)
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>
                    Format universal · Numbers · LibreOffice
                  </p>
                </div>
                <Download size={16} color="var(--text3)" />
              </button>

            </div>
          </div>
        </>
      )}
    </>
  )
}
