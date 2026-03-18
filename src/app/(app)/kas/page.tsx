import { getNeighborhood, getSaldo, getCashbook } from '@/lib/db'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import { rpCompact, tglPendek } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Plus, ChevronRight, FileText } from 'lucide-react'

const KAT_BG: Record<string,string>   = { iuran:'#ecfdf5', arisan:'#f3e8ff', belanja:'#fff7ed', infra:'#eff6ff', sumbangan:'#f0fdf4', kegiatan:'#fff0f9', operasional:'#f0f9ff', 'lain-lain':'#f5f5f5' }
const KAT_TEXT: Record<string,string> = { iuran:'#065f46', arisan:'#6b21a8', belanja:'#9a3412', infra:'#1e40af', sumbangan:'#14532d', kegiatan:'#9d174d', operasional:'#0369a1', 'lain-lain':'#555' }

export default async function KasPage() {
  const nb    = await getNeighborhood()
  if (!nb) return null
  const saldo = await getSaldo(nb.id)
  const txns  = await getCashbook(nb.id)

  const bulanIni = new Date().toISOString().slice(0, 7)
  const txnsBulanIni   = txns.filter(t => t.tanggal.startsWith(bulanIni))
  const masukBulanIni  = txnsBulanIni.filter(t => t.tipe==='masuk').reduce((s,t) => s+t.jumlah, 0)
  const keluarBulanIni = txnsBulanIni.filter(t => t.tipe==='keluar').reduce((s,t) => s+t.jumlah, 0)

  return (
    <div className="page">
      <div style={{ background:'var(--teal)', padding:'48px 20px 20px', color:'#fff' }}>
        <p style={{ fontSize:12, opacity:.75, margin:'0 0 3px' }}>Buku Kas RT</p>
        <h1 style={{ fontSize:20, fontWeight:700, margin:'0 0 14px' }}>{nb.nama}</h1>
        <div style={{ background:'rgba(255,255,255,.18)', borderRadius:12, padding:'14px 16px', marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4, opacity:.8 }}>
            <Wallet size={14} /><span style={{ fontSize:12 }}>Total saldo</span>
          </div>
          <p style={{ fontSize:30, fontWeight:800, margin:'0 0 10px', letterSpacing:'-1px' }}>{rpCompact(saldo.saldo)}</p>
          <div style={{ display:'flex', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <TrendingUp size={12} style={{ opacity:.7 }} />
              <span style={{ fontSize:12, opacity:.8 }}>{rpCompact(saldo.total_masuk)} masuk</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <TrendingDown size={12} style={{ opacity:.7 }} />
              <span style={{ fontSize:12, opacity:.8 }}>{rpCompact(saldo.total_keluar)} keluar</span>
            </div>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[
            { label:'Masuk bulan ini',  val: masukBulanIni },
            { label:'Keluar bulan ini', val: keluarBulanIni },
          ].map(({ label, val }) => (
            <div key={label} style={{ background:'rgba(255,255,255,.15)', borderRadius:10, padding:'10px 12px' }}>
              <p style={{ fontSize:10, opacity:.75, margin:'0 0 3px', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>{label}</p>
              <p style={{ fontSize:16, fontWeight:700, margin:0 }}>{rpCompact(val)}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'16px 16px 0' }}>
        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
          <Link href="/kas/tambah" className="btn" style={{ flex:2, display:'flex', alignItems:'center', justifyContent:'center', gap:6, textDecoration:'none' }}>
            <Plus size={15} /> Catat transaksi
          </Link>
          <Link href="/kas/laporan" className="btn-outline" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, textDecoration:'none' }}>
            <FileText size={14} /> Laporan
          </Link>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.05em', margin:0 }}>Semua transaksi</p>
          <span style={{ fontSize:11, color:'var(--text3)' }}>{txns.length} entri · ketuk untuk edit</span>
        </div>

        {txns.length === 0 ? (
          <div className="card" style={{ padding:28, textAlign:'center' }}>
            <p style={{ fontSize:14, color:'var(--text3)', margin:'0 0 4px', fontWeight:600 }}>Belum ada transaksi</p>
            <p style={{ fontSize:12, color:'var(--text3)', margin:'0 0 14px' }}>Catat pemasukan atau pengeluaran pertama</p>
            <Link href="/kas/tambah" className="btn" style={{ textDecoration:'none', fontSize:13 }}>
              <Plus size={14} /> Catat sekarang
            </Link>
          </div>
        ) : (
          <div className="card">
            {txns.map((e, i) => (
              <Link key={e.id} href={`/kas/${e.id}`} style={{ textDecoration:'none', color:'inherit', display:'block' }}>
                <div className="list-row" style={{
                  display:'flex', alignItems:'center', gap:12, padding:'11px 14px',
                  borderBottom: i < txns.length-1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ width:34, height:34, borderRadius:9, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background: e.tipe==='masuk'?'#ecfdf5':'#fef2f2' }}>
                    {e.tipe==='masuk' ? <TrendingUp size={15} color="#16a34a" /> : <TrendingDown size={15} color="#dc2626" />}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:500, margin:'0 0 3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.keterangan}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:11, color:'var(--text3)' }}>{tglPendek(e.tanggal)}</span>
                      <span style={{ fontSize:10, fontWeight:600, padding:'1px 6px', borderRadius:99, background:KAT_BG[e.kategori]??'#f5f5f5', color:KAT_TEXT[e.kategori]??'#555' }}>
                        {e.kategori}
                      </span>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                    <p style={{ fontSize:13, fontWeight:700, margin:0, color:e.tipe==='masuk'?'#16a34a':'#dc2626' }}>
                      {e.tipe==='masuk'?'+':'−'}{e.jumlah.toLocaleString('id-ID')}
                    </p>
                    <ChevronRight size={14} color="var(--text3)" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
