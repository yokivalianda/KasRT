import { getNeighborhood, getSaldo, getCashbook, getBills, getArisanGroups } from '@/lib/db'
import { createServer } from '@/lib/supabase/server'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import { rpCompact, rp, tglPendek, persen } from '@/lib/utils'
import { TrendingUp, TrendingDown, ChevronRight, Plus, Settings } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'
import GrafikKas from './GrafikKas'
import StatistikRT from './StatistikRT'
import NotifikasiBell from '@/components/NotifikasiBell'
import ThemeToggle from '@/components/ThemeToggle'
import { generateNotifs } from '@/lib/notifikasi'

const BULAN_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des']

export default async function DashboardPage() {
  const nb    = await getNeighborhood()
  if (!nb) return null
  const saldo  = await getSaldo(nb.id)
  const txns   = await getCashbook(nb.id, 4)
  const bills  = await getBills(nb.id)
  const tagihan = bills.filter(b => b.status === 'buka')
  const arisanGroups = await getArisanGroups(nb.id)

  const sb = createServer()

  // Data arisan untuk notifikasi
  const arisanNotifData = await Promise.all(
    arisanGroups
      .filter(g => g.status === 'aktif')
      .map(async g => {
        const { data: payments } = await sb
          .from('arisan_payments')
          .select('status, member_id')
          .eq('group_id', g.id)
          .eq('putaran', g.putaran_ini)

        const belum = (payments ?? []).filter(p => p.status === 'belum').length
        const total = (payments ?? []).length

        return {
          id: g.id,
          nama: g.nama,
          putaran_ini: g.putaran_ini,
          belum_bayar: belum,
          total_anggota: total,
        }
      })
  )

  // Generate notifikasi
  const notifs = generateNotifs(
    tagihan.map(b => ({
      id:          b.id,
      judul:       b.judul,
      jatuh_tempo: b.jatuh_tempo,
      belum_lunas: b.belum_lunas,
      total_warga: b.total_warga,
      status:      b.status,
    })),
    arisanNotifData,
  )

  // Data grafik 6 bulan
  const { data: txnsBulanan } = await sb
    .from('cashbook')
    .select('tanggal, tipe, jumlah')
    .eq('neighborhood_id', nb.id)
    .gte('tanggal', (() => {
      const d = new Date(); d.setMonth(d.getMonth() - 5)
      return d.toISOString().slice(0, 7) + '-01'
    })())
    .order('tanggal')

  const { count: jmlWarga } = await sb
    .from('members')
    .select('id', { count: 'exact', head: true })
    .eq('neighborhood_id', nb.id)
    .eq('status', 'aktif')

  // Kelompokkan per bulan
  const bulanMap = new Map<string, { masuk: number; keluar: number }>()
  ;(txnsBulanan ?? []).forEach(t => {
    const b = t.tanggal.slice(0, 7)
    if (!bulanMap.has(b)) bulanMap.set(b, { masuk: 0, keluar: 0 })
    const curr = bulanMap.get(b)!
    if (t.tipe === 'masuk') curr.masuk += t.jumlah
    else curr.keluar += t.jumlah
  })

  const grafikData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
    const key = d.toISOString().slice(0, 7)
    const val = bulanMap.get(key) ?? { masuk: 0, keluar: 0 }
    return { bulan: key, label: BULAN_ID[d.getMonth()], masuk: val.masuk, keluar: val.keluar, saldo: val.masuk - val.keluar }
  })

  const bulanIni  = new Date().toISOString().slice(0, 7)
  const bulanLalu = (() => { const d = new Date(); d.setMonth(d.getMonth()-1); return d.toISOString().slice(0,7) })()
  const dataIni   = bulanMap.get(bulanIni)  ?? { masuk: 0, keluar: 0 }
  const dataLalu  = bulanMap.get(bulanLalu) ?? { masuk: 0, keluar: 0 }

  return (
    <div className="page">
      {/* Header */}
      <div style={{ background:'var(--teal)', padding:'48px 20px 20px', color:'#fff' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
          <p style={{ fontSize:12, opacity:.75, margin:0 }}>
            {nb.nama}{nb.rw ? ` / ${nb.rw}` : ''}{nb.kelurahan ? ` · ${nb.kelurahan}` : ''}
          </p>
          <div style={{ display:'flex', gap:8 }}>
            <NotifikasiBell notifs={notifs} />
            <ThemeToggle variant="icon" />
            <LogoutButton />
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'6px 0 16px' }}>
          <h1 style={{ fontSize:20, fontWeight:700, margin:0 }}>Dashboard RT</h1>
          <Link href="/settings" style={{ display:'flex', alignItems:'center', gap:4, color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:12, fontWeight:600, background:'rgba(255,255,255,0.15)', padding:'5px 10px', borderRadius:99 }}>
            <Settings size={13} /> Setelan
          </Link>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[
            { label:'Saldo kas',   val: rpCompact(saldo.saldo) },
            { label:'Pemasukan',   val: rpCompact(saldo.total_masuk) },
            { label:'Pengeluaran', val: rpCompact(saldo.total_keluar) },
          ].map(({ label, val }) => (
            <div key={label} style={{ background:'rgba(255,255,255,.18)', borderRadius:10, padding:'8px 10px' }}>
              <div style={{ fontSize:14, fontWeight:700 }}>{val}</div>
              <div style={{ fontSize:10, opacity:.75, marginTop:1 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'16px 16px 0' }}>

        {/* Statistik bulanan */}
        <StatistikRT
          masukBulanIni={dataIni.masuk}
          masukBulanLalu={dataLalu.masuk}
          keluarBulanIni={dataIni.keluar}
          keluarBulanLalu={dataLalu.keluar}
          saldoBulanIni={dataIni.masuk - dataIni.keluar}
          saldoBulanLalu={dataLalu.masuk - dataLalu.keluar}
          jmlWarga={jmlWarga ?? 0}
          jmlTagihanAktif={tagihan.length}
        />

        {/* Grafik */}
        <div style={{ marginBottom:16 }}>
          <GrafikKas data={grafikData} />
        </div>

        {/* Tagihan aktif */}
        {tagihan.length > 0 && (
          <section style={{ marginBottom:16 }}>
            <p style={sHd}>Tagihan aktif</p>
            {tagihan.slice(0,2).map(b => (
              <Link key={b.id} href={`/warga/tagihan/${b.id}`} style={{ textDecoration:'none', display:'block', marginBottom:8 }}>
                <div className="card" style={{ padding:14 }}>
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
                    <span style={{ fontSize:11, fontWeight:600, color:'var(--teal)' }}>{persen(b.sudah_lunas, b.total_warga)}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}

        {tagihan.length === 0 && (
          <div className="card" style={{ padding:16, marginBottom:16, textAlign:'center' }}>
            <p style={{ fontSize:13, color:'var(--text3)', margin:'0 0 10px' }}>Belum ada tagihan aktif</p>
            <Link href="/warga/tagihan/buat" className="btn" style={{ fontSize:13, padding:'8px 18px' }}>
              + Buat tagihan iuran
            </Link>
          </div>
        )}

        {/* Transaksi terakhir */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <p style={sHd}>Transaksi terakhir</p>
          <Link href="/kas" style={{ fontSize:12, color:'var(--teal)', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:2 }}>
            Lihat semua <ChevronRight size={13} />
          </Link>
        </div>

        {txns.length === 0 ? (
          <div className="card" style={{ padding:16, textAlign:'center', marginBottom:12 }}>
            <p style={{ fontSize:13, color:'var(--text3)', margin:'0 0 10px' }}>Belum ada transaksi</p>
            <Link href="/kas/tambah" className="btn" style={{ fontSize:13, padding:'8px 18px' }}>
              <Plus size={14} /> Catat transaksi
            </Link>
          </div>
        ) : (
          <div className="card" style={{ marginBottom:12 }}>
            {txns.map((e, i) => (
              <Link key={e.id} href={`/kas/${e.id}`} style={{ textDecoration:'none', color:'inherit', display:'block' }}>
                <div className="list-row" style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderBottom: i < txns.length-1 ? '1px solid var(--border)' : 'none' }}>
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
              </Link>
            ))}
          </div>
        )}

        <Link href="/kas/tambah" className="btn" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, width:'100%', marginTop:4, textDecoration:'none' }}>
          <Plus size={15} /> Catat transaksi
        </Link>
      </div>
      <BottomNav />
    </div>
  )
}

const sHd: React.CSSProperties = {
  fontSize:11, fontWeight:700, color:'var(--text3)',
  textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 8px',
}
