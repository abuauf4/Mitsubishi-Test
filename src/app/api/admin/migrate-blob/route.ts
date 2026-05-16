import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * POST /api/admin/migrate-blob
 *
 * Smart migration: ONLY copies blobs that are actually USED in the database.
 * Skips orphan/unused photos — saves bandwidth and storage.
 *
 * Query params:
 *   ?step=scan    — scan only, don't migrate
 *   ?step=urls    — only fix proxy URLs in DB
 *   ?step=migrate — migrate private blobs to public
 *   ?dryRun=true  — preview only (no changes)
 *
 * No bash needed — just hit this endpoint from your phone!
 */

export const maxDuration = 60;

interface BlobInfo {
  url: string;
  pathname: string;
  size: number;
}

// ─── Helper: Collect ALL image URLs currently used in the database ───
async function getUsedImageUrlsFromDb(db: NonNullable<ReturnType<typeof getDb>>): Promise<Set<string>> {
  const usedUrls = new Set<string>();

  const columns = [
    { table: 'Vehicle', column: 'imagePath' },
    { table: 'VehicleVariant', column: 'imagePath' },
    { table: 'VehicleColor', column: 'imagePath' },
    { table: 'Hero', column: 'imagePath' },
    { table: 'AudienceCategory', column: 'imagePath' },
    { table: 'Testimonial', column: 'imagePath' },
    { table: 'SalesConsultant', column: 'imagePath' },
    { table: 'DealerLocation', column: 'embeddingUrl' },
    { table: 'GalleryItem', column: 'imagePath' },
  ];

  for (const { table, column } of columns) {
    try {
      const rows = await db.execute({
        sql: `SELECT ${column} FROM ${table} WHERE ${column} IS NOT NULL AND ${column} != ''`,
        args: [],
      });
      for (const row of rows.rows) {
        const val = row[column] as string;
        if (!val) continue;

        // Direct blob URL
        if (val.includes('blob.vercel-storage.com') || val.includes('vercel-storage.com')) {
          usedUrls.add(val);
        }

        // Proxy URL → extract the inner blob URL
        if (val.includes('/api/image?url=')) {
          const innerUrl = decodeURIComponent(val.replace('/api/image?url=', ''));
          if (innerUrl.includes('vercel-storage.com')) {
            usedUrls.add(innerUrl);
          }
        }
      }
    } catch {
      // Table might not exist — skip
    }
  }

  return usedUrls;
}

// ─── Helper: Update DB URLs using a mapping ───
async function updateDbUrls(
  db: NonNullable<ReturnType<typeof getDb>>,
  urlMapping: Record<string, string>,
  dryRun: boolean
): Promise<{ updated: number; details: string[]; errors: string[] }> {
  const details: string[] = [];
  const errors: string[] = [];
  let updated = 0;

  const columns = [
    { table: 'Vehicle', column: 'imagePath', idColumn: 'id' },
    { table: 'VehicleVariant', column: 'imagePath', idColumn: 'id' },
    { table: 'VehicleColor', column: 'imagePath', idColumn: 'id' },
    { table: 'Hero', column: 'imagePath', idColumn: 'id' },
    { table: 'AudienceCategory', column: 'imagePath', idColumn: 'id' },
    { table: 'Testimonial', column: 'imagePath', idColumn: 'id' },
    { table: 'SalesConsultant', column: 'imagePath', idColumn: 'id' },
    { table: 'DealerLocation', column: 'embeddingUrl', idColumn: 'id' },
    { table: 'GalleryItem', column: 'imagePath', idColumn: 'id' },
  ];

  for (const { table, column, idColumn } of columns) {
    try {
      const rows = await db.execute({
        sql: `SELECT ${idColumn}, ${column} FROM ${table} WHERE ${column} IS NOT NULL AND ${column} != ''`,
        args: [],
      });

      for (const row of rows.rows) {
        const rowId = row[idColumn] as string;
        let current = row[column] as string;
        let changed = false;

        for (const [oldUrl, newUrl] of Object.entries(urlMapping)) {
          if (current.includes(oldUrl)) {
            current = current.replace(oldUrl, newUrl);
            changed = true;
          }
          if (current.includes(`/api/image?url=${encodeURIComponent(oldUrl)}`)) {
            current = newUrl;
            changed = true;
          }
          if (current.includes(`/api/image?url=${oldUrl}`)) {
            current = newUrl;
            changed = true;
          }
        }

        if (changed) {
          details.push(`   📝 ${table}.${column} [${rowId.substring(0, 8)}...]: updated`);
          if (!dryRun) {
            await db.execute({
              sql: `UPDATE ${table} SET ${column} = ? WHERE ${idColumn} = ?`,
              args: [current, rowId],
            });
          }
          updated++;
        }
      }
    } catch (err: any) {
      errors.push(`${table}.${column}: ${err?.message || err}`);
    }
  }

  details.push(`   📊 ${dryRun ? 'Would update' : 'Updated'} ${updated} DB rows`);
  return { updated, details, errors };
}

