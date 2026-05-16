import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * POST /api/admin/migrate-blob
 *
 * Browser-triggerable migration: copies private blob images to public,
 * then updates all database URLs.
 *
 * Usage (from browser or curl):
 *   POST /api/admin/migrate-blob
 *   POST /api/admin/migrate-blob?dryRun=true   ← preview only, no changes
 *   POST /api/admin/migrate-blob?step=db        ← only update DB URLs (skip blob copy)
 *   POST /api/admin/migrate-blob?step=urls      ← only fix proxy URLs in DB
 *
 * No bash needed — just hit this endpoint from your phone!
 */

export const maxDuration = 300; // 5 min timeout for Pro plans

interface BlobInfo {
  url: string;
  pathname: string;
  size: number;
}

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

  // ─── STEP 1: List & copy blobs from private → public ───
  if ((step === 'all' || step === 'blobs') && token) {
    results.details.push('📋 Step 1: Scanning blob store...');

    try {
      const { list } = await import('@vercel/blob');
      const allBlobs: BlobInfo[] = [];
      let cursor: string | undefined;
      let hasMore = true;

      // List all blobs
      while (hasMore) {
        const batch = await list({ token, limit: 100, cursor });
        for (const b of batch.blobs) {
          allBlobs.push({ url: b.url, pathname: b.pathname, size: b.size });
        }
        cursor = batch.cursor ?? undefined;
        hasMore = batch.hasMore;
      }

      results.details.push(`   Found ${allBlobs.length} blobs total`);

      // Find private blobs that need migration
      const privateBlobs = allBlobs.filter(b => b.url.includes('.private.blob.vercel-storage.com'));
      const publicBlobs = allBlobs.filter(b => b.url.includes('.public.blob.vercel-storage.com'));

      results.details.push(`   🔒 Private: ${privateBlobs.length}`);
      results.details.push(`   🌐 Public: ${publicBlobs.length}`);

      if (privateBlobs.length === 0) {
        results.details.push('   ✅ No private blobs found — all images are already public!');
      } else if (!dryRun) {
        results.details.push(`   📦 Migrating ${privateBlobs.length} private blobs to public...`);

        const { put } = await import('@vercel/blob');
        let migrated = 0;
        let failed = 0;
        const urlMapping: Record<string, string> = {};

        for (let i = 0; i < privateBlobs.length; i++) {
          const blob = privateBlobs[i];
          try {
            // Download the private blob
            const downloadHeaders: Record<string, string> = {};
            // Try direct fetch first
            let downloadRes = await fetch(blob.url, { headers: downloadHeaders });

            // If direct fails, try with auth
            if (!downloadRes.ok) {
              downloadHeaders['Authorization'] = `Bearer ${token}`;
              downloadRes = await fetch(blob.url, { headers: downloadHeaders });
            }

            // If still failing, try signed URL via REST API
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
                // signed URL failed too
              }
            }

            if (!downloadRes.ok) {
              results.errors.push(`Failed to download ${blob.pathname}: ${downloadRes.status}`);
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
            results.details.push(`   ✅ [${i + 1}/${privateBlobs.length}] ${blob.pathname}`);
          } catch (err: any) {
            failed++;
            results.errors.push(`Failed ${blob.pathname}: ${err?.message || err}`);
          }
        }

        results.details.push(`   📊 Migrated: ${migrated}, Failed: ${failed}`);
        results.summary = { migrated, failed, total: privateBlobs.length };

        // ─── STEP 1b: Update database URLs with the mapping ───
        if (db && Object.keys(urlMapping).length > 0) {
          results.details.push('📋 Step 1b: Updating database URLs...');
          const dbUpdated = await updateDbUrls(db, urlMapping, false);
          results.details.push(...dbUpdated.details);
          results.errors.push(...dbUpdated.errors);
          results.summary = { ...results.summary, dbUpdated: dbUpdated.updated };
        }
      } else {
        results.details.push(`   🔍 DRY RUN — would migrate ${privateBlobs.length} private blobs`);
      }
    } catch (err: any) {
      results.errors.push(`Blob scan error: ${err?.message || err}`);
    }
  } else if (!token) {
    results.errors.push('BLOB_READ_WRITE_TOKEN not set — cannot scan blobs');
  }

  // ─── STEP 2: Fix proxy URLs in database (even without blob migration) ───
  if ((step === 'all' || step === 'urls') && db) {
    results.details.push('📋 Step 2: Fixing proxy URLs in database...');

    try {
      // Find all rows where imagePath or value contains /api/image?url= or .private.blob
      const urlMapping = await buildUrlMappingFromDb(db);
      if (Object.keys(urlMapping).length > 0) {
        const dbResult = await updateDbUrls(db, urlMapping, dryRun);
        results.details.push(...dbResult.details);
        results.errors.push(...dbResult.errors);
        results.summary = { ...results.summary, urlsFixed: dbResult.updated };
      } else {
        results.details.push('   ✅ No proxy URLs found in database — all clean!');
      }
    } catch (err: any) {
      results.errors.push(`DB URL fix error: ${err?.message || err}`);
    }
  } else if (step === 'urls' && !db) {
    results.errors.push('Database not configured — cannot fix URLs');
  }

  // ─── STEP 3: Only update DB with specific mapping ───
  if (step === 'db' && db) {
    results.details.push('📋 Step 3: Updating database blob URLs...');
    // Check if user provided a mapping in the request body
    try {
      const body = await request.json().catch(() => ({}));
      const mapping = body.mapping || {};
      if (Object.keys(mapping).length > 0) {
        const dbResult = await updateDbUrls(db, mapping, dryRun);
        results.details.push(...dbResult.details);
        results.errors.push(...dbResult.errors);
        results.summary = { dbUpdated: dbResult.updated };
      } else {
        // Auto-detect: find private URLs and try to find their public counterparts
        const urlMapping = await buildUrlMappingFromDb(db);
        if (Object.keys(urlMapping).length > 0) {
          const dbResult = await updateDbUrls(db, urlMapping, dryRun);
          results.details.push(...dbResult.details);
          results.errors.push(...dbResult.errors);
          results.summary = { dbUpdated: dbResult.updated };
        } else {
          results.details.push('   ✅ No private blob URLs found in database');
        }
      }
    } catch (err: any) {
      results.errors.push(`DB update error: ${err?.message || err}`);
    }
  }

  results.status = results.errors.length > 0
    ? 'completed_with_errors'
    : 'completed';

  return NextResponse.json(results);
}

