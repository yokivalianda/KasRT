'use server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

function sb() {
  return createServerComponentClient({ cookies })
}

async function getNbId(): Promise<string> {
  const supabase = sb()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Tidak ada sesi')
  const { data } = await supabase
    .from('neighborhoods')
    .select('id')
    .eq('owner_id', session.user.id)
    .single()
  if (!data) throw new Error('RT tidak ditemukan')
  return data.id
}

// ─── ONBOARDING ──────────────────────────────────────────────
export async function buatRT(fd: FormData) {
  const supabase = sb()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Tidak ada sesi' }

  const { error } = await supabase.from('neighborhoods').insert({
    owner_id:  session.user.id,
    nama:      fd.get('nama') as string,
    rw:        fd.get('rw') as string || null,
    kelurahan: fd.get('kelurahan') as string || null,
    kecamatan: fd.get('kecamatan') as string || null,
    kota:      fd.get('kota') as string || null,
    provinsi:  fd.get('provinsi') as string || null,
  })
  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { ok: true }
}

// ─── WARGA ───────────────────────────────────────────────────
export async function tambahWarga(fd: FormData) {
  try {
    const nbId = await getNbId()
    const { error } = await sb().from('members').insert({
      neighborhood_id: nbId,
      nama:         fd.get('nama') as string,
      no_rumah:     fd.get('no_rumah') as string || null,
      jumlah_jiwa:  parseInt(fd.get('jumlah_jiwa') as string) || 1,
      no_hp:        fd.get('no_hp') as string || null,
      alamat:       fd.get('alamat') as string || null,
    })
    if (error) return { error: error.message }
    revalidatePath('/warga')
    return { ok: true }
  } catch (e: any) { return { error: e.message } }
}

export async function hapusWarga(memberId: string) {
  try {
    const { error } = await sb()
      .from('members')
      .update({ status: 'pindah' })
      .eq('id', memberId)
    if (error) return { error: error.message }
    revalidatePath('/warga')
    return { ok: true }
  } catch (e: any) { return { error: e.message } }
}

// ─── KAS ─────────────────────────────────────────────────────
export async function tambahTransaksi(fd: FormData) {
  try {
    const nbId = await getNbId()
    const supabase = sb()
    const { data: { session } } = await supabase.auth.getSession()

    const { error } = await supabase.from('cashbook').insert({
      neighborhood_id: nbId,
      tipe:        fd.get('tipe') as string,
      jumlah:      parseInt(fd.get('jumlah') as string),
      keterangan:  fd.get('keterangan') as string,
      kategori:    fd.get('kategori') as string || 'lain-lain',
      tanggal:     fd.get('tanggal') as string,
      created_by:  session?.user.id,
    })
    if (error) return { error: error.message }
    revalidatePath('/kas')
    revalidatePath('/dashboard')
    return { ok: true }
  } catch (e: any) { return { error: e.message } }
}

export async function hapusTransaksi(id: string) {
  try {
    const { error } = await sb().from('cashbook').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/kas')
    revalidatePath('/dashboard')
    return { ok: true }
  } catch (e: any) { return { error: e.message } }
}

// ─── TAGIHAN ─────────────────────────────────────────────────
export async function buatTagihan(fd: FormData) {
  try {
    const nbId = await getNbId()
    const supabase = sb()
    const { data: { session } } = await supabase.auth.getSession()

    // Trigger auto_bill_payments akan jalan otomatis
    const { error } = await supabase.from('bills').insert({
      neighborhood_id: nbId,
      judul:       fd.get('judul') as string,
      nominal:     parseInt(fd.get('nominal') as string),
      jatuh_tempo: fd.get('jatuh_tempo') as string,
      periode:     fd.get('periode') as string || null,
      created_by:  session?.user.id,
    })
    if (error) return { error: error.message }
    revalidatePath('/warga')
    return { ok: true }
  } catch (e: any) { return { error: e.message } }
}

export async function tandaiLunas(paymentId: string, metode: string) {
  try {
    const { error } = await sb()
      .from('bill_payments')
      .update({ status: 'lunas', metode, dibayar_at: new Date().toISOString() })
      .eq('id', paymentId)
    if (error) return { error: error.message }
    revalidatePath('/warga')
    return { ok: true }
  } catch (e: any) { return { error: e.message } }
}

