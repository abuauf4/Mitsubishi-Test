import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getStaticCategories } from '@/lib/static-data';
import { ensureMigrations } from '@/lib/auto-migrate';

export async function GET() {
  const headers = {
    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
  };

  const db = getDb();
  if (!db) {
    return NextResponse.json(getStaticCategories(), { headers });
  }

  // Ensure schema is up to date
  await ensureMigrations();

  try {
    const result = await db.execute({
      sql: 'SELECT * FROM AudienceCategory WHERE active = 1 ORDER BY displayOrder ASC',
      args: [],
    });
    if (result.rows.length === 0) {
      return NextResponse.json(getStaticCategories(), { headers });
    }
    const categories = result.rows.map((row) => ({
      ...row,
      active: row.active === 1,
      displayOrder: Number(row.displayOrder),
    }));
    return NextResponse.json(categories, { headers });
  } catch (error) {
    console.error('Error fetching audience categories:', error);
    return NextResponse.json(getStaticCategories(), { headers });
  }
}
