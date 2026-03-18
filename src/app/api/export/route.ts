import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const sb = createRouteHandlerClient({ cookies })
  const { data: { session } } = await sb.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url    = new URL(req.url)
  const format = url.searchParams.get('format') ?? 'csv'   // 'csv' | 'excel'
  const tipe   = url.searchParams.get('tipe')   ?? 'warga' // 'warga' | 'kas' | 'tagihan'

  // Ambil RT user
  const { data: nb } = await sb
    .from('neighborhoods')
    .select('id, nama, rw, kelurahan, kota')
    .eq('owner_id', session.user.id)
    .single()

  if (!nb) return NextResponse.json({ error: 'RT tidak ditemukan' }, { status: 404 })

  let rows: Record<string, string | number>[] = []
  let filename = ''

  const tanggalExport = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')

  if (tipe === 'warga') {
    // ── Data warga ──────────────────────────────────────────
    const { data } = await sb
      .from('members')
      .select('*')
      .eq('neighborhood_id', nb.id)
      .order('no_rumah')

    // Ambil tagihan aktif untuk status iuran
    const { data: bills } = await sb
      .from('bills')
      .select('id, judul')
      .eq('neighborhood_id', nb.id)
      .eq('status', 'buka')
      .limit(1)

    let paidSet = new Set<string>()
    let namaTagihan = ''
    if (bills && bills.length > 0) {
      namaTagihan = bills[0].judul
      const { data: payments } = await sb
        .from('bill_payments')
        .select('member_id, status')
        .eq('bill_id', bills[0].id)
      payments?.forEach(p => { if (p.status === 'lunas') paidSet.add(p.member_id) })
    }

    rows = (data ?? []).map((m, i) => ({
      'No': i + 1,
      'Nama KK':       m.nama,
      'No. Rumah':     m.no_rumah ?? '',
      'Jumlah Jiwa':   m.jumlah_jiwa,
      'No. HP/WA':     m.no_hp ?? '',
      'Alamat':        m.alamat ?? '',
      'Status':        m.status === 'aktif' ? 'Aktif' : 'Pindah',
      ...(namaTagihan ? { [`Iuran: ${namaTagihan}`]: paidSet.has(m.id) ? 'Lunas' : 'Belum' } : {}),
      'Tgl Masuk':     new Date(m.created_at).toLocaleDateString('id-ID'),
    }))

    filename = `Data_Warga_${nb.nama.replace(/\s/g, '_')}_${tanggalExport}`

  } else if (tipe === 'kas') {
    // ── Data transaksi kas ───────────────────────────────────
    const { data } = await sb
      .from('cashbook')
      .select('*')
      .eq('neighborhood_id', nb.id)
      .order('tanggal', { ascending: false })
      .order('created_at', { ascending: false })

    let saldoBerjalan = 0
    const list = [...(data ?? [])].reverse()
    const withSaldo = list.map((t, i) => {
      saldoBerjalan += t.tipe === 'masuk' ? t.jumlah : -t.jumlah
      return { ...t, saldo: saldoBerjalan }
    }).reverse()

    rows = withSaldo.map((t, i) => ({
      'No':           i + 1,
      'Tanggal':      new Date(t.tanggal).toLocaleDateString('id-ID'),
      'Keterangan':   t.keterangan,
      'Kategori':     t.kategori,
      'Tipe':         t.tipe === 'masuk' ? 'Pemasukan' : 'Pengeluaran',
      'Debit (Rp)':   t.tipe === 'masuk'  ? t.jumlah : 0,
      'Kredit (Rp)':  t.tipe === 'keluar' ? t.jumlah : 0,
      'Saldo (Rp)':   t.saldo,
    }))

    filename = `Buku_Kas_${nb.nama.replace(/\s/g, '_')}_${tanggalExport}`

  } else if (tipe === 'tagihan') {
    // ── Rekap tagihan semua warga ────────────────────────────
    const { data: bills } = await sb
      .from('bills')
      .select('*')
      .eq('neighborhood_id', nb.id)
      .order('created_at', { ascending: false })

    const { data: payments } = await sb
      .from('bill_payments')
      .select('*, members(nama, no_rumah), bills(judul, nominal)')
      .eq('bill_id', bills?.[0]?.id ?? '')

    rows = (payments ?? []).map((p, i) => ({
      'No':           i + 1,
      'Nama KK':      (p.members as any)?.nama ?? '',
      'No. Rumah':    (p.members as any)?.no_rumah ?? '',
      'Tagihan':      (p.bills as any)?.judul ?? '',
      'Nominal (Rp)': (p.bills as any)?.nominal ?? 0,
      'Status':       p.status === 'lunas' ? 'Lunas' : 'Belum Lunas',
      'Metode':       p.metode ?? '',
      'Tgl Bayar':    p.dibayar_at ? new Date(p.dibayar_at).toLocaleDateString('id-ID') : '',
    }))

    filename = `Rekap_Tagihan_${nb.nama.replace(/\s/g, '_')}_${tanggalExport}`
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Tidak ada data untuk diekspor' }, { status: 404 })
  }

  if (format === 'csv') {
    // ── Generate CSV ─────────────────────────────────────────
    const headers = Object.keys(rows[0])
    const csvLines = [
      // BOM untuk Excel UTF-8
      '\uFEFF' + headers.join(','),
      ...rows.map(row =>
        headers.map(h => {
          const val = String(row[h] ?? '')
          // Escape koma dan quotes
          return val.includes(',') || val.includes('"') || val.includes('\n')
            ? `"${val.replace(/"/g, '""')}"`
            : val
        }).join(',')
      )
    ]

    return new NextResponse(csvLines.join('\r\n'), {
      headers: {
        'Content-Type':        'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.csv"`,
      }
    })

  } else {
    // ── Generate Excel (XLSX via XML) ─────────────────────────
    // Pakai format SpreadsheetML — native Excel tanpa library
    const headers = Object.keys(rows[0])

    function escXml(s: string) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    }

    function cellType(val: unknown) {
      return typeof val === 'number' ? '' : ' t="s"'
    }

    // String table
    const strings: string[] = []
    const strIdx = (s: string) => {
      const i = strings.indexOf(s)
      if (i >= 0) return i
      strings.push(s)
      return strings.length - 1
    }

    // Pre-populate string table
    headers.forEach(h => strIdx(h))
    rows.forEach(row => headers.forEach(h => {
      const val = row[h]
      if (typeof val === 'string') strIdx(val)
    }))

    const colLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    // Build sheet XML
    const sheetRows = [
      // Header row
      `<row r="1">` +
      headers.map((h, ci) =>
        `<c r="${colLetters[ci]}1" t="s" s="1"><v>${strIdx(h)}</v></c>`
      ).join('') +
      `</row>`,
      // Data rows
      ...rows.map((row, ri) =>
        `<row r="${ri + 2}">` +
        headers.map((h, ci) => {
          const val = row[h]
          const isNum = typeof val === 'number'
          return isNum
            ? `<c r="${colLetters[ci]}${ri + 2}"><v>${val}</v></c>`
            : `<c r="${colLetters[ci]}${ri + 2}" t="s"><v>${strIdx(String(val ?? ''))}</v></c>`
        }).join('') +
        `</row>`
      )
    ]

    const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetData>${sheetRows.join('')}</sheetData>
