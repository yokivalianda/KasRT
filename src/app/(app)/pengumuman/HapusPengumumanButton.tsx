'use client'
import { hapusPengumuman } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function HapusPengumumanButton({ id }: { id: string }) {
  const router = useRouter()
  async function hapus() {
    if (!confirm('Hapus pengumuman ini?')) return
    await hapusPengumuman(id)
    router.refresh()
  }
  return (
    <button onClick={hapus} style={{ background:'none', border:'none', cursor:'pointer', padding:4, color:'var(--text3)' }}>
      <Trash2 size={14} />
    </button>
  )
}
