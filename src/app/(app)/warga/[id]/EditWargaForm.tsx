'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { editWarga, tandaiPindah } from '@/lib/actions'
import type { Member } from '@/lib/types'
import { Pencil, X, Check, AlertTriangle } from 'lucide-react'

export default function EditWargaForm({ member }: { member: Member }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [konfirmPindah, setKonfirmPindah] = useState(false)
  const [error, setError] = useState('')

  // Field state — diisi dari data awal
  const [nama, setNama]         = useState(member.nama)
  const [noRumah, setNoRumah]   = useState(member.no_rumah ?? '')
  const [jiwa, setJiwa]         = useState(String(member.jumlah_jiwa))
  const [noHp, setNoHp]         = useState(member.no_hp ?? '')
  const [alamat, setAlamat]     = useState(member.alamat ?? '')

  async function simpan() {
    setError('')
    if (!nama.trim()) { setError('Nama tidak boleh kosong'); return }
    setLoading(true)
    const fd = new FormData()
    fd.set('nama', nama.trim())
    fd.set('no_rumah', noRumah.trim())
    fd.set('jumlah_jiwa', jiwa)
    fd.set('no_hp', noHp.trim())
    fd.set('alamat', alamat.trim())
    const result = await editWarga(member.id, fd)
    setLoading(false)
    if (result?.error) { setError(result.error); return }
    setEditing(false)
    router.refresh()
  }

  async function konfirmasiPindah() {
    setLoading(true)
    await tandaiPindah(member.id)
    setLoading(false)
    router.push('/warga')
    router.refresh()
  }

  function batal() {
    // Reset ke nilai awal
    setNama(member.nama)
    setNoRumah(member.no_rumah ?? '')
    setJiwa(String(member.jumlah_jiwa))
    setNoHp(member.no_hp ?? '')
    setAlamat(member.alamat ?? '')
    setError('')
    setEditing(false)
  }

  if (member.status === 'pindah') {
    return (
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text3)' }}>
          <AlertTriangle size={16} />
          <p style={{ fontSize: 13, margin: 0 }}>Warga ini sudah ditandai pindah dan tidak aktif.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editing ? 16 : 0 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.05em', margin: 0 }}>
          Data warga
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
        <div style={{ marginTop: 12 }}>
          {[
            { label: 'Nama KK',       val: member.nama },
            { label: 'No. Rumah',     val: member.no_rumah ?? '—' },
            { label: 'Jumlah jiwa',   val: member.jumlah_jiwa + ' orang' },
            { label: 'No. HP / WA',   val: member.no_hp ?? '—' },
            { label: 'Alamat',        val: member.alamat ?? '—' },
          ].map(({ label, val }, i, arr) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '8px 0',
              borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
              gap: 12,
            }}>
              <span style={{ fontSize: 13, color: 'var(--text3)', flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textAlign: 'right' }}>{val}</span>
            </div>
          ))}

          {/* Tandai pindah */}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            {!konfirmPindah ? (
              <button
                onClick={() => setKonfirmPindah(true)}
                style={{
                  fontSize: 13, fontWeight: 600, color: '#dc2626',
                  background: '#fef2f2', border: '1px solid #fecaca',
                  padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'inherit', width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'background .15s',
                }}
              >
                <AlertTriangle size={14} /> Tandai warga sudah pindah
              </button>
            ) : (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 10, padding: 14,
                animation: 'fadeUp 0.2s ease-out both',
              }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', margin: '0 0 4px' }}>
                  Yakin tandai warga pindah?
                </p>
                <p style={{ fontSize: 12, color: '#dc2626', opacity: .8, margin: '0 0 12px', lineHeight: 1.5 }}>
                  Warga akan dinonaktifkan dan tidak muncul di daftar aktif. Data tetap tersimpan untuk arsip.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setKonfirmPindah(false)}
                    style={{ ...btnOutline, flex: 1 }}
                  >
                    Batal
                  </button>
                  <button
                    onClick={konfirmasiPindah}
                    disabled={loading}
                    style={{
                      flex: 1, fontSize: 13, fontWeight: 600, color: '#fff',
                      background: '#dc2626', border: 'none',
                      padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                      fontFamily: 'inherit', opacity: loading ? .6 : 1,
                    }}
                  >
                    {loading ? 'Memproses...' : 'Ya, tandai pindah'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT MODE */}
      {editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeUp 0.2s ease-out both' }}>
          <div>
            <label style={lbl}>Nama kepala keluarga <span style={{ color: 'red' }}>*</span></label>
            <input
              className="input"
              value={nama}
              onChange={e => setNama(e.target.value)}
              autoFocus
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>No. Rumah</label>
              <input
                className="input"
                value={noRumah}
                onChange={e => setNoRumah(e.target.value)}
                placeholder="cth: 12A"
              />
            </div>
            <div>
              <label style={lbl}>Jumlah jiwa</label>
              <input
                className="input"
                type="number"
                min="1"
                value={jiwa}
                onChange={e => setJiwa(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label style={lbl}>No. HP / WhatsApp</label>
            <input
              className="input"
              type="tel"
              value={noHp}
              onChange={e => setNoHp(e.target.value)}
              placeholder="cth: 081234567890"
            />
          </div>
          <div>
            <label style={lbl}>Alamat</label>
            <textarea
              className="input"
              rows={2}
              value={alamat}
              onChange={e => setAlamat(e.target.value)}
              placeholder="Alamat lengkap"
              style={{ resize: 'none' }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#dc2626', margin: 0, animation: 'fadeUp 0.2s ease-out both' }}>
              ⚠ {error}
            </p>
          )}

          <button
            onClick={simpan}
            disabled={loading}
            className="btn"
            style={{ marginTop: 4 }}
          >
            {loading ? 'Menyimpan...' : 'Simpan perubahan'}
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
  fontFamily: 'inherit', transition: 'background .15s',
}
const btnOutline: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 5,
  fontSize: 12, fontWeight: 600, color: 'var(--text2)',
  background: 'none', border: '1px solid var(--border)',
  padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
  fontFamily: 'inherit',
}
