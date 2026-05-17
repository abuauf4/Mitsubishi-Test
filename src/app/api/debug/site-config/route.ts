import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to check what's actually stored in the database
 * for site config (especially logos).
 * 
 * Usage: /api/debug/site-config
 */
export async function GET() {
  const debug: Record<string, any> = {};

  // 1. Check environment
  debug.env = {
    TURSO_DATABASE_URL: !!process.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: !!process.env.TURSO_AUTH_TOKEN,
    BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
  };

  // 2. Check database connection and data
  const db = getDb();
  if (!db) {
    debug.db = 'NOT CONNECTED - using static data';
    debug.staticData = {
      logo_passenger: '/mitsubishi-logo.png',
      logo_commercial: '/mitsubishi-logo.png',
    };
    return NextResponse.json(debug);
  }

  try {
    // Check if SiteConfig table exists
    const tableCheck = await db.execute({
      sql: "SELECT name FROM sqlite_master WHERE type='table' AND name='SiteConfig'",
      args: [],
    });

    if (tableCheck.rows.length === 0) {
      debug.db = 'CONNECTED but SiteConfig table does not exist!';
      return NextResponse.json(debug);
    }

    debug.db = 'CONNECTED';

    // Get ALL site configs
    const result = await db.execute({
      sql: 'SELECT * FROM SiteConfig ORDER BY key ASC',
      args: [],
    });

    debug.totalConfigs = result.rows.length;
    debug.configs = result.rows.map(r => ({
      key: r.key,
      value: r.value ? (typeof r.value === 'string' ? (r.value.length > 120 ? r.value.substring(0, 120) + '...' : r.value) : r.value) : '(empty)',
      type: r.type,
      page: r.page,
    }));

    // Specifically check logo configs
    debug.logos = {};
    for (const row of result.rows) {
      if ((row.key as string).startsWith('logo_')) {
        const val = row.value as string;
        debug.logos[row.key] = {
          value: val || '(empty)',
          isPublicBlob: val?.includes('.public.blob.vercel-storage.com') || false,
          isPrivateBlob: val?.includes('.private.blob.vercel-storage.com') || false,
          isLocalPath: val?.startsWith('/') || false,
          isProxyUrl: val?.startsWith('/api/image?url=') || false,
          proxyResolved: val?.includes('vercel-storage.com') ? `/api/image?url=${encodeURIComponent(val)}` : val,
        };
      }
    }
  } catch (error: any) {
    debug.dbError = error?.message || String(error);
  }

  // 3. Check blob store
  try {
    const { list } = await import('@vercel/blob');
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (token) {
      const { blobs } = await list({ token, limit: 5 });
      debug.blobStore = {
        recentBlobs: blobs.map(b => ({
          url: b.url.substring(0, 80) + '...',
          isPublic: b.url.includes('.public.blob.vercel-storage.com'),
          isPrivate: b.url.includes('.private.blob.vercel-storage.com'),
          pathname: b.pathname,
          size: b.size,
        })),
        storeType: blobs.length > 0
          ? (blobs[0].url.includes('.public.') ? 'PUBLIC' : 'PRIVATE')
          : 'UNKNOWN (no blobs found)',
      };
    }
  } catch (error: any) {
    debug.blobStoreError = error?.message || String(error);
  }

  return NextResponse.json(debug, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
