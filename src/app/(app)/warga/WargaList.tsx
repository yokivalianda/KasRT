'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { inisial, avatarColor, persen } from '@/lib/utils'
import { Search, ChevronRight, X, Filter } from 'lucide-react'
import type { Member } from '@/lib/types'

interface Props {
  members: Member[]
  paidSet: string[]   // member_id yang sudah lunas
  adaTagihan: boolean
}

type FilterStatus = 'semua' | 'lunas' | 'belum'

export default function WargaList({ members, paidSet, adaTagihan }: Props) {
  const [query, setQuery]       = useState('')
  const [filter, setFilter]     = useState<FilterStatus>('semua')
  const paidIds = new Set(paidSet)

  const filtered = useMemo(() => {
    return members.filter(m => {
      // Filter teks — cari nama atau nomor rumah
      const q = query.toLowerCase().trim()
      if (q && !m.nama.toLowerCase().includes(q) && !(m.no_rumah ?? '').toLowerCase().includes(q)) {
        return false
      }
      // Filter status iuran
      if (adaTagihan && filter === 'lunas'  && !paidIds.has(m.id)) return false
      if (adaTagihan && filter === 'belum'  &&  paidIds.has(m.id)) return false
      return true
    })
  }, [members, query, filter, paidIds, adaTagihan])

  const lunasCount = members.filter(m => paidIds.has(m.id)).length
  const belumCount = members.length - lunasCount

  return (
    <div>
      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <Search size={15} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          className="input"
          placeholder="Cari nama atau nomor rumah..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ paddingLeft: 36, paddingRight: query ? 36 : 14 }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 2 }}>
            <X size={14} color="var(--text3)" />
          </button>
        )}
      </div>

      {/* Filter chips — hanya tampil kalau ada tagihan aktif */}
      {adaTagihan && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 2 }}>
          {([
            { val: 'semua', label: `Semua (${members.length})` },
            { val: 'lunas', label: `Lunas (${lunasCount})` },
            { val: 'belum', label: `Belum (${belumCount})` },
          ] as { val: FilterStatus; label: string }[]).map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              style={{
                padding: '5px 12px', borderRadius: 99, border: 'none',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', whiteSpace: 'nowrap',
                background: filter === val ? 'var(--teal)' : '#f0f0ee',
                color: filter === val ? '#fff' : 'var(--text2)',
                transition: 'all .15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Hasil */}
      {filtered.length === 0 ? (
        <div style={{ padding: '28px 16px', textAlign: 'center' }}>
          <Search size={28} color="var(--text3)" style={{ margin: '0 auto 10px', display: 'block' }} />
          <p style={{ fontSize: 14, color: 'var(--text3)', margin: '0 0 4px', fontWeight: 600 }}>
            {query ? `Tidak ada warga "${query}"` : `Tidak ada warga ${filter}`}
          </p>
          {query && (
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>
              Coba kata kunci lain
            </p>
          )}
        </div>
      ) : (
        <div className="card">
          {/* Counter kalau ada filter aktif */}
          {(query || filter !== 'semua') && (
            <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafaf8' }}>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                Menampilkan <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> dari {members.length} warga
              </span>
              {(query || filter !== 'semua') && (
                <button onClick={() => { setQuery(''); setFilter('semua') }} style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                  Reset filter
                </button>
              )}
            </div>
          )}

          {filtered.map((m, i) => {
            const paid = paidIds.has(m.id)
            return (
              <Link key={m.id} href={`/warga/${m.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div className="list-row" style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: avatarColor(m.nama),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {inisial(m.nama)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {/* Highlight teks yang dicari */}
                      {query ? <HighlightText text={m.nama} query={query} /> : m.nama}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0 }}>
                      No. {m.no_rumah ?? '—'} · {m.jumlah_jiwa} jiwa
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {adaTagihan && (
                      <span className={paid ? 'badge-ok' : 'badge-warn'}>
                        {paid ? 'Lunas' : 'Belum'}
                      </span>
                    )}
                    <ChevronRight size={14} color="var(--text3)" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Komponen highlight teks yang cocok dengan query
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: '#fef08a', borderRadius: 2, padding: '0 1px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}
