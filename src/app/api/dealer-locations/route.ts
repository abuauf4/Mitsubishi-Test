import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getStaticDealers } from '@/lib/static-data';

export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json(getStaticDealers());
  }
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM DealerLocation WHERE active = 1 ORDER BY name ASC',
      args: []
    });
    const dealers = result.rows.map(row => ({
      ...row,
      active: row.active === 1,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
    }));
    return NextResponse.json(dealers);
  } catch (error) {
    console.error('Error fetching dealer locations:', error);
    return NextResponse.json({ error: 'Failed to fetch dealer locations' }, { status: 500 });
  }
}
