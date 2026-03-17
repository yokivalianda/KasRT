'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { buatPengumuman } from '@/lib/actions'
import { ArrowLeft } from 'lucide-react'

export default function BuatPengumumanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pin, setPin] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    if (!(fd.get('judul') as string).trim()) { setError('Judul wajib diisi'); return }
    fd.set('disematkan', pin.toString())
    setLoading(true)
    const result = await buatPengumuman(fd)
    setLoading(false)
    if (result?.error) { setError(result.error); return }
    router.push('/pengumuman')
    router.refresh()
  }

  return (
    <div className="page">
      <div style={{ background:'var(--teal)', padding:'48px 20px 20px', color:'#fff' }}>
        <button onClick={() => router.back()} style={{ background:'none', border:'none', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:4, marginBottom:8, fontSize:13, opacity:.8, padding:0 }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <h1 style={{ fontSize:20, fontWeight:700, margin:0 }}>Buat Pengumuman</h1>
      </div>
      <form onSubmit={submit} style={{ padding:'20px 16px', display:'flex', flexDirection:'column', gap:14 }}>
        <div>
          <label style={lbl}>Judul <span style={{color:'red'}}>*</span></label>
          <input className="input" name="judul" placeholder="cth: Kerja bakti Minggu depan" autoFocus required />
        </div>
        <div>
          <label style={lbl}>Isi pengumuman</label>
          <textarea className="input" name="isi" rows={4} placeholder="Detail kegiatan, lokasi, waktu, dll..." style={{ resize:'none' }} />
        </div>
        <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
          <div onClick={() => setPin(p=>!p)} style={{ width:20, height:20, borderRadius:5, border:`2px solid ${pin?'var(--teal)':'var(--border)'}`, background: pin?'var(--teal)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s', flexShrink:0 }}>
            {pin && <span style={{ color:'#fff', fontSize:12, fontWeight:700 }}>✓</span>}
          </div>
          <span style={{ fontSize:13, fontWeight:500, color:'var(--text2)' }}>Sematkan di atas (pengumuman penting)</span>
        </label>
        {error && <p style={{ fontSize:13, color:'#dc2626', margin:0 }}>⚠ {error}</p>}
        <button className="btn" type="submit" disabled={loading} style={{ marginTop:4 }}>
          {loading ? 'Menyimpan...' : 'Publikasikan Pengumuman'}
        </button>
      </form>
    </div>
  )
}
const lbl: React.CSSProperties = { display:'block', fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:5 }
