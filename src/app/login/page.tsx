'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type Mode = 'masuk' | 'daftar'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('masuk')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function submit() {
    setError(''); setInfo('')
    if (!email.trim()) { setError('Isi email dulu'); return }
    if (password.length < 6) { setError('Password minimal 6 karakter'); return }
    setLoading(true)
    try {
      if (mode === 'masuk') {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password })
        if (e) { setError(errMsg(e.message)); return }
        router.refresh()
        router.push('/dashboard')
      } else {
        const { error: e } = await supabase.auth.signUp({ email, password })
        if (e) { setError(errMsg(e.message)); return }
        setInfo('Akun dibuat! Silakan masuk.')
        setMode('masuk')
      }
    } finally {
      setLoading(false)
    }
  }

  function errMsg(msg: string) {
    if (msg.includes('Invalid login')) return 'Email atau password salah'
    if (msg.includes('already registered')) return 'Email sudah terdaftar'
    if (msg.includes('not confirmed')) return 'Matikan "Confirm email" di Supabase dulu'
    return msg
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 24px', background: 'var(--bg)',
      // Animasi masuk halaman login
      animation: 'fadeIn 0.3s ease-out both',
    }}>
      {/* Logo — bounce in */}
      <div style={{
        textAlign: 'center', marginBottom: 40,
        animation: 'popIn 0.4s 0.05s ease-out both',
      }}>
        <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--teal)', letterSpacing: '-1px', margin: '0 0 6px' }}>
          KasRT 🏘️
        </p>
        <p style={{ fontSize: 14, color: 'var(--text3)', margin: 0 }}>Kelola RT lebih mudah</p>
      </div>

      {/* Form card — slide up */}
      <div style={{
        width: '100%', maxWidth: 360,
        animation: 'slideUp 0.35s 0.1s ease-out both',
      }}>
        {/* Tab toggle */}
        <div style={{
          display: 'flex', background: '#eee',
          borderRadius: 12, padding: 4, marginBottom: 24,
        }}>
          {(['masuk', 'daftar'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setInfo('') }}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 9, border: 'none',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                background: mode === m ? '#fff' : 'transparent',
                color: mode === m ? 'var(--text)' : 'var(--text3)',
                transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {m === 'masuk' ? 'Masuk' : 'Daftar Baru'}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ animation: 'fadeUp 0.3s 0.15s ease-out both' }}>
            <label style={lbl}>Email</label>
            <input
              className="input"
              type="email"
              placeholder="contoh@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
          </div>
          <div style={{ animation: 'fadeUp 0.3s 0.2s ease-out both' }}>
            <label style={lbl}>Password</label>
            <input
              className="input"
              type="password"
              placeholder="minimal 6 karakter"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
          </div>
        </div>

        {/* Feedback messages */}
        {error && (
          <p style={{
            fontSize: 13, color: '#dc2626', marginTop: 10, fontWeight: 500,
            animation: 'fadeUp 0.2s ease-out both',
          }}>
            ⚠ {error}
          </p>
        )}
        {info && (
          <p style={{
            fontSize: 13, color: 'var(--teal)', marginTop: 10, fontWeight: 600,
            animation: 'fadeUp 0.2s ease-out both',
          }}>
            ✓ {info}
          </p>
        )}

        {/* Submit button */}
        <button
          onClick={submit}
          disabled={loading}
          className="btn"
          style={{
            width: '100%', marginTop: 20, fontSize: 15, height: 48,
            animation: 'fadeUp 0.3s 0.25s ease-out both',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Spinner /> {mode === 'masuk' ? 'Masuk...' : 'Mendaftar...'}
            </span>
          ) : (
            mode === 'masuk' ? 'Masuk ke KasRT →' : 'Buat Akun →'
          )}
        </button>

        <p style={{
          fontSize: 12, color: 'var(--text3)', textAlign: 'center',
          marginTop: 20, lineHeight: 1.6,
          animation: 'fadeIn 0.4s 0.3s ease-out both',
        }}>
          Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan KasRT.
        </p>
      </div>
    </div>
  )
}

// Spinner SVG kecil — tidak pakai library
function Spinner() {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{ animation: 'spin 0.7s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

const lbl: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: 'var(--text2)', marginBottom: 6,
}
