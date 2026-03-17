import { getNeighborhood } from '@/lib/db'
import { createServer } from '@/lib/supabase/server'
import BottomNav from '@/components/layout/BottomNav'
import LogoutButton from '@/components/LogoutButton'
import KodeUndangCard from './KodeUndangCard'
import { Settings, Users, BookOpen, Info } from 'lucide-react'

export default async function SettingsPage() {
  const nb = await getNeighborhood()
  if (!nb) return null

  const sb = createServer()
  const { data: { session } } = await sb.auth.getSession()

  const { count: jmlWarga } = await sb
    .from('members')
    .select('id', { count:'exact', head:true })
    .eq('neighborhood_id', nb.id)
    .eq('status','aktif')

  const { count: jmlArisan } = await sb
    .from('arisan_groups')
    .select('id', { count:'exact', head:true })
    .eq('neighborhood_id', nb.id)
    .eq('status','aktif')

  const { count: jmlTransaksi } = await sb
    .from('cashbook')
    .select('id', { count:'exact', head:true })
    .eq('neighborhood_id', nb.id)

  return (
    <div className="page">
      <div style={{ background:'var(--teal)', padding:'48px 20px 20px', color:'#fff' }}>
        <p style={{ fontSize:12, opacity:.75, margin:'0 0 3px' }}>Pengaturan</p>
        <h1 style={{ fontSize:20, fontWeight:700, margin:0 }}>Profil RT</h1>
      </div>

      <div style={{ padding:'16px 16px 0' }}>

        {/* RT Info */}
        <div className="card" style={{ padding:16, marginBottom:12 }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 10px' }}>
            Informasi RT
          </p>
          {[
            { label:'Nama RT',      val: nb.nama },
            { label:'RW',           val: nb.rw ?? '—' },
            { label:'Kelurahan',    val: nb.kelurahan ?? '—' },
            { label:'Kecamatan',    val: nb.kecamatan ?? '—' },
            { label:'Kota',         val: nb.kota ?? '—' },
            { label:'Provinsi',     val: nb.provinsi ?? '—' },
          ].map(({ label, val }, i, arr) => (
            <div key={label} style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'8px 0',
              borderBottom: i < arr.length-1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize:13, color:'var(--text3)' }}>{label}</span>
              <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Statistik */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
          {[
            { icon: Users,    label:'Warga aktif',    val: jmlWarga ?? 0 },
            { icon: Settings, label:'Arisan aktif',   val: jmlArisan ?? 0 },
            { icon: BookOpen, label:'Transaksi',       val: jmlTransaksi ?? 0 },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="card" style={{ padding:12, textAlign:'center' }}>
              <Icon size={18} color="var(--teal)" style={{ margin:'0 auto 6px', display:'block' }} />
              <p style={{ fontSize:18, fontWeight:700, color:'var(--text)', margin:'0 0 2px' }}>{val}</p>
              <p style={{ fontSize:10, color:'var(--text3)', margin:0 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Kode undang */}
        <div className="card" style={{ padding:16, marginBottom:12 }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 10px' }}>
            Kode undangan warga
          </p>
          <KodeUndangCard kode={nb.kode_undang} nama={nb.nama} />
          <p style={{ fontSize:12, color:'var(--text3)', margin:'8px 0 0', lineHeight:1.5 }}>
            Bagikan kode ini ke warga agar mereka bisa bergabung ke RT Anda.
          </p>
        </div>

        {/* Akun */}
        <div className="card" style={{ padding:16, marginBottom:12 }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 10px' }}>
            Akun
          </p>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
            <span style={{ fontSize:13, color:'var(--text3)' }}>Email</span>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{session?.user?.email ?? '—'}</span>
          </div>
          <div style={{ paddingTop:12 }}>
            <LogoutButton full />
          </div>
        </div>

        {/* App info */}
        <div style={{ textAlign:'center', paddingBottom:8 }}>
          <p style={{ fontSize:12, color:'var(--text3)', margin:0 }}>KasRT v2.0 · Kelola RT lebih mudah</p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
