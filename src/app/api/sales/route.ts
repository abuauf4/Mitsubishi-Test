import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getStaticSales } from '@/lib/static-data';

export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json(getStaticSales());
  }
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM SalesConsultant WHERE active = 1',
      args: []
    });
    const consultants = result.rows.map(row => ({
      ...row,
      active: row.active === 1,
    }));
    return NextResponse.json(consultants);
  } catch (error) {
    console.error('Error fetching sales consultants:', error);
    return NextResponse.json({ error: 'Failed to fetch sales consultants' }, { status: 500 });
  }
}
