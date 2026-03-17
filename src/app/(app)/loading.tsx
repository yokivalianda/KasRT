// Loading state global — tampil saat navigasi antar halaman
// Next.js otomatis pakai file ini sebagai suspense fallback
export default function Loading() {
  return (
    <div style={{
      maxWidth: 480, margin: '0 auto', minHeight: '100vh',
      background: '#fff', paddingBottom: 84,
      animation: 'fadeIn 0.15s ease-out both',
    }}>
      {/* Header skeleton */}
      <div style={{
        background: 'var(--teal)', padding: '48px 20px 24px',
        opacity: 0.85,
      }}>
        <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 8, opacity: 0.3, borderRadius: 7 }} />
        <div className="skeleton" style={{ width: '80%', height: 22, marginBottom: 20, opacity: 0.3, borderRadius: 7 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 10, padding: 12 }}>
              <div className="skeleton" style={{ width: '70%', height: 18, marginBottom: 6, opacity: 0.4, borderRadius: 5 }} />
              <div className="skeleton" style={{ width: '50%', height: 10, opacity: 0.3, borderRadius: 5 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div style={{ padding: '16px 16px 0' }}>
        {[0,1,2].map(i => (
          <div
            key={i}
            className="card"
            style={{
              padding: 14, marginBottom: 10,
              animation: `fadeUp 0.25s ${0.05 + i * 0.07}s ease-out both`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="skeleton" style={{ width: '55%', height: 15, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: '20%', height: 15, borderRadius: 99 }} />
            </div>
            <div className="skeleton" style={{ width: '40%', height: 11, marginBottom: 10, borderRadius: 5 }} />
            <div className="skeleton" style={{ width: '100%', height: 6, borderRadius: 3 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
