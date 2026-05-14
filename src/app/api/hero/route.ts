import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getStaticHero } from '@/lib/static-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || 'home';

  const headers = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };

  const db = getDb();
  if (!db) {
    return NextResponse.json(getStaticHero(), { headers });
  }
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM Hero WHERE active = 1 AND page = ? LIMIT 1',
      args: [page],
    });
    if (result.rows.length === 0) {
      return NextResponse.json(null, { headers });
    }
    const hero = {
      ...result.rows[0],
      active: result.rows[0].active === 1,
    };
    return NextResponse.json(hero, { headers });
  } catch (error) {
    console.error('Error fetching hero:', error);
    return NextResponse.json({ error: 'Failed to fetch hero' }, { status: 500 });
  }
}
