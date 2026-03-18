'use client'
import { useState } from 'react'

interface BulanData {
  bulan: string   // "2026-03"
  label: string   // "Mar"
  masuk: number
  keluar: number
  saldo: number
}

interface Props { data: BulanData[] }

type ViewMode = 'bar' | 'line'

export default function GrafikKas({ data }: Props) {
  const [mode, setMode] = useState<ViewMode>('bar')
  const [hover, setHover] = useState<number | null>(null)

  if (data.length === 0) return null

  const W = 340   // viewBox width
  const H = 140   // chart height
  const PAD_LEFT = 8
  const PAD_RIGHT = 8
  const PAD_TOP = 12
  const PAD_BOT = 24

  const chartW = W - PAD_LEFT - PAD_RIGHT
  const chartH = H - PAD_TOP - PAD_BOT

  const maxVal = Math.max(...data.flatMap(d => [d.masuk, d.keluar]), 1)
  const n = data.length
  const barW = Math.min(chartW / n * 0.35, 20)
  const colW = chartW / n

  // Y posisi dari nilai (0 = bottom, chartH = top)
  function yPos(val: number) {
    return PAD_TOP + chartH - (val / maxVal) * chartH
  }

  // X posisi tengah tiap kolom
  function xCenter(i: number) {
    return PAD_LEFT + colW * i + colW / 2
  }

  // Format singkat
  function fmt(n: number) {
    if (n >= 1_000_000) return (n/1_000_000).toFixed(1).replace('.0','') + 'jt'
    if (n >= 1_000)     return (n/1_000).toFixed(0) + 'rb'
    return String(n)
  }

  // Line path untuk mode line
  function makePath(vals: number[]) {
    return vals.map((v, i) => {
      const x = xCenter(i)
      const y = yPos(v)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    }).join(' ')
  }

  const hovered = hover !== null ? data[hover] : null

  return (
    <div className="card" style={{ padding: '14px 14px 10px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', margin: 0 }}>
          Grafik kas 6 bulan terakhir
        </p>
        {/* Toggle bar/line */}
        <div style={{ display: 'flex', background: '#f0f0ee', borderRadius: 8, padding: 2, gap: 2 }}>
          {(['bar', 'line'] as ViewMode[]).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '3px 10px', borderRadius: 6, border: 'none',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
              background: mode === m ? '#fff' : 'transparent',
              color: mode === m ? 'var(--text)' : 'var(--text3)',
              transition: 'all .15s',
              boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
            }}>
              {m === 'bar' ? '▊ Bar' : '∿ Line'}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 8 }}>
        {[
          { color: '#0F9E78', label: 'Masuk' },
          { color: '#EF4444', label: 'Keluar' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* SVG Chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        onMouseLeave={() => setHover(null)}
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map(f => {
          const y = PAD_TOP + chartH * (1 - f)
          return (
            <line key={f}
              x1={PAD_LEFT} y1={y} x2={W - PAD_RIGHT} y2={y}
              stroke="#f0f0ee" strokeWidth="1"
            />
          )
        })}

        {/* Y axis labels */}
        {[0.5, 1].map(f => (
          <text key={f}
            x={PAD_LEFT}
            y={PAD_TOP + chartH * (1 - f) - 3}
            fontSize="8" fill="#bbb" textAnchor="start"
          >
            {fmt(maxVal * f)}
          </text>
        ))}

        {mode === 'bar' ? (
          /* BAR MODE */
          data.map((d, i) => {
            const cx = xCenter(i)
            const isHov = hover === i
            const masukH = (d.masuk / maxVal) * chartH
            const keluarH = (d.keluar / maxVal) * chartH

            return (
              <g key={d.bulan}
                onMouseEnter={() => setHover(i)}
                style={{ cursor: 'pointer' }}
              >
                {/* Hover area */}
                <rect
                  x={cx - colW / 2} y={PAD_TOP}
                  width={colW} height={chartH}
                  fill={isHov ? 'rgba(15,158,120,0.06)' : 'transparent'}
                  rx="4"
                />

                {/* Bar masuk */}
                <rect
                  x={cx - barW - 1}
                  y={yPos(d.masuk)}
                  width={barW}
                  height={masukH}
                  fill={isHov ? '#0A7259' : '#0F9E78'}
                  rx="2"
                  style={{ transition: 'fill .15s, y .3s, height .3s' }}
                />

                {/* Bar keluar */}
                <rect
                  x={cx + 1}
                  y={yPos(d.keluar)}
                  width={barW}
                  height={keluarH}
                  fill={isHov ? '#B91C1C' : '#EF4444'}
                  rx="2"
                  style={{ transition: 'fill .15s, y .3s, height .3s' }}
                />

                {/* Label bulan */}
                <text
                  x={cx} y={H - 6}
                  fontSize="9" fill={isHov ? 'var(--teal)' : '#bbb'}
                  textAnchor="middle" fontWeight={isHov ? '700' : '400'}
                >
                  {d.label}
                </text>
              </g>
            )
          })
        ) : (
          /* LINE MODE */
          <>
            {/* Area masuk */}
            <defs>
              <linearGradient id="gradMasuk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F9E78" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#0F9E78" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gradKeluar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Area fill masuk */}
            <path
              d={`${makePath(data.map(d => d.masuk))} L${xCenter(n-1).toFixed(1)},${PAD_TOP + chartH} L${xCenter(0).toFixed(1)},${PAD_TOP + chartH} Z`}
              fill="url(#gradMasuk)"
            />

            {/* Area fill keluar */}
            <path
              d={`${makePath(data.map(d => d.keluar))} L${xCenter(n-1).toFixed(1)},${PAD_TOP + chartH} L${xCenter(0).toFixed(1)},${PAD_TOP + chartH} Z`}
              fill="url(#gradKeluar)"
            />

            {/* Line masuk */}
            <path
              d={makePath(data.map(d => d.masuk))}
              fill="none" stroke="#0F9E78" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            />

            {/* Line keluar */}
            <path
              d={makePath(data.map(d => d.keluar))}
              fill="none" stroke="#EF4444" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            />

            {/* Dots + hover areas */}
            {data.map((d, i) => {
              const cx = xCenter(i)
              const isHov = hover === i
              return (
                <g key={d.bulan} onMouseEnter={() => setHover(i)} style={{ cursor: 'pointer' }}>
                  {/* Hover area */}
                  <rect
                    x={cx - colW / 2} y={PAD_TOP}
                    width={colW} height={chartH}
                    fill={isHov ? 'rgba(15,158,120,0.05)' : 'transparent'}
                  />
                  {/* Dot masuk */}
                  <circle cx={cx} cy={yPos(d.masuk)} r={isHov ? 4 : 2.5}
                    fill={isHov ? '#0F9E78' : '#fff'} stroke="#0F9E78" strokeWidth="2"
                    style={{ transition: 'r .15s' }}
                  />
                  {/* Dot keluar */}
                  <circle cx={cx} cy={yPos(d.keluar)} r={isHov ? 4 : 2.5}
                    fill={isHov ? '#EF4444' : '#fff'} stroke="#EF4444" strokeWidth="2"
                    style={{ transition: 'r .15s' }}
                  />
                  {/* Label bulan */}
                  <text x={cx} y={H - 6} fontSize="9"
                    fill={isHov ? 'var(--teal)' : '#bbb'}
                    textAnchor="middle" fontWeight={isHov ? '700' : '400'}
                  >
                    {d.label}
                  </text>
                </g>
              )
            })}
          </>
        )}
      </svg>

      {/* Tooltip hover */}
      {hovered ? (
        <div style={{
          marginTop: 8, padding: '8px 12px',
          background: 'var(--bg)', borderRadius: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          animation: 'fadeIn .15s ease-out both',
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>
            {hovered.label} {hovered.bulan.slice(0, 4)}
          </span>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>
              +{fmt(hovered.masuk)}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#dc2626' }}>
              −{fmt(hovered.keluar)}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
              ={fmt(hovered.masuk - hovered.keluar)}
            </span>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', margin: '4px 0 0' }}>
          Sentuh bar/titik untuk detail
        </p>
      )}
    </div>
  )
}