</worksheet>`

    const sstXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${strings.length}" uniqueCount="${strings.length}">
${strings.map(s => `<si><t xml:space="preserve">${escXml(s)}</t></si>`).join('')}
</sst>`

    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="11"/><name val="Arial"/></font></fonts>
<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="2">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0"/>
</cellXfs>
</styleSheet>`

    const wbXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Data" sheetId="1" r:id="rId1"/></sheets>
</workbook>`

    const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`

    const pkgRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`

    // Build ZIP manually (XLSX = ZIP)
    const encoder = new TextEncoder()
    const files: [string, Uint8Array][] = [
      ['[Content_Types].xml',       encoder.encode(contentTypesXml)],
      ['_rels/.rels',               encoder.encode(pkgRelsXml)],
      ['xl/workbook.xml',           encoder.encode(wbXml)],
      ['xl/_rels/workbook.xml.rels',encoder.encode(relsXml)],
      ['xl/worksheets/sheet1.xml',  encoder.encode(sheetXml)],
      ['xl/sharedStrings.xml',      encoder.encode(sstXml)],
      ['xl/styles.xml',             encoder.encode(stylesXml)],
    ]

    const zipBytes = buildZip(files)

    return new NextResponse(zipBytes, {
      headers: {
        'Content-Type':        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
      }
    })
  }
}

