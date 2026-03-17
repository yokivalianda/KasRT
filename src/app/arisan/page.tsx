import { getNeighborhood, getArisanGroups } from '@/lib/db'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import { rpCompact, tglPendek } from '@/lib/utils'
import { Plus, RefreshCw } from 'lucide-react'

export default async function ArisanPage() {
  const nb     = await getNeighborhood()
  if (!nb) return null
  const groups = await getArisanGroups(nb.id)
  const aktif  = groups.filter(g => g.status === 'aktif')
  const selesai = groups.filter(g => g.status === 'selesai')

  return (
    <div className="page">
      <div style={{ background:'var(--teal)', padding:'48px 20px 20px', color:'#fff' }}>
        <p style={{ fontSize:12, opacity:.75, margin:'0 0 3px' }}>{aktif.length} grup aktif</p>
        <h1 style={{ fontSize:20, fontWeight:700, margin:0 }}>Arisan Digital</h1>
      </div>

      <div style={{ padding:'16px 16px 0' }}>
        <Link href="/arisan/buat" className="btn" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, width:'100%', textDecoration:'none', marginBottom:16 }}>
          <Plus size={15} /> Buat grup arisan baru
        </Link>

        {groups.length === 0 ? (
          <div className="card" style={{ padding:32, textAlign:'center' }}>
            <RefreshCw size={32} style={{ color:'var(--text3)', margin:'0 auto 12px', display:'block' }} />
            <p style={{ fontSize:14, color:'var(--text3)', margin:'0 0 4px', fontWeight:600 }}>Belum ada arisan</p>
            <p style={{ fontSize:13, color:'var(--text3)', margin:0 }}>Buat grup arisan pertama untuk RT Anda</p>
          </div>
        ) : (
          <>
            {aktif.length > 0 && (
              <>
                <p style={sHd}>Aktif</p>
                {aktif.map(g => (
                  <Link key={g.id} href={`/arisan/${g.id}`} style={{ textDecoration:'none' }}>
                    <div className="card" style={{ padding:14, marginBottom:8 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                        <p style={{ fontSize:14, fontWeight:700, color:'var(--text)', margin:0 }}>{g.nama}</p>
                        <span className="badge-ok">Aktif</span>
                      </div>
                      <p style={{ fontSize:13, color:'var(--text2)', margin:'0 0 4px' }}>
                        {rpCompact(g.nominal)}/putaran · {g.frekuensi}
                      </p>
                      <p style={{ fontSize:12, color:'var(--text3)', margin:0 }}>
                        Putaran {g.putaran_ini} dari {g.total_putaran}
                        {g.tgl_kocok ? ` · Kocok ${tglPendek(g.tgl_kocok)}` : ''}
                      </p>
                    </div>
                  </Link>
                ))}
              </>
            )}
            {selesai.length > 0 && (
              <>
                <p style={{ ...sHd, marginTop:16 }}>Selesai</p>
                {selesai.map(g => (
                  <Link key={g.id} href={`/arisan/${g.id}`} style={{ textDecoration:'none' }}>
                    <div className="card" style={{ padding:14, marginBottom:8, opacity:.7 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <p style={{ fontSize:14, fontWeight:600, color:'var(--text)', margin:0 }}>{g.nama}</p>
                        <span className="badge-warn">Selesai</span>
                      </div>
                      <p style={{ fontSize:12, color:'var(--text3)', margin:'4px 0 0' }}>
                        {rpCompact(g.nominal)} · {g.total_putaran} putaran
                      </p>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
const sHd: React.CSSProperties = { fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 8px' }
