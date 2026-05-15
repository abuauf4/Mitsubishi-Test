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
    if (id.startsWith('static-')) {
      return NextResponse.json({ error: 'Cannot add items to a static vehicle. Save it to the database first.', hint: 'Click "Save to Database" in the admin panel to create a DB record.' }, { status: 400 });
    }
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

    await revalidateVehiclePages(id);

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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.', hint: 'Vercel Dashboard → Settings → Environment Variables' }, { status: 503 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const { id: specId, ...data } = body;
    if (!specId) return NextResponse.json({ error: 'Spec id required' }, { status: 400 });
    if (typeof specId === 'string' && specId.startsWith('static-')) {
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

    args.push(specId);
    await db.execute({
      sql: `UPDATE VehicleSpec SET ${fields.join(', ')} WHERE id = ?`,
      args,
    });

    const updated = await db.execute({
      sql: 'SELECT * FROM VehicleSpec WHERE id = ?',
      args: [specId],
    });

    if (updated.rows.length === 0) {
      return NextResponse.json({ error: 'Spec not found' }, { status: 404 });
    }

    await revalidateVehiclePages(id);

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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.', hint: 'Vercel Dashboard → Settings → Environment Variables' }, { status: 503 });
  }
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const specId = searchParams.get('id');
    if (!specId) return NextResponse.json({ error: 'Spec id required' }, { status: 400 });
    await db.execute({
      sql: 'DELETE FROM VehicleSpec WHERE id = ?',
      args: [specId],
    });

    await revalidateVehiclePages(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting spec:', error);
    return NextResponse.json({ error: 'Failed to delete spec', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