// ── Minimal ZIP builder (no library needed) ──────────────────
function buildZip(files: [string, Uint8Array][]): Uint8Array {
  const parts: Uint8Array[] = []
  const centralDir: Uint8Array[] = []
  let offset = 0

  for (const [name, data] of files) {
    const nameBytes = new TextEncoder().encode(name)
    const crc = crc32(data)
    const localHeader = new Uint8Array(30 + nameBytes.length)
    const v = new DataView(localHeader.buffer)
    v.setUint32(0, 0x04034b50, true)  // signature
    v.setUint16(4, 20, true)           // version needed
    v.setUint16(6, 0, true)            // flags
    v.setUint16(8, 0, true)            // compression (stored)
    v.setUint16(10, 0, true)           // mod time
    v.setUint16(12, 0, true)           // mod date
    v.setUint32(14, crc, true)         // crc32
    v.setUint32(18, data.length, true) // compressed size
    v.setUint32(22, data.length, true) // uncompressed size
    v.setUint16(26, nameBytes.length, true)
    v.setUint16(28, 0, true)
    localHeader.set(nameBytes, 30)

    const cdEntry = new Uint8Array(46 + nameBytes.length)
    const cv = new DataView(cdEntry.buffer)
    cv.setUint32(0, 0x02014b50, true)
    cv.setUint16(4, 20, true)
    cv.setUint16(6, 20, true)
    cv.setUint16(8, 0, true)
    cv.setUint16(10, 0, true)
    cv.setUint16(12, 0, true)
    cv.setUint16(14, 0, true)
    cv.setUint32(16, crc, true)
    cv.setUint32(20, data.length, true)
    cv.setUint32(24, data.length, true)
    cv.setUint16(28, nameBytes.length, true)
    cv.setUint16(30, 0, true)
    cv.setUint16(32, 0, true)
    cv.setUint16(34, 0, true)
    cv.setUint16(36, 0, true)
    cv.setUint32(38, 0x20, true)       // external attrs
    cv.setUint32(42, offset, true)     // local header offset
    cdEntry.set(nameBytes, 46)

    parts.push(localHeader, data)
    centralDir.push(cdEntry)
    offset += localHeader.length + data.length
  }

  const cdSize = centralDir.reduce((s, b) => s + b.length, 0)
  const eocd = new Uint8Array(22)
  const ev = new DataView(eocd.buffer)
  ev.setUint32(0, 0x06054b50, true)
  ev.setUint16(4, 0, true)
  ev.setUint16(6, 0, true)
  ev.setUint16(8, files.length, true)
  ev.setUint16(10, files.length, true)
  ev.setUint32(12, cdSize, true)
  ev.setUint32(16, offset, true)
  ev.setUint16(20, 0, true)

  const all = [...parts, ...centralDir, eocd]
  const total = all.reduce((s, b) => s + b.length, 0)
  const result = new Uint8Array(total)
  let pos = 0
  for (const b of all) { result.set(b, pos); pos += b.length }
  return result
}

// CRC32
function crc32(data: Uint8Array): number {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    table[i] = c
  }
  let crc = 0xFFFFFFFF
  for (const b of data) crc = table[(crc ^ b) & 0xFF] ^ (crc >>> 8)
  return (crc ^ 0xFFFFFFFF) >>> 0
}
