'use client'
import { X, Download, Smartphone, Wifi, Bell } from 'lucide-react'

interface Props {
  onInstall: () => void
  onDismiss: () => void
}

export default function InstallPrompt({ onInstall, onDismiss }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onDismiss}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 999,
          animation: 'fadeIn .2s ease-out both',
        }}
      />

      {/* Bottom sheet */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        background: '#fff',
        borderRadius: '20px 20px 0 0',
        padding: '0 0 32px',
        zIndex: 1000,
        animation: 'slideUpSheet .3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      }}>
        {/* Handle bar */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: '#ddd', margin: '12px auto 0',
        }} />

        {/* Header */}
        <div style={{ padding: '16px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* App icon */}
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg, #0F9E78, #0A7259)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: '#fff',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(15,158,120,0.3)',
            }}>
              RT
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', margin: '0 0 2px' }}>
                Pasang KasRT
              </p>
              <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
                kasrt.vercel.app
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: '#f5f5f5', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <X size={14} color="#888" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px' }}>
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: '0 0 16px' }}>
            Pasang KasRT di homescreen HP Anda untuk akses lebih cepat — seperti aplikasi biasa, tanpa perlu buka browser.
          </p>

          {/* Fitur */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {[
              { icon: Smartphone, text: 'Buka langsung dari homescreen' },
              { icon: Wifi,       text: 'Tetap bisa dilihat saat offline' },
              { icon: Download,   text: 'Gratis, tidak perlu Play Store' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: 'var(--teal-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={14} color="var(--teal)" />
                </div>
                <span style={{ fontSize: 13, color: '#444' }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Tombol */}
          <button
            onClick={onInstall}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '13px 0', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #0F9E78, #0A7259)',
              fontSize: 15, fontWeight: 700, color: '#fff',
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 14px rgba(15,158,120,0.35)',
              marginBottom: 8,
            }}
          >
            <Download size={16} /> Pasang Sekarang
          </button>

          <button
            onClick={onDismiss}
            style={{
              width: '100%', padding: '11px 0', borderRadius: 12,
              border: 'none', background: 'none',
              fontSize: 13, fontWeight: 500, color: '#999',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Nanti saja
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUpSheet {
          from { transform: translateX(-50%) translateY(100%); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  )
}
