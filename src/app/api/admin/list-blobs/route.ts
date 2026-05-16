import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/list-blobs
 * List all blobs from Vercel Blob Storage for the BlobPicker component.
 *
 * Query params:
 *   ?search=xxx       — filter by pathname (case-insensitive)
 *   ?folder=xxx       — filter by folder prefix
 *   ?page=1           — pagination page (1-based)
 *   ?limit=50         — items per page (max 100)
 *   ?usedOnly=true    — only show blobs used in DB
 */
export async function GET(request: NextRequest) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN not set' }, { status: 503 });
  }

  const search = (request.nextUrl.searchParams.get('search') || '').toLowerCase().trim();
  const folder = request.nextUrl.searchParams.get('folder') || '';
  const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(request.nextUrl.searchParams.get('limit') || '50')));
  const usedOnly = request.nextUrl.searchParams.get('usedOnly') === 'true';

  try {
    const { list } = await import('@vercel/blob');

    // Fetch ALL blobs (Vercel Blob doesn't support server-side search)
    const allBlobs: { url: string; pathname: string; size: number; uploadedAt: string }[] = [];
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
        });
      }
      cursor = batch.cursor ?? undefined;
      hasMore = batch.hasMore;
    }

    // Get used URLs from DB if needed
    let usedUrls: Set<string> | null = null;
    if (usedOnly) {
      try {
        const { getDb } = await import('@/lib/db');
        const db = getDb();
        if (db) {
          usedUrls = new Set<string>();
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
                if (val) usedUrls!.add(val);
              }
            } catch { /* table might not exist yet */ }
          }
        }
      } catch { /* db not available */ }
    }

    // Filter
    let filtered = allBlobs.filter(b => {
      // Search filter
      if (search && !b.pathname.toLowerCase().includes(search)) return false;
      // Folder filter
      if (folder && !b.pathname.startsWith(folder)) return false;
      // Used only filter
      if (usedOnly && usedUrls) {
        const isUsed = usedUrls.has(b.url) ||
          usedUrls.has(`/api/image?url=${encodeURIComponent(b.url)}`);
        if (!isUsed) return false;
      }
      return true;
    });

    // Sort by upload date (newest first)
    filtered.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    // Get unique folders for folder filter dropdown
    const folders = [...new Set(allBlobs.map(b => {
      const parts = b.pathname.split('/');
      return parts.length > 1 ? parts.slice(0, -1).join('/') : '';
    }))].filter(Boolean).sort();

    return NextResponse.json({
      blobs: paged.map(b => {
        // Private blob URLs can't be loaded directly by the browser.
        // Route them through /api/image which generates a signed URL redirect.
        const isPrivate = b.url.includes('.private.blob.vercel-storage.com');
        const thumbUrl = isPrivate
          ? `/api/image?url=${encodeURIComponent(b.url)}`
          : b.url;

        return {
          url: b.url,
          pathname: b.pathname,
          size: b.size,
          sizeKB: (b.size / 1024).toFixed(0),
          uploadedAt: b.uploadedAt,
          thumbUrl,
        };
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
      folders,
      totalBlobs: allBlobs.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
