'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { tglPendek } from '@/lib/utils'
import { Search, TrendingUp, TrendingDown, ChevronRight, X } from 'lucide-react'
import type { CashbookEntry } from '@/lib/types'

const KAT_BG: Record<string, string>   = { iuran:'#ecfdf5', arisan:'#f3e8ff', belanja:'#fff7ed', infra:'#eff6ff', sumbangan:'#f0fdf4', kegiatan:'#fff0f9', operasional:'#f0f9ff', 'lain-lain':'#f5f5f5' }
const KAT_TEXT: Record<string, string> = { iuran:'#065f46', arisan:'#6b21a8', belanja:'#9a3412', infra:'#1e40af', sumbangan:'#14532d', kegiatan:'#9d174d', operasional:'#0369a1', 'lain-lain':'#555' }

const BULAN_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des']

interface Props { txns: CashbookEntry[] }

type FilterTipe = 'semua' | 'masuk' | 'keluar'

export default function KasList({ txns }: Props) {
  const [query,  setQuery]  = useState('')
  const [tipe,   setTipe]   = useState<FilterTipe>('semua')
  const [bulan,  setBulan]  = useState('semua')

  // Daftar bulan unik dari data
  const uniqueBulan = useMemo(() => {
    const set = new Set(txns.map(t => t.tanggal.slice(0, 7)))
    return Array.from(set).sort().reverse()
  }, [txns])

  const filtered = useMemo(() => {
    return txns.filter(t => {
      const q = query.toLowerCase().trim()
      if (q && !t.keterangan.toLowerCase().includes(q) && !t.kategori.toLowerCase().includes(q)) return false
      if (tipe !== 'semua' && t.tipe !== tipe) return false
      if (bulan !== 'semua' && !t.tanggal.startsWith(bulan)) return false
      return true
    })
  }, [txns, query, tipe, bulan])

  const totalMasuk  = filtered.filter(t => t.tipe === 'masuk').reduce((s, t) => s + t.jumlah, 0)
  const totalKeluar = filtered.filter(t => t.tipe === 'keluar').reduce((s, t) => s + t.jumlah, 0)
  const hasFilter   = query || tipe !== 'semua' || bulan !== 'semua'

  function namaBulan(b: string) {
    const [y, m] = b.split('-')
    return `${BULAN_ID[parseInt(m) - 1]} ${y}`
  }

  return (
    <div>
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <Search size={15} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          className="input"
          placeholder="Cari keterangan atau kategori..."
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

      {/* Filter row */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 2 }}>
        {/* Filter tipe */}
        {([
          { val: 'semua',  label: 'Semua' },
          { val: 'masuk',  label: '+ Masuk' },
          { val: 'keluar', label: '− Keluar' },
        ] as { val: FilterTipe; label: string }[]).map(({ val, label }) => (
          <button key={val} onClick={() => setTipe(val)} style={{
            padding: '5px 12px', borderRadius: 99, border: 'none',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit', whiteSpace: 'nowrap',
            background: tipe === val
              ? val === 'masuk' ? '#16a34a' : val === 'keluar' ? '#dc2626' : 'var(--teal)'
              : '#f0f0ee',
            color: tipe === val ? '#fff' : 'var(--text2)',
            transition: 'all .15s',
          }}>
            {label}
          </button>
        ))}

        {/* Divider */}
        <div style={{ width: 1, background: 'var(--border)', flexShrink: 0, margin: '0 2px' }} />

        {/* Filter bulan */}
        <button onClick={() => setBulan('semua')} style={{
          padding: '5px 12px', borderRadius: 99, border: 'none',
          fontSize: 12, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit', whiteSpace: 'nowrap',
          background: bulan === 'semua' ? '#f0f0ee' : 'transparent',
          color: bulan === 'semua' ? 'var(--text2)' : 'var(--text3)',
          textDecoration: bulan === 'semua' ? 'none' : 'underline',
          transition: 'all .15s',
        }}>
          Semua bulan
        </button>

        {uniqueBulan.slice(0, 6).map(b => (
          <button key={b} onClick={() => setBulan(b === bulan ? 'semua' : b)} style={{
            padding: '5px 12px', borderRadius: 99, border: 'none',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit', whiteSpace: 'nowrap',
            background: bulan === b ? '#7c3aed' : '#f0f0ee',
            color: bulan === b ? '#fff' : 'var(--text2)',
            transition: 'all .15s',
          }}>
            {namaBulan(b)}
          </button>
        ))}
      </div>

      {/* Ringkasan hasil filter */}
      {hasFilter && filtered.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 8, marginBottom: 10,
          animation: 'fadeUp .2s ease-out both',
        }}>
          <div style={{ background: '#ecfdf5', borderRadius: 10, padding: '8px 12px' }}>
            <p style={{ fontSize: 10, color: '#065f46', margin: '0 0 2px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>Masuk</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#16a34a', margin: 0 }}>
              Rp {totalMasuk.toLocaleString('id-ID')}
            </p>
          </div>
          <div style={{ background: '#fef2f2', borderRadius: 10, padding: '8px 12px' }}>
            <p style={{ fontSize: 10, color: '#991b1b', margin: '0 0 2px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>Keluar</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#dc2626', margin: 0 }}>
              Rp {totalKeluar.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ padding: '28px 16px', textAlign: 'center' }}>
          <Search size={28} color="var(--text3)" style={{ margin: '0 auto 10px', display: 'block' }} />
          <p style={{ fontSize: 14, color: 'var(--text3)', margin: '0 0 4px', fontWeight: 600 }}>
            {query ? `Tidak ada transaksi "${query}"` : 'Tidak ada transaksi ditemukan'}
          </p>
          <button onClick={() => { setQuery(''); setTipe('semua'); setBulan('semua') }}
            style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginTop: 6, fontFamily: 'inherit' }}>
            Reset semua filter
          </button>
        </div>
      ) : (
        <div className="card">
          {/* Header counter */}
          <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafaf8' }}>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>
              {hasFilter
                ? <><strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> dari {txns.length} transaksi</>
                : <>{txns.length} transaksi · ketuk untuk edit</>
              }
            </span>
            {hasFilter && (
              <button onClick={() => { setQuery(''); setTipe('semua'); setBulan('semua') }}
                style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                Reset
              </button>
            )}
          </div>

          {filtered.map((t, i) => (
            <Link key={t.id} href={`/kas/${t.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div className="list-row" style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.tipe === 'masuk' ? '#ecfdf5' : '#fef2f2' }}>
                  {t.tipe === 'masuk' ? <TrendingUp size={15} color="#16a34a" /> : <TrendingDown size={15} color="#dc2626" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {query ? <HighlightText text={t.keterangan} query={query} /> : t.keterangan}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{tglPendek(t.tanggal)}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 99, background: KAT_BG[t.kategori] ?? '#f5f5f5', color: KAT_TEXT[t.kategori] ?? '#555' }}>
                      {t.kategori}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: t.tipe === 'masuk' ? '#16a34a' : '#dc2626' }}>
                    {t.tipe === 'masuk' ? '+' : '−'}{t.jumlah.toLocaleString('id-ID')}
                  </p>
                  <ChevronRight size={14} color="var(--text3)" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

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