/**
 * GET /api/admin/migrate-blob — Check current status without making changes
 */
export async function GET() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const db = getDb();

  const status: {
    blob: { configured: boolean; totalBlobs?: number; privateBlobs?: number; publicBlobs?: number; error?: string };
    database: { configured: boolean; privateUrls?: number; proxyUrls?: number; error?: string };
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

  // Scan database for private/proxy URLs
  if (db) {
    try {
      let privateUrls = 0;
      let proxyUrls = 0;

      const tables = [
        { table: 'Vehicle', column: 'imagePath' },
        { table: 'VehicleVariant', column: 'imagePath' },
        { table: 'VehicleColor', column: 'imagePath' },
        { table: 'Hero', column: 'imagePath' },
        { table: 'AudienceCategory', column: 'imagePath' },
        { table: 'Testimonial', column: 'imagePath' },
        { table: 'SalesConsultant', column: 'imagePath' },
        { table: 'GalleryItem', column: 'imagePath' },
      ];

      for (const { table, column } of tables) {
        try {
          const rows = await db.execute({
            sql: `SELECT ${column} FROM ${table} WHERE ${column} IS NOT NULL AND ${column} != ''`,
            args: [],
          });
          for (const row of rows.rows) {
            const val = row[column] as string;
            if (val?.includes('.private.blob.vercel-storage.com')) privateUrls++;
            if (val?.includes('/api/image?url=')) proxyUrls++;
          }
        } catch {
          // Table might not exist
        }
      }

      status.database.privateUrls = privateUrls;
      status.database.proxyUrls = proxyUrls;
    } catch (err: any) {
      status.database.error = err?.message || String(err);
    }
  }

  return NextResponse.json(status);
}

// ─── Helper: Build URL mapping from database (private → try to find public) ───
async function buildUrlMappingFromDb(db: NonNullable<ReturnType<typeof getDb>>): Promise<Record<string, string>> {
  const mapping: Record<string, string> = {};

  // Get all private blob URLs from DB
  const tables = [
    { table: 'Vehicle', column: 'imagePath' },
    { table: 'VehicleVariant', column: 'imagePath' },
    { table: 'VehicleColor', column: 'imagePath' },
    { table: 'Hero', column: 'imagePath' },
    { table: 'AudienceCategory', column: 'imagePath' },
    { table: 'Testimonial', column: 'imagePath' },
    { table: 'SalesConsultant', column: 'imagePath' },
    { table: 'GalleryItem', column: 'imagePath' },
  ];

  for (const { table, column } of tables) {
    try {
      const rows = await db.execute({
        sql: `SELECT ${column} FROM ${table} WHERE ${column} IS NOT NULL AND ${column} != ''`,
        args: [],
      });
      for (const row of rows.rows) {
        const val = row[column] as string;
        if (!val) continue;

        // Proxy URLs: /api/image?url=xxx → need to unwrap
        if (val.startsWith('/api/image?url=')) {
          const innerUrl = decodeURIComponent(val.replace('/api/image?url=', ''));
          if (innerUrl.includes('.private.blob.vercel-storage.com')) {
            // Can't auto-fix without knowing the public URL — skip
            // Will be fixed when blobs are migrated
          } else if (innerUrl.includes('.public.blob.vercel-storage.com')) {
            // Proxy wrapping a public URL — just use the direct URL
            mapping[val] = innerUrl;
          }
        }
      }
    } catch {
      // Table might not exist
    }
  }

  return mapping;
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

  const columns: { table: string; column: string; idColumn: string }[] = [
    { table: 'Vehicle', column: 'imagePath', idColumn: 'id' },
    { table: 'VehicleVariant', column: 'imagePath', idColumn: 'id' },
    { table: 'VehicleColor', column: 'imagePath', idColumn: 'id' },
    { table: 'Hero', column: 'imagePath', idColumn: 'id' },
    { table: 'AudienceCategory', column: 'imagePath', idColumn: 'id' },
    { table: 'Testimonial', column: 'imagePath', idColumn: 'id' },
    { table: 'SalesConsultant', column: 'imagePath', idColumn: 'id' },
    { table: 'DealerLocation', column: 'embeddingUrl', idColumn: 'id' },
    { table: 'SiteConfig', column: 'value', idColumn: 'id' },
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

  details.push(`   📊 ${dryRun ? 'Would update' : 'Updated'} ${updated} rows`);
  return { updated, details, errors };
}
