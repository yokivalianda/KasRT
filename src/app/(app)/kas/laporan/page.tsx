import { getNeighborhood, getSaldo, getCashbook } from '@/lib/db'
import { createServer } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import LaporanView from './LaporanView'

interface Props {
  searchParams: { bulan?: string }
}

export default async function LaporanPage({ searchParams }: Props) {
  const nb = await getNeighborhood()
  if (!nb) return notFound()

  // Default ke bulan ini kalau tidak ada parameter
  const bulan = searchParams.bulan ?? new Date().toISOString().slice(0, 7)
  const [tahun, bln] = bulan.split('-').map(Number)

  const sb = createServer()

  // Ambil transaksi bulan yang dipilih
  const { data: txns } = await sb
    .from('cashbook')
    .select('*')
    .eq('neighborhood_id', nb.id)
    .gte('tanggal', `${bulan}-01`)
    .lte('tanggal', `${bulan}-${new Date(tahun, bln, 0).getDate()}`)
    .order('tanggal')
    .order('created_at')

  // Saldo sebelum bulan ini (kumulatif)
  const { data: sebelumnya } = await sb
    .from('cashbook')
    .select('tipe, jumlah')
    .eq('neighborhood_id', nb.id)
    .lt('tanggal', `${bulan}-01`)

  const saldoAwal = (sebelumnya ?? []).reduce((s, t) =>
    s + (t.tipe === 'masuk' ? t.jumlah : -t.jumlah), 0
  )

  const list = txns ?? []
  const masuk  = list.filter(t => t.tipe === 'masuk').reduce((s, t) => s + t.jumlah, 0)
  const keluar = list.filter(t => t.tipe === 'keluar').reduce((s, t) => s + t.jumlah, 0)
  const saldoAkhir = saldoAwal + masuk - keluar

  // Nama bulan Indonesia
  const BULAN_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
  const namaBulan = `${BULAN_ID[bln - 1]} ${tahun}`

  // Daftar bulan tersedia (untuk selector)
  const { data: bulanTersedia } = await sb
    .from('cashbook')
    .select('tanggal')
    .eq('neighborhood_id', nb.id)
    .order('tanggal', { ascending: false })

  const uniqueBulan = [...new Set(
    (bulanTersedia ?? []).map(t => t.tanggal.slice(0, 7))
  )].slice(0, 24) // Maks 24 bulan terakhir

  // Tambahkan bulan ini jika belum ada
  if (!uniqueBulan.includes(bulan)) uniqueBulan.unshift(bulan)

  return (
    <LaporanView
      nb={nb}
      bulan={bulan}
      namaBulan={namaBulan}
      txns={list}
      saldoAwal={saldoAwal}
      totalMasuk={masuk}
      totalKeluar={keluar}
      saldoAkhir={saldoAkhir}
      uniqueBulan={uniqueBulan}
    />
  )
}
