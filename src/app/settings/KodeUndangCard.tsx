'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function KodeUndangCard({ kode, nama }: { kode: string; nama: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(kode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ flex:1, background:'#f5f5f3', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px' }}>
        <p style={{ fontSize:10, color:'var(--text3)', margin:'0 0 2px', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>Kode RT</p>
        <p style={{ fontSize:22, fontWeight:800, color:'var(--teal)', letterSpacing:'.2em', margin:0 }}>{kode}</p>
      </div>
      <button onClick={copy} style={{
        width:42, height:42, borderRadius:10,
        border: copied ? '1px solid #16a34a' : '1px solid var(--border)',
        background: copied ? '#ecfdf5' : '#fff',
        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
        transition:'all .15s', flexShrink:0,
      }}>
        {copied ? <Check size={16} color="#16a34a" /> : <Copy size={16} color="var(--text3)" />}
      </button>
    </div>
  )
}
