import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getStaticHero } from '@/lib/static-data';
import { ensureMigrations } from '@/lib/auto-migrate';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || 'home';

  // Use no-store so browsers and CDNs always get fresh hero data
  // Hero changes should be visible immediately — no stale cache
  const headers = {
    'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
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
    const hero = {
      ...result.rows[0],
      active: result.rows[0].active === 1,
    };
    return NextResponse.json(hero, { headers });
  } catch (error) {
    console.error('Error fetching hero:', error);
    // Fall back to static data on error (NOT null!)
    const staticData = getStaticHero(page);
    return NextResponse.json(staticData, { headers });
  }
}
