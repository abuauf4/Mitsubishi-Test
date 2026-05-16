'use client';

import { useState } from 'react';

type ScanStatus = {
  blob: { configured: boolean; totalBlobs?: number; privateBlobs?: number; publicBlobs?: number; error?: string };
  database: { configured: boolean; usedImages?: number; privateUrls?: number; proxyUrls?: number; publicUrls?: number; localPaths?: number; error?: string };
  env: Record<string, string>;
};

type MigrateResult = {
  step: string;
  status: string;
  details: string[];
  errors: string[];
  summary?: Record<string, number>;
};

type CleanupStatus = {
  summary: {
    total: number;
    totalSizeMB: string;
    usedCount: number;
    usedSizeMB: string;
    orphanCount: number;
    orphanSizeMB: string;
    savingsPercent: string;
  };
  byFolder: Record<string, { count: number; size: number; used: number; orphan: number }>;
  topOrphans: { pathname: string; sizeKB: string; uploadedAt: string }[];
};

type DeleteResult = {
  status: string;
  message?: string;
  deleted?: number;
  failed?: number;
  freedMB?: string;
  errors?: string[];
  orphanCount?: number;
  orphanSizeMB?: string;
};

export default function MigratePage() {
  const [tab, setTab] = useState<'migrate' | 'cleanup'>('cleanup');
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);
  const [migrateResult, setMigrateResult] = useState<MigrateResult | null>(null);
  const [cleanupStatus, setCleanupStatus] = useState<CleanupStatus | null>(null);
  const [deleteResult, setDeleteResult] = useState<DeleteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const scan = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/admin/migrate-blob');
      setScanStatus(await res.json());
    } catch (err: any) {
      alert('Scan failed: ' + (err?.message || err));
    } finally {
      setScanning(false);
    }
  };

  const migrate = async (step: string = 'all') => {
    if (!confirm(`Run migration (${step})? Only images used in the database will be migrated.`)) return;
    setLoading(true);
    setMigrateResult(null);
    try {
      const res = await fetch(`/api/admin/migrate-blob?step=${step}`, { method: 'POST' });
      setMigrateResult(await res.json());
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
      setMigrateResult(await res.json());
    } catch (err: any) {
      alert('Dry run failed: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const scanCleanup = async () => {
    setScanning(true);
    setCleanupStatus(null);
    try {
      const res = await fetch('/api/admin/blob-cleanup');
      setCleanupStatus(await res.json());
    } catch (err: any) {
      alert('Scan failed: ' + (err?.message || err));
    } finally {
      setScanning(false);
    }
  };

  const previewDelete = async () => {
    setLoading(true);
    setDeleteResult(null);
    try {
      const res = await fetch('/api/admin/blob-cleanup', { method: 'POST' });
      setDeleteResult(await res.json());
    } catch (err: any) {
      alert('Preview failed: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!confirm('⚠️ PERMANENTLY DELETE all orphan blobs? This cannot be undone!')) return;
    if (!confirm('Are you REALLY sure? 468+ photos will be deleted forever.')) return;
    setLoading(true);
    setDeleteResult(null);
    try {
      const res = await fetch('/api/admin/blob-cleanup?confirm=true', { method: 'POST' });
      const data = await res.json();
      setDeleteResult(data);
      if (data.status === 'completed') {
        await scanCleanup(); // refresh
      }
    } catch (err: any) {
      alert('Delete failed: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">🗄️ Blob Storage Manager</h1>
          <p className="text-gray-400 text-sm mt-1">No bash needed — run from your phone!</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
          <button
            onClick={() => setTab('cleanup')}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${
              tab === 'cleanup' ? 'bg-red-700 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            🗑️ Cleanup ({cleanupStatus ? `${cleanupStatus.summary.orphanCount} orphan` : 'Scan first'})
          </button>
          <button
            onClick={() => setTab('migrate')}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${
              tab === 'migrate' ? 'bg-blue-700 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            🔧 Migrate Private → Public
          </button>
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* TAB: CLEANUP                              */}
        {/* ═══════════════════════════════════════════ */}
        {tab === 'cleanup' && (
          <>
            {/* Scan */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">📊 Storage Scan</h2>
                <button
                  onClick={scanCleanup}
                  disabled={scanning}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  {scanning ? 'Scanning...' : '🔍 Scan Now'}
                </button>
              </div>

              {cleanupStatus && (
                <div className="space-y-3">
                  {/* Big summary */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <p className="text-3xl font-bold text-white">{cleanupStatus.summary.total}</p>
                      <p className="text-xs text-gray-400 mt-1">Total Photos</p>
                      <p className="text-xs text-gray-500">{cleanupStatus.summary.totalSizeMB} MB</p>
                    </div>
                    <div className="bg-green-900/30 border border-green-800/50 rounded-lg p-3 text-center">
                      <p className="text-3xl font-bold text-green-400">{cleanupStatus.summary.usedCount}</p>
                      <p className="text-xs text-gray-400 mt-1">Used ✅</p>
                      <p className="text-xs text-gray-500">{cleanupStatus.summary.usedSizeMB} MB</p>
                    </div>
                    <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-3 text-center col-span-2">
                      <p className="text-3xl font-bold text-red-400">{cleanupStatus.summary.orphanCount}</p>
                      <p className="text-xs text-gray-400 mt-1">Orphan / Unused ❌</p>
                      <p className="text-xs text-gray-500">{cleanupStatus.summary.orphanSizeMB} MB — {cleanupStatus.summary.savingsPercent}% of total</p>
                    </div>
                  </div>

                  {/* By folder */}
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">📂 By Folder</h3>
                    <div className="space-y-2">
                      {Object.entries(cleanupStatus.byFolder)
                        .sort(([,a], [,b]) => b.size - a.size)
                        .map(([folder, info]) => (
                          <div key={folder} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-300 font-mono text-xs">/{folder}</span>
                              <span className="text-gray-400">{info.count} files · {(info.size / 1024 / 1024).toFixed(1)} MB</span>
                            </div>
                            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-700">
                              <div
                                className="bg-green-600"
                                style={{ width: `${info.count > 0 ? (info.used / info.count * 100) : 0}%` }}
                                title={`${info.used} used`}
                              />
                              <div
                                className="bg-red-600"
                                style={{ width: `${info.count > 0 ? (info.orphan / info.count * 100) : 0}%` }}
                                title={`${info.orphan} orphan`}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-500">
                              <span>🟢 {info.used} used</span>
                              <span>🔴 {info.orphan} orphan</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Top orphans */}
                  {cleanupStatus.topOrphans.length > 0 && (
                    <details className="bg-gray-800/50 rounded-lg p-3">
                      <summary className="text-sm font-medium text-gray-300 cursor-pointer">
                        🔴 Top {cleanupStatus.topOrphans.length} Biggest Orphan Photos
                      </summary>
                      <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
                        {cleanupStatus.topOrphans.map((b, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-gray-400 font-mono truncate mr-2">{b.pathname}</span>
                            <span className="text-red-400 flex-shrink-0">{b.sizeKB} KB</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>

            {/* Delete */}
            {cleanupStatus && cleanupStatus.summary.orphanCount > 0 && (
              <div className="bg-gray-900 rounded-xl border border-red-900/50 p-4 space-y-3">
                <h2 className="text-lg font-semibold text-red-400">🗑️ Cleanup Orphan Photos</h2>
                <p className="text-gray-400 text-xs">
                  Delete {cleanupStatus.summary.orphanCount} unused photos to free {cleanupStatus.summary.orphanSizeMB} MB of storage.
                  This is permanent and cannot be undone.
                </p>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={previewDelete}
                    disabled={loading}
                    className="px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 rounded-lg text-sm font-medium transition-colors border border-gray-700 text-left"
                  >
                    👁️ <strong>Preview</strong> — See what would be deleted
                  </button>

                  <button
                    onClick={confirmDelete}
                    disabled={loading}
                    className="px-4 py-3 bg-red-800 hover:bg-red-700 disabled:bg-gray-900 disabled:text-gray-600 rounded-lg text-sm font-medium transition-colors text-white text-left"
                  >
                    🗑️ <strong>DELETE {cleanupStatus.summary.orphanCount} Orphan Photos</strong> — Free {cleanupStatus.summary.orphanSizeMB} MB
                  </button>
                </div>

                {/* Delete result */}
                {deleteResult && (
                  <div className={`rounded-lg p-3 ${
                    deleteResult.status === 'completed' ? 'bg-green-900/30 border border-green-800/50' :
                    deleteResult.status === 'preview' ? 'bg-yellow-900/30 border border-yellow-800/50' :
                    'bg-red-900/30 border border-red-800/50'
                  }`}>
                    {deleteResult.status === 'preview' && (
                      <>
                        <p className="text-yellow-300 text-sm font-medium">{deleteResult.message}</p>
                        {deleteResult.orphans && (
                          <details className="mt-2">
                            <summary className="text-xs text-yellow-400 cursor-pointer">
                              View all {deleteResult.orphanCount} files
                            </summary>
                            <div className="mt-1 max-h-40 overflow-y-auto space-y-0.5">
                              {deleteResult.orphans.map((o: { pathname: string; sizeKB: string }, i: number) => (
                                <div key={i} className="flex justify-between text-xs">
                                  <span className="text-gray-400 font-mono">{o.pathname}</span>
                                  <span className="text-red-400">{o.sizeKB} KB</span>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </>
                    )}
                    {deleteResult.status === 'completed' && (
                      <div className="space-y-1">
                        <p className="text-green-300 text-sm font-medium">
                          ✅ Deleted {deleteResult.deleted} orphan photos — freed {deleteResult.freedMB} MB!
                        </p>
                        {deleteResult.failed && deleteResult.failed > 0 && (
                          <p className="text-yellow-400 text-xs">⚠️ {deleteResult.failed} failed to delete</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {cleanupStatus && cleanupStatus.summary.orphanCount === 0 && (
              <div className="bg-green-900/30 border border-green-800/50 rounded-xl p-4 text-center">
                <p className="text-green-300 text-lg font-medium">🎉 All Clean!</p>
                <p className="text-green-400/70 text-sm">No orphan photos — every blob is being used.</p>
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* TAB: MIGRATE                              */}
        {/* ═══════════════════════════════════════════ */}
        {tab === 'migrate' && (
          <>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">🔍 Scan DB URLs</h2>
                <button
                  onClick={scan}
                  disabled={scanning}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  {scanning ? 'Scanning...' : 'Scan Now'}
                </button>
              </div>

              {scanStatus && (
                <div className="space-y-3">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Environment</h3>
                    {Object.entries(scanStatus.env).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-400">{key}</span>
                        <span className={val.includes('✅') ? 'text-green-400' : 'text-red-400'}>{val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Database Image URLs</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">🔒 Private blob (needs migration)</span>
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
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
              <h2 className="text-lg font-semibold">🚀 Migrate</h2>
              <p className="text-gray-400 text-xs">Only images used in the database will be migrated. Orphan photos are skipped.</p>
              <div className="grid grid-cols-1 gap-2">
                <button onClick={dryRun} disabled={loading} className="px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 rounded-lg text-sm font-medium transition-colors border border-gray-700 text-left">
                  🔍 <strong>Dry Run</strong> — Preview changes
                </button>
                <button onClick={() => migrate('all')} disabled={loading} className="px-4 py-3 bg-red-700 hover:bg-red-600 disabled:bg-gray-900 rounded-lg text-sm font-medium transition-colors text-white text-left">
                  🚀 <strong>Full Migration</strong> — Copy used private blobs → public + update DB
                </button>
                <button onClick={() => migrate('urls')} disabled={loading} className="px-4 py-3 bg-amber-700 hover:bg-amber-600 disabled:bg-gray-900 rounded-lg text-sm font-medium transition-colors text-white text-left">
                  🔗 <strong>Fix Proxy URLs</strong> — Unwrap /api/image?url= → direct URLs
                </button>
              </div>
            </div>

            {migrateResult && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
                <h2 className="text-lg font-semibold">
                  {migrateResult.status === 'completed' ? '✅ Completed' : '⚠️ Completed with errors'}
                </h2>
                {migrateResult.summary && (
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    {Object.entries(migrateResult.summary).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-400">{key}</span>
                        <span className="text-white font-mono">{val}</span>
                      </div>
                    ))}
                  </div>
                )}
                {migrateResult.details.length > 0 && (
                  <details className="bg-gray-800/50 rounded-lg p-3">
                    <summary className="text-sm font-medium text-gray-300 cursor-pointer">📋 Details ({migrateResult.details.length})</summary>
                    <pre className="mt-2 text-xs text-gray-400 whitespace-pre-wrap overflow-x-auto max-h-80 overflow-y-auto">
                      {migrateResult.details.join('\n')}
                    </pre>
                  </details>
                )}
                {migrateResult.errors.length > 0 && (
                  <details open className="bg-red-950/50 rounded-lg p-3 border border-red-900">
                    <summary className="text-sm font-medium text-red-300 cursor-pointer">❌ Errors ({migrateResult.errors.length})</summary>
                    <pre className="mt-2 text-xs text-red-400 whitespace-pre-wrap overflow-x-auto max-h-60 overflow-y-auto">
                      {migrateResult.errors.join('\n')}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </>
        )}

        <div className="text-center">
          <a href="/admin" className="text-gray-500 hover:text-gray-300 text-sm underline transition-colors">← Back to Admin</a>
        </div>
      </div>
    </div>
  );
}
