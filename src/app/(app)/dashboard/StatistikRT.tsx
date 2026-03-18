'use client'

interface Props {
  saldoBulanIni: number
  saldoBulanLalu: number
  masukBulanIni: number
  masukBulanLalu: number
  keluarBulanIni: number
  keluarBulanLalu: number
  jmlWarga: number
  jmlTagihanAktif: number
}

function rpK(n: number) {
  if (n >= 1_000_000) return 'Rp ' + (n/1_000_000).toFixed(1).replace('.0','') + ' jt'
  if (n >= 1_000)     return 'Rp ' + (n/1_000).toFixed(0) + ' rb'
  return 'Rp ' + n
}

function tren(sekarang: number, lalu: number) {
  if (lalu === 0) return null
  const pct = Math.round(((sekarang - lalu) / lalu) * 100)
  return { pct, naik: pct >= 0 }
}

function TrenBadge({ sekarang, lalu }: { sekarang: number; lalu: number }) {
  const t = tren(sekarang, lalu)
  if (!t) return null
  return (
    <span style={{
      fontSize: 10, fontWeight: 700,
      color: t.naik ? '#16a34a' : '#dc2626',
      background: t.naik ? '#ecfdf5' : '#fef2f2',
      padding: '1px 6px', borderRadius: 99,
    }}>
      {t.naik ? '↑' : '↓'} {Math.abs(t.pct)}%
    </span>
  )
}

export default function StatistikRT({
  saldoBulanIni, saldoBulanLalu,
  masukBulanIni, masukBulanLalu,
  keluarBulanIni, keluarBulanLalu,
  jmlWarga, jmlTagihanAktif,
}: Props) {
  const bulanIni = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  return (
    <div className="card" style={{ padding: 14, marginBottom: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 12px' }}>
        Statistik {bulanIni}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>

        {/* Pemasukan */}
        <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', margin: 0, textTransform: 'uppercase', letterSpacing: '.04em' }}>Pemasukan</p>
            <TrenBadge sekarang={masukBulanIni} lalu={masukBulanLalu} />
          </div>
          <p style={{ fontSize: 17, fontWeight: 800, color: '#16a34a', margin: 0 }}>{rpK(masukBulanIni)}</p>
          {masukBulanLalu > 0 && (
            <p style={{ fontSize: 10, color: '#86efac', margin: '2px 0 0' }}>
              Bln lalu: {rpK(masukBulanLalu)}
            </p>
          )}
        </div>

        {/* Pengeluaran */}
        <div style={{ background: '#fef2f2', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', margin: 0, textTransform: 'uppercase', letterSpacing: '.04em' }}>Pengeluaran</p>
            <TrenBadge sekarang={keluarBulanIni} lalu={keluarBulanLalu} />
          </div>
          <p style={{ fontSize: 17, fontWeight: 800, color: '#dc2626', margin: 0 }}>{rpK(keluarBulanIni)}</p>
          {keluarBulanLalu > 0 && (
            <p style={{ fontSize: 10, color: '#fca5a5', margin: '2px 0 0' }}>
              Bln lalu: {rpK(keluarBulanLalu)}
            </p>
          )}
        </div>

        {/* Warga aktif */}
        <div style={{ background: 'var(--teal-light)', borderRadius: 10, padding: '10px 12px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--teal)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Warga aktif</p>
          <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--teal)', margin: 0 }}>{jmlWarga} KK</p>
        </div>

        {/* Net bulan ini */}
        <div style={{
          background: (masukBulanIni - keluarBulanIni) >= 0 ? '#f0fdf4' : '#fef2f2',
          borderRadius: 10, padding: '10px 12px',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Net bulan ini</p>
          <p style={{ fontSize: 17, fontWeight: 800, margin: 0, color: (masukBulanIni - keluarBulanIni) >= 0 ? '#16a34a' : '#dc2626' }}>
            {(masukBulanIni - keluarBulanIni) >= 0 ? '+' : ''}{rpK(masukBulanIni - keluarBulanIni)}
          </p>
        </div>

      </div>
    </div>
  )
}
