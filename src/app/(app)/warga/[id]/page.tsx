import { getNeighborhood } from '@/lib/db'
import { createServer } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import EditWargaForm from './EditWargaForm'
import type { Member } from '@/lib/types'

export default async function WargaDetailPage({ params }: { params: { id: string } }) {
  const nb = await getNeighborhood()
  if (!nb) return null

  const sb = createServer()

  // Ambil data warga + riwayat pembayaran
  const { data: member } = await sb
    .from('members')
    .select('*')
    .eq('id', params.id)
    .eq('neighborhood_id', nb.id)
    .single()

  if (!member) return notFound()

  // Riwayat iuran warga ini
  const { data: payments } = await sb
    .from('bill_payments')
    .select('*, bills(judul, nominal, jatuh_tempo, periode)')
    .eq('member_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Riwayat arisan
  const { data: arisanPayments } = await sb
    .from('arisan_payments')
    .select('*, arisan_groups(nama, nominal)')
    .eq('member_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const lunasCount  = payments?.filter(p => p.status === 'lunas').length ?? 0
  const totalIuran  = payments?.length ?? 0

  return (
    <div className="page">
      {/* Header */}
      <div style={{ background: 'var(--teal)', padding: '48px 20px 20px', color: '#fff' }}>
        <Link href="/warga" style={{
          display: 'flex', alignItems: 'center', gap: 4,
          color: '#fff', textDecoration: 'none',
          marginBottom: 10, fontSize: 13, opacity: .8,
        }}>
          <ArrowLeft size={16} /> Kembali ke daftar warga
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, flexShrink: 0,
          }}>
            {member.nama.split(' ').slice(0,2).map((n: string) => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 3px' }}>{member.nama}</h1>
            <p style={{ fontSize: 13, opacity: .8, margin: 0 }}>
              No. {member.no_rumah ?? '—'} · {member.jumlah_jiwa} jiwa
              {member.status === 'pindah' && (
                <span style={{
                  marginLeft: 8, fontSize: 11, fontWeight: 700,
                  background: 'rgba(255,255,255,0.25)', padding: '2px 8px', borderRadius: 99,
                }}>Sudah pindah</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* Statistik bayar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Total iuran',  val: totalIuran },
            { label: 'Sudah lunas', val: lunasCount, color: '#16a34a' },
            { label: 'Belum lunas', val: totalIuran - lunasCount, color: totalIuran - lunasCount > 0 ? '#d97706' : 'var(--text)' },
          ].map(({ label, val, color }) => (
            <div key={label} className="card" style={{ padding: '10px 12px', textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: color ?? 'var(--text)', margin: '0 0 2px' }}>{val}</p>
              <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Form edit */}
        <EditWargaForm member={member as Member} />

        {/* Riwayat iuran */}
        {payments && payments.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <p style={sHd}>Riwayat iuran</p>
            <div className="card">
              {payments.map((p, i) => {
                const bill = p.bills as any
                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px',
                    borderBottom: i < payments.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {bill?.judul}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0 }}>
                        Rp {bill?.nominal?.toLocaleString('id-ID')}
                        {p.metode ? ` · ${p.metode}` : ''}
                      </p>
                    </div>
                    <span className={p.status === 'lunas' ? 'badge-ok' : 'badge-warn'}>
                      {p.status === 'lunas' ? 'Lunas' : 'Belum'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Riwayat arisan */}
        {arisanPayments && arisanPayments.length > 0 && (
          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <p style={sHd}>Riwayat arisan</p>
            <div className="card">
              {arisanPayments.map((p, i) => {
                const group = p.arisan_groups as any
                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px',
                    borderBottom: i < arisanPayments.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 1px' }}>
                        {group?.nama} · Putaran {p.putaran}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0 }}>
                        Rp {group?.nominal?.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <span className={p.status === 'lunas' ? 'badge-ok' : 'badge-warn'}>
                      {p.status === 'lunas' ? 'Lunas' : 'Belum'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

const sHd: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: 'var(--text3)',
  textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 8px',
}
