import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getStaticSiteConfig } from '@/lib/static-data';

// Force dynamic — site config can change at any time via admin panel
export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json(getStaticSiteConfig());
  }
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM SiteConfig ORDER BY key ASC',
      args: []
    });
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching site configs:', error);
    return NextResponse.json({ error: 'Failed to fetch site configs' }, { status: 500 });
  }
}
