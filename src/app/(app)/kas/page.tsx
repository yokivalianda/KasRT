import { getNeighborhood, getSaldo, getCashbook } from '@/lib/db'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import { rpCompact } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Plus, FileText } from 'lucide-react'
import KasList from './KasList'
import ExportButton from '@/components/ExportButton'

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
      {/* Header */}
      <div style={{ background:'var(--teal)', padding:'48px 20px 20px', color:'#fff' }}>
        <p style={{ fontSize:12, opacity:.75, margin:'0 0 3px' }}>Buku Kas RT</p>
        <h1 style={{ fontSize:20, fontWeight:700, margin:'0 0 14px' }}>{nb.nama}</h1>

        {/* Saldo utama */}
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

        {/* Bulan ini */}
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
        {/* Tombol aksi */}
        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
          <Link href="/kas/tambah" className="btn" style={{ flex:2, display:'flex', alignItems:'center', justifyContent:'center', gap:6, textDecoration:'none' }}>
            <Plus size={15} /> Catat transaksi
          </Link>
          <Link href="/kas/laporan" className="btn-outline" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, textDecoration:'none' }}>
            <FileText size={14} /> Laporan
          </Link>
          <ExportButton tipe="kas" label="Export" />
        </div>

        {/* List dengan search + filter */}
        {txns.length === 0 ? (
          <div className="card" style={{ padding:28, textAlign:'center' }}>
            <p style={{ fontSize:14, color:'var(--text3)', margin:'0 0 4px', fontWeight:600 }}>Belum ada transaksi</p>
            <p style={{ fontSize:12, color:'var(--text3)', margin:'0 0 14px' }}>Catat pemasukan atau pengeluaran pertama</p>
            <Link href="/kas/tambah" className="btn" style={{ textDecoration:'none', fontSize:13 }}>
              <Plus size={14} /> Catat sekarang
            </Link>
          </div>
        ) : (
          <KasList txns={txns} />
        )}
      </div>
      <BottomNav />
    </div>
  )
}
