import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getStaticHero } from '@/lib/static-data';
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || 'home';

  // No caching — hero changes must be visible immediately after admin updates
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  const db = getDb();
  if (!db) {
    const staticData = getStaticHero(page);
    return NextResponse.json(staticData, { headers });
  }

  // Ensure migrations have run (adds 'page' column if missing)
  await ensureMigrations();

  try {
    const result = await db.execute({
      sql: 'SELECT * FROM Hero WHERE active = 1 AND page = ? LIMIT 1',
      args: [page],
    });
    if (result.rows.length === 0) {
      // No active hero for this page — return page-specific static fallback (NOT null!)
      const staticData = getStaticHero(page);
      return NextResponse.json(staticData, { headers });
    }
    const row = result.rows[0];
    const hero = {
      ...row,
      imagePath: proxyBlobUrl(row.imagePath as string) || row.imagePath,
      active: row.active === 1,
    };
    return NextResponse.json(hero, { headers });
  } catch (error) {
    console.error('Error fetching hero:', error);
    // Fall back to static data on error (NOT null!)
    const staticData = getStaticHero(page);
    return NextResponse.json(staticData, { headers });
  }
}
