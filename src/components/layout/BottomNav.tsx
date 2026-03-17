'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, RefreshCw, Users, BookOpen, Megaphone } from 'lucide-react'

// 5 tab utama — Settings diakses dari header Dashboard
const NAV = [
  { href:'/dashboard',  label:'Dashboard', Icon: LayoutDashboard },
  { href:'/arisan',     label:'Arisan',    Icon: RefreshCw },
  { href:'/warga',      label:'Warga',     Icon: Users },
  { href:'/kas',        label:'Kas',       Icon: BookOpen },
  { href:'/pengumuman', label:'Info',      Icon: Megaphone },
]

export default function BottomNav() {
  const path = usePathname()

  return (
    <nav style={{
      position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)',
      width:'100%', maxWidth:480, background:'#fff',
      borderTop:'1px solid var(--border)', display:'flex', zIndex:50,
      animation:'slideUpNav 0.3s 0.1s ease-out both',
    }}>
      {NAV.map(({ href, label, Icon }) => {
        const active = path === href || (href !== '/dashboard' && path.startsWith(href))
        return (
          <Link key={href} href={href} className="bottom-nav-item" style={{
            flex:1, display:'flex', flexDirection:'column',
            alignItems:'center', gap:2, padding:'10px 4px 8px',
            textDecoration:'none', fontSize:10, fontWeight:600,
            color: active ? 'var(--teal)' : 'var(--text3)',
            position:'relative',
          }}>
            {active && (
              <span style={{
                position:'absolute', top:5,
                width:4, height:4, borderRadius:'50%',
                background:'var(--teal)',
                animation:'scaleIn 0.2s ease-out both',
              }} />
            )}
            <Icon size={20} strokeWidth={active ? 2.2 : 1.8}
              style={{ marginTop: active ? 4 : 0, transition:'margin .15s' }} />
            <span style={{ transition:'color .15s' }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
