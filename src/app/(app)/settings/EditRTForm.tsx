'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { editRT } from '@/lib/actions'
import type { Neighborhood } from '@/lib/types'
import { Pencil, X, Check } from 'lucide-react'

export default function EditRTForm({ nb }: { nb: Neighborhood }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [saved, setSaved]     = useState(false)

  // Field states — prefill dari data RT saat ini
  const [nama,      setNama]      = useState(nb.nama)
  const [rw,        setRw]        = useState(nb.rw ?? '')
  const [kelurahan, setKelurahan] = useState(nb.kelurahan ?? '')
  const [kecamatan, setKecamatan] = useState(nb.kecamatan ?? '')
  const [kota,      setKota]      = useState(nb.kota ?? '')
  const [provinsi,  setProvinsi]  = useState(nb.provinsi ?? '')

  function batal() {
    setNama(nb.nama)
    setRw(nb.rw ?? '')
    setKelurahan(nb.kelurahan ?? '')
    setKecamatan(nb.kecamatan ?? '')
    setKota(nb.kota ?? '')
    setProvinsi(nb.provinsi ?? '')
    setError('')
    setEditing(false)
  }

  async function simpan() {
    setError('')
    if (!nama.trim()) { setError('Nama RT tidak boleh kosong'); return }
    const fd = new FormData()
    fd.set('nama', nama.trim())
    fd.set('rw', rw.trim())
    fd.set('kelurahan', kelurahan.trim())
    fd.set('kecamatan', kecamatan.trim())
    fd.set('kota', kota.trim())
    fd.set('provinsi', provinsi.trim())
    setLoading(true)
    const result = await editRT(fd)
    setLoading(false)
    if (result?.error) { setError(result.error); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    setEditing(false)
    router.refresh()
  }

  const FIELDS = [
    { label: 'Nama RT',         val: nama,      set: setNama,      placeholder: 'cth: RT 05',            required: true },
    { label: 'RW',              val: rw,        set: setRw,        placeholder: 'cth: RW 03' },
    { label: 'Kelurahan / Desa',val: kelurahan, set: setKelurahan, placeholder: 'cth: Talang Semut' },
    { label: 'Kecamatan',       val: kecamatan, set: setKecamatan, placeholder: 'cth: Bukit Kecil' },
    { label: 'Kota / Kabupaten',val: kota,      set: setKota,      placeholder: 'cth: Palembang' },
    { label: 'Provinsi',        val: provinsi,  set: setProvinsi,  placeholder: 'cth: Sumatera Selatan' },
  ]

  return (
    <div className="card" style={{ padding: 16, marginBottom: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.05em', margin: 0 }}>
          Informasi RT
        </p>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 13, fontWeight: 600, color: 'var(--teal)',
              background: 'var(--teal-light)', border: 'none',
              padding: '5px 12px', borderRadius: 99, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'opacity .15s',
            }}
          >
            <Pencil size={13} /> Edit
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={batal} style={btnOutline}>
              <X size={13} /> Batal
            </button>
            <button onClick={simpan} disabled={loading} style={btnPrimary}>
              {loading ? '...' : <><Check size={13} /> Simpan</>}
            </button>
          </div>
        )}
      </div>

      {/* READ MODE */}
      {!editing && (
        <div style={{ animation: 'fadeIn .2s ease-out both' }}>
          {saved && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#ecfdf5', border: '1px solid #a7f3d0',
              borderRadius: 8, padding: '8px 12px', marginBottom: 12,
              fontSize: 13, fontWeight: 600, color: '#065f46',
              animation: 'fadeUp .2s ease-out both',
            }}>
              <Check size={14} /> Data RT berhasil diperbarui!
            </div>
          )}
          {[
            { label: 'Nama RT',    val: nb.nama },
            { label: 'RW',         val: nb.rw ?? '—' },
            { label: 'Kelurahan',  val: nb.kelurahan ?? '—' },
            { label: 'Kecamatan', val: nb.kecamatan ?? '—' },
            { label: 'Kota',       val: nb.kota ?? '—' },
            { label: 'Provinsi',   val: nb.provinsi ?? '—' },
          ].map(({ label, val }, i, arr) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0',
              borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
              gap: 12,
            }}>
              <span style={{ fontSize: 13, color: 'var(--text3)', flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textAlign: 'right' }}>{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODE */}
      {editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeUp .2s ease-out both' }}>
          {FIELDS.map(({ label, val, set, placeholder, required }) => (
            <div key={label}>
              <label style={lbl}>
                {label} {required && <span style={{ color: 'red' }}>*</span>}
              </label>
              <input
                className="input"
                value={val}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                autoFocus={label === 'Nama RT'}
              />
            </div>
          ))}

          {error && (
            <p style={{ fontSize: 13, color: '#dc2626', margin: 0, animation: 'fadeUp .2s ease-out both' }}>
              ⚠ {error}
            </p>
          )}

          <button onClick={simpan} disabled={loading} className="btn" style={{ marginTop: 4 }}>
            {loading ? 'Menyimpan...' : 'Simpan perubahan data RT'}
          </button>
        </div>
      )}
    </div>
  )
}

const lbl: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: 'var(--text2)', marginBottom: 5,
}
const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 5,
  fontSize: 12, fontWeight: 600, color: '#fff',
  background: 'var(--teal)', border: 'none',
  padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
  fontFamily: 'inherit',
}
const btnOutline: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 5,
  fontSize: 12, fontWeight: 600, color: 'var(--text2)',
  background: 'none', border: '1px solid var(--border)',
  padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
  fontFamily: 'inherit',
}
