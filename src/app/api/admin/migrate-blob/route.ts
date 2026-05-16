import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * POST /api/admin/migrate-blob
 *
 * Smart migration: ONLY copies blobs that are actually USED in the database.
 * Skips orphan/unused photos — saves bandwidth and storage.
 *
 * Usage (from browser):
 *   POST /api/admin/migrate-blob              ← migrate only DB-referenced blobs
 *   POST /api/admin/migrate-blob?dryRun=true  ← preview only
 *   POST /api/admin/migrate-blob?step=urls    ← only fix proxy URLs in DB
 *
 * No bash needed — just hit this endpoint from your phone!
 */

export const maxDuration = 300; // 5 min timeout

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
// POST — Run migration
// ═══════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  const dryRun = request.nextUrl.searchParams.get('dryRun') === 'true';
  const step = request.nextUrl.searchParams.get('step') || 'all';

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

  // ─── STEP 1: Smart migration — only blobs USED in DB ───
  if ((step === 'all' || step === 'blobs') && token) {
    results.details.push('📋 Step 1: Scanning database for used images...');

    if (!db) {
      results.errors.push('Database not configured — cannot determine which blobs are used');
    } else {
      try {
        // 1a. Get all image URLs actually referenced in the database
        const usedUrls = await getUsedImageUrlsFromDb(db);
        const usedPrivateUrls = new Set(
          [...usedUrls].filter(u => u.includes('.private.blob.vercel-storage.com'))
        );
        const usedPublicUrls = new Set(
          [...usedUrls].filter(u => u.includes('.public.blob.vercel-storage.com'))
        );
        const usedLocalPaths = new Set(
          [...usedUrls].filter(u => !u.includes('vercel-storage.com'))
        );

        results.details.push(`   📊 Images used in DB:`);
        results.details.push(`      🔒 Private blob: ${usedPrivateUrls.size}`);
        results.details.push(`      🌐 Public blob: ${usedPublicUrls.size}`);
        results.details.push(`      📁 Local/other: ${usedLocalPaths.size}`);

        if (usedPrivateUrls.size === 0) {
          results.details.push('   ✅ No private blob URLs in DB — nothing to migrate!');
        } else {
          // 1b. List all blobs in store to find the actual files
          results.details.push('   📦 Listing blob store...');
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

          const totalPrivate = allBlobs.filter(b => b.url.includes('.private.blob.vercel-storage.com')).length;
          results.details.push(`   📦 Blob store total: ${allBlobs.length} (🔒 ${totalPrivate} private, 🌐 ${allBlobs.length - totalPrivate} public)`);

          // 1c. Find only the blobs that are USED in DB
          const blobsToMigrate = allBlobs.filter(b =>
            b.url.includes('.private.blob.vercel-storage.com') && usedPrivateUrls.has(b.url)
          );

          const unusedPrivate = totalPrivate - blobsToMigrate.length;
          results.details.push(`   🎯 Blobs to migrate: ${blobsToMigrate.length} (skipping ${unusedPrivate} unused/orphan)`);

          if (dryRun) {
            results.details.push(`   🔍 DRY RUN — would migrate these ${blobsToMigrate.length} blobs:`);
            for (const b of blobsToMigrate) {
              results.details.push(`      • ${b.pathname} (${(b.size / 1024).toFixed(0)} KB)`);
            }
            results.summary = { toMigrate: blobsToMigrate.length, skipped: unusedPrivate, totalPrivate };
          } else {
            // 1d. Migrate only the used blobs
            results.details.push(`   🚀 Migrating ${blobsToMigrate.length} used blobs...`);

            const { put } = await import('@vercel/blob');
            let migrated = 0;
            let failed = 0;
            const urlMapping: Record<string, string> = {};

            for (let i = 0; i < blobsToMigrate.length; i++) {
              const blob = blobsToMigrate[i];
              try {
                // Download private blob
                let downloadRes = await fetch(blob.url);

                if (!downloadRes.ok) {
                  downloadRes = await fetch(blob.url, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                }

                if (!downloadRes.ok) {
                  try {
                    const signedRes = await fetch('https://blob.vercel-storage.com/api/v1/generate-signed-url', {
                      method: 'POST',
                      headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ url: blob.url, expiry: 3600 }),
                    });
                    if (signedRes.ok) {
                      const signedData = await signedRes.json() as { url: string };
                      downloadRes = await fetch(signedData.url);
                    }
                  } catch {
                    // signed URL failed
                  }
                }

                if (!downloadRes.ok) {
                  results.errors.push(`Download failed: ${blob.pathname} (${downloadRes.status})`);
                  failed++;
                  continue;
                }

                const data = await downloadRes.arrayBuffer();
                const contentType = downloadRes.headers.get('content-type') || 'image/png';

                // Re-upload as PUBLIC
                const newBlob = await put(blob.pathname, data, {
                  token,
                  access: 'public',
                  contentType,
                  addRandomSuffix: false,
                });

                urlMapping[blob.url] = newBlob.url;
                migrated++;
                results.details.push(`   ✅ [${i + 1}/${blobsToMigrate.length}] ${blob.pathname}`);
              } catch (err: any) {
                failed++;
                results.errors.push(`Failed: ${blob.pathname}: ${err?.message || err}`);
              }
            }

            results.details.push(`   📊 Migrated: ${migrated}, Failed: ${failed}, Skipped (unused): ${unusedPrivate}`);
            results.summary = { migrated, failed, skipped: unusedPrivate, totalPrivate };

            // 1e. Update database URLs with the mapping
            if (Object.keys(urlMapping).length > 0) {
              results.details.push('   📝 Updating database URLs...');
              const dbUpdated = await updateDbUrls(db, urlMapping, false);
              results.details.push(...dbUpdated.details);
              results.errors.push(...dbUpdated.errors);
              results.summary = { ...results.summary, dbUpdated: dbUpdated.updated };
            }
          }
        }
      } catch (err: any) {
        results.errors.push(`Migration error: ${err?.message || err}`);
      }
    }
  } else if (!token) {
    results.errors.push('BLOB_READ_WRITE_TOKEN not set — cannot scan blobs');
  }

  // ─── STEP 2: Fix proxy URLs in database ───
  if ((step === 'all' || step === 'urls') && db) {
    results.details.push('📋 Step 2: Fixing proxy URLs in database...');

    try {
      const usedUrls = await getUsedImageUrlsFromDb(db);
      const mapping: Record<string, string> = {};

      // Find proxy-wrapped public URLs → just unwrap them
      for (const val of usedUrls) {
        // These are already extracted from proxy by getUsedImageUrlsFromDb
        // We need to scan DB columns directly for the proxy format
      }

      // Scan DB directly for proxy URLs
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
        results.summary = { ...results.summary, urlsFixed: dbResult.updated };
      } else {
        results.details.push('   ✅ No proxy URLs found — all clean!');
      }
    } catch (err: any) {
      results.errors.push(`DB URL fix error: ${err?.message || err}`);
    }
  }

  results.status = results.errors.length > 0
    ? 'completed_with_errors'
    : 'completed';

  return NextResponse.json(results);
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

      // Also scan for proxy URLs directly
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
