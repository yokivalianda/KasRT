'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { buatRT } from '@/lib/actions'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    if (!(fd.get('nama') as string).trim()) { setError('Nama RT wajib diisi'); return }
    setLoading(true)
    const result = await buatRT(fd)
    setLoading(false)
    if (result?.error) { setError(result.error); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 24px', background:'var(--bg)' }}>
      <div style={{ textAlign:'center', marginBottom:32 }}>
        <p style={{ fontSize:28, fontWeight:800, color:'var(--teal)', margin:'0 0 4px' }}>KasRT 🏘️</p>
        <p style={{ fontSize:14, color:'var(--text2)', margin:0 }}>Selamat datang! Isi data RT Anda dulu.</p>
      </div>

      <form onSubmit={submit} style={{ width:'100%', maxWidth:400, display:'flex', flexDirection:'column', gap:14 }}>
        <div>
          <label style={lbl}>Nama RT <span style={{color:'red'}}>*</span></label>
          <input className="input" name="nama" placeholder="cth: RT 05" required />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <div>
            <label style={lbl}>RW</label>
            <input className="input" name="rw" placeholder="cth: RW 03" />
          </div>
          <div>
            <label style={lbl}>Kelurahan / Desa</label>
            <input className="input" name="kelurahan" placeholder="cth: Talang Semut" />
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <div>
            <label style={lbl}>Kecamatan</label>
            <input className="input" name="kecamatan" placeholder="cth: Bukit Kecil" />
          </div>
          <div>
            <label style={lbl}>Kota / Kabupaten</label>
            <input className="input" name="kota" placeholder="cth: Palembang" />
          </div>
        </div>
        <div>
          <label style={lbl}>Provinsi</label>
          <input className="input" name="provinsi" placeholder="cth: Sumatera Selatan" />
        </div>

        {error && <p style={{ fontSize:13, color:'#dc2626', margin:0 }}>⚠ {error}</p>}

        <button className="btn" type="submit" disabled={loading} style={{ marginTop:4 }}>
          {loading ? 'Menyimpan...' : 'Mulai Kelola RT →'}
        </button>
      </form>
    </div>
  )
}

const lbl: React.CSSProperties = { display:'block', fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:5 }
