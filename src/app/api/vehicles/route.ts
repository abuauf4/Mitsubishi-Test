import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getStaticVehicles } from '@/lib/static-data';

// Force dynamic rendering — prevent Next.js from caching this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const db = getDb();
  if (!db) {
    return NextResponse.json(getStaticVehicles(), {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
    });
  }
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let sql: string;
    let args: (string | number)[];

    if (category) {
      sql = 'SELECT * FROM Vehicle WHERE category = ? AND active = 1 ORDER BY displayOrder ASC';
      args = [category];
    } else {
      sql = 'SELECT * FROM Vehicle WHERE active = 1 ORDER BY displayOrder ASC';
      args = [];
    }

    const vehicleResult = await db.execute({ sql, args });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vehicles: any[] = [];

    for (const row of vehicleResult.rows) {
      const vehicleId = row.id as string;

      const [variantsRes, colorsRes, specsRes, featuresRes] = await Promise.all([
        db.execute({ sql: 'SELECT * FROM VehicleVariant WHERE vehicleId = ? ORDER BY displayOrder ASC', args: [vehicleId] }),
        db.execute({ sql: 'SELECT * FROM VehicleColor WHERE vehicleId = ? ORDER BY displayOrder ASC', args: [vehicleId] }),
        db.execute({ sql: 'SELECT * FROM VehicleSpec WHERE vehicleId = ? ORDER BY displayOrder ASC', args: [vehicleId] }),
        db.execute({ sql: 'SELECT * FROM VehicleFeature WHERE vehicleId = ? ORDER BY displayOrder ASC', args: [vehicleId] }),
      ]);

      vehicles.push({
        ...row,
        active: row.active === 1,
        displayOrder: Number(row.displayOrder),
        variants: variantsRes.rows.map(v => ({
          ...v,
          highlights: typeof v.highlights === 'string' ? JSON.parse(v.highlights) : v.highlights,
          priceNum: Number(v.priceNum),
          displayOrder: Number(v.displayOrder),
        })),
        colors: colorsRes.rows.map(c => ({
          ...c,
          displayOrder: Number(c.displayOrder),
        })),
        specs: specsRes.rows.map(s => ({
          ...s,
          items: typeof s.items === 'string' ? JSON.parse(s.items) : s.items,
          displayOrder: Number(s.displayOrder),
        })),
        features: featuresRes.rows.map(f => ({
          ...f,
          displayOrder: Number(f.displayOrder),
        })),
      });
    }

    // Explicit no-cache headers to prevent stale data
    return NextResponse.json(vehicles, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}
