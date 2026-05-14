import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getStaticVehiclesList } from '@/lib/static-data';

export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json(getStaticVehiclesList());
  }
  try {
    const result = await db.execute({
      sql: `SELECT v.*,
              (SELECT COUNT(*) FROM VehicleVariant WHERE vehicleId = v.id) AS variantCount,
              (SELECT COUNT(*) FROM VehicleColor WHERE vehicleId = v.id) AS colorCount,
              (SELECT COUNT(*) FROM VehicleSpec WHERE vehicleId = v.id) AS specCount,
              (SELECT COUNT(*) FROM VehicleFeature WHERE vehicleId = v.id) AS featureCount
            FROM Vehicle v
            ORDER BY v.category ASC, v.displayOrder ASC`,
      args: []
    });
    const vehicles = result.rows.map(row => ({
      ...row,
      active: row.active === 1,
      displayOrder: Number(row.displayOrder),
      _count: {
        variants: Number(row.variantCount),
        colors: Number(row.colorCount),
        specs: Number(row.specCount),
        features: Number(row.featureCount),
      },
    }));
    // Remove the count columns from top-level
    for (const v of vehicles) {
      delete (v as Record<string, unknown>).variantCount;
      delete (v as Record<string, unknown>).colorCount;
      delete (v as Record<string, unknown>).specCount;
      delete (v as Record<string, unknown>).featureCount;
    }
    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.', hint: 'Vercel Dashboard → Settings → Environment Variables' }, { status: 503 });
  }
  try {
    const body = await request.json();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO Vehicle (id, slug, name, tagline, category, basePrice, imagePath, payload, specsShort, displayOrder, active, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        body.slug ?? '',
        body.name ?? '',
        body.tagline ?? '',
        body.category ?? 'passenger',
        body.basePrice ?? '',
        body.imagePath ?? '',
        body.payload ?? null,
        typeof body.specsShort === 'object' ? JSON.stringify(body.specsShort) : (body.specsShort ?? '[]'),
        body.displayOrder ?? 0,
        body.active !== false ? 1 : 0,
        now,
        now,
      ]
    });

    // Purge listing pages cache
    revalidatePath('/passenger');
    revalidatePath('/commercial');
    revalidatePath('/');

    return NextResponse.json({
      id,
      slug: body.slug ?? '',
      name: body.name ?? '',
      tagline: body.tagline ?? '',
      category: body.category ?? 'passenger',
      basePrice: body.basePrice ?? '',
      imagePath: body.imagePath ?? '',
      payload: body.payload ?? null,
      specsShort: body.specsShort ?? [],
      displayOrder: body.displayOrder ?? 0,
      active: body.active !== false,
      createdAt: now,
      updatedAt: now,
      _count: { variants: 0, colors: 0, specs: 0, features: 0 },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json({ error: 'Failed to create vehicle', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
