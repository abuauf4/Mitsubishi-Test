import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getStaticVehicles } from '@/lib/static-data';

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

export async function PUT(request: NextRequest) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.', hint: 'Vercel Dashboard → Settings → Environment Variables' }, { status: 503 });
  }
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'Feature id required' }, { status: 400 });
    if (typeof id === 'string' && id.startsWith('static-')) {
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

    args.push(id);
    await db.execute({
      sql: `UPDATE VehicleFeature SET ${fields.join(', ')} WHERE id = ?`,
      args,
    });

    const updated = await db.execute({
      sql: 'SELECT * FROM VehicleFeature WHERE id = ?',
      args: [id],
    });

    if (updated.rows.length === 0) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }

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

export async function DELETE(request: NextRequest) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.', hint: 'Vercel Dashboard → Settings → Environment Variables' }, { status: 503 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Feature id required' }, { status: 400 });
    await db.execute({
      sql: 'DELETE FROM VehicleFeature WHERE id = ?',
      args: [id],
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feature:', error);
    return NextResponse.json({ error: 'Failed to delete feature', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
