import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getStaticVehicles } from '@/lib/static-data';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  if (!db) {
    const vehicle = getStaticVehicles().find(v => v.id === id);
    return NextResponse.json(vehicle?.specs || []);
  }
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM VehicleSpec WHERE vehicleId = ? ORDER BY displayOrder ASC',
      args: [id],
    });
    const specs = result.rows.map(row => ({
      ...row,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      displayOrder: Number(row.displayOrder),
    }));
    return NextResponse.json(specs);
  } catch (error) {
    console.error('Error fetching specs:', error);
    return NextResponse.json({ error: 'Failed to fetch specs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.', hint: 'Vercel Dashboard → Settings → Environment Variables' }, { status: 503 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const specId = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO VehicleSpec (id, vehicleId, category, items, displayOrder)
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        specId,
        id,
        body.category ?? '',
        typeof body.items === 'object' ? JSON.stringify(body.items) : (body.items ?? '[]'),
        body.displayOrder ?? 0,
      ]
    });

    return NextResponse.json({
      id: specId,
      vehicleId: id,
      category: body.category ?? '',
      items: body.items ?? [],
      displayOrder: body.displayOrder ?? 0,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating spec:', error);
    return NextResponse.json({ error: 'Failed to create spec', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
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
    if (!id) return NextResponse.json({ error: 'Spec id required' }, { status: 400 });
    if (typeof id === 'string' && id.startsWith('static-')) {
      return NextResponse.json({ error: 'Cannot update static-prefixed record. Please create a new record instead.', hint: 'Use POST to create a new database record.' }, { status: 400 });
    }

    const fields: string[] = [];
    const args: (string | number)[] = [];

    if (data.category !== undefined) { fields.push('category = ?'); args.push(data.category); }
    if (data.items !== undefined) { fields.push('items = ?'); args.push(typeof data.items === 'object' ? JSON.stringify(data.items) : data.items); }
    if (data.displayOrder !== undefined) { fields.push('displayOrder = ?'); args.push(Number(data.displayOrder)); }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    args.push(id);
    await db.execute({
      sql: `UPDATE VehicleSpec SET ${fields.join(', ')} WHERE id = ?`,
      args,
    });

    const updated = await db.execute({
      sql: 'SELECT * FROM VehicleSpec WHERE id = ?',
      args: [id],
    });

    if (updated.rows.length === 0) {
      return NextResponse.json({ error: 'Spec not found' }, { status: 404 });
    }

    const row = updated.rows[0];
    return NextResponse.json({
      ...row,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      displayOrder: Number(row.displayOrder),
    });
  } catch (error) {
    console.error('Error updating spec:', error);
    return NextResponse.json({ error: 'Failed to update spec', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
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
    if (!id) return NextResponse.json({ error: 'Spec id required' }, { status: 400 });
    await db.execute({
      sql: 'DELETE FROM VehicleSpec WHERE id = ?',
      args: [id],
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting spec:', error);
    return NextResponse.json({ error: 'Failed to delete spec', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
