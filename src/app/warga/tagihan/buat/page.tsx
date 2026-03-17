'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { buatTagihan } from '@/lib/actions'
import { ArrowLeft } from 'lucide-react'

export default function BuatTagihanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const bulanIni = new Date().toISOString().slice(0,7)
  const akhirBulan = (() => {
    const [y,m] = bulanIni.split('-').map(Number)
    return `${bulanIni}-${new Date(y,m,0).getDate()}`
  })()

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    if (!(fd.get('judul') as string).trim()) { setError('Judul wajib diisi'); return }
    const nominal = parseInt(fd.get('nominal') as string)
    if (!nominal || nominal <= 0) { setError('Nominal harus lebih dari 0'); return }
    setLoading(true)
    const result = await buatTagihan(fd)
    setLoading(false)
    if (result?.error) { setError(result.error); return }
    router.push('/warga')
    router.refresh()
  }

  const PRESET = ['Iuran Keamanan','Iuran Kebersihan','Iuran Sosial','Iuran Pembangunan']

  return (
    <div className="page">
      <div style={{ background:'var(--teal)', padding:'48px 20px 20px', color:'#fff' }}>
        <button onClick={() => router.back()} style={{ background:'none', border:'none', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:4, marginBottom:8, fontSize:13, opacity:.8, padding:0 }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <h1 style={{ fontSize:20, fontWeight:700, margin:0 }}>Buat Tagihan Iuran</h1>
        <p style={{ fontSize:13, opacity:.8, margin:'4px 0 0' }}>Tagihan akan otomatis dibuat untuk semua warga aktif</p>
      </div>
      <form onSubmit={submit} style={{ padding:'20px 16px', display:'flex', flexDirection:'column', gap:14 }}>
        <div>
          <label style={lbl}>Jenis iuran <span style={{color:'red'}}>*</span></label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
            {PRESET.map(p => (
              <button key={p} type="button" onClick={e => {
                const input = (e.currentTarget.closest('form') as HTMLFormElement).elements.namedItem('judul') as HTMLInputElement
                input.value = p
              }} style={{ fontSize:12, padding:'4px 12px', borderRadius:99, border:'1px solid var(--border)', background:'none', cursor:'pointer' }}>
                {p}
              </button>
            ))}
          </div>
          <input className="input" name="judul" placeholder="Atau ketik nama iuran..." />
        </div>
        <div>
          <label style={lbl}>Nominal per KK (Rp) <span style={{color:'red'}}>*</span></label>
          <input className="input" name="nominal" type="number" min="1000" placeholder="cth: 30000" />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <div>
            <label style={lbl}>Periode</label>
            <input className="input" name="periode" type="month" defaultValue={bulanIni} />
          </div>
          <div>
            <label style={lbl}>Jatuh tempo <span style={{color:'red'}}>*</span></label>
            <input className="input" name="jatuh_tempo" type="date" defaultValue={akhirBulan} required />
          </div>
        </div>
        {error && <p style={{ fontSize:13, color:'#dc2626', margin:0 }}>⚠ {error}</p>}
        <button className="btn" type="submit" disabled={loading} style={{ marginTop:4 }}>
          {loading ? 'Membuat...' : 'Buat Tagihan untuk Semua Warga'}
        </button>
      </form>
    </div>
  )
}
const lbl: React.CSSProperties = { display:'block', fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:5 }
