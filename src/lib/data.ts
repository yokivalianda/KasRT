export const RT_INFO = {
  nama: 'RT 05',
  rw: 'RW 03',
  kelurahan: 'Talang Semut',
  kota: 'Palembang',
  ketua: 'Pak Hendra Rahmat',
}

export const WARGA = [
  { id: '1', nama: 'Bpk. Hendra Rahmat',  no: '12', jiwa: 4, hp: '081234567890' },
  { id: '2', nama: 'Bpk. Budi Darmawan',  no: '14', jiwa: 3, hp: '' },
  { id: '3', nama: 'Bpk. Suryadi R.',     no: '15', jiwa: 5, hp: '081298765432' },
  { id: '4', nama: 'Bpk. M. Fauzi',       no: '17', jiwa: 2, hp: '' },
  { id: '5', nama: 'Bpk. Andi Nugraha',   no: '19', jiwa: 4, hp: '081388888888' },
  { id: '6', nama: 'Bpk. Joko Santoso',   no: '21', jiwa: 6, hp: '' },
  { id: '7', nama: 'Ibu Wulandari',       no: '07', jiwa: 3, hp: '081222222222' },
  { id: '8', nama: 'Bpk. Rahmat S.',      no: '08', jiwa: 2, hp: '081233333333' },
  { id: '9', nama: 'Ibu Sari',            no: '10', jiwa: 4, hp: '' },
  { id:'10', nama: 'Bpk. Anton W.',       no: '22', jiwa: 3, hp: '081299999999' },
]

// Siapa yang sudah bayar iuran bulan ini
export const SUDAH_BAYAR_IURAN = new Set(['1','2','5','7','8','10'])

export const IURAN_BULAN_INI = {
  judul: 'Iuran Keamanan Maret 2026',
  nominal: 30_000,
  jatuh_tempo: '2026-03-25',
}

export const KAS_ENTRIES = [
  { id:'1', tipe:'masuk',  jumlah:30_000,  ket:'Iuran — Bpk. Rahmat',    kat:'iuran',    tgl:'2026-03-17' },
  { id:'2', tipe:'masuk',  jumlah:50_000,  ket:'Arisan — Ibu Sari',      kat:'arisan',   tgl:'2026-03-16' },
  { id:'3', tipe:'keluar', jumlah:85_000,  ket:'Beli sapu & pengki',     kat:'belanja',  tgl:'2026-03-15' },
  { id:'4', tipe:'masuk',  jumlah:30_000,  ket:'Iuran — Bpk. Andi',      kat:'iuran',    tgl:'2026-03-14' },
  { id:'5', tipe:'keluar', jumlah:150_000, ket:'Pasang lampu gang',       kat:'infra',    tgl:'2026-03-12' },
  { id:'6', tipe:'masuk',  jumlah:200_000, ket:'Sumbangan pak RW',        kat:'sumbangan',tgl:'2026-03-10' },
  { id:'7', tipe:'masuk',  jumlah:30_000,  ket:'Iuran — Ibu Wulandari',  kat:'iuran',    tgl:'2026-03-09' },
  { id:'8', tipe:'masuk',  jumlah:30_000,  ket:'Iuran — Bpk. Anton',     kat:'iuran',    tgl:'2026-03-08' },
]

export const ARISAN = {
  nama: 'Arisan Ibu-ibu PKK',
  nominal: 50_000,
  putaran_ini: 7,
  total_putaran: 20,
  pemenang: 'Ibu Wulandari',
  frekuensi: 'Bulanan',
}

export const ARISAN_ANGGOTA = [
  { id:'1', nama:'Ibu Wulandari',   giliran:7,  sudah_bayar:true,  menang:true  },
  { id:'2', nama:'Ibu Sari',        giliran:1,  sudah_bayar:true,  menang:false },
  { id:'3', nama:'Ibu Dewi H.',     giliran:2,  sudah_bayar:true,  menang:false },
  { id:'4', nama:'Ibu Ratna',       giliran:3,  sudah_bayar:false, menang:false },
  { id:'5', nama:'Ibu Yuni',        giliran:4,  sudah_bayar:false, menang:false },
  { id:'6', nama:'Ibu Maisyaroh',   giliran:5,  sudah_bayar:false, menang:false },
  { id:'7', nama:'Ibu Hartini',     giliran:6,  sudah_bayar:true,  menang:false },
  { id:'8', nama:'Ibu Sri',         giliran:8,  sudah_bayar:true,  menang:false },
]

export const PENGUMUMAN = [
  { id:'1', judul:'Kerja bakti Minggu 23 Maret', isi:'Harap hadir pukul 07.00 WIB di pos ronda. Bawa cangkul/sapu masing-masing.', pin:true,  tgl:'2026-03-15' },
  { id:'2', judul:'Rapat RT bulan Maret',         isi:'Sabtu 22 Maret 2026 pukul 19.30 WIB di rumah ketua RT. Agenda: evaluasi iuran dan rencana kegiatan.', pin:false, tgl:'2026-03-14' },
  { id:'3', judul:'Peringatan keamanan',           isi:'Ada laporan kehilangan motor di sekitar kelurahan. Harap selalu kunci kendaraan dan waspada.', pin:false, tgl:'2026-03-10' },
]
