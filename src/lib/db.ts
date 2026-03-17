import { createServer } from './supabase/server'
import type { Neighborhood, VSaldo, VBillSummary, CashbookEntry, Member, ArisanGroup, Pengumuman } from './types'

// Ambil RT milik user yang sedang login
export async function getNeighborhood(): Promise<Neighborhood | null> {
  const sb = createServer()
  const { data: { session } } = await sb.auth.getSession()
  if (!session) return null

  const { data } = await sb
    .from('neighborhoods')
    .select('*')
    .eq('owner_id', session.user.id)
    .single()
  return data
}

// Ambil RT by ID (verifikasi kepemilikan)
export async function getNeighborhoodById(id: string): Promise<Neighborhood | null> {
  const sb = createServer()
  const { data } = await sb
    .from('neighborhoods')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

// Saldo kas
export async function getSaldo(nbId: string): Promise<VSaldo> {
  const sb = createServer()
  const { data } = await sb
    .from('v_saldo')
    .select('*')
    .eq('neighborhood_id', nbId)
    .single()
  return data ?? { neighborhood_id: nbId, total_masuk: 0, total_keluar: 0, saldo: 0 }
}

// Transaksi kas terbaru
export async function getCashbook(nbId: string, limit = 50): Promise<CashbookEntry[]> {
  const sb = createServer()
  const { data } = await sb
    .from('cashbook')
    .select('*')
    .eq('neighborhood_id', nbId)
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

// Daftar warga
export async function getMembers(nbId: string): Promise<Member[]> {
  const sb = createServer()
  const { data } = await sb
    .from('members')
    .select('*')
    .eq('neighborhood_id', nbId)
    .eq('status', 'aktif')
    .order('no_rumah')
  return data ?? []
}

// Tagihan aktif
export async function getBills(nbId: string): Promise<VBillSummary[]> {
  const sb = createServer()
  const { data } = await sb
    .from('v_bill_summary')
    .select('*')
    .eq('neighborhood_id', nbId)
    .order('jatuh_tempo', { ascending: false })
  return (data as VBillSummary[]) ?? []
}

// Tagihan + detail pembayaran per member
export async function getBillWithPayments(billId: string) {
  const sb = createServer()
  const { data: bill } = await sb
    .from('bills')
    .select('*')
    .eq('id', billId)
    .single()

  const { data: payments } = await sb
    .from('bill_payments')
    .select('*, members(id, nama, no_rumah, no_hp)')
    .eq('bill_id', billId)
    .order('created_at')

  return { bill, payments: payments ?? [] }
}

// Arisan groups
export async function getArisanGroups(nbId: string): Promise<ArisanGroup[]> {
  const sb = createServer()
  const { data } = await sb
    .from('arisan_groups')
    .select('*')
    .eq('neighborhood_id', nbId)
    .order('created_at', { ascending: false })
  return data ?? []
}

// Detail arisan + anggota + status bayar putaran ini
export async function getArisanDetail(groupId: string) {
  const sb = createServer()

  const { data: group } = await sb
    .from('arisan_groups')
    .select('*')
    .eq('id', groupId)
    .single()

  if (!group) return null

  const { data: members } = await sb
    .from('arisan_members')
    .select('*, members(id, nama, no_rumah, no_hp)')
    .eq('group_id', groupId)
    .order('urutan')

  const { data: payments } = await sb
    .from('arisan_payments')
    .select('*')
    .eq('group_id', groupId)
    .eq('putaran', group.putaran_ini)

  return { group, members: members ?? [], payments: payments ?? [] }
}

// Pengumuman
export async function getPengumuman(nbId: string): Promise<Pengumuman[]> {
  const sb = createServer()
  const { data } = await sb
    .from('pengumuman')
    .select('*')
    .eq('neighborhood_id', nbId)
    .order('disematkan', { ascending: false })
    .order('created_at', { ascending: false })
  return data ?? []
}
