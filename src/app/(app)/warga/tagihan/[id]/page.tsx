import { getNeighborhood } from '@/lib/db'
import { createServer } from '@/lib/supabase/server'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import { rp, inisial, avatarColor, persen, tgl } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import TandaiLunasButtons from './TandaiLunasButtons'
import { notFound } from 'next/navigation'

export default async function DetailTagihanPage({ params }: { params: { id: string } }) {
  const nb = await getNeighborhood()
  if (!nb) return null

  const sb = createServer()

  const { data: bill } = await sb
    .from('bills')
    .select('*')
    .eq('id', params.id)
    .eq('neighborhood_id', nb.id)
    .single()

  if (!bill) return notFound()

  const { data: payments } = await sb
    .from('bill_payments')
    .select('*, members(id, nama, no_rumah, no_hp)')
    .eq('bill_id', bill.id)
    .order('created_at')

  const list = payments ?? []
  const lunas = list.filter(p => p.status === 'lunas').length
  const prog  = persen(lunas, list.length)
  const terkumpul = lunas * bill.nominal

  return (
    <div className="page">
      <div style={{ background:'var(--teal)', padding:'48px 20px 20px', color:'#fff' }}>
        <Link href="/warga" style={{ display:'flex', alignItems:'center', gap:4, color:'#fff', textDecoration:'none', marginBottom:8, fontSize:13, opacity:.8 }}>
          <ArrowLeft size={16} /> Kembali
        </Link>
        <h1 style={{ fontSize:18, fontWeight:700, margin:'0 0 4px' }}>{bill.judul}</h1>
        <p style={{ fontSize:13, opacity:.8, margin:0 }}>
          {rp(bill.nominal)}/KK · Tenggat {tgl(bill.jatuh_tempo)}
        </p>
      </div>

      <div style={{ padding:'16px 16px 0' }}>
        {/* Summary */}
        <div className="card" style={{ padding:14, marginBottom:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:10 }}>
            {[
              { label:'Terkumpul',   val: rp(terkumpul),       color:'#16a34a' },
              { label:'Sudah lunas', val: lunas + ' KK',        color:'var(--teal)' },
              { label:'Belum lunas', val: (list.length-lunas) + ' KK', color:'#d97706' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ textAlign:'center' }}>
                <p style={{ fontSize:15, fontWeight:700, color, margin:'0 0 2px' }}>{val}</p>
                <p style={{ fontSize:10, color:'var(--text3)', margin:0 }}>{label}</p>
              </div>
            ))}
          </div>
          <div className="progress"><div className="progress-bar" style={{ width: prog+'%' }} /></div>
          <p style={{ fontSize:11, color:'var(--text3)', margin:'4px 0 0', textAlign:'right' }}>{prog}% lunas</p>
        </div>

        {/* Warga list */}
        <p style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:8 }}>
          Status per warga
        </p>
        <div className="card">
          {list.map((p, i) => {
            const member = p.members as any
            return (
              <div key={p.id} style={{
                display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                borderBottom: i < list.length-1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background: avatarColor(member?.nama??''), display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>
                  {inisial(member?.nama??'?')}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, margin:'0 0 1px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {member?.nama}
                  </p>
                  <p style={{ fontSize:11, color:'var(--text3)', margin:0 }}>
                    No. {member?.no_rumah ?? '—'}
                    {p.status === 'lunas' && p.metode ? ` · ${p.metode}` : ''}
                  </p>
                </div>
                {p.status === 'lunas'
                  ? <span className="badge-ok">Lunas</span>
                  : <TandaiLunasButtons paymentId={p.id} />
                }
              </div>
            )
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
