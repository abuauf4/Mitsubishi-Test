import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ensureMigrations } from '@/lib/auto-migrate';

/** Proxy raw blob URLs through /api/image so clients can load them */
function proxyBlobUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('/api/image?')) return url;
  if (url.includes('vercel-storage.com') || url.includes('blob.vercel-storage.com')) {
    return `/api/image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export async function GET() {
  const headers = {
    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
  };

  const db = getDb();
  if (!db) {
    return NextResponse.json([], { headers });
  }

  await ensureMigrations();

  try {
    const result = await db.execute({
      sql: 'SELECT * FROM GalleryItem WHERE active = 1 ORDER BY displayOrder ASC, createdAt DESC',
      args: [],
    });

    const items = result.rows.map((row) => ({
      ...row,
      imagePath: proxyBlobUrl(row.imagePath as string) || row.imagePath,
      active: row.active === 1,
      displayOrder: Number(row.displayOrder),
    }));

    return NextResponse.json(items, { headers });
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return NextResponse.json([], { headers });
  }
}
