'use client';

import { useState } from 'react';

type ScanStatus = {
  blob: {
    configured: boolean;
    totalBlobs?: number;
    privateBlobs?: number;
    publicBlobs?: number;
    error?: string;
  };
  database: {
    configured: boolean;
    usedImages?: number;
    privateUrls?: number;
    proxyUrls?: number;
    publicUrls?: number;
    localPaths?: number;
    error?: string;
  };
  env: Record<string, string>;
};

type MigrateResult = {
  step: string;
  status: string;
  details: string[];
  errors: string[];
  summary?: Record<string, number>;
};

export default function MigratePage() {
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);
  const [migrateResult, setMigrateResult] = useState<MigrateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const scan = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/admin/migrate-blob');
      const data = await res.json();
      setScanStatus(data);
    } catch (err: any) {
      alert('Scan failed: ' + (err?.message || err));
    } finally {
      setScanning(false);
    }
  };

  const migrate = async (step: string = 'all') => {
    const labels: Record<string, string> = {
      all: 'Full Migration (only used images)',
      urls: 'Fix Proxy URLs',
    };
    if (!confirm(`Run ${labels[step] || step}? Only images used in the database will be migrated.`)) return;
    setLoading(true);
    setMigrateResult(null);
    try {
      const res = await fetch(`/api/admin/migrate-blob?step=${step}`, { method: 'POST' });
      const data = await res.json();
      setMigrateResult(data);
      await scan();
    } catch (err: any) {
      alert('Migration failed: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const dryRun = async () => {
    setLoading(true);
    setMigrateResult(null);
    try {
      const res = await fetch('/api/admin/migrate-blob?dryRun=true', { method: 'POST' });
      const data = await res.json();
      setMigrateResult(data);
    } catch (err: any) {
      alert('Dry run failed: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const needsMigration = scanStatus && (
    (scanStatus.database.privateUrls ?? 0) > 0 ||
    (scanStatus.database.proxyUrls ?? 0) > 0
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">🗄️ DB & Blob Migration</h1>
          <p className="text-gray-400 text-sm mt-1">
            Migrate only images that are <strong className="text-white">used in the database</strong> — skip orphan/unused photos
          </p>
        </div>

        {/* Step 1: Scan */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Step 1: Scan</h2>
            <button
              onClick={scan}
              disabled={scanning}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              {scanning ? 'Scanning...' : '🔍 Scan Now'}
            </button>
          </div>

          {scanStatus && (
            <div className="space-y-3">
              {/* Env vars */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Environment</h3>
                <div className="space-y-1">
                  {Object.entries(scanStatus.env).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-400">{key}</span>
                      <span className={val.includes('✅') ? 'text-green-400' : 'text-red-400'}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blob status */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Vercel Blob Store</h3>
                {scanStatus.blob.error ? (
                  <p className="text-red-400 text-sm">❌ {scanStatus.blob.error}</p>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total blobs in store</span>
                      <span className="text-white">{scanStatus.blob.totalBlobs ?? '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">🔒 Private</span>
                      <span className={scanStatus.blob.privateBlobs ? 'text-yellow-400' : 'text-green-400'}>
                        {scanStatus.blob.privateBlobs ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">🌐 Public</span>
                      <span className="text-green-400">{scanStatus.blob.publicBlobs ?? 0}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Database status */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Database (used images only)</h3>
                {scanStatus.database.error ? (
                  <p className="text-red-400 text-sm">❌ {scanStatus.database.error}</p>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">📸 Total images used in DB</span>
                      <span className="text-white font-semibold">{scanStatus.database.usedImages ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">🔒 Private blob URLs</span>
                      <span className={scanStatus.database.privateUrls ? 'text-yellow-400 font-semibold' : 'text-green-400'}>
                        {scanStatus.database.privateUrls ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">🔀 Proxy URLs (/api/image)</span>
                      <span className={scanStatus.database.proxyUrls ? 'text-yellow-400 font-semibold' : 'text-green-400'}>
                        {scanStatus.database.proxyUrls ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">🌐 Already public ✅</span>
                      <span className="text-green-400">{scanStatus.database.publicUrls ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">📁 Local paths</span>
                      <span className="text-gray-300">{scanStatus.database.localPaths ?? 0}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Verdict */}
              {needsMigration ? (
                <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3">
                  <p className="text-yellow-300 text-sm font-medium">
                    ⚠️ Migration needed — {scanStatus.database.privateUrls} private + {scanStatus.database.proxyUrls} proxy URLs need fixing
                  </p>
                  <p className="text-yellow-400/70 text-xs mt-1">
                    Only these {scanStatus.database.privateUrls} images will be copied. Unused photos in blob store will be skipped.
                  </p>
                </div>
              ) : (
                <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3">
                  <p className="text-green-300 text-sm font-medium">✅ All images are already public — no migration needed!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Migrate */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
          <h2 className="text-lg font-semibold">Step 2: Migrate</h2>
          <p className="text-gray-400 text-xs">
            Only images that are <strong className="text-white">actually used in the database</strong> will be migrated.
            Orphan/unused photos are skipped automatically.
          </p>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={dryRun}
              disabled={loading}
              className="px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 rounded-lg text-sm font-medium transition-colors border border-gray-700 text-left"
            >
              🔍 <strong>Dry Run</strong> — Preview which images will be migrated (no changes)
            </button>

            <button
              onClick={() => migrate('all')}
              disabled={loading || !needsMigration}
              className="px-4 py-3 bg-red-700 hover:bg-red-600 disabled:bg-gray-900 disabled:text-gray-600 rounded-lg text-sm font-medium transition-colors text-white text-left"
            >
              🚀 <strong>Migrate Used Images Only</strong> — Copy private → public + update DB URLs
            </button>

            <button
              onClick={() => migrate('urls')}
              disabled={loading}
              className="px-4 py-3 bg-amber-700 hover:bg-amber-600 disabled:bg-gray-900 disabled:text-gray-600 rounded-lg text-sm font-medium transition-colors text-white text-left"
            >
              🔗 <strong>Fix Proxy URLs Only</strong> — Unwrap /api/image?url= → direct public URLs
            </button>
          </div>
        </div>

        {/* Results */}
        {(migrateResult || loading) && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
            <h2 className="text-lg font-semibold">
              {loading ? '⏳ Running...' : migrateResult?.status === 'completed' ? '✅ Completed' : '⚠️ Completed with errors'}
            </h2>

            {migrateResult?.summary && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Summary</h3>
                <div className="space-y-1">
                  {Object.entries(migrateResult.summary).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-400">{key}</span>
                      <span className="text-white font-mono">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {migrateResult?.details && migrateResult.details.length > 0 && (
              <details className="bg-gray-800/50 rounded-lg p-3">
                <summary className="text-sm font-medium text-gray-300 cursor-pointer">
                  📋 Details ({migrateResult.details.length} items)
                </summary>
                <pre className="mt-2 text-xs text-gray-400 whitespace-pre-wrap overflow-x-auto max-h-80 overflow-y-auto">
                  {migrateResult.details.join('\n')}
                </pre>
              </details>
            )}

            {migrateResult?.errors && migrateResult.errors.length > 0 && (
              <details open className="bg-red-950/50 rounded-lg p-3 border border-red-900">
                <summary className="text-sm font-medium text-red-300 cursor-pointer">
                  ❌ Errors ({migrateResult.errors.length})
                </summary>
                <pre className="mt-2 text-xs text-red-400 whitespace-pre-wrap overflow-x-auto max-h-60 overflow-y-auto">
                  {migrateResult.errors.join('\n')}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Back */}
        <div className="text-center">
          <a href="/admin" className="text-gray-500 hover:text-gray-300 text-sm underline transition-colors">
            ← Back to Admin
          </a>
        </div>
      </div>
    </div>
  );
}
