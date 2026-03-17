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
        // auth-helpers otomatis set cookie — tinggal refresh halaman
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
    if (msg.includes('already registered')) return 'Email sudah terdaftar, silakan masuk'
    if (msg.includes('not confirmed')) return 'Email belum dikonfirmasi — matikan "Confirm email" di Supabase'
    return msg
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 24px', background: 'var(--bg)',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <p style={{ fontSize: 30, fontWeight: 800, color: 'var(--teal)', letterSpacing: '-0.5px', margin: '0 0 4px' }}>
          KasRT <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:'var(--amber)', marginBottom:2 }} />
        </p>
        <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>Kelola RT lebih mudah</p>
      </div>

      <div style={{ width: '100%', maxWidth: 360 }}>
        {/* Tab */}
        <div style={{ display:'flex', background:'#eee', borderRadius:12, padding:4, marginBottom:24 }}>
          {(['masuk','daftar'] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setInfo('') }}
              style={{
                flex:1, padding:'8px 0', borderRadius:9, border:'none',
                fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                background: mode===m ? '#fff' : 'transparent',
                color: mode===m ? 'var(--text)' : 'var(--text3)',
                transition:'all .15s',
                textTransform:'capitalize',
              }}>
              {m === 'masuk' ? 'Masuk' : 'Daftar Baru'}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <label style={{ display:'block', fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:6 }}>
              Email
            </label>
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
          <div>
            <label style={{ display:'block', fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:6 }}>
              Password
            </label>
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

        {error && (
          <p style={{ fontSize:13, color:'#dc2626', marginTop:10, fontWeight:500 }}>⚠ {error}</p>
        )}
        {info && (
          <p style={{ fontSize:13, color:'var(--teal)', marginTop:10, fontWeight:600 }}>✓ {info}</p>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="btn"
          style={{ width:'100%', marginTop:20, fontSize:15 }}
        >
          {loading ? 'Memproses...' : mode === 'masuk' ? 'Masuk ke KasRT →' : 'Buat Akun →'}
        </button>

        <p style={{ fontSize:12, color:'var(--text3)', textAlign:'center', marginTop:20, lineHeight:1.6 }}>
          Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan KasRT.
        </p>
      </div>
    </div>
  )
}
