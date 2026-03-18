'use client'
import { useState, useEffect } from 'react'
import { Bell, X, AlertTriangle, Clock, CheckCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export interface Notif {
  id: string
  tipe: 'urgent' | 'warning' | 'info'
  judul: string
  pesan: string
  href?: string
  tanggal?: string
}

interface Props { notifs: Notif[] }

export default function NotifikasiBell({ notifs }: Props) {
  const [open, setOpen]     = useState(false)
  const [dibaca, setDibaca] = useState<Set<string>>(new Set())

  // Load status dibaca dari localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kasrt-notif-read')
      if (saved) setDibaca(new Set(JSON.parse(saved)))
    } catch {}
  }, [])

  const belumDibaca = notifs.filter(n => !dibaca.has(n.id)).length

  function tandaiDibaca(id: string) {
    const next = new Set(Array.from(dibaca).concat(id))
    setDibaca(next)
    try { localStorage.setItem('kasrt-notif-read', JSON.stringify(Array.from(next))) } catch {}
  }

  function tandaiSemuaDibaca() {
    const next = new Set<string>(notifs.map(n => n.id))
    setDibaca(next)
    try { localStorage.setItem('kasrt-notif-read', JSON.stringify(Array.from(next))) } catch {}
  }

  const TIPE_CONFIG = {
    urgent:  { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', Icon: AlertTriangle },
    warning: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', Icon: Clock },
    info:    { color: 'var(--teal)', bg: 'var(--teal-light)', border: '#a7f3d0', Icon: CheckCircle },
  }

  return (
    <>
      {/* Bell button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'relative', background: 'rgba(255,255,255,0.2)',
          border: 'none', borderRadius: '50%', width: 34, height: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
          transition: 'background .15s',
        }}
      >
        <Bell size={16} color="#fff" />
        {belumDibaca > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2,
            width: 16, height: 16, borderRadius: '50%',
            background: '#ef4444', border: '2px solid var(--teal)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 800, color: '#fff',
            animation: 'popIn .3s ease-out both',
          }}>
            {belumDibaca > 9 ? '9+' : belumDibaca}
          </span>
        )}
      </button>

      {/* Panel notifikasi */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 998, animation: 'fadeIn .15s ease-out both' }}
          />

          {/* Drawer dari atas */}
          <div style={{
            position: 'fixed', top: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: '100%', maxWidth: 480,
            background: '#fff', zIndex: 999,
            borderRadius: '0 0 20px 20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            animation: 'slideDown .28s cubic-bezier(0.34, 1.2, 0.64, 1) both',
            maxHeight: '80vh', overflowY: 'auto',
          }}>
            {/* Header panel */}
            <div style={{
              padding: '16px 16px 12px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              position: 'sticky', top: 0, background: '#fff', zIndex: 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell size={16} color="var(--teal)" />
                <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Notifikasi</p>
                {belumDibaca > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '1px 7px',
                    borderRadius: 99, background: '#fef2f2', color: '#dc2626',
                  }}>
                    {belumDibaca} baru
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {belumDibaca > 0 && (
                  <button onClick={tandaiSemuaDibaca} style={{
                    fontSize: 11, color: 'var(--teal)', fontWeight: 600,
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', padding: 0,
                  }}>
                    Tandai semua dibaca
                  </button>
                )}
                <button onClick={() => setOpen(false)} style={{
                  width: 28, height: 28, borderRadius: '50%', background: '#f5f5f3',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <X size={14} color="var(--text2)" />
                </button>
              </div>
            </div>

            {/* List notifikasi */}
            {notifs.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                <CheckCircle size={32} color="var(--teal)" style={{ margin: '0 auto 10px', display: 'block' }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', margin: '0 0 4px' }}>Semua beres!</p>
                <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>Tidak ada tagihan atau iuran yang perlu diperhatikan.</p>
              </div>
            ) : (
              <div style={{ padding: '8px 0 16px' }}>
                {notifs.map(n => {
                  const { color, bg, border, Icon } = TIPE_CONFIG[n.tipe]
                  const sudahDibaca = dibaca.has(n.id)
                  const content = (
                    <div
                      key={n.id}
                      onClick={() => tandaiDibaca(n.id)}
                      style={{
                        display: 'flex', gap: 12, padding: '10px 16px',
                        background: sudahDibaca ? 'transparent' : bg,
                        borderLeft: `3px solid ${sudahDibaca ? 'transparent' : border}`,
                        cursor: n.href ? 'pointer' : 'default',
                        transition: 'background .15s',
                        animation: 'fadeUp .2s ease-out both',
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: sudahDibaca ? '#f5f5f3' : bg,
                        border: `1px solid ${sudahDibaca ? '#eee' : border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: 1,
                      }}>
                        <Icon size={15} color={sudahDibaca ? 'var(--text3)' : color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <p style={{ fontSize: 13, fontWeight: sudahDibaca ? 500 : 700, color: sudahDibaca ? 'var(--text2)' : 'var(--text)', margin: '0 0 2px', lineHeight: 1.4 }}>
                            {n.judul}
                          </p>
                          {!sudahDibaca && (
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 4 }} />
                          )}
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0, lineHeight: 1.5 }}>{n.pesan}</p>
                        {n.tanggal && (
                          <p style={{ fontSize: 11, color: 'var(--text3)', margin: '3px 0 0', opacity: .7 }}>{n.tanggal}</p>
                        )}
                      </div>
                      {n.href && <ChevronRight size={14} color="var(--text3)" style={{ flexShrink: 0, marginTop: 4 }} />}
                    </div>
                  )

                  return n.href ? (
                    <Link key={n.id} href={n.href} style={{ textDecoration: 'none', display: 'block' }} onClick={() => setOpen(false)}>
                      {content}
                    </Link>
                  ) : (
                    <div key={n.id}>{content}</div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
