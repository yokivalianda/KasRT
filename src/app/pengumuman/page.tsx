import { getNeighborhood, getPengumuman } from '@/lib/db'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import { tglPendek } from '@/lib/utils'
import { Pin, Plus, Megaphone } from 'lucide-react'
import HapusPengumumanButton from './HapusPengumumanButton'

export default async function PengumumanPage() {
  const nb     = await getNeighborhood()
  if (!nb) return null
  const items  = await getPengumuman(nb.id)
  const pinned = items.filter(p => p.disematkan)
  const biasa  = items.filter(p => !p.disematkan)

  return (
    <div className="page">
      <div style={{ background:'var(--teal)', padding:'48px 20px 20px', color:'#fff' }}>
        <p style={{ fontSize:12, opacity:.75, margin:'0 0 3px' }}>{items.length} pengumuman</p>
        <h1 style={{ fontSize:20, fontWeight:700, margin:0 }}>Pengumuman RT</h1>
      </div>

      <div style={{ padding:'16px 16px 0' }}>
        <Link href="/pengumuman/buat" className="btn" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, width:'100%', textDecoration:'none', marginBottom:16 }}>
          <Plus size={15} /> Buat pengumuman
        </Link>

        {items.length === 0 ? (
          <div className="card" style={{ padding:32, textAlign:'center' }}>
            <Megaphone size={32} style={{ color:'var(--text3)', margin:'0 auto 12px', display:'block' }} />
            <p style={{ fontSize:14, color:'var(--text3)', margin:'0 0 4px', fontWeight:600 }}>Belum ada pengumuman</p>
            <p style={{ fontSize:13, color:'var(--text3)', margin:0 }}>Buat pengumuman untuk warga RT Anda</p>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <>
                <p style={sHd}>Disematkan</p>
                {pinned.map(p => <PengCard key={p.id} item={p} />)}
              </>
            )}
            {biasa.length > 0 && (
              <>
                <p style={{ ...sHd, marginTop: pinned.length ? 16 : 0 }}>Terbaru</p>
                {biasa.map(p => <PengCard key={p.id} item={p} />)}
              </>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  )
}

function PengCard({ item }: { item: any }) {
  return (
    <div className="card" style={{ padding:14, marginBottom:8, position:'relative' }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:6, marginBottom:4, paddingRight:28 }}>
        {item.disematkan && <Pin size={13} color="var(--amber)" style={{ marginTop:2, flexShrink:0 }} />}
        <p style={{ fontSize:14, fontWeight:700, margin:0, lineHeight:1.4 }}>{item.judul}</p>
      </div>
      <p style={{ fontSize:11, color:'var(--text3)', margin:'0 0 6px' }}>{tglPendek(item.created_at)}</p>
      {item.isi && <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6, margin:0 }}>{item.isi}</p>}
      <div style={{ position:'absolute', top:12, right:12 }}>
        <HapusPengumumanButton id={item.id} />
      </div>
    </div>
  )
}

const sHd: React.CSSProperties = { fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 8px' }
