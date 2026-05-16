'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          padding: '24px',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a1a' }}>
              Terjadi Kesalahan
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Maaf, terjadi kesalahan saat memuat halaman.
            </p>
            <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '16px', wordBreak: 'break-word' }}>
              {error?.message || 'Unknown error'}
            </p>
            <button
              onClick={reset}
              style={{
                padding: '12px 24px',
                backgroundColor: '#D6001C',
                color: 'white',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
