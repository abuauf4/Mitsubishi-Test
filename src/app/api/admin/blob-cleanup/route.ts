import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/admin/blob-cleanup
 * List all blobs with used/orphan status + storage stats
 *
 * POST /api/admin/blob-cleanup
 * Delete orphan blobs (not used in DB) to free storage
 *   ?confirm=true → actually delete
 *   (without confirm → just preview what would be deleted)
 */

export const maxDuration = 300;

interface BlobInfo {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  used: boolean;
}

// ─── Helper: Get all image URLs from DB ───
async function getUsedUrlsFromDb(db: NonNullable<ReturnType<typeof getDb>>): Promise<Set<string>> {
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
        if (val.includes('vercel-storage.com')) usedUrls.add(val);
        if (val.includes('/api/image?url=')) {
          const inner = decodeURIComponent(val.replace('/api/image?url=', ''));
          if (inner.includes('vercel-storage.com')) usedUrls.add(inner);
        }
      }
    } catch { /* table might not exist */ }
  }

  return usedUrls;
}

// ═══════════════════════════════════════════════════
// GET — List all blobs with used/orphan status
// ═══════════════════════════════════════════════════
export async function GET() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN not set' }, { status: 503 });
  }

  const db = getDb();

  try {
    const { list } = await import('@vercel/blob');
    const allBlobs: BlobInfo[] = [];
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const batch = await list({ token, limit: 100, cursor });
      for (const b of batch.blobs) {
        allBlobs.push({
          url: b.url,
          pathname: b.pathname,
          size: b.size,
          uploadedAt: b.uploadedAt,
          used: false, // will be set below
        });
      }
      cursor = batch.cursor ?? undefined;
      hasMore = batch.hasMore;
    }

    // Mark which ones are used in DB
    const usedUrls = db ? await getUsedUrlsFromDb(db) : new Set<string>();

    for (const blob of allBlobs) {
      // Check if this blob URL (or a proxy-wrapped version) is in the used set
      blob.used = usedUrls.has(blob.url) ||
        usedUrls.has(`/api/image?url=${encodeURIComponent(blob.url)}`);
    }

    const used = allBlobs.filter(b => b.used);
    const orphan = allBlobs.filter(b => !b.used);

    // Group by folder prefix for summary
    const byFolder: Record<string, { count: number; size: number; used: number; orphan: number }> = {};
    for (const blob of allBlobs) {
      const folder = blob.pathname.includes('/')
        ? blob.pathname.split('/').slice(0, -1).join('/')
        : '(root)';
      if (!byFolder[folder]) {
        byFolder[folder] = { count: 0, size: 0, used: 0, orphan: 0 };
      }
      byFolder[folder].count++;
      byFolder[folder].size += blob.size;
      if (blob.used) byFolder[folder].used++;
      else byFolder[folder].orphan++;
    }

    // Storage stats
    const totalSize = allBlobs.reduce((s, b) => s + b.size, 0);
    const usedSize = used.reduce((s, b) => s + b.size, 0);
    const orphanSize = orphan.reduce((s, b) => s + b.size, 0);

    // Sort orphan by size descending (biggest wasters first)
    orphan.sort((a, b) => b.size - a.size);

    return NextResponse.json({
      summary: {
        total: allBlobs.length,
        totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(1),
        usedCount: used.length,
        usedSize,
        usedSizeMB: (usedSize / 1024 / 1024).toFixed(1),
        orphanCount: orphan.length,
        orphanSize,
        orphanSizeMB: (orphanSize / 1024 / 1024).toFixed(1),
        savingsPercent: totalSize > 0 ? ((orphanSize / totalSize) * 100).toFixed(0) : '0',
      },
      byFolder,
      // Top 50 biggest orphan blobs
      topOrphans: orphan.slice(0, 50).map(b => ({
        pathname: b.pathname,
        size: b.size,
        sizeKB: (b.size / 1024).toFixed(0),
        uploadedAt: b.uploadedAt,
        url: b.url.substring(0, 60) + '...',
      })),
      // Used blobs summary (just count + size per folder)
      usedBlobs: used.map(b => ({
        pathname: b.pathname,
        size: b.size,
        sizeKB: (b.size / 1024).toFixed(0),
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════
// POST — Delete orphan blobs
// ═══════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  const confirm = request.nextUrl.searchParams.get('confirm') === 'true';

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN not set' }, { status: 503 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const { list, del } = await import('@vercel/blob');

    // Get all blobs
    const allBlobs: { url: string; pathname: string; size: number }[] = [];
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

    // Find used URLs
    const usedUrls = await getUsedUrlsFromDb(db);

    // Find orphans
    const orphans = allBlobs.filter(b =>
      !usedUrls.has(b.url) &&
      !usedUrls.has(`/api/image?url=${encodeURIComponent(b.url)}`)
    );

    if (orphans.length === 0) {
      return NextResponse.json({
        status: 'nothing_to_delete',
        message: 'No orphan blobs found — all clean!',
      });
    }

    const orphanSize = orphans.reduce((s, b) => s + b.size, 0);

    if (!confirm) {
      return NextResponse.json({
        status: 'preview',
        message: `Would delete ${orphans.length} orphan blobs (${(orphanSize / 1024 / 1024).toFixed(1)} MB)`,
        orphanCount: orphans.length,
        orphanSizeMB: (orphanSize / 1024 / 1024).toFixed(1),
        orphans: orphans.map(b => ({
          pathname: b.pathname,
          sizeKB: (b.size / 1024).toFixed(0),
        })),
      });
    }

    // Actually delete
    let deleted = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < orphans.length; i++) {
      try {
        await del(orphans[i].url, { token });
        deleted++;
      } catch (err: any) {
        failed++;
        if (errors.length < 20) {
          errors.push(`${orphans[i].pathname}: ${err?.message || err}`);
        }
      }
    }

    return NextResponse.json({
      status: 'completed',
      deleted,
      failed,
      freedMB: (orphanSize / 1024 / 1024).toFixed(1),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
