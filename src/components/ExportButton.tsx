'use client'
import { useState } from 'react'
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react'

interface Props {
  tipe: 'warga' | 'kas' | 'tagihan'
  label?: string
  variant?: 'btn' | 'outline' | 'minimal'
}

export default function ExportButton({ tipe, label, variant = 'outline' }: Props) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen]       = useState(false)

  async function download(format: 'csv' | 'excel') {
    setLoading(true)
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
    } catch (e) {
      alert('Export gagal. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const btnLabel = label ?? 'Export'

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit', borderRadius: 99, border: 'none',
    transition: 'all .15s', whiteSpace: 'nowrap',
    opacity: loading ? .6 : 1,
    pointerEvents: loading ? 'none' : 'auto',
  }

  const variantStyles: Record<string, React.CSSProperties> = {
    btn:     { background: 'var(--teal)', color: '#fff', padding: '10px 16px' },
    outline: { background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', padding: '9px 14px' },
    minimal: { background: 'none', color: 'var(--teal)', padding: '6px 0' },
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        style={{ ...baseStyle, ...variantStyles[variant] }}
      >
        {loading ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation:'spin .7s linear infinite' }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeOpacity=".3" strokeWidth="2"/>
            <path d="M7 2a5 5 0 0 1 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <Download size={14} />
        )}
        {loading ? 'Mengunduh...' : btnLabel}
        {!loading && <ChevronDown size={12} style={{ opacity:.7, transition:'transform .15s', transform: open?'rotate(180deg)':'none' }} />}
      </button>

      {/* Dropdown menu */}
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position:'fixed', inset:0, zIndex:98 }} />
          <div style={{
            position:'absolute', right:0, top:'calc(100% + 6px)',
            background:'var(--card-bg)', border:'1px solid var(--border)',
            borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,.12)',
            zIndex:99, minWidth:180, overflow:'hidden',
            animation:'fadeUp .15s ease-out both',
          }}>
            <div style={{ padding:'6px 0' }}>
              <button onClick={() => download('excel')} style={{
                display:'flex', alignItems:'center', gap:10,
                width:'100%', padding:'10px 14px', background:'none', border:'none',
                cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:600,
                color:'var(--text)', textAlign:'left', transition:'background .1s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <div style={{ width:28, height:28, borderRadius:8, background:'#ecfdf5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <FileSpreadsheet size={15} color="#16a34a" />
                </div>
                <div>
                  <p style={{ margin:0, lineHeight:1.3 }}>Excel (.xlsx)</p>
                  <p style={{ margin:0, fontSize:11, color:'var(--text3)', fontWeight:400 }}>Buka di Microsoft Excel</p>
                </div>
              </button>

              <button onClick={() => download('csv')} style={{
                display:'flex', alignItems:'center', gap:10,
                width:'100%', padding:'10px 14px', background:'none', border:'none',
                cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:600,
                color:'var(--text)', textAlign:'left', transition:'background .1s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <div style={{ width:28, height:28, borderRadius:8, background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <FileText size={15} color="#2563eb" />
                </div>
                <div>
                  <p style={{ margin:0, lineHeight:1.3 }}>CSV (.csv)</p>
                  <p style={{ margin:0, fontSize:11, color:'var(--text3)', fontWeight:400 }}>Google Sheets / Numbers</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
