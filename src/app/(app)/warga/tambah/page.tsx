'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { tambahWarga } from '@/lib/actions'
import { ArrowLeft } from 'lucide-react'

export default function TambahWargaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    if (!(fd.get('nama') as string).trim()) { setError('Nama wajib diisi'); return }
    setLoading(true)
    const result = await tambahWarga(fd)
    setLoading(false)
    if (result?.error) { setError(result.error); return }
    router.push('/warga')
    router.refresh()
  }

  return (
    <div className="page">
      <div style={{ background:'var(--teal)', padding:'48px 20px 20px', color:'#fff' }}>
        <button onClick={() => router.back()} style={{ background:'none', border:'none', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:4, marginBottom:8, fontSize:13, opacity:.8, padding:0 }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <h1 style={{ fontSize:20, fontWeight:700, margin:0 }}>Tambah Warga</h1>
      </div>
      <form onSubmit={submit} style={{ padding:'20px 16px', display:'flex', flexDirection:'column', gap:14 }}>
        <div>
          <label style={lbl}>Nama kepala keluarga <span style={{color:'red'}}>*</span></label>
          <input className="input" name="nama" placeholder="cth: Bpk. Ahmad Santoso" autoFocus />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <div>
            <label style={lbl}>No. Rumah</label>
            <input className="input" name="no_rumah" placeholder="cth: 12A" />
          </div>
          <div>
            <label style={lbl}>Jumlah jiwa</label>
            <input className="input" name="jumlah_jiwa" type="number" min="1" defaultValue="4" />
          </div>
        </div>
        <div>
          <label style={lbl}>No. HP / WhatsApp</label>
          <input className="input" name="no_hp" type="tel" placeholder="cth: 081234567890" />
        </div>
        <div>
          <label style={lbl}>Alamat lengkap</label>
          <textarea className="input" name="alamat" rows={2} placeholder="cth: Jl. Mawar No. 12A" style={{ resize:'none' }} />
        </div>
        {error && <p style={{ fontSize:13, color:'#dc2626', margin:0 }}>⚠ {error}</p>}
        <button className="btn" type="submit" disabled={loading} style={{ marginTop:4 }}>
          {loading ? 'Menyimpan...' : 'Simpan Warga'}
        </button>
      </form>
    </div>
  )
}
const lbl: React.CSSProperties = { display:'block', fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:5 }
