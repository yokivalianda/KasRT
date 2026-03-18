'use client'
import { useTheme } from './ThemeProvider'
import { Sun, Moon, Monitor } from 'lucide-react'

interface Props {
  variant?: 'icon' | 'full'
}

export default function ThemeToggle({ variant = 'full' }: Props) {
  const { theme, setTheme } = useTheme()

  const OPTIONS = [
    { val: 'light',  Icon: Sun,     label: 'Terang' },
    { val: 'dark',   Icon: Moon,    label: 'Gelap' },
    { val: 'system', Icon: Monitor, label: 'Sistem' },
  ] as const

  if (variant === 'icon') {
    // Toggle simpel icon-only (light ↔ dark)
    const isDark = theme === 'dark'
    return (
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        style={{
          background: 'rgba(255,255,255,.15)', border: 'none',
          borderRadius: '50%', width: 34, height: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background .15s',
        }}
        title={isDark ? 'Mode terang' : 'Mode gelap'}
      >
        {isDark
          ? <Sun size={16} color="#fff" />
          : <Moon size={16} color="#fff" />
        }
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 12, padding: 3, gap: 2 }}>
      {OPTIONS.map(({ val, Icon, label }) => {
        const active = theme === val
        return (
          <button
            key={val}
            onClick={() => setTheme(val)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4,
              padding: '8px 4px', borderRadius: 10, border: 'none',
              cursor: 'pointer', fontFamily: 'inherit',
              background: active ? 'var(--card-bg)' : 'transparent',
              color: active ? 'var(--teal)' : 'var(--text3)',
              transition: 'all .15s',
              boxShadow: active ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
            }}
          >
            <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
            <span style={{ fontSize: 11, fontWeight: active ? 700 : 400 }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
