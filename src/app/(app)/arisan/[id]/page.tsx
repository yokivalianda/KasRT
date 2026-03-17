import { getArisanDetail } from '@/lib/db'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import { rp, rpCompact, inisial, avatarColor, persen } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import TandaiArisanButtons from './TandaiArisanButtons'
import { notFound } from 'next/navigation'

export default async function ArisanDetailPage({ params }: { params: { id: string } }) {
  const detail = await getArisanDetail(params.id)
  if (!detail) return notFound()

  const { group, members, payments } = detail
  const paidSet = new Set(payments.filter(p => p.status==='lunas').map(p => p.member_id))
  const paidCount = paidSet.size
  const totalCount = members.length
  const prog = persen(paidCount, totalCount)
  const pemenang = members.find(m => m.urutan === group.putaran_ini)

  return (
    <div className="page">
      <div style={{ background:'var(--teal)', padding:'48px 20px 20px', color:'#fff' }}>
        <Link href="/arisan" style={{ display:'flex', alignItems:'center', gap:4, color:'#fff', textDecoration:'none', marginBottom:8, fontSize:13, opacity:.8 }}>
          <ArrowLeft size={16} /> Kembali
        </Link>
        <h1 style={{ fontSize:20, fontWeight:700, margin:'0 0 4px' }}>{group.nama}</h1>
        <p style={{ fontSize:13, opacity:.8, margin:0 }}>
          {rp(group.nominal)}/putaran · {group.frekuensi}
        </p>
      </div>

      <div style={{ padding:'16px 16px 0' }}>
        {/* Round info */}
        <div className="card" style={{ padding:16, marginBottom:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <div>
              <p style={{ fontSize:14, fontWeight:700, margin:'0 0 2px' }}>Putaran ke-{group.putaran_ini}</p>
              <p style={{ fontSize:12, color:'var(--text3)', margin:0 }}>dari {group.total_putaran} putaran total</p>
            </div>
            <span className={totalCount - paidCount > 0 ? 'badge-warn' : 'badge-ok'}>
              {totalCount - paidCount > 0 ? `${totalCount-paidCount} belum` : 'Semua lunas'}
            </span>
          </div>
          <div className="progress" style={{ marginBottom:6 }}>
            <div className="progress-bar" style={{ width: prog+'%' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom: pemenang ? 12 : 0 }}>
            <span style={{ fontSize:11, color:'var(--text3)' }}>{paidCount}/{totalCount} bayar</span>
            <span style={{ fontSize:11, fontWeight:600, color:'var(--teal)' }}>
              {rpCompact(paidCount * group.nominal)} terkumpul
            </span>
          </div>

          {pemenang && (
            <div style={{ display:'flex', alignItems:'center', gap:10, background:'var(--teal-light)', borderRadius:10, padding:'10px 12px' }}>
              <span style={{ fontSize:20 }}>🎉</span>
              <div>
                <p style={{ fontSize:11, fontWeight:600, color:'var(--teal-dark,#0a7259)', margin:'0 0 1px' }}>Pemenang putaran ini:</p>
                <p style={{ fontSize:15, fontWeight:700, color:'var(--teal-dark,#0a7259)', margin:0 }}>
                  {(pemenang.members as any)?.nama ?? '—'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Member list */}
        <p style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:8 }}>
          Anggota & status bayar
        </p>
        <div className="card" style={{ marginBottom:12 }}>
          {members.map((am, i) => {
            const member = (am.members as any)
            const paid   = paidSet.has(am.member_id)
            const payment = payments.find(p => p.member_id === am.member_id)
            return (
              <div key={am.id} style={{
                display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                borderBottom: i < members.length-1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background: avatarColor(member?.nama??''), display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
                  {inisial(member?.nama??'?')}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:600, margin:'0 0 1px' }}>
                    {member?.nama}
                    {am.urutan === group.putaran_ini && (
                      <span style={{ fontSize:10, background:'var(--teal-light)', color:'var(--teal-dark,#0a7259)', padding:'1px 6px', borderRadius:99, marginLeft:6 }}>giliran ini</span>
                    )}
                  </p>
                  <p style={{ fontSize:11, color:'var(--text3)', margin:0 }}>Urutan ke-{am.urutan}</p>
                </div>
                {payment && !paid && (
                  <TandaiArisanButtons paymentId={payment.id} />
                )}
                {paid && <span className="badge-ok">Lunas</span>}
                {!payment && !paid && <span className="badge-warn">Belum</span>}
              </div>
            )
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
