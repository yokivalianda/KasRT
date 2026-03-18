'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Printer, Download } from 'lucide-react'
import type { Neighborhood, CashbookEntry } from '@/lib/types'
import { rp, tgl } from '@/lib/utils'

interface Props {
  nb: Neighborhood
  bulan: string
  namaBulan: string
  txns: CashbookEntry[]
  saldoAwal: number
  totalMasuk: number
  totalKeluar: number
  saldoAkhir: number
  uniqueBulan: string[]
}

const BULAN_ID = ['Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember']

function namaBulanDariString(b: string) {
  const [y, m] = b.split('-')
  return `${BULAN_ID[parseInt(m) - 1]} ${y}`
}

export default function LaporanView({
  nb, bulan, namaBulan, txns,
  saldoAwal, totalMasuk, totalKeluar, saldoAkhir,
  uniqueBulan,
}: Props) {
  const router = useRouter()

  function print() {
    window.print()
  }

  function gantiPeriode(b: string) {
    router.push(`/kas/laporan?bulan=${b}`)
  }

  const tanggalCetak = new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  // Penomoran transaksi dimulai dari saldo awal
  let saldoBerjalan = saldoAwal

  return (
    <>
      {/* ─── CSS PRINT ─────────────────────────────────────── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .page { padding-bottom: 0 !important; }
          body { background: #fff !important; }
          @page {
            size: A4;
            margin: 15mm 12mm;
          }
          .print-page {
            box-shadow: none !important;
            border: none !important;
          }
        }
        @media screen {
          .print-only { display: none; }
        }
      `}</style>

      <div className="page">
        {/* ─── TOOLBAR (tidak ikut print) ───────────────── */}
        <div className="no-print" style={{
          background: 'var(--teal)', padding: '48px 20px 16px', color: '#fff',
        }}>
          <button onClick={() => router.back()} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            color: '#fff', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 13, opacity: .8,
            marginBottom: 10, fontFamily: 'inherit', padding: 0,
          }}>
            <ArrowLeft size={16} /> Kembali ke kas
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 14px' }}>
            Laporan Kas Bulanan
          </h1>

          {/* Pilih periode */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, opacity: .8 }}>Periode:</span>
            <select
              value={bulan}
              onChange={e => gantiPeriode(e.target.value)}
              style={{
                padding: '6px 12px', borderRadius: 8, border: 'none',
                fontSize: 13, fontWeight: 600, background: 'rgba(255,255,255,.2)',
                color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                appearance: 'none',
              }}
            >
              {uniqueBulan.map(b => (
                <option key={b} value={b} style={{ background: '#0f9e78', color: '#fff' }}>
                  {namaBulanDariString(b)}
                </option>
              ))}
            </select>
          </div>

          {/* Tombol aksi */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={print} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 99, border: 'none',
              background: '#fff', color: 'var(--teal)',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit',
            }}>
              <Printer size={14} /> Cetak PDF
            </button>
            <button onClick={print} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 99, border: '1px solid rgba(255,255,255,.4)',
              background: 'transparent', color: '#fff',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
            }}>
              <Download size={14} /> Simpan PDF
            </button>
          </div>
        </div>

        {/* ─── DOKUMEN LAPORAN (yang akan diprint) ─────── */}
        <div className="print-page" style={{ padding: '20px 16px' }}>

          {/* KOP SURAT */}
          <div style={{
            textAlign: 'center', paddingBottom: 14,
            borderBottom: '2px solid #0f9e78', marginBottom: 16,
          }}>
            <p style={{ fontSize: 11, color: '#666', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              Laporan Keuangan
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f9e78', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              {nb.nama}{nb.rw ? ` / ${nb.rw}` : ''}
            </h2>
            {(nb.kelurahan || nb.kecamatan || nb.kota) && (
              <p style={{ fontSize: 12, color: '#666', margin: '0 0 2px' }}>
                {[nb.kelurahan, nb.kecamatan, nb.kota, nb.provinsi].filter(Boolean).join(', ')}
              </p>
            )}
            <p style={{ fontSize: 13, fontWeight: 700, color: '#333', margin: '6px 0 0' }}>
              LAPORAN KAS BULAN {namaBulan.toUpperCase()}
            </p>
          </div>

          {/* RINGKASAN KEUANGAN */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: 8, marginBottom: 16,
          }}>
            {[
              { label: 'Saldo Awal', val: saldoAwal, color: '#333' },
              { label: 'Total Pemasukan', val: totalMasuk, color: '#16a34a' },
              { label: 'Total Pengeluaran', val: totalKeluar, color: '#dc2626' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{
                border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', textAlign: 'center',
              }}>
                <p style={{ fontSize: 10, color: '#888', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</p>
                <p style={{ fontSize: 15, fontWeight: 800, color, margin: 0 }}>{rp(val)}</p>
              </div>
            ))}
          </div>

          {/* SALDO AKHIR */}
          <div style={{
            background: saldoAkhir >= 0 ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${saldoAkhir >= 0 ? '#a7f3d0' : '#fecaca'}`,
            borderRadius: 8, padding: '10px 16px', marginBottom: 20,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: saldoAkhir >= 0 ? '#065f46' : '#991b1b' }}>
              Saldo Akhir {namaBulan}
            </span>
            <span style={{ fontSize: 18, fontWeight: 800, color: saldoAkhir >= 0 ? '#059669' : '#dc2626' }}>
              {rp(saldoAkhir)}
            </span>
          </div>

          {/* TABEL TRANSAKSI */}
          <p style={{ fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
            Rincian Transaksi ({txns.length} entri)
          </p>

          {txns.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: 8 }}>
              <p style={{ fontSize: 14, color: '#888', margin: 0 }}>Tidak ada transaksi bulan {namaBulan}</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#0f9e78', color: '#fff' }}>
                  {['No', 'Tanggal', 'Keterangan', 'Kategori', 'Debit (+)', 'Kredit (−)', 'Saldo'].map(h => (
                    <th key={h} style={{
                      padding: '7px 8px', textAlign: h === 'No' ? 'center' : h.startsWith('Debit') || h.startsWith('Kredit') || h === 'Saldo' ? 'right' : 'left',
                      fontWeight: 700, fontSize: 11,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txns.map((t, i) => {
                  saldoBerjalan += t.tipe === 'masuk' ? t.jumlah : -t.jumlah
                  const isEven = i % 2 === 0
                  return (
                    <tr key={t.id} style={{ background: isEven ? '#fff' : '#f9fafb' }}>
                      <td style={{ padding: '6px 8px', textAlign: 'center', color: '#888', borderBottom: '1px solid #f3f4f6' }}>{i + 1}</td>
                      <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' }}>{tgl(t.tanggal)}</td>
                      <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', maxWidth: 160 }}>{t.keterangan}</td>
                      <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 99,
                          background: '#f3f4f6', color: '#555',
                        }}>{t.kategori}</span>
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', borderBottom: '1px solid #f3f4f6', color: '#16a34a', fontWeight: 600 }}>
                        {t.tipe === 'masuk' ? rp(t.jumlah) : '—'}
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', borderBottom: '1px solid #f3f4f6', color: '#dc2626', fontWeight: 600 }}>
                        {t.tipe === 'keluar' ? rp(t.jumlah) : '—'}
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', borderBottom: '1px solid #f3f4f6', fontWeight: 700, color: saldoBerjalan >= 0 ? '#111' : '#dc2626' }}>
                        {rp(saldoBerjalan)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f0fdf4', fontWeight: 700 }}>
                  <td colSpan={4} style={{ padding: '8px 8px', fontWeight: 700, borderTop: '2px solid #0f9e78' }}>
                    TOTAL
                  </td>
                  <td style={{ padding: '8px 8px', textAlign: 'right', color: '#16a34a', borderTop: '2px solid #0f9e78' }}>
                    {rp(totalMasuk)}
                  </td>
                  <td style={{ padding: '8px 8px', textAlign: 'right', color: '#dc2626', borderTop: '2px solid #0f9e78' }}>
                    {rp(totalKeluar)}
                  </td>
                  <td style={{ padding: '8px 8px', textAlign: 'right', color: '#059669', borderTop: '2px solid #0f9e78' }}>
                    {rp(saldoAkhir)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}

          {/* TANDA TANGAN */}
          <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {['Bendahara RT', 'Ketua RT'].map(jabatan => (
              <div key={jabatan} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 12, margin: '0 0 60px' }}>{jabatan},</p>
                <div style={{ borderTop: '1px solid #333', paddingTop: 4 }}>
                  <p style={{ fontSize: 12, margin: 0 }}>( ___________________ )</p>
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 10, color: '#aaa', margin: 0 }}>Dicetak oleh KasRT · kasrt.vercel.app</p>
            <p style={{ fontSize: 10, color: '#aaa', margin: 0 }}>Dicetak pada: {tanggalCetak}</p>
          </div>

        </div>
      </div>
    </>
  )
}
