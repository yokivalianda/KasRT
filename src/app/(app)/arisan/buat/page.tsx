'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { buatArisan } from '@/lib/actions'
import { supabase } from '@/lib/supabase/client'
import { inisial, avatarColor } from '@/lib/utils'
import { ArrowLeft, Check } from 'lucide-react'

export default function BuatArisanPage() {
  const router = useRouter()
  const [members, setMembers] = useState<{id:string,nama:string,no_rumah:string|null}[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'info'|'anggota'>('info')
  const [formData, setFormData] = useState<FormData|null>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: nb } = await supabase.from('neighborhoods').select('id').eq('owner_id', session.user.id).single()
      if (!nb) return
      const { data } = await supabase.from('members').select('id,nama,no_rumah').eq('neighborhood_id', nb.id).eq('status','aktif').order('no_rumah')
      setMembers(data ?? [])
    }
    load()
  }, [])

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function submitInfo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (!(fd.get('nama') as string).trim()) { setError('Nama arisan wajib diisi'); return }
    if (!parseInt(fd.get('nominal') as string)) { setError('Nominal wajib diisi'); return }
    setError('')
    setFormData(fd)
    setStep('anggota')
  }

  async function submitAnggota() {
    if (selected.size < 2) { setError('Pilih minimal 2 anggota'); return }
    if (!formData) return
    setError('')
    setLoading(true)
    const result = await buatArisan(formData, Array.from(selected))
    setLoading(false)
    if (result?.error) { setError(result.error); return }
    router.push('/arisan')
    router.refresh()
  }

  return (
    <div className="page">
      <div style={{ background:'var(--teal)', padding:'48px 20px 20px', color:'#fff' }}>
        <button onClick={() => step==='anggota' ? setStep('info') : router.back()} style={{ background:'none', border:'none', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:4, marginBottom:8, fontSize:13, opacity:.8, padding:0 }}>
          <ArrowLeft size={16} /> {step==='anggota' ? 'Kembali ke info' : 'Kembali'}
        </button>
        <h1 style={{ fontSize:20, fontWeight:700, margin:'0 0 2px' }}>Buat Grup Arisan</h1>
        <p style={{ fontSize:12, opacity:.75, margin:0 }}>
          {step==='info' ? 'Langkah 1: Info arisan' : `Langkah 2: Pilih anggota (${selected.size} dipilih)`}
        </p>
      </div>

      {step === 'info' && (
        <form onSubmit={submitInfo} style={{ padding:'20px 16px', display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={lbl}>Nama arisan <span style={{color:'red'}}>*</span></label>
            <input className="input" name="nama" placeholder="cth: Arisan Ibu-ibu PKK" autoFocus defaultValue="Arisan RT" />
          </div>
          <div>
            <label style={lbl}>Nominal setoran / putaran (Rp) <span style={{color:'red'}}>*</span></label>
            <input className="input" name="nominal" type="number" min="10000" placeholder="cth: 50000" />
          </div>
          <div>
            <label style={lbl}>Frekuensi</label>
            <select className="input" name="frekuensi" style={{ appearance:'none' }}>
              <option value="bulanan">Bulanan</option>
              <option value="mingguan">Mingguan</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Tanggal kocok pertama</label>
            <input className="input" name="tgl_kocok" type="date" />
          </div>
          {error && <p style={{ fontSize:13, color:'#dc2626', margin:0 }}>⚠ {error}</p>}
          <button className="btn" type="submit" style={{ marginTop:4 }}>
            Lanjut pilih anggota →
          </button>
        </form>
      )}

      {step === 'anggota' && (
        <div style={{ padding:'20px 16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <p style={{ fontSize:13, color:'var(--text2)', margin:0 }}>
              <strong>{selected.size}</strong> dari {members.length} warga dipilih
            </p>
            <button onClick={() => setSelected(new Set(members.map(m=>m.id)))} style={{ fontSize:12, color:'var(--teal)', fontWeight:600, background:'none', border:'none', cursor:'pointer', padding:0 }}>
              Pilih semua
            </button>
          </div>

          {members.length === 0 ? (
            <div className="card" style={{ padding:24, textAlign:'center' }}>
              <p style={{ fontSize:14, color:'var(--text3)', margin:0 }}>Belum ada warga. Tambah warga dulu.</p>
            </div>
          ) : (
            <div className="card" style={{ marginBottom:14 }}>
              {members.map((m, i) => {
                const on = selected.has(m.id)
                return (
                  <div key={m.id} onClick={() => toggle(m.id)} style={{
                    display:'flex', alignItems:'center', gap:12, padding:'10px 14px', cursor:'pointer',
                    borderBottom: i < members.length-1 ? '1px solid var(--border)' : 'none',
                    background: on ? 'var(--teal-light)' : 'transparent',
                    transition:'background .1s',
                  }}>
                    <div style={{ width:34, height:34, borderRadius:'50%', background: avatarColor(m.nama), display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
                      {inisial(m.nama)}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:600, margin:'0 0 1px' }}>{m.nama}</p>
                      <p style={{ fontSize:11, color:'var(--text3)', margin:0 }}>No. {m.no_rumah ?? '—'}</p>
                    </div>
                    <div style={{ width:22, height:22, borderRadius:6, border: `2px solid ${on?'var(--teal)':'var(--border)'}`, background: on?'var(--teal)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}>
                      {on && <Check size={12} color="#fff" strokeWidth={3} />}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {error && <p style={{ fontSize:13, color:'#dc2626', margin:'0 0 12px' }}>⚠ {error}</p>}

          <button className="btn" onClick={submitAnggota} disabled={loading || selected.size < 2} style={{ width:'100%' }}>
            {loading ? 'Membuat...' : `🎉 Buat arisan (${selected.size} anggota)`}
          </button>
        </div>
      )}
    </div>
  )
}
const lbl: React.CSSProperties = { display:'block', fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:5 }
