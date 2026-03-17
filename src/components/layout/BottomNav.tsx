'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, RefreshCw, Users, BookOpen, Megaphone } from 'lucide-react'

const NAV = [
  { href:'/dashboard',  label:'Dashboard',  Icon: LayoutDashboard },
  { href:'/arisan',     label:'Arisan',     Icon: RefreshCw },
  { href:'/warga',      label:'Warga',      Icon: Users },
  { href:'/kas',        label:'Kas',        Icon: BookOpen },
  { href:'/pengumuman', label:'Info',       Icon: Megaphone },
]

export default function BottomNav() {
  const path = usePathname()
  return (
    <nav style={{
      position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)',
      width:'100%', maxWidth:480, background:'#fff',
      borderTop:'1px solid var(--border)', display:'flex', zIndex:50,
    }}>
      {NAV.map(({ href, label, Icon }) => {
        const active = path === href || (href !== '/dashboard' && path.startsWith(href))
        return (
          <Link key={href} href={href} style={{
            flex:1, display:'flex', flexDirection:'column',
            alignItems:'center', gap:2, padding:'10px 4px 8px',
            textDecoration:'none', fontSize:10, fontWeight:600,
            color: active ? 'var(--teal)' : 'var(--text3)',
            transition:'color .15s',
          }}>
            <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
