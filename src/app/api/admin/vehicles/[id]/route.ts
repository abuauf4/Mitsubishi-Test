import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getStaticVehicles } from '@/lib/static-data';

/**
 * Extract the direct Vercel Blob URL from a proxy path like /api/image?url=...
 * Returns null if the path is not a proxy URL or can't be parsed.
 */
function extractBlobUrl(imagePath: string): string | null {
  try {
    if (imagePath.startsWith('/api/image?url=')) {
      return decodeURIComponent(imagePath.replace('/api/image?url=', ''));
    }
    if (imagePath.includes('vercel-storage.com')) {
      return imagePath;
    }
  } catch { /* ignore */ }
  return null;
}

/**
 * Delete a blob from Vercel Blob storage.
 * Fails silently — we don't want image cleanup to block saves.
 */
async function deleteBlobIfNeeded(blobUrl: string): Promise<void> {
  try {
    if (!blobUrl.includes('vercel-storage.com')) return;
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) return;
    const { del } = await import('@vercel/blob');
    await del(blobUrl, { token });
    console.log('🗑️ Deleted old blob:', blobUrl);
  } catch (error: any) {
    console.warn('⚠️ Failed to delete old blob (non-critical):', error?.message);
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  if (!db) {
    const vehicle = getStaticVehicles().find(v => v.id === id);
    return NextResponse.json(vehicle || null);
  }
  try {
    const vehicleResult = await db.execute({
      sql: 'SELECT * FROM Vehicle WHERE id = ?',
      args: [id],
    });

    if (vehicleResult.rows.length === 0) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const row = vehicleResult.rows[0];

    const [variantsRes, colorsRes, specsRes, featuresRes] = await Promise.all([
      db.execute({ sql: 'SELECT * FROM VehicleVariant WHERE vehicleId = ? ORDER BY displayOrder ASC', args: [id] }),
      db.execute({ sql: 'SELECT * FROM VehicleColor WHERE vehicleId = ? ORDER BY displayOrder ASC', args: [id] }),
      db.execute({ sql: 'SELECT * FROM VehicleSpec WHERE vehicleId = ? ORDER BY displayOrder ASC', args: [id] }),
      db.execute({ sql: 'SELECT * FROM VehicleFeature WHERE vehicleId = ? ORDER BY displayOrder ASC', args: [id] }),
    ]);

    // Safe JSON parse helper - returns fallback if parsing fails
    function safeJsonParse(val: unknown, fallback: unknown = null) {
      if (val === null || val === undefined) return fallback;
      if (typeof val !== 'string') return val;
      try { return JSON.parse(val); }
      catch { return fallback; }
    }

    const vehicle = {
      ...row,
      active: row.active === 1,
      displayOrder: Number(row.displayOrder),
      gallery: safeJsonParse(row.gallery, []),
      variants: variantsRes.rows.map(v => ({
        ...v,
        highlights: safeJsonParse(v.highlights, []),
        priceNum: Number(v.priceNum),
        displayOrder: Number(v.displayOrder),
      })),
      colors: colorsRes.rows.map(c => ({
        ...c,
        displayOrder: Number(c.displayOrder),
      })),
      specs: specsRes.rows.map(s => ({
        ...s,
        items: safeJsonParse(s.items, []),
        displayOrder: Number(s.displayOrder),
      })),
      features: featuresRes.rows.map(f => ({
        ...f,
        displayOrder: Number(f.displayOrder),
      })),
    };

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicle' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.', hint: 'Vercel Dashboard → Settings → Environment Variables' }, { status: 503 });
  }
  try {
    const { id } = await params;
    if (id.startsWith('static-')) {
      return NextResponse.json({ error: 'Cannot update static-prefixed record. Please create a new record instead.', hint: 'Use POST on the parent route to create a new database record.' }, { status: 400 });
    }
    const body = await request.json();
    const now = new Date().toISOString();

    // If imagePath is being updated, check for the old one to delete from Vercel Blob
    let oldBlobUrl: string | null = null;
    if (body.imagePath !== undefined) {
      try {
        const oldResult = await db.execute({
          sql: 'SELECT imagePath FROM Vehicle WHERE id = ?',
          args: [id],
        });
        if (oldResult.rows.length > 0) {
          const oldImagePath = oldResult.rows[0].imagePath as string;
          if (oldImagePath && oldImagePath !== body.imagePath) {
            oldBlobUrl = extractBlobUrl(oldImagePath);
          }
        }
      } catch (e) {
        console.warn('⚠️ Could not fetch old imagePath for cleanup:', e);
      }
    }

    const fields: string[] = [];
    const args: (string | number | null)[] = [];

    if (body.slug !== undefined) { fields.push('slug = ?'); args.push(body.slug); }
    if (body.name !== undefined) { fields.push('name = ?'); args.push(body.name); }
    if (body.tagline !== undefined) { fields.push('tagline = ?'); args.push(body.tagline); }
    if (body.category !== undefined) { fields.push('category = ?'); args.push(body.category); }
    if (body.basePrice !== undefined) { fields.push('basePrice = ?'); args.push(body.basePrice); }
    if (body.imagePath !== undefined) { fields.push('imagePath = ?'); args.push(body.imagePath); }
    if (body.payload !== undefined) { fields.push('payload = ?'); args.push(body.payload); }
    if (body.specsShort !== undefined) { fields.push('specsShort = ?'); args.push(typeof body.specsShort === 'object' ? JSON.stringify(body.specsShort) : body.specsShort); }
    if (body.gallery !== undefined) { fields.push('gallery = ?'); args.push(typeof body.gallery === 'object' ? JSON.stringify(body.gallery) : body.gallery); }
    if (body.displayOrder !== undefined) { fields.push('displayOrder = ?'); args.push(Number(body.displayOrder)); }
    if (body.active !== undefined) { fields.push('active = ?'); args.push(body.active ? 1 : 0); }

    fields.push('updatedAt = ?');
    args.push(now);
    args.push(id);

    await db.execute({
      sql: `UPDATE Vehicle SET ${fields.join(', ')} WHERE id = ?`,
      args,
    });

    const updated = await db.execute({
      sql: 'SELECT * FROM Vehicle WHERE id = ?',
      args: [id],
    });

    if (updated.rows.length === 0) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Delete old blob AFTER successful DB update (non-blocking)
    if (oldBlobUrl) {
      deleteBlobIfNeeded(oldBlobUrl); // fire-and-forget — don't block the response
    }

    // Purge Next.js cache for the vehicle detail pages so they show fresh data
    const slug = body.slug || (updated.rows[0]?.slug as string);
    const category = body.category || (updated.rows[0]?.category as string);
    if (slug) {
      if (category === 'commercial' || category === 'niaga-ringan') {
        revalidatePath(`/commercial/${slug}`);
      } else {
        revalidatePath(`/passenger/${slug}`);
      }
    }
    // Also purge listing pages and home
    revalidatePath('/passenger');
    revalidatePath('/commercial');
    revalidatePath('/');

    const row = updated.rows[0];
    return NextResponse.json({
      ...row,
      active: row.active === 1,
      displayOrder: Number(row.displayOrder),
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json({ error: 'Failed to update vehicle', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.', hint: 'Vercel Dashboard → Settings → Environment Variables' }, { status: 503 });
  }
  try {
    const { id } = await params;

    // Get the vehicle's imagePath before deleting so we can clean up its blob
    let blobUrlToDelete: string | null = null;
    try {
      const vehicleResult = await db.execute({
        sql: 'SELECT imagePath FROM Vehicle WHERE id = ?',
        args: [id],
      });
      if (vehicleResult.rows.length > 0) {
        const imagePath = vehicleResult.rows[0].imagePath as string;
        if (imagePath) {
          blobUrlToDelete = extractBlobUrl(imagePath);
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not fetch imagePath for cleanup:', e);
    }

    // Sub-tables should be deleted via CASCADE, but be explicit
    await db.batch([
      { sql: 'DELETE FROM VehicleVariant WHERE vehicleId = ?', args: [id] },
      { sql: 'DELETE FROM VehicleColor WHERE vehicleId = ?', args: [id] },
      { sql: 'DELETE FROM VehicleSpec WHERE vehicleId = ?', args: [id] },
      { sql: 'DELETE FROM VehicleFeature WHERE vehicleId = ?', args: [id] },
      { sql: 'DELETE FROM Vehicle WHERE id = ?', args: [id] },
    ]);

    // Delete blob AFTER successful DB delete (non-blocking)
    if (blobUrlToDelete) {
      deleteBlobIfNeeded(blobUrlToDelete);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json({ error: 'Failed to delete vehicle', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
