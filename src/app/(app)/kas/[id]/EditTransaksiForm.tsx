'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { editTransaksi, hapusTransaksi } from '@/lib/actions'
import type { CashbookEntry } from '@/lib/types'
import { Trash2 } from 'lucide-react'

const KATEGORI = {
  masuk:  ['iuran', 'arisan', 'sumbangan', 'lain-lain'],
  keluar: ['belanja', 'infra', 'kegiatan', 'operasional', 'lain-lain'],
}

interface Props { txn: CashbookEntry }

export default function EditTransaksiForm({ txn }: Props) {
  const router = useRouter()
  const [tipe, setTipe]               = useState<'masuk'|'keluar'>(txn.tipe)
  const [jumlah, setJumlah]           = useState(txn.jumlah.toLocaleString('id-ID'))
  const [keterangan, setKeterangan]   = useState(txn.keterangan)
  const [kategori, setKategori]       = useState(txn.kategori)
  const [tanggal, setTanggal]         = useState(txn.tanggal)
  const [loading, setLoading]         = useState(false)
  const [konfirmHapus, setKonfirmHapus] = useState(false)
  const [error, setError]             = useState('')

  // Format angka jadi Rp style saat diketik
  function formatRp(val: string) {
    const digits = val.replace(/\D/g, '')
    return digits ? Number(digits).toLocaleString('id-ID') : ''
  }

  // Saat ganti tipe, reset kategori ke default kategori baru
  function gantiTipe(t: 'masuk'|'keluar') {
    setTipe(t)
    setKategori(KATEGORI[t][0])
  }

  async function simpan() {
    setError('')
    const jumlahAngka = parseInt(jumlah.replace(/\D/g, ''))
    if (!jumlahAngka || jumlahAngka <= 0) { setError('Jumlah harus lebih dari 0'); return }
    if (!keterangan.trim()) { setError('Keterangan tidak boleh kosong'); return }

    const fd = new FormData()
    fd.set('tipe', tipe)
    fd.set('jumlah', jumlah)
    fd.set('keterangan', keterangan)
    fd.set('kategori', kategori)
    fd.set('tanggal', tanggal)

    setLoading(true)
    const result = await editTransaksi(txn.id, fd)
    setLoading(false)

    if (result?.error) { setError(result.error); return }
    router.push('/kas')
    router.refresh()
  }

  async function hapus() {
    setLoading(true)
    await hapusTransaksi(txn.id)
    router.push('/kas')
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Tipe toggle */}
      <div style={{ display: 'flex', background: '#eee', borderRadius: 10, padding: 3 }}>
        {(['masuk', 'keluar'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => gantiTipe(t)}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 8, border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
              background: tipe === t ? (t === 'masuk' ? '#16a34a' : '#dc2626') : 'transparent',
              color: tipe === t ? '#fff' : 'var(--text3)',
              transition: 'all .18s',
            }}
          >
            {t === 'masuk' ? '+ Pemasukan' : '− Pengeluaran'}
          </button>
        ))}
      </div>

      {/* Jumlah */}
      <div>
        <label style={lbl}>Jumlah (Rp) <span style={{ color: 'red' }}>*</span></label>
        <input
          className="input"
          inputMode="numeric"
          value={jumlah}
          onChange={e => setJumlah(formatRp(e.target.value))}
          style={{ fontSize: 22, fontWeight: 700 }}
          autoFocus
        />
      </div>

      {/* Keterangan */}
      <div>
        <label style={lbl}>Keterangan <span style={{ color: 'red' }}>*</span></label>
        <input
          className="input"
          value={keterangan}
          onChange={e => setKeterangan(e.target.value)}
          placeholder={tipe === 'masuk' ? 'cth: Iuran — Bpk. Ahmad' : 'cth: Beli cat tembok'}
        />
      </div>

      {/* Kategori + Tanggal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={lbl}>Kategori</label>
          <select
            className="input"
            value={kategori}
            onChange={e => setKategori(e.target.value)}
            style={{ appearance: 'none' }}
          >
            {KATEGORI[tipe].map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={lbl}>Tanggal</label>
          <input
            className="input"
            type="date"
            value={tanggal}
            onChange={e => setTanggal(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: '#dc2626', margin: 0, animation: 'fadeUp .2s ease-out both' }}>
          ⚠ {error}
        </p>
      )}

      {/* Simpan */}
      <button
        onClick={simpan}
        disabled={loading}
        className="btn"
        style={{
          background: tipe === 'masuk' ? '#16a34a' : '#dc2626',
          marginTop: 4,
        }}
      >
        {loading ? 'Menyimpan...' : 'Simpan perubahan'}
      </button>

      {/* Hapus — dengan konfirmasi */}
      <div style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        {!konfirmHapus ? (
          <button
            onClick={() => setKonfirmHapus(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', padding: '10px 0',
              fontSize: 13, fontWeight: 600, color: '#dc2626',
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background .15s',
            }}
          >
            <Trash2 size={14} /> Hapus transaksi ini
          </button>
        ) : (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 12, padding: 16,
            animation: 'fadeUp .2s ease-out both',
          }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#dc2626', margin: '0 0 6px' }}>
              Hapus transaksi?
            </p>
            <p style={{ fontSize: 13, color: '#dc2626', opacity: .8, margin: '0 0 14px', lineHeight: 1.5 }}>
              Data ini tidak bisa dipulihkan setelah dihapus. Saldo kas akan berubah secara otomatis.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setKonfirmHapus(false)}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid var(--border)',
                  background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  color: 'var(--text2)', fontFamily: 'inherit',
                }}
              >
                Batal
              </button>
              <button
                onClick={hapus}
                disabled={loading}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, border: 'none',
                  background: '#dc2626', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', color: '#fff', fontFamily: 'inherit',
                  opacity: loading ? .6 : 1,
                }}
              >
                {loading ? 'Menghapus...' : 'Ya, hapus'}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

const lbl: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: 'var(--text2)', marginBottom: 6,
}
