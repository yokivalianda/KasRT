'use client'
import { useState } from 'react'
import { Smartphone, X, Share } from 'lucide-react'

export default function IOSInstallGuide() {
  const [show, setShow] = useState(false)

  // Deteksi iOS
  const isIOS = typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent)

  // Cek apakah sudah standalone (sudah diinstall)
  const isStandalone = typeof window !== 'undefined' &&
    window.matchMedia('(display-mode: standalone)').matches

  if (isStandalone) return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 0',
      fontSize: 13, color: '#16a34a', fontWeight: 600,
    }}>
      ✅ KasRT sudah terpasang di homescreen
    </div>
  )

  return (
    <>
      <button
        onClick={() => setShow(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: '10px 0', background: 'none',
          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 14, fontWeight: 600, color: 'var(--teal)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <Smartphone size={16} />
        Pasang di homescreen HP
      </button>

      {show && (
        <>
          <div onClick={() => setShow(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} />
          <div style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 480, background: '#fff',
            borderRadius: '20px 20px 0 0', padding: '12px 20px 32px',
            zIndex: 1000, animation: 'slideUpSheet .3s ease-out both',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#ddd', margin: '0 auto 16px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Pasang KasRT di HP</p>
              <button onClick={() => setShow(false)} style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} color="#888" />
              </button>
            </div>

            {isIOS ? (
              // Panduan iOS
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.6 }}>
                  Di Safari, ikuti langkah berikut:
                </p>
                {[
                  { num: '1', text: 'Ketuk tombol Share (kotak dengan panah ke atas) di toolbar Safari' },
                  { num: '2', text: 'Scroll ke bawah, ketuk "Add to Home Screen" (Tambahkan ke Layar Utama)' },
                  { num: '3', text: 'Ketuk "Add" — KasRT akan muncul di homescreen seperti app biasa' },
                ].map(({ num, text }) => (
                  <div key={num} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--teal)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {num}
                    </div>
                    <p style={{ fontSize: 13, color: '#444', margin: 0, lineHeight: 1.6 }}>{text}</p>
                  </div>
                ))}
                <div style={{ background: '#fff7ed', borderRadius: 8, padding: '10px 12px', marginTop: 4 }}>
                  <p style={{ fontSize: 12, color: '#92400e', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Share size={13} /> Pastikan menggunakan Safari (bukan Chrome atau Firefox) untuk fitur ini
                  </p>
                </div>
              </div>
            ) : (
              // Android / Desktop
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.6 }}>
                  Di Chrome Android atau browser lain:
                </p>
                {[
                  { num: '1', text: 'Ketuk menu ⋮ (tiga titik) di pojok kanan atas browser' },
                  { num: '2', text: 'Pilih "Install app" atau "Add to Home screen"' },
                  { num: '3', text: 'Konfirmasi, lalu KasRT akan muncul di homescreen' },
                ].map(({ num, text }) => (
                  <div key={num} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--teal)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {num}
                    </div>
                    <p style={{ fontSize: 13, color: '#444', margin: 0, lineHeight: 1.6 }}>{text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <style>{`@keyframes slideUpSheet { from { transform: translateX(-50%) translateY(100%); } to { transform: translateX(-50%) translateY(0); } }`}</style>
        </>
      )}
    </>
  )
}
