import { getNeighborhood, getMembers, getBills } from '@/lib/db'
import { createServer } from '@/lib/supabase/server'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import { inisial, avatarColor, rp, persen, tglPendek } from '@/lib/utils'
import { UserPlus, Plus, ChevronRight, History } from 'lucide-react'

export default async function WargaPage() {
  const nb = await getNeighborhood()
  if (!nb) return null

  const members = await getMembers(nb.id)
  const bills   = await getBills(nb.id)
  const tagihan = bills.filter(b => b.status === 'buka')
  const aktivTagihan = tagihan[0] ?? null

  let paidSet = new Set<string>()
  if (aktivTagihan) {
    const sb = createServer()
    const { data: payments } = await sb
      .from('bill_payments')
      .select('member_id, status')
      .eq('bill_id', aktivTagihan.id)
    payments?.forEach(p => { if (p.status === 'lunas') paidSet.add(p.member_id) })
  }

  const prog = aktivTagihan ? persen(aktivTagihan.sudah_lunas, aktivTagihan.total_warga) : 0

  return (
    <div className="page">
      <div style={{ background:'var(--teal)', padding:'48px 20px 20px', color:'#fff' }} className="page-header">
        <p style={{ fontSize:12, opacity:.75, margin:'0 0 3px' }}>{members.length} KK terdaftar</p>
        <h1 style={{ fontSize:20, fontWeight:700, margin:0 }}>Data Warga</h1>
      </div>

      <div style={{ padding:'16px 16px 0' }} className="page-body">

        {/* Status tagihan aktif */}
        {aktivTagihan ? (
          <Link href={`/warga/tagihan/${aktivTagihan.id}`} style={{ textDecoration:'none', display:'block', marginBottom:12 }}>
            <div className="card" style={{ padding:'12px 14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, margin:'0 0 1px', color:'var(--text)' }}>{aktivTagihan.judul}</p>
                  <p style={{ fontSize:11, color:'var(--text3)', margin:0 }}>
                    {rp(aktivTagihan.nominal)}/KK · Tenggat {tglPendek(aktivTagihan.jatuh_tempo)}
                  </p>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span className={aktivTagihan.belum_lunas > 0 ? 'badge-warn' : 'badge-ok'}>
                    {aktivTagihan.belum_lunas > 0 ? `${aktivTagihan.belum_lunas} belum` : 'Semua lunas'}
                  </span>
                  <ChevronRight size={14} color="var(--text3)" />
                </div>
              </div>
              <div className="progress"><div className="progress-bar" style={{ width: prog+'%' }} /></div>
            </div>
          </Link>
        ) : (
          <div className="card" style={{ padding:'12px 14px', marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <p style={{ fontSize:13, color:'var(--text3)', margin:0 }}>Belum ada tagihan aktif</p>
            <Link href="/warga/tagihan/buat" className="btn" style={{ fontSize:12, padding:'6px 14px', textDecoration:'none' }}>
              + Buat
            </Link>
          </div>
        )}

        {/* Tombol aksi */}
        <div style={{ display:'flex', gap:8, marginBottom:8 }}>
          <Link href="/warga/tambah" className="btn" style={{
            flex:1, textDecoration:'none', display:'flex',
            alignItems:'center', justifyContent:'center', gap:5,
          }}>
            <UserPlus size={14} /> Tambah warga
          </Link>
          <Link href="/warga/tagihan/buat" className="btn-outline" style={{
            flex:1, textDecoration:'none', display:'flex',
            alignItems:'center', justifyContent:'center', gap:5,
          }}>
            <Plus size={14} /> Buat tagihan
          </Link>
        </div>
        <Link href="/warga/tagihan" style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          width:'100%', padding:'9px 0', marginBottom:14,
          fontSize:13, fontWeight:600, color:'var(--text2)',
          border:'1px solid var(--border)', borderRadius:99,
          textDecoration:'none', background:'none', transition:'all .15s',
        }}>
          <History size={14} /> Lihat riwayat semua tagihan
        </Link>

        {/* Daftar warga */}
        <p style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 8px' }}>
          Daftar warga ({members.length} KK)
        </p>

        {members.length === 0 ? (
          <div className="card" style={{ padding:28, textAlign:'center' }}>
            <p style={{ fontSize:14, color:'var(--text3)', margin:'0 0 12px' }}>Belum ada warga terdaftar</p>
            <Link href="/warga/tambah" className="btn" style={{ textDecoration:'none' }}>
              + Tambah warga pertama
            </Link>
          </div>
        ) : (
          <div className="card">
            {members.map((m, i) => {
              const paid = paidSet.has(m.id)
              return (
                <Link
                  key={m.id}
                  href={`/warga/${m.id}`}
                  style={{ textDecoration:'none', color:'inherit' }}
                >
                  <div className="list-row" style={{
                    display:'flex', alignItems:'center', gap:12,
                    padding:'10px 14px',
                    borderBottom: i < members.length-1 ? '1px solid var(--border)' : 'none',
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width:36, height:36, borderRadius:'50%',
                      background: avatarColor(m.nama),
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:12, fontWeight:700, color:'#fff', flexShrink:0,
                    }}>
                      {inisial(m.nama)}
                    </div>

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, margin:'0 0 1px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {m.nama}
                      </p>
                      <p style={{ fontSize:11, color:'var(--text3)', margin:0 }}>
                        No. {m.no_rumah ?? '—'} · {m.jumlah_jiwa} jiwa
                      </p>
                    </div>

                    {/* Status bayar + arrow */}
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                      {aktivTagihan && (
                        <span className={paid ? 'badge-ok' : 'badge-warn'}>
                          {paid ? 'Lunas' : 'Belum'}
                        </span>
                      )}
                      <ChevronRight size={14} color="var(--text3)" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  )
}
