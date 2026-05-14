'use client';

import { useEffect, useState } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center px-6">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h2>
        <p className="text-gray-500 mb-4">
          Maaf, terjadi kesalahan saat memuat halaman. Silakan coba lagi.
        </p>

        {/* Error details toggle - for debugging */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-400 text-xs underline mb-4 block mx-auto"
        >
          {showDetails ? 'Sembunyikan Detail' : 'Lihat Detail Error'}
        </button>

        {showDetails && (
          <div className="mb-4 p-3 bg-gray-100 rounded-lg text-left overflow-auto max-h-48">
            <p className="text-red-600 text-xs font-bold mb-1">{error?.name || 'Error'}</p>
            <p className="text-gray-700 text-xs break-words">{error?.message || 'Unknown error'}</p>
            {error?.digest && (
              <p className="text-gray-400 text-[10px] mt-1">Digest: {error.digest}</p>
            )}
            {error?.stack && (
              <pre className="text-gray-500 text-[10px] mt-2 whitespace-pre-wrap break-words">{error.stack.slice(0, 500)}</pre>
            )}
          </div>
        )}

        <button
          onClick={reset}
          className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
