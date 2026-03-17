import { getNeighborhood, getSaldo, getCashbook, getBills } from '@/lib/db'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import { rpCompact, rp, tglPendek, persen } from '@/lib/utils'
import { TrendingUp, TrendingDown, ChevronRight, Plus, Settings } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardPage() {
  const nb      = await getNeighborhood()
  if (!nb) return null
  const saldo   = await getSaldo(nb.id)
  const txns    = await getCashbook(nb.id, 4)
  const bills   = await getBills(nb.id)
  const tagihan = bills.filter(b => b.status === 'buka')

  return (
    <div className="page">
      {/* Header */}
      <div style={{ background:'var(--teal)', padding:'48px 20px 20px', color:'#fff' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
          <p style={{ fontSize:12, opacity:.75, margin:0 }}>
            {nb.nama}{nb.rw ? ` / ${nb.rw}` : ''}{nb.kelurahan ? ` · ${nb.kelurahan}` : ''}
          </p>
          <LogoutButton />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'4px 0 16px' }}>
          <h1 style={{ fontSize:20, fontWeight:700, margin:0 }}>Dashboard RT</h1>
          <Link href="/settings" style={{
            display:'flex', alignItems:'center', gap:4,
            color:'rgba(255,255,255,0.85)', textDecoration:'none',
            fontSize:12, fontWeight:600,
            background:'rgba(255,255,255,0.15)', padding:'5px 10px',
            borderRadius:99,
          }}>
            <Settings size={13} /> Setelan
          </Link>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[
            { label:'Saldo kas',    val: rpCompact(saldo.saldo) },
            { label:'Pemasukan',    val: rpCompact(saldo.total_masuk) },
            { label:'Pengeluaran',  val: rpCompact(saldo.total_keluar) },
          ].map(({ label, val }) => (
            <div key={label} style={{ background:'rgba(255,255,255,.18)', borderRadius:10, padding:'8px 10px' }}>
              <div style={{ fontSize:14, fontWeight:700 }}>{val}</div>
              <div style={{ fontSize:10, opacity:.75, marginTop:1 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'16px 16px 0' }}>

        {/* Tagihan aktif */}
        {tagihan.length > 0 && (
          <section style={{ marginBottom:20 }}>
            <p style={sectionHd}>Tagihan aktif</p>
            {tagihan.slice(0,2).map(b => (
              <div key={b.id} className="card" style={{ padding:14, marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:'var(--text)', margin:0 }}>{b.judul}</p>
                  <span className={b.belum_lunas > 0 ? 'badge-warn' : 'badge-ok'}>
                    {b.belum_lunas > 0 ? `${b.belum_lunas} belum` : 'Semua lunas'}
                  </span>
                </div>
                <p style={{ fontSize:12, color:'var(--text3)', margin:'0 0 8px' }}>
                  {rp(b.nominal)}/KK · Tenggat {tglPendek(b.jatuh_tempo)}
                </p>
                <div className="progress" style={{ marginBottom:3 }}>
                  <div className="progress-bar" style={{ width: persen(b.sudah_lunas, b.total_warga) + '%' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:11, color:'var(--text3)' }}>{b.sudah_lunas}/{b.total_warga} lunas</span>
                  <span style={{ fontSize:11, fontWeight:600, color:'var(--teal)' }}>
                    {persen(b.sudah_lunas, b.total_warga)}%
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}

        {tagihan.length === 0 && (
          <div className="card" style={{ padding:16, marginBottom:20, textAlign:'center' }}>
            <p style={{ fontSize:13, color:'var(--text3)', margin:'0 0 10px' }}>
              Belum ada tagihan aktif
            </p>
            <Link href="/warga" className="btn" style={{ fontSize:13, padding:'8px 18px' }}>
              + Buat tagihan iuran
            </Link>
          </div>
        )}

        {/* Transaksi terakhir */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <p style={sectionHd}>Transaksi terakhir</p>
          <Link href="/kas" style={{ fontSize:12, color:'var(--teal)', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:2 }}>
            Lihat semua <ChevronRight size={13} />
          </Link>
        </div>

        {txns.length === 0 ? (
          <div className="card" style={{ padding:16, textAlign:'center' }}>
            <p style={{ fontSize:13, color:'var(--text3)', margin:'0 0 10px' }}>Belum ada transaksi</p>
            <Link href="/kas/tambah" className="btn" style={{ fontSize:13, padding:'8px 18px' }}>
              <Plus size={14} /> Catat transaksi
            </Link>
          </div>
        ) : (
          <div className="card">
            {txns.map((e, i) => (
              <div key={e.id} style={{
                display:'flex', alignItems:'center', gap:12, padding:'11px 14px',
                borderBottom: i < txns.length-1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background: e.tipe==='masuk'?'#ecfdf5':'#fef2f2' }}>
                  {e.tipe==='masuk' ? <TrendingUp size={15} color="#16a34a" /> : <TrendingDown size={15} color="#dc2626" />}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:500, margin:'0 0 1px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.keterangan}</p>
                  <p style={{ fontSize:11, color:'var(--text3)', margin:0 }}>{tglPendek(e.tanggal)}</p>
                </div>
                <p style={{ fontSize:13, fontWeight:700, margin:0, color: e.tipe==='masuk'?'#16a34a':'#dc2626', flexShrink:0 }}>
                  {e.tipe==='masuk'?'+':'−'}{e.jumlah.toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>
        )}

        <Link href="/kas/tambah" className="btn" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, width:'100%', marginTop:12, textDecoration:'none' }}>
          <Plus size={15} /> Catat transaksi
        </Link>
      </div>
      <BottomNav />
    </div>
  )
}

const sectionHd: React.CSSProperties = {
  fontSize:11, fontWeight:700, color:'var(--text3)',
  textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 8px',
}
