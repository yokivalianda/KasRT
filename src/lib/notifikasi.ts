import type { Notif } from '@/components/NotifikasiBell'

interface TagihanData {
  id: string
  judul: string
  jatuh_tempo: string
  belum_lunas: number
  total_warga: number
  status: string
}

interface ArisanData {
  id: string
  nama: string
  putaran_ini: number
  belum_bayar: number
  total_anggota: number
}

function tglIndo(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })
}

function selisihHari(dateStr: string): number {
  const now  = new Date()
  now.setHours(0, 0, 0, 0)
  const tgt  = new Date(dateStr)
  tgt.setHours(0, 0, 0, 0)
  return Math.round((tgt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function generateNotifs(
  tagihan: TagihanData[],
  arisan: ArisanData[],
): Notif[] {
  const notifs: Notif[] = []

  // ── TAGIHAN ────────────────────────────────────────────────
  for (const t of tagihan) {
    if (t.status !== 'buka') continue

    const hari = selisihHari(t.jatuh_tempo)
    const pct  = t.total_warga > 0 ? Math.round((t.belum_lunas / t.total_warga) * 100) : 0

    if (hari < 0) {
      // Sudah lewat jatuh tempo
      notifs.push({
        id: `bill-overdue-${t.id}`,
        tipe: 'urgent',
        judul: `Tagihan lewat jatuh tempo!`,
        pesan: `${t.judul} — ${t.belum_lunas} warga belum lunas. Jatuh tempo ${tglIndo(t.jatuh_tempo)}.`,
        href: `/warga/tagihan/${t.id}`,
        tanggal: `Terlambat ${Math.abs(hari)} hari`,
      })
    } else if (hari <= 3 && t.belum_lunas > 0) {
      // Jatuh tempo ≤3 hari, masih ada yang belum
      notifs.push({
        id: `bill-due-soon-${t.id}`,
        tipe: 'urgent',
        judul: `Tagihan jatuh tempo ${hari === 0 ? 'hari ini' : `${hari} hari lagi`}`,
        pesan: `${t.judul} — ${t.belum_lunas} dari ${t.total_warga} warga belum lunas.`,
        href: `/warga/tagihan/${t.id}`,
        tanggal: `Tenggat ${tglIndo(t.jatuh_tempo)}`,
      })
    } else if (hari <= 7 && t.belum_lunas > 0) {
      // Jatuh tempo ≤7 hari
      notifs.push({
        id: `bill-week-${t.id}`,
        tipe: 'warning',
        judul: `Tagihan jatuh tempo ${hari} hari lagi`,
        pesan: `${t.judul} — ${t.belum_lunas} warga (${pct}%) belum lunas.`,
        href: `/warga/tagihan/${t.id}`,
        tanggal: `Tenggat ${tglIndo(t.jatuh_tempo)}`,
      })
    } else if (t.belum_lunas > 0 && pct > 50) {
      // Lebih dari setengah belum bayar
      notifs.push({
        id: `bill-half-${t.id}`,
        tipe: 'warning',
        judul: `${pct}% warga belum bayar iuran`,
        pesan: `${t.judul} — ${t.belum_lunas} dari ${t.total_warga} warga belum lunas.`,
        href: `/warga/tagihan/${t.id}`,
        tanggal: `Tenggat ${tglIndo(t.jatuh_tempo)}`,
      })
    } else if (t.belum_lunas === 0) {
      // Semua lunas — info positif
      notifs.push({
        id: `bill-done-${t.id}`,
        tipe: 'info',
        judul: `Tagihan ${t.judul} lunas semua! 🎉`,
        pesan: `Semua ${t.total_warga} warga sudah bayar. Tagihan bisa ditutup.`,
        href: `/warga/tagihan/${t.id}`,
      })
    }
  }

  // ── ARISAN ─────────────────────────────────────────────────
  for (const a of arisan) {
    if (a.belum_bayar > 0) {
      const pct = a.total_anggota > 0 ? Math.round((a.belum_bayar / a.total_anggota) * 100) : 0
      notifs.push({
        id: `arisan-unpaid-${a.id}-${a.putaran_ini}`,
        tipe: pct > 60 ? 'warning' : 'info',
        judul: `${a.belum_bayar} anggota arisan belum bayar`,
        pesan: `${a.nama} putaran ke-${a.putaran_ini} — ${a.belum_bayar} dari ${a.total_anggota} belum setor.`,
        href: `/arisan/${a.id}`,
      })
    } else if (a.belum_bayar === 0 && a.total_anggota > 0) {
      notifs.push({
        id: `arisan-done-${a.id}-${a.putaran_ini}`,
        tipe: 'info',
        judul: `Arisan ${a.nama} putaran ${a.putaran_ini} lunas! 🎉`,
        pesan: `Semua ${a.total_anggota} anggota sudah setor. Bisa lanjut ke putaran berikutnya.`,
        href: `/arisan/${a.id}`,
      })
    }
  }

  // Urutkan: urgent dulu, lalu warning, lalu info
  const order = { urgent: 0, warning: 1, info: 2 }
  notifs.sort((a, b) => order[a.tipe] - order[b.tipe])

  return notifs
}
