export interface Neighborhood {
  id: string
  owner_id: string
  nama: string
  rw: string | null
  kelurahan: string | null
  kecamatan: string | null
  kota: string | null
  provinsi: string | null
  kode_undang: string
  created_at: string
}

export interface Member {
  id: string
  neighborhood_id: string
  nama: string
  no_rumah: string | null
  jumlah_jiwa: number
  no_hp: string | null
  alamat: string | null
  status: 'aktif' | 'pindah'
  created_at: string
}

export interface CashbookEntry {
  id: string
  neighborhood_id: string
  tipe: 'masuk' | 'keluar'
  jumlah: number
  keterangan: string
  kategori: string
  tanggal: string
  created_at: string
}

export interface Bill {
  id: string
  neighborhood_id: string
  judul: string
  nominal: number
  jatuh_tempo: string
  periode: string | null
  status: 'buka' | 'tutup'
  created_at: string
}

export interface BillPayment {
  id: string
  bill_id: string
  member_id: string
  status: 'belum' | 'lunas'
  metode: 'tunai' | 'transfer' | 'qris' | null
  dibayar_at: string | null
  catatan: string | null
}

export interface ArisanGroup {
  id: string
  neighborhood_id: string
  nama: string
  nominal: number
  frekuensi: 'mingguan' | 'bulanan'
  putaran_ini: number
  total_putaran: number
  tgl_kocok: string | null
  status: 'aktif' | 'selesai'
  created_at: string
}

export interface ArisanMember {
  id: string
  group_id: string
  member_id: string
  urutan: number | null
  sudah_menang: boolean
  menang_putaran: number | null
}

export interface ArisanPayment {
  id: string
  group_id: string
  member_id: string
  putaran: number
  status: 'belum' | 'lunas'
  metode: 'tunai' | 'transfer' | 'qris' | null
  dibayar_at: string | null
}

export interface Pengumuman {
  id: string
  neighborhood_id: string
  judul: string
  isi: string | null
  disematkan: boolean
  created_by: string | null
  created_at: string
}

// View types
export interface VSaldo {
  neighborhood_id: string
  total_masuk: number
  total_keluar: number
  saldo: number
}

export interface VBillSummary {
  id: string
  neighborhood_id: string
  judul: string
  nominal: number
  jatuh_tempo: string
  periode: string | null
  status: 'buka' | 'tutup'
  total_warga: number
  sudah_lunas: number
  belum_lunas: number
  terkumpul: number
}
