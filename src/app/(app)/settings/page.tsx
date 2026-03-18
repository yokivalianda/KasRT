import { getNeighborhood } from '@/lib/db'
import { createServer } from '@/lib/supabase/server'
import BottomNav from '@/components/layout/BottomNav'
import LogoutButton from '@/components/LogoutButton'
import KodeUndangCard from './KodeUndangCard'
import EditRTForm from './EditRTForm'
import IOSInstallGuide from './IOSInstallGuide'
import { Users, RefreshCw, BookOpen, Megaphone } from 'lucide-react'

export default async function SettingsPage() {
  const nb = await getNeighborhood()
  if (!nb) return null

  const sb = createServer()
  const { data: { session } } = await sb.auth.getSession()

  // Statistik RT
  const [
    { count: jmlWarga },
    { count: jmlArisan },
    { count: jmlTransaksi },
    { count: jmlPengumuman },
  ] = await Promise.all([
    sb.from('members').select('id', { count:'exact', head:true }).eq('neighborhood_id', nb.id).eq('status','aktif'),
    sb.from('arisan_groups').select('id', { count:'exact', head:true }).eq('neighborhood_id', nb.id).eq('status','aktif'),
    sb.from('cashbook').select('id', { count:'exact', head:true }).eq('neighborhood_id', nb.id),
    sb.from('pengumuman').select('id', { count:'exact', head:true }).eq('neighborhood_id', nb.id),
  ])

  return (
    <div className="page">
      {/* Header */}
      <div style={{ background:'var(--teal)', padding:'48px 20px 20px', color:'#fff' }}>
        <p style={{ fontSize:12, opacity:.75, margin:'0 0 3px' }}>Pengaturan</p>
        <h1 style={{ fontSize:20, fontWeight:700, margin:'0 0 2px' }}>{nb.nama}</h1>
        <p style={{ fontSize:13, opacity:.8, margin:0 }}>
          {[nb.rw, nb.kelurahan, nb.kota].filter(Boolean).join(' · ')}
        </p>
      </div>

      <div style={{ padding:'16px 16px 0' }}>

        {/* Statistik */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:16 }}>
          {[
            { icon:Users,      label:'Warga',      val: jmlWarga ?? 0 },
            { icon:RefreshCw,  label:'Arisan',     val: jmlArisan ?? 0 },
            { icon:BookOpen,   label:'Transaksi',  val: jmlTransaksi ?? 0 },
            { icon:Megaphone,  label:'Pengumuman', val: jmlPengumuman ?? 0 },
          ].map(({ icon:Icon, label, val }) => (
            <div key={label} className="card" style={{ padding:'10px 6px', textAlign:'center' }}>
              <Icon size={16} color="var(--teal)" style={{ margin:'0 auto 4px', display:'block' }} />
              <p style={{ fontSize:17, fontWeight:800, color:'var(--text)', margin:'0 0 1px', lineHeight:1 }}>{val}</p>
              <p style={{ fontSize:10, color:'var(--text3)', margin:0 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Edit info RT — inline form */}
        <EditRTForm nb={nb} />

        {/* Kode undang */}
        <div className="card" style={{ padding:16, marginBottom:12 }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 10px' }}>
            Kode undangan warga
          </p>
          <KodeUndangCard kode={nb.kode_undang} nama={nb.nama} />
          <p style={{ fontSize:12, color:'var(--text3)', margin:'8px 0 0', lineHeight:1.6 }}>
            Bagikan kode ini agar warga bisa bergabung ke RT Anda. Kode bersifat unik dan permanen.
          </p>
        </div>

        {/* Akun */}
        <div className="card" style={{ padding:16, marginBottom:12 }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 12px' }}>
            Akun
          </p>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)', marginBottom:12 }}>
            <span style={{ fontSize:13, color:'var(--text3)' }}>Email</span>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--text)', maxWidth:'60%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {session?.user?.email ?? '—'}
            </span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)', marginBottom:12 }}>
            <span style={{ fontSize:13, color:'var(--text3)' }}>Bergabung sejak</span>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>
              {new Date(nb.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}
            </span>
          </div>
          <LogoutButton full />
        </div>

        {/* App version */}
        <div style={{ textAlign:'center', padding:'4px 0 8px' }}>
          <p style={{ fontSize:12, color:'var(--text3)', margin:0 }}>
            KasRT v2.0 · Dibuat untuk ketua RT Indonesia 🏘️
          </p>
        </div>

      </div>
      <BottomNav />
    </div>
  )
}
