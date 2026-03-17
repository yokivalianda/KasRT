'use client'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton({ full }: { full?: boolean }) {
  const router = useRouter()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (full) {
    return (
      <button onClick={logout} style={{
        display:'flex', alignItems:'center', gap:8, width:'100%',
        padding:'10px 0', background:'none', border:'none',
        cursor:'pointer', fontSize:14, fontWeight:600,
        color:'#dc2626', fontFamily:'inherit',
      }}>
        <LogOut size={16} color="#dc2626" /> Keluar dari akun
      </button>
    )
  }

  return (
    <button onClick={logout} style={{
      display:'flex', alignItems:'center', gap:6,
      background:'rgba(255,255,255,.2)', border:'none',
      color:'#fff', borderRadius:99, padding:'5px 12px',
      fontSize:12, fontWeight:600, cursor:'pointer',
    }}>
      <LogOut size={13} /> Keluar
    </button>
  )
}