// ═══════════════════════════════════════════════════
// GET — Scan status without making changes
// ═══════════════════════════════════════════════════
export async function GET() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const db = getDb();

  const status: {
    blob: { configured: boolean; totalBlobs?: number; privateBlobs?: number; publicBlobs?: number; error?: string };
    database: { configured: boolean; privateUrls?: number; proxyUrls?: number; publicUrls?: number; localPaths?: number; usedImages?: number; error?: string };
    env: Record<string, string>;
  } = {
    blob: { configured: !!token },
    database: { configured: !!db },
    env: {
      BLOB_READ_WRITE_TOKEN: token ? '✅ Set' : '❌ Missing',
      TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? '✅ Set' : '❌ Missing',
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? '✅ Set' : '❌ Missing',
    },
  };

  // Scan blob store
  if (token) {
    try {
      const { list } = await import('@vercel/blob');
      const allBlobs: BlobInfo[] = [];
      let cursor: string | undefined;
      let hasMore = true;

      while (hasMore) {
        const batch = await list({ token, limit: 100, cursor });
        for (const b of batch.blobs) {
          allBlobs.push({ url: b.url, pathname: b.pathname, size: b.size });
        }
        cursor = batch.cursor ?? undefined;
        hasMore = batch.hasMore;
      }

      const privateBlobs = allBlobs.filter(b => b.url.includes('.private.blob.vercel-storage.com'));
      const publicBlobs = allBlobs.filter(b => b.url.includes('.public.blob.vercel-storage.com'));

      status.blob.totalBlobs = allBlobs.length;
      status.blob.privateBlobs = privateBlobs.length;
      status.blob.publicBlobs = publicBlobs.length;
    } catch (err: any) {
      status.blob.error = err?.message || String(err);
    }
  }

  // Scan database for image URL types
  if (db) {
    try {
      const usedUrls = await getUsedImageUrlsFromDb(db);
      let privateUrls = 0;
      let proxyUrls = 0;
      let publicUrls = 0;
      let localPaths = 0;

      const columns = [
        { table: 'Vehicle', column: 'imagePath' },
        { table: 'VehicleVariant', column: 'imagePath' },
        { table: 'VehicleColor', column: 'imagePath' },
        { table: 'Hero', column: 'imagePath' },
        { table: 'AudienceCategory', column: 'imagePath' },
        { table: 'Testimonial', column: 'imagePath' },
        { table: 'SalesConsultant', column: 'imagePath' },
        { table: 'GalleryItem', column: 'imagePath' },
      ];

      for (const { table, column } of columns) {
        try {
          const rows = await db.execute({
            sql: `SELECT ${column} FROM ${table} WHERE ${column} IS NOT NULL AND ${column} != ''`,
            args: [],
          });
          for (const row of rows.rows) {
            const val = row[column] as string;
            if (!val) continue;
            if (val.includes('.private.blob.vercel-storage.com')) privateUrls++;
            if (val.includes('/api/image?url=')) proxyUrls++;
            if (val.includes('.public.blob.vercel-storage.com')) publicUrls++;
            if (!val.includes('vercel-storage.com') && !val.includes('/api/image')) localPaths++;
          }
        } catch {
          // Table might not exist
        }
      }

      status.database.usedImages = usedUrls.size;
      status.database.privateUrls = privateUrls;
      status.database.proxyUrls = proxyUrls;
      status.database.publicUrls = publicUrls;
      status.database.localPaths = localPaths;
    } catch (err: any) {
      status.database.error = err?.message || String(err);
    }
  }

  return NextResponse.json(status);
}

