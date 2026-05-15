import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getStaticVehicles } from '@/lib/static-data';

/**
 * Purge Next.js cache for the vehicle's public pages after any mutation.
 * This ensures admin changes are immediately visible on the frontend.
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

/**
 * Find the vehicleId for a variant by its ID (needed for DELETE which only has variantId).
 */
async function findVehicleIdByVariantId(variantId: string): Promise<string | null> {
  try {
    const db = getDb();
    if (!db) return null;
    const result = await db.execute({
      sql: 'SELECT vehicleId FROM VehicleVariant WHERE id = ?',
      args: [variantId],
    });
    return result.rows.length > 0 ? (result.rows[0].vehicleId as string) : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  if (!db) {
    const vehicle = getStaticVehicles().find(v => v.id === id);
    return NextResponse.json(vehicle?.variants || []);
  }
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM VehicleVariant WHERE vehicleId = ? ORDER BY displayOrder ASC',
      args: [id],
    });
    const variants = result.rows.map(row => ({
      ...row,
      highlights: typeof row.highlights === 'string' ? JSON.parse(row.highlights) : row.highlights,
      priceNum: Number(row.priceNum),
      displayOrder: Number(row.displayOrder),
    }));
    return NextResponse.json(variants);
  } catch (error) {
    console.error('Error fetching variants:', error);
    return NextResponse.json({ error: 'Failed to fetch variants' }, { status: 500 });
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
    const variantId = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO VehicleVariant (id, vehicleId, name, price, priceNum, transmission, drivetrain, imagePath, description, highlights, displayOrder)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        variantId,
        id,
        body.name ?? '',
        body.price ?? '',
        body.priceNum ?? 0,
        body.transmission ?? '',
        body.drivetrain ?? null,
        body.imagePath ?? null,
        body.description ?? null,
        typeof body.highlights === 'object' ? JSON.stringify(body.highlights) : (body.highlights ?? '[]'),
        body.displayOrder ?? 0,
      ]
    });

    // Purge cache so frontend shows the new variant immediately
    await revalidateVehiclePages(id);

    return NextResponse.json({
      id: variantId,
      vehicleId: id,
      name: body.name ?? '',
      price: body.price ?? '',
      priceNum: body.priceNum ?? 0,
      transmission: body.transmission ?? '',
      drivetrain: body.drivetrain ?? null,
      imagePath: body.imagePath ?? null,
      description: body.description ?? null,
      highlights: body.highlights ?? [],
      displayOrder: body.displayOrder ?? 0,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating variant:', error);
    return NextResponse.json({ error: 'Failed to create variant', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
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
    const { id: variantId, ...data } = body;
    if (!variantId) return NextResponse.json({ error: 'Variant id required' }, { status: 400 });
    if (typeof variantId === 'string' && variantId.startsWith('static-')) {
      return NextResponse.json({ error: 'Cannot update static-prefixed record. Please create a new record instead.', hint: 'Use POST to create a new database record.' }, { status: 400 });
    }

    const fields: string[] = [];
    const args: (string | number | null)[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); args.push(data.name); }
    if (data.price !== undefined) { fields.push('price = ?'); args.push(data.price); }
    if (data.priceNum !== undefined) { fields.push('priceNum = ?'); args.push(Number(data.priceNum)); }
    if (data.transmission !== undefined) { fields.push('transmission = ?'); args.push(data.transmission); }
    if (data.drivetrain !== undefined) { fields.push('drivetrain = ?'); args.push(data.drivetrain); }
    if (data.highlights !== undefined) { fields.push('highlights = ?'); args.push(typeof data.highlights === 'object' ? JSON.stringify(data.highlights) : data.highlights); }
    if (data.imagePath !== undefined) { fields.push('imagePath = ?'); args.push(data.imagePath); }
    if (data.description !== undefined) { fields.push('description = ?'); args.push(data.description); }
    if (data.displayOrder !== undefined) { fields.push('displayOrder = ?'); args.push(Number(data.displayOrder)); }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    args.push(variantId);
    await db.execute({
      sql: `UPDATE VehicleVariant SET ${fields.join(', ')} WHERE id = ?`,
      args,
    });

    const updated = await db.execute({
      sql: 'SELECT * FROM VehicleVariant WHERE id = ?',
      args: [variantId],
    });

    if (updated.rows.length === 0) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    // Purge cache so frontend shows the updated variant immediately
    await revalidateVehiclePages(id);

    const row = updated.rows[0];
    return NextResponse.json({
      ...row,
      highlights: typeof row.highlights === 'string' ? JSON.parse(row.highlights) : row.highlights,
      priceNum: Number(row.priceNum),
      displayOrder: Number(row.displayOrder),
    });
  } catch (error) {
    console.error('Error updating variant:', error);
    return NextResponse.json({ error: 'Failed to update variant', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
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
    const variantId = searchParams.get('id');
    if (!variantId) return NextResponse.json({ error: 'Variant id required' }, { status: 400 });

    // Find the vehicleId for cache purging before deleting
    const vehicleId = await findVehicleIdByVariantId(variantId);

    await db.execute({
      sql: 'DELETE FROM VehicleVariant WHERE id = ?',
      args: [variantId],
    });

    // Purge cache so frontend shows the deletion immediately
    if (vehicleId) {
      await revalidateVehiclePages(vehicleId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting variant:', error);
    return NextResponse.json({ error: 'Failed to delete variant', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