export async function tandaiBelumLunas(paymentId: string) {
  try {
    const { error } = await sb()
      .from('bill_payments')
      .update({ status: 'belum', metode: null, dibayar_at: null })
      .eq('id', paymentId)
    if (error) return { error: error.message }
    revalidatePath('/warga')
    return { ok: true }
  } catch (e: any) { return { error: e.message } }
}

// ─── ARISAN ──────────────────────────────────────────────────
export async function buatArisan(fd: FormData, memberIds: string[]) {
  try {
    const nbId = await getNbId()
    const supabase = sb()
    const { data: { session } } = await supabase.auth.getSession()

    // Buat grup
    const { data: group, error: gErr } = await supabase
      .from('arisan_groups')
      .insert({
        neighborhood_id: nbId,
        nama:          fd.get('nama') as string,
        nominal:       parseInt(fd.get('nominal') as string),
        frekuensi:     fd.get('frekuensi') as string,
        total_putaran: memberIds.length,
        tgl_kocok:     fd.get('tgl_kocok') as string || null,
        created_by:    session?.user.id,
      })
      .select()
      .single()

    if (gErr || !group) return { error: gErr?.message ?? 'Gagal buat grup' }

    // Kocok urutan
    const shuffled = [...memberIds].sort(() => Math.random() - 0.5)

    // Insert anggota
    const { error: mErr } = await supabase.from('arisan_members').insert(
      shuffled.map((mid, i) => ({
        group_id: group.id, member_id: mid, urutan: i + 1,
      }))
    )
    if (mErr) return { error: mErr.message }

    // Buat pembayaran putaran 1
    const { error: pErr } = await supabase.from('arisan_payments').insert(
      memberIds.map(mid => ({
        group_id: group.id, member_id: mid, putaran: 1,
      }))
    )
    if (pErr) return { error: pErr.message }

    revalidatePath('/arisan')
    return { ok: true, id: group.id }
  } catch (e: any) { return { error: e.message } }
}

export async function tandaiArisanLunas(paymentId: string, metode: string) {
  try {
    const { error } = await sb()
      .from('arisan_payments')
      .update({ status: 'lunas', metode, dibayar_at: new Date().toISOString() })
      .eq('id', paymentId)
    if (error) return { error: error.message }
    revalidatePath('/arisan')
    return { ok: true }
  } catch (e: any) { return { error: e.message } }
}

export async function nextPutaranArisan(groupId: string, currentRound: number, totalRounds: number) {
  try {
    if (currentRound >= totalRounds) {
      // Arisan selesai
      const { error } = await sb()
        .from('arisan_groups')
        .update({ status: 'selesai' })
        .eq('id', groupId)
      if (error) return { error: error.message }
    } else {
      const nextRound = currentRound + 1
      const supabase = sb()

      // Update putaran
      const { error: uErr } = await supabase
        .from('arisan_groups')
        .update({ putaran_ini: nextRound })
        .eq('id', groupId)
      if (uErr) return { error: uErr.message }

      // Ambil semua anggota
      const { data: members } = await supabase
        .from('arisan_members')
        .select('member_id')
        .eq('group_id', groupId)

      // Buat pembayaran putaran baru
      if (members) {
        const { error: pErr } = await supabase.from('arisan_payments').insert(
          members.map(m => ({
            group_id: groupId, member_id: m.member_id, putaran: nextRound,
          }))
        )
        if (pErr) return { error: pErr.message }
      }
    }

    revalidatePath('/arisan')
    revalidatePath(`/arisan/${groupId}`)
    return { ok: true }
  } catch (e: any) { return { error: e.message } }
}

// ─── PENGUMUMAN ───────────────────────────────────────────────
export async function buatPengumuman(fd: FormData) {
  try {
    const nbId = await getNbId()
    const supabase = sb()
    const { data: { session } } = await supabase.auth.getSession()

    const { error } = await supabase.from('pengumuman').insert({
      neighborhood_id: nbId,
      judul:       fd.get('judul') as string,
      isi:         fd.get('isi') as string || null,
      disematkan:  fd.get('disematkan') === 'true',
      created_by:  session?.user.id,
    })
    if (error) return { error: error.message }
    revalidatePath('/pengumuman')
    return { ok: true }
  } catch (e: any) { return { error: e.message } }
}

export async function hapusPengumuman(id: string) {
  try {
    const { error } = await sb().from('pengumuman').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/pengumuman')
    return { ok: true }
  } catch (e: any) { return { error: e.message } }
}