// ═══════════════════════════════════════════════════
// POST — Run migration (step by step)
// ═══════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  const dryRun = request.nextUrl.searchParams.get('dryRun') === 'true';
  const step = request.nextUrl.searchParams.get('step') || 'scan';

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const db = getDb();

  const results: {
    step: string;
    status: string;
    details: string[];
    errors: string[];
    summary?: Record<string, number>;
  } = {
    step,
    status: 'started',
    details: [],
    errors: [],
  };

  // ─── Quick env check ───
  if (!token) {
    results.errors.push('BLOB_READ_WRITE_TOKEN not set — cannot access blob storage');
    results.status = 'error';
    return NextResponse.json(results);
  }

  if (!db) {
    results.errors.push('Database not configured (TURSO_DATABASE_URL missing) — cannot determine which blobs are used');
    results.status = 'error';
    return NextResponse.json(results);
  }

  try {
    // ─── STEP: SCAN (list blobs + DB URLs) ───
    if (step === 'scan') {
      results.details.push('📋 Scanning blob store + database...');

      const { list } = await import('@vercel/blob');
      const allBlobs: BlobInfo[] = [];
      let cursor: string | undefined;
      let hasMore = true;

      while (hasMore) {
        const batch = await list({ token, limit: 100, cursor });
        for (const b of batch.blobs) {
          allBlobs.push({ url: b.url, pathname: b.pathname, size: b.size });
        }
        cursor = batch.cursor ?? undefined;
        hasMore = batch.hasMore;
      }

      const usedUrls = await getUsedImageUrlsFromDb(db);
      const usedPrivateUrls = new Set(
        [...usedUrls].filter(u => u.includes('.private.blob.vercel-storage.com'))
      );
      const usedPublicUrls = new Set(
        [...usedUrls].filter(u => u.includes('.public.blob.vercel-storage.com'))
      );

      const privateBlobs = allBlobs.filter(b => b.url.includes('.private.blob.vercel-storage.com'));
      const blobsToMigrate = privateBlobs.filter(b => usedPrivateUrls.has(b.url));

      results.details.push(`   📦 Total blobs: ${allBlobs.length}`);
      results.details.push(`   🔒 Private: ${privateBlobs.length} (${blobsToMigrate.length} used in DB, ${privateBlobs.length - blobsToMigrate.length} orphan)`);
      results.details.push(`   🌐 Public: ${allBlobs.length - privateBlobs.length}`);
      results.details.push(`   🗄️ DB used images: ${usedUrls.size}`);
      results.details.push(`   🔒 DB private URLs: ${usedPrivateUrls.size}`);
      results.details.push(`   🌐 DB public URLs: ${usedPublicUrls.size}`);

      if (dryRun) {
        results.details.push(`   🔍 DRY RUN — would migrate these ${blobsToMigrate.length} blobs:`);
        for (const b of blobsToMigrate) {
          results.details.push(`      • ${b.pathname} (${(b.size / 1024).toFixed(0)} KB)`);
        }
      }

      results.summary = {
        totalBlobs: allBlobs.length,
        privateBlobs: privateBlobs.length,
        publicBlobs: allBlobs.length - privateBlobs.length,
        toMigrate: blobsToMigrate.length,
        skippedOrphan: privateBlobs.length - blobsToMigrate.length,
      };
    }

    // ─── STEP: MIGRATE (copy private → public, max 10 per call) ───
    if (step === 'migrate') {
      const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');
      const batchSize = 5; // Small batch to avoid timeout

      results.details.push(`🚀 Migrating private blobs → public (batch: offset=${offset}, size=${batchSize})...`);

      const { list, put, generateSignedUrl } = await import('@vercel/blob');

      // Get used URLs from DB
      const usedUrls = await getUsedImageUrlsFromDb(db);
      const usedPrivateUrls = new Set(
        [...usedUrls].filter(u => u.includes('.private.blob.vercel-storage.com'))
      );

      if (usedPrivateUrls.size === 0) {
        results.details.push('   ✅ No private blob URLs in DB — nothing to migrate!');
        results.status = 'completed';
        results.summary = { migrated: 0, failed: 0, remaining: 0 };
        return NextResponse.json(results);
      }

      // List all private blobs
      const allBlobs: BlobInfo[] = [];
      let cursor: string | undefined;
      let hasMore = true;

      while (hasMore) {
        const batch = await list({ token, limit: 100, cursor });
        for (const b of batch.blobs) {
          allBlobs.push({ url: b.url, pathname: b.pathname, size: b.size });
        }
        cursor = batch.cursor ?? undefined;
        hasMore = batch.hasMore;
      }

      const blobsToMigrate = allBlobs.filter(b =>
        b.url.includes('.private.blob.vercel-storage.com') && usedPrivateUrls.has(b.url)
      );

      const batch = blobsToMigrate.slice(offset, offset + batchSize);
      const remaining = blobsToMigrate.length - (offset + batchSize);

      results.details.push(`   📦 Total to migrate: ${blobsToMigrate.length}, this batch: ${batch.length}, remaining: ${Math.max(0, remaining)}`);

      let migrated = 0;
      let failed = 0;
      const urlMapping: Record<string, string> = {};

      for (let i = 0; i < batch.length; i++) {
        const blob = batch[i];
        try {
          // Try to get signed URL for private blob
          let downloadUrl = blob.url;

          try {
            const signedResult = await generateSignedUrl({
              url: blob.url,
              token,
              expiry: 3600,
            });
            downloadUrl = typeof signedResult === 'string' ? signedResult : (signedResult as any).url || String(signedResult);
          } catch (signErr: any) {
            results.details.push(`   ⚠️ Signed URL failed for ${blob.pathname}: ${signErr?.message}`);
            // Try direct download
          }

          // Download the blob
          const downloadRes = await fetch(downloadUrl);
          if (!downloadRes.ok) {
            results.errors.push(`Download failed: ${blob.pathname} (HTTP ${downloadRes.status})`);
            failed++;
            continue;
          }

          const data = await downloadRes.arrayBuffer();
          const contentType = downloadRes.headers.get('content-type') || 'image/png';

          // Re-upload as PUBLIC (add a suffix to avoid name collision)
          const newBlob = await put(blob.pathname, data, {
            token,
            access: 'public',
            contentType,
            addRandomSuffix: true,
          });

          urlMapping[blob.url] = newBlob.url;
          migrated++;
          results.details.push(`   ✅ [${offset + i + 1}/${blobsToMigrate.length}] ${blob.pathname}`);
        } catch (err: any) {
          failed++;
          results.errors.push(`Failed: ${blob.pathname}: ${err?.message || err}`);
        }
      }

      // Update DB URLs for this batch
      if (Object.keys(urlMapping).length > 0 && !dryRun) {
        results.details.push('   📝 Updating database URLs for this batch...');
        const dbUpdated = await updateDbUrls(db, urlMapping, false);
        results.details.push(...dbUpdated.details);
        results.errors.push(...dbUpdated.errors);
        results.summary = { migrated, failed, remaining: Math.max(0, remaining), dbUpdated: dbUpdated.updated };
      } else {
        results.summary = { migrated, failed, remaining: Math.max(0, remaining) };
      }
    }

    // ─── STEP: FIX PROXY URLS ───
    if (step === 'urls') {
      results.details.push('🔗 Fixing proxy URLs in database...');

      const columns = [
        { table: 'Vehicle', column: 'imagePath' },
        { table: 'VehicleVariant', column: 'imagePath' },
        { table: 'VehicleColor', column: 'imagePath' },
        { table: 'Hero', column: 'imagePath' },
        { table: 'AudienceCategory', column: 'imagePath' },
        { table: 'Testimonial', column: 'imagePath' },
        { table: 'SalesConsultant', column: 'imagePath' },
        { table: 'GalleryItem', column: 'imagePath' },
      ];

      const mapping: Record<string, string> = {};
      let proxyFound = 0;

      for (const { table, column } of columns) {
        try {
          const rows = await db.execute({
            sql: `SELECT ${column} FROM ${table} WHERE ${column} LIKE '%/api/image?url=%'`,
            args: [],
          });
          for (const row of rows.rows) {
            const val = row[column] as string;
            if (!val) continue;
            const innerUrl = decodeURIComponent(val.replace('/api/image?url=', ''));
            // If inner URL is public blob → unwrap the proxy
            if (innerUrl.includes('.public.blob.vercel-storage.com')) {
              mapping[val] = innerUrl;
              proxyFound++;
            }
          }
        } catch {
          // Table might not exist
        }
      }

      if (proxyFound > 0) {
        results.details.push(`   🔗 Found ${proxyFound} proxy URLs to unwrap`);
        const dbResult = await updateDbUrls(db, mapping, dryRun);
        results.details.push(...dbResult.details);
        results.errors.push(...dbResult.errors);
        results.summary = { urlsFixed: dbResult.updated };
      } else {
        results.details.push('   ✅ No proxy URLs found — all clean!');
        results.summary = { urlsFixed: 0 };
      }
    }
  } catch (err: any) {
    results.errors.push(`Fatal error: ${err?.message || String(err)}`);
    console.error('Migration error:', err);
  }

  results.status = results.errors.length > 0
    ? 'completed_with_errors'
    : 'completed';

  return NextResponse.json(results);
}
