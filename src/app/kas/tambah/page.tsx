'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { tambahTransaksi } from '@/lib/actions'
import { ArrowLeft } from 'lucide-react'

const KATEGORI = {
  masuk:  ['iuran','arisan','sumbangan','lain-lain'],
  keluar: ['belanja','infra','kegiatan','operasional','lain-lain'],
}

export default function TambahTransaksiPage() {
  const router = useRouter()
  const [tipe, setTipe] = useState<'masuk'|'keluar'>('masuk')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [jumlahDisplay, setJumlahDisplay] = useState('')

  function formatRp(val: string) {
    const digits = val.replace(/\D/g,'')
    return digits ? Number(digits).toLocaleString('id-ID') : ''
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    const jumlah = parseInt((fd.get('jumlah') as string).replace(/\D/g,''))
    if (!jumlah || jumlah <= 0) { setError('Jumlah harus lebih dari 0'); return }
    fd.set('jumlah', jumlah.toString())
    fd.set('tipe', tipe)
    setLoading(true)
    const result = await tambahTransaksi(fd)
    setLoading(false)
    if (result?.error) { setError(result.error); return }
    router.push('/kas')
    router.refresh()
  }

  return (
    <div className="page">
      <div style={{ background:'var(--teal)', padding:'48px 20px 20px', color:'#fff' }}>
        <button onClick={() => router.back()} style={{ background:'none', border:'none', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:4, marginBottom:8, fontSize:13, opacity:.8, padding:0 }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <h1 style={{ fontSize:20, fontWeight:700, margin:0 }}>Catat Transaksi</h1>
      </div>

      <form onSubmit={submit} style={{ padding:'20px 16px', display:'flex', flexDirection:'column', gap:14 }}>
        {/* Tipe toggle */}
        <div style={{ display:'flex', background:'#eee', borderRadius:10, padding:3 }}>
          {(['masuk','keluar'] as const).map(t => (
            <button key={t} type="button" onClick={() => setTipe(t)} style={{
              flex:1, padding:'8px 0', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit',
              fontSize:14, fontWeight:600,
              background: tipe===t ? (t==='masuk'?'#16a34a':'#dc2626') : 'transparent',
              color: tipe===t ? '#fff' : 'var(--text3)',
              transition:'all .15s',
            }}>
              {t === 'masuk' ? '+ Pemasukan' : '− Pengeluaran'}
            </button>
          ))}
        </div>

        <div>
          <label style={lbl}>Jumlah (Rp) <span style={{color:'red'}}>*</span></label>
          <input
            className="input" name="jumlah" inputMode="numeric"
            placeholder="cth: 30.000"
            value={jumlahDisplay}
            onChange={e => setJumlahDisplay(formatRp(e.target.value))}
            style={{ fontSize:20, fontWeight:700 }}
          />
        </div>

        <div>
          <label style={lbl}>Keterangan <span style={{color:'red'}}>*</span></label>
          <input className="input" name="keterangan" placeholder={tipe==='masuk' ? 'cth: Iuran — Bpk. Ahmad' : 'cth: Beli cat tembok'} required />
        </div>

        <div>
          <label style={lbl}>Kategori</label>
          <select className="input" name="kategori" style={{ appearance:'none' }}>
            {KATEGORI[tipe].map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        <div>
          <label style={lbl}>Tanggal</label>
          <input className="input" name="tanggal" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
        </div>

        {error && <p style={{ fontSize:13, color:'#dc2626', margin:0 }}>⚠ {error}</p>}

        <button className="btn" type="submit" disabled={loading} style={{
          marginTop:4,
          background: tipe==='masuk' ? '#16a34a' : '#dc2626',
        }}>
          {loading ? 'Menyimpan...' : `Simpan ${tipe==='masuk'?'Pemasukan':'Pengeluaran'}`}
        </button>
      </form>
    </div>
  )
}
const lbl: React.CSSProperties = { display:'block', fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:5 }
