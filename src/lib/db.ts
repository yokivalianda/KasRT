import { createServer } from './supabase/server'
import { cache } from 'react'
import type { Neighborhood, VSaldo, VBillSummary, CashbookEntry, Member, ArisanGroup, Pengumuman } from './types'

// React cache() — deduplicate requests dalam satu render cycle
// Kalau dashboard dan layout keduanya panggil getNeighborhood(),
// Supabase hanya dipanggil SEKALI

export const getNeighborhood = cache(async (): Promise<Neighborhood | null> => {
  const sb = createServer()
  const { data: { session } } = await sb.auth.getSession()
  if (!session) return null
  const { data } = await sb
    .from('neighborhoods')
    .select('*')
    .eq('owner_id', session.user.id)
    .single()
  return data
})

export const getSaldo = cache(async (nbId: string): Promise<VSaldo> => {
  const sb = createServer()
  const { data } = await sb
    .from('v_saldo')
    .select('*')
    .eq('neighborhood_id', nbId)
    .single()
  return data ?? { neighborhood_id: nbId, total_masuk: 0, total_keluar: 0, saldo: 0 }
})

export const getCashbook = cache(async (nbId: string, limit = 50): Promise<CashbookEntry[]> => {
  const sb = createServer()
  const { data } = await sb
    .from('cashbook')
    .select('*')
    .eq('neighborhood_id', nbId)
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
})

export const getMembers = cache(async (nbId: string): Promise<Member[]> => {
  const sb = createServer()
  const { data } = await sb
    .from('members')
    .select('*')
    .eq('neighborhood_id', nbId)
    .eq('status', 'aktif')
    .order('no_rumah')
  return data ?? []
})

export const getBills = cache(async (nbId: string): Promise<VBillSummary[]> => {
  const sb = createServer()
  const { data } = await sb
    .from('v_bill_summary')
    .select('*')
    .eq('neighborhood_id', nbId)
    .order('jatuh_tempo', { ascending: false })
  return (data as VBillSummary[]) ?? []
})

export async function getBillWithPayments(billId: string) {
  const sb = createServer()
  const { data: bill } = await sb
    .from('bills').select('*').eq('id', billId).single()
  const { data: payments } = await sb
    .from('bill_payments')
    .select('*, members(id, nama, no_rumah, no_hp)')
    .eq('bill_id', billId)
    .order('created_at')
  return { bill, payments: payments ?? [] }
}

export const getArisanGroups = cache(async (nbId: string): Promise<ArisanGroup[]> => {
  const sb = createServer()
  const { data } = await sb
    .from('arisan_groups')
    .select('*')
    .eq('neighborhood_id', nbId)
    .order('created_at', { ascending: false })
  return data ?? []
})

export async function getArisanDetail(groupId: string) {
  const sb = createServer()
  const { data: group } = await sb
    .from('arisan_groups').select('*').eq('id', groupId).single()
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

export const getPengumuman = cache(async (nbId: string): Promise<Pengumuman[]> => {
  const sb = createServer()
  const { data } = await sb
    .from('pengumuman')
    .select('*')
    .eq('neighborhood_id', nbId)
    .order('disematkan', { ascending: false })
    .order('created_at', { ascending: false })
  return data ?? []
})
