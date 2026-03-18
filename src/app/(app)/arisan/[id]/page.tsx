import { getArisanDetail } from '@/lib/db'
import { createServer } from '@/lib/supabase/server'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import { rp, rpCompact, inisial, avatarColor, persen } from '@/lib/utils'
import { ArrowLeft, Trophy } from 'lucide-react'
import TandaiArisanButtons from './TandaiArisanButtons'
import NextPutaranButton from './NextPutaranButton'
import { notFound } from 'next/navigation'

export default async function ArisanDetailPage({ params }: { params: { id: string } }) {
  const detail = await getArisanDetail(params.id)
  if (!detail) return notFound()

  const { group, members, payments } = detail
  const paidSet   = new Set(payments.filter(p => p.status === 'lunas').map(p => p.member_id))
  const paidCount = paidSet.size
  const totalCount = members.length
  const prog      = persen(paidCount, totalCount)
  const semuaLunas = paidCount === totalCount && totalCount > 0
  const isSelesai  = group.status === 'selesai'
  const isLast     = group.putaran_ini >= group.total_putaran
  const pemenang   = members.find(m => m.urutan === group.putaran_ini)

  // Ambil semua riwayat pemenang (urutan <= putaran sekarang yang sudah selesai)
  const sb = createServer()
  const { data: allPayments } = await sb
    .from('arisan_payments')
    .select('putaran, status, member_id')
    .eq('group_id', group.id)
    .order('putaran')

  // Kelompokkan per putaran
  const putaranSelesai = new Set<number>()
  allPayments?.forEach(p => {
    if (p.status === 'lunas') putaranSelesai.add(p.putaran)
  })

  const headerBg = isSelesai
    ? 'linear-gradient(135deg, #059669, #047857)'
    : 'var(--teal)'

  return (
    <div className="page">
      {/* Header */}
      <div style={{ background: headerBg, padding: '48px 20px 20px', color: '#fff' }}>
        <Link href="/arisan" style={{ display:'flex', alignItems:'center', gap:4, color:'#fff', textDecoration:'none', marginBottom:8, fontSize:13, opacity:.8 }}>
          <ArrowLeft size={16} /> Kembali ke daftar arisan
        </Link>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h1 style={{ fontSize:20, fontWeight:700, margin:'0 0 4px' }}>{group.nama}</h1>
            <p style={{ fontSize:13, opacity:.8, margin:0 }}>
              {rp(group.nominal)}/putaran · {group.frekuensi}
            </p>
          </div>
          {isSelesai && (
            <div style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(255,255,255,.2)', padding:'5px 10px', borderRadius:99, fontSize:12, fontWeight:700 }}>
              <Trophy size={13} /> Selesai
            </div>
          )}
        </div>
      </div>

      <div style={{ padding:'16px 16px 0' }}>

        {/* Banner arisan selesai */}
        {isSelesai && (
          <div style={{
            background:'linear-gradient(135deg, #ecfdf5, #d1fae5)',
            border:'1px solid #a7f3d0', borderRadius:14, padding:16, marginBottom:14,
            display:'flex', alignItems:'center', gap:14,
            animation:'fadeUp .3s ease-out both',
          }}>
            <span style={{ fontSize:36 }}>🏆</span>
            <div>
              <p style={{ fontSize:15, fontWeight:800, color:'#065f46', margin:'0 0 3px' }}>
                Arisan selesai!
              </p>
              <p style={{ fontSize:13, color:'#059669', margin:0, lineHeight:1.5 }}>
                Semua {group.total_putaran} putaran sudah tuntas.
                Total arisan: {rp(group.nominal * group.total_putaran * totalCount)}.
              </p>
            </div>
          </div>
        )}

        {/* Info putaran */}
        <div className="card" style={{ padding:16, marginBottom:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
            <div>
              <p style={{ fontSize:14, fontWeight:700, margin:'0 0 2px' }}>
                {isSelesai ? `Putaran terakhir (${group.total_putaran})` : `Putaran ke-${group.putaran_ini}`}
              </p>
              <p style={{ fontSize:12, color:'var(--text3)', margin:0 }}>
                dari {group.total_putaran} putaran total
              </p>
            </div>
            <span className={isSelesai ? 'badge-ok' : semuaLunas ? 'badge-ok' : totalCount - paidCount > 0 ? 'badge-warn' : 'badge-ok'}>
              {isSelesai ? 'Selesai' : semuaLunas ? 'Semua lunas' : `${totalCount - paidCount} belum`}
            </span>
          </div>

          {/* Progress bar multi-putaran */}
          <div style={{ marginBottom:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:11, color:'var(--text3)' }}>Progress arisan keseluruhan</span>
              <span style={{ fontSize:11, fontWeight:600, color: isSelesai ? '#059669' : 'var(--teal)' }}>
                {isSelesai ? group.total_putaran : group.putaran_ini - 1}/{group.total_putaran} putaran
              </span>
            </div>
            <div className="progress">
              <div className="progress-bar" style={{
                width: persen(isSelesai ? group.total_putaran : group.putaran_ini - 1, group.total_putaran) + '%',
                background: isSelesai ? '#059669' : undefined,
              }} />
            </div>
          </div>

          {/* Progress bayar putaran ini */}
          {!isSelesai && (
            <div style={{ marginBottom: pemenang ? 12 : 0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:11, color:'var(--text3)' }}>Pembayaran putaran ini</span>
                <span style={{ fontSize:11, fontWeight:600, color:'var(--teal)' }}>
                  {rpCompact(paidCount * group.nominal)} terkumpul
                </span>
              </div>
              <div className="progress">
                <div className="progress-bar" style={{ width: prog + '%' }} />
              </div>
              <p style={{ fontSize:11, color:'var(--text3)', margin:'3px 0 0' }}>
                {paidCount}/{totalCount} anggota sudah bayar
              </p>
            </div>
          )}

          {/* Pemenang putaran ini */}
          {pemenang && !isSelesai && (
            <div style={{ display:'flex', alignItems:'center', gap:10, background:'var(--teal-light)', borderRadius:10, padding:'10px 12px', marginTop:10 }}>
              <span style={{ fontSize:20 }}>🎉</span>
              <div>
                <p style={{ fontSize:11, fontWeight:600, color:'var(--teal-dark,#0a7259)', margin:'0 0 1px' }}>
                  Yang mendapat arisan putaran ini:
                </p>
                <p style={{ fontSize:15, fontWeight:700, color:'var(--teal-dark,#0a7259)', margin:0 }}>
                  {(pemenang.members as any)?.nama ?? '—'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tombol lanjut putaran — hanya tampil kalau belum selesai */}
        {!isSelesai && (
          <div style={{ marginBottom:14 }}>
            <NextPutaranButton
              groupId={group.id}
              currentRound={group.putaran_ini}
              totalRounds={group.total_putaran}
              pemenangNama={(pemenang?.members as any)?.nama ?? ''}
              semualunas={semuaLunas}
            />
          </div>
        )}

        {/* Daftar anggota + status bayar */}
        <p style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:8 }}>
          Anggota & status bayar ({totalCount} orang)
        </p>
        <div className="card" style={{ marginBottom:14 }}>
          {members.map((am, i) => {
            const member  = (am.members as any)
            const paid    = paidSet.has(am.member_id)
            const payment = payments.find(p => p.member_id === am.member_id)
            const isWinner = am.urutan === group.putaran_ini

            return (
              <div key={am.id} style={{
                display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                borderBottom: i < members.length - 1 ? '1px solid var(--border)' : 'none',
                background: isWinner && !isSelesai ? 'rgba(15,158,120,0.04)' : 'transparent',
              }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background: avatarColor(member?.nama??''), display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
                  {inisial(member?.nama??'?')}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {member?.nama}
                    {isWinner && !isSelesai && (
                      <span style={{ fontSize:10, background:'var(--teal-light)', color:'var(--teal-dark,#0a7259)', padding:'1px 7px', borderRadius:99, marginLeft:6, fontWeight:700 }}>
                        giliran ini
                      </span>
                    )}
                  </p>
                  <p style={{ fontSize:11, color:'var(--text3)', margin:0 }}>
                    Urutan ke-{am.urutan}
                    {am.sudah_menang && am.menang_putaran
                      ? ` · Menang putaran ${am.menang_putaran}`
                      : am.urutan < group.putaran_ini
                        ? ' · Sudah dapat'
                        : ''}
                  </p>
                </div>
                {/* Status tombol — kalau selesai atau sudah bayar, badge saja */}
                {isSelesai || am.sudah_menang ? (
                  <span className="badge-ok">
                    {am.sudah_menang ? `Putaran ${am.menang_putaran}` : paid ? 'Lunas' : 'Selesai'}
                  </span>
                ) : paid ? (
                  <span className="badge-ok">Lunas</span>
                ) : payment ? (
                  <TandaiArisanButtons paymentId={payment.id} />
                ) : (
                  <span className="badge-warn">Belum</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Riwayat putaran selesai */}
        {group.putaran_ini > 1 && (
          <div style={{ marginBottom:16 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:8 }}>
              Riwayat putaran
            </p>
            <div className="card">
              {Array.from({ length: isSelesai ? group.total_putaran : group.putaran_ini - 1 }, (_, i) => {
                const p = i + 1
                const pemenangPutaran = members.find(m => m.urutan === p)
                return (
                  <div key={p} style={{
                    display:'flex', alignItems:'center', gap:12, padding:'9px 14px',
                    borderBottom: i < (isSelesai ? group.total_putaran : group.putaran_ini - 1) - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--teal-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'var(--teal)', flexShrink:0 }}>
                      {p}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:600, margin:'0 0 1px' }}>
                        {(pemenangPutaran?.members as any)?.nama ?? '—'}
                      </p>
                      <p style={{ fontSize:11, color:'var(--text3)', margin:0 }}>
                        Putaran ke-{p} · {rp(group.nominal * totalCount)}
                      </p>
                    </div>
                    <span className="badge-ok">✓</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  )
}
