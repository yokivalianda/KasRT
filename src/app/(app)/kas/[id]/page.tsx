import { getNeighborhood } from '@/lib/db'
import { createServer } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import EditTransaksiForm from './EditTransaksiForm'

export default async function EditTransaksiPage({ params }: { params: { id: string } }) {
  const nb = await getNeighborhood()
  if (!nb) return null

  const sb = createServer()
  const { data: txn } = await sb
    .from('cashbook')
    .select('*')
    .eq('id', params.id)
    .eq('neighborhood_id', nb.id)
    .single()

  if (!txn) return notFound()

  return (
    <div className="page">
      <div style={{ background: 'var(--teal)', padding: '48px 20px 20px', color: '#fff' }}>
        <Link href="/kas" style={{
          display: 'flex', alignItems: 'center', gap: 4,
          color: '#fff', textDecoration: 'none',
          marginBottom: 10, fontSize: 13, opacity: .8,
        }}>
          <ArrowLeft size={16} /> Kembali ke buku kas
        </Link>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Edit Transaksi</h1>
      </div>
      <div style={{ padding: '20px 16px 0' }}>
        <EditTransaksiForm txn={txn} />
      </div>
    </div>
  )
}
