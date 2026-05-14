import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getStaticHero } from '@/lib/static-data';

export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json(getStaticHero());
  }
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM Hero WHERE active = 1 LIMIT 1',
      args: []
    });
    if (result.rows.length === 0) {
      return NextResponse.json(null);
    }
    const hero = {
      ...result.rows[0],
      active: result.rows[0].active === 1,
    };
    return NextResponse.json(hero);
  } catch (error) {
    console.error('Error fetching hero:', error);
    return NextResponse.json({ error: 'Failed to fetch hero' }, { status: 500 });
  }
}
