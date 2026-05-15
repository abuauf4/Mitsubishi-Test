import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getStaticVehicles } from '@/lib/static-data';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  if (!db) {
    const vehicle = getStaticVehicles().find(v => v.id === id);
    return NextResponse.json(vehicle?.colors || []);
  }
  try {
    // Support optional ?variantId= filter to get colors for a specific variant
    // If variantId is provided, return: variant-specific colors + global colors (variantId IS NULL)
    // If not provided, return ALL colors for the vehicle
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get('variantId');

    let sql: string;
    let args: (string | null)[];

    if (variantId) {
      // Return variant-specific colors + global colors
      sql = `SELECT * FROM VehicleColor WHERE vehicleId = ? AND (variantId = ? OR variantId IS NULL) ORDER BY displayOrder ASC`;
      args = [id, variantId];
    } else {
      // Return all colors for the vehicle
      sql = 'SELECT * FROM VehicleColor WHERE vehicleId = ? ORDER BY displayOrder ASC';
      args = [id];
    }

    const result = await db.execute({ sql, args });
    const colors = result.rows.map(row => ({
      ...row,
      displayOrder: Number(row.displayOrder),
    }));
    return NextResponse.json(colors);
  } catch (error) {
    console.error('Error fetching colors:', error);
    return NextResponse.json({ error: 'Failed to fetch colors' }, { status: 500 });
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
    const colorId = crypto.randomUUID();

    // variantId is optional: if provided, color is specific to that variant
    // if null/undefined, color is global (available for all variants)
    const variantId = body.variantId || null;

    await db.execute({
      sql: `INSERT INTO VehicleColor (id, vehicleId, variantId, name, hex, imagePath, displayOrder)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        colorId,
        id,
        variantId,
        body.name ?? '',
        body.hex ?? '#000000',
        body.imagePath ?? null,
        body.displayOrder ?? 0,
      ]
    });

    return NextResponse.json({
      id: colorId,
      vehicleId: id,
      variantId,
      name: body.name ?? '',
      hex: body.hex ?? '#000000',
      imagePath: body.imagePath ?? null,
      displayOrder: body.displayOrder ?? 0,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating color:', error);
    return NextResponse.json({ error: 'Failed to create color', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
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
    if (!id) return NextResponse.json({ error: 'Color id required' }, { status: 400 });
    if (typeof id === 'string' && id.startsWith('static-')) {
      return NextResponse.json({ error: 'Cannot update static-prefixed record. Please create a new record instead.', hint: 'Use POST to create a new database record.' }, { status: 400 });
    }

    const fields: string[] = [];
    const args: (string | number | null)[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); args.push(data.name); }
    if (data.hex !== undefined) { fields.push('hex = ?'); args.push(data.hex); }
    if (data.variantId !== undefined) { fields.push('variantId = ?'); args.push(data.variantId || null); }
    if (data.imagePath !== undefined) { fields.push('imagePath = ?'); args.push(data.imagePath); }
    if (data.displayOrder !== undefined) { fields.push('displayOrder = ?'); args.push(Number(data.displayOrder)); }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    args.push(id);
    await db.execute({
      sql: `UPDATE VehicleColor SET ${fields.join(', ')} WHERE id = ?`,
      args,
    });

    const updated = await db.execute({
      sql: 'SELECT * FROM VehicleColor WHERE id = ?',
      args: [id],
    });

    if (updated.rows.length === 0) {
      return NextResponse.json({ error: 'Color not found' }, { status: 404 });
    }

    const row = updated.rows[0];
    return NextResponse.json({
      ...row,
      displayOrder: Number(row.displayOrder),
    });
  } catch (error) {
    console.error('Error updating color:', error);
    return NextResponse.json({ error: 'Failed to update color', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
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
    if (!id) return NextResponse.json({ error: 'Color id required' }, { status: 400 });
    await db.execute({
      sql: 'DELETE FROM VehicleColor WHERE id = ?',
      args: [id],
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting color:', error);
    return NextResponse.json({ error: 'Failed to delete color', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
