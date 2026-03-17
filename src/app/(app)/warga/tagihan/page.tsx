import { getNeighborhood, getBills } from '@/lib/db'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import { rp, tglPendek, persen } from '@/lib/utils'
import { ArrowLeft, Plus, ChevronRight, CheckCircle, Clock } from 'lucide-react'

export default async function RiwayatTagihanPage() {
  const nb = await getNeighborhood()
  if (!nb) return null

  const bills  = await getBills(nb.id)
  const aktif  = bills.filter(b => b.status === 'buka')
  const tutup  = bills.filter(b => b.status === 'tutup')

  return (
    <div className="page">
      <div style={{ background:'var(--teal)', padding:'48px 20px 20px', color:'#fff' }}>
        <Link href="/warga" style={{ display:'flex', alignItems:'center', gap:4, color:'#fff', textDecoration:'none', marginBottom:10, fontSize:13, opacity:.8 }}>
          <ArrowLeft size={16} /> Kembali
        </Link>
        <p style={{ fontSize:12, opacity:.75, margin:'0 0 3px' }}>{bills.length} tagihan total</p>
        <h1 style={{ fontSize:20, fontWeight:700, margin:0 }}>Riwayat Tagihan</h1>
      </div>

      <div style={{ padding:'16px 16px 0' }}>
        <Link href="/warga/tagihan/buat" className="btn" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, width:'100%', textDecoration:'none', marginBottom:16 }}>
          <Plus size={15} /> Buat tagihan baru
        </Link>

        {/* Tagihan aktif */}
        {aktif.length > 0 && (
          <section style={{ marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
              <Clock size={13} color="var(--teal)" />
              <p style={sHd}>Tagihan aktif ({aktif.length})</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {aktif.map(b => <BillCard key={b.id} bill={b} />)}
            </div>
          </section>
        )}

        {/* Tagihan selesai */}
        {tutup.length > 0 && (
          <section style={{ marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
              <CheckCircle size={13} color="var(--text3)" />
              <p style={sHd}>Riwayat selesai ({tutup.length})</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {tutup.map(b => <BillCard key={b.id} bill={b} tutup />)}
            </div>
          </section>
        )}

        {bills.length === 0 && (
          <div className="card" style={{ padding:28, textAlign:'center' }}>
            <p style={{ fontSize:14, color:'var(--text3)', margin:'0 0 4px', fontWeight:600 }}>Belum ada tagihan</p>
            <p style={{ fontSize:13, color:'var(--text3)', margin:'0 0 14px' }}>Buat tagihan iuran untuk semua warga sekarang</p>
            <Link href="/warga/tagihan/buat" className="btn" style={{ textDecoration:'none' }}>
              + Buat tagihan pertama
            </Link>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}

function BillCard({ bill, tutup = false }: { bill: any, tutup?: boolean }) {
  const prog = persen(bill.sudah_lunas, bill.total_warga)
  return (
    <Link href={`/warga/tagihan/${bill.id}`} style={{ textDecoration:'none' }}>
      <div className="card" style={{ padding:14, opacity: tutup ? .75 : 1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
          <div style={{ flex:1, minWidth:0, paddingRight:8 }}>
            <p style={{ fontSize:14, fontWeight:700, color:'var(--text)', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {bill.judul}
            </p>
            <p style={{ fontSize:11, color:'var(--text3)', margin:0 }}>
              {rp(bill.nominal)}/KK · {bill.periode ?? tglPendek(bill.jatuh_tempo)}
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
            <span className={tutup ? 'badge-ok' : bill.belum_lunas > 0 ? 'badge-warn' : 'badge-ok'}>
              {tutup ? 'Selesai' : bill.belum_lunas > 0 ? `${bill.belum_lunas} belum` : 'Lunas semua'}
            </span>
            <ChevronRight size={14} color="var(--text3)" />
          </div>
        </div>
        <div className="progress" style={{ marginBottom:4 }}>
          <div className="progress-bar" style={{ width: prog+'%', background: tutup ? '#059669' : undefined }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:11, color:'var(--text3)' }}>
            {bill.sudah_lunas}/{bill.total_warga} lunas
          </span>
          <span style={{ fontSize:11, fontWeight:600, color: tutup ? '#059669' : 'var(--teal)' }}>
            {rp(bill.terkumpul)} terkumpul
          </span>
        </div>
      </div>
    </Link>
  )
}

const sHd: React.CSSProperties = { fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.05em', margin:0 }
