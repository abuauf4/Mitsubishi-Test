import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getStaticVehicles } from '@/lib/static-data';

/**
 * Purge Next.js cache for the vehicle's public pages after any mutation.
 */
async function revalidateVehiclePages(vehicleId: string) {
  try {
    const db = getDb();
    if (!db) return;
    const result = await db.execute({
      sql: 'SELECT slug, category FROM Vehicle WHERE id = ?',
      args: [vehicleId],
    });
    if (result.rows.length === 0) return;
    const slug = result.rows[0].slug as string;
    const category = result.rows[0].category as string;

    if (category === 'commercial' || category === 'niaga-ringan') {
      revalidatePath(`/commercial/${slug}`);
    } else {
      revalidatePath(`/passenger/${slug}`);
    }
    revalidatePath('/passenger');
    revalidatePath('/commercial');
    revalidatePath('/');
  } catch (e) {
    console.warn('⚠️ Failed to revalidate vehicle pages:', e);
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  if (!db) {
    const vehicle = getStaticVehicles().find(v => v.id === id);
    return NextResponse.json(vehicle?.features || []);
  }
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM VehicleFeature WHERE vehicleId = ? ORDER BY displayOrder ASC',
      args: [id],
    });
    const features = result.rows.map(row => ({
      ...row,
      displayOrder: Number(row.displayOrder),
    }));
    return NextResponse.json(features);
  } catch (error) {
    console.error('Error fetching features:', error);
    return NextResponse.json({ error: 'Failed to fetch features' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.', hint: 'Vercel Dashboard → Settings → Environment Variables' }, { status: 503 });
  }
  try {
    const { id } = await params;
    if (id.startsWith('static-')) {
      return NextResponse.json({ error: 'Cannot add items to a static vehicle. Save it to the database first.', hint: 'Click "Save to Database" in the admin panel to create a DB record.' }, { status: 400 });
    }
    const body = await request.json();
    const featureId = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO VehicleFeature (id, vehicleId, icon, title, description, displayOrder)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        featureId,
        id,
        body.icon ?? 'Zap',
        body.title ?? '',
        body.description ?? '',
        body.displayOrder ?? 0,
      ]
    });

    await revalidateVehiclePages(id);

    return NextResponse.json({
      id: featureId,
      vehicleId: id,
      icon: body.icon ?? 'Zap',
      title: body.title ?? '',
      description: body.description ?? '',
      displayOrder: body.displayOrder ?? 0,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating feature:', error);
    return NextResponse.json({ error: 'Failed to create feature', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.', hint: 'Vercel Dashboard → Settings → Environment Variables' }, { status: 503 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const { id: featureId, ...data } = body;
    if (!featureId) return NextResponse.json({ error: 'Feature id required' }, { status: 400 });
    if (typeof featureId === 'string' && featureId.startsWith('static-')) {
      return NextResponse.json({ error: 'Cannot update static-prefixed record. Please create a new record instead.', hint: 'Use POST to create a new database record.' }, { status: 400 });
    }

    const fields: string[] = [];
    const args: (string | number)[] = [];

    if (data.icon !== undefined) { fields.push('icon = ?'); args.push(data.icon); }
    if (data.title !== undefined) { fields.push('title = ?'); args.push(data.title); }
    if (data.description !== undefined) { fields.push('description = ?'); args.push(data.description); }
    if (data.displayOrder !== undefined) { fields.push('displayOrder = ?'); args.push(Number(data.displayOrder)); }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    args.push(featureId);
    await db.execute({
      sql: `UPDATE VehicleFeature SET ${fields.join(', ')} WHERE id = ?`,
      args,
    });

    const updated = await db.execute({
      sql: 'SELECT * FROM VehicleFeature WHERE id = ?',
      args: [featureId],
    });

    if (updated.rows.length === 0) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }

    await revalidateVehiclePages(id);

    const row = updated.rows[0];
    return NextResponse.json({
      ...row,
      displayOrder: Number(row.displayOrder),
    });
  } catch (error) {
    console.error('Error updating feature:', error);
    return NextResponse.json({ error: 'Failed to update feature', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.', hint: 'Vercel Dashboard → Settings → Environment Variables' }, { status: 503 });
  }
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const featureId = searchParams.get('id');
    if (!featureId) return NextResponse.json({ error: 'Feature id required' }, { status: 400 });
    await db.execute({
      sql: 'DELETE FROM VehicleFeature WHERE id = ?',
      args: [featureId],
    });

    await revalidateVehiclePages(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feature:', error);
    return NextResponse.json({ error: 'Failed to delete feature', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
