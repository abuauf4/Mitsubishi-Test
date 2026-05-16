import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ensureMigrations } from '@/lib/auto-migrate';
import { revalidatePath } from 'next/cache';

/** GET all gallery items (admin — includes inactive) */
export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  await ensureMigrations();

  try {
    const result = await db.execute({
      sql: 'SELECT * FROM GalleryItem ORDER BY displayOrder ASC, createdAt DESC',
      args: [],
    });

    const items = result.rows.map((row) => ({
      ...row,
      active: row.active === 1,
      displayOrder: Number(row.displayOrder),
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return NextResponse.json({ error: 'Failed to fetch gallery items' }, { status: 500 });
  }
}

/** POST — create a new gallery item */
export async function POST(request: NextRequest) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  await ensureMigrations();

  try {
    const body = await request.json();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO GalleryItem (id, type, title, description, imagePath, customerName, vehicleName, articleContent, displayOrder, active, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        body.type || 'delivery',
        body.title || '',
        body.description || '',
        body.imagePath || '',
        body.customerName || '',
        body.vehicleName || '',
        body.articleContent || '',
        body.displayOrder ?? 0,
        body.active !== false ? 1 : 0,
        now,
        now,
      ],
    });

    try { revalidatePath('/'); revalidatePath('/api/gallery'); } catch {}

    return NextResponse.json({
      id,
      type: body.type || 'delivery',
      title: body.title || '',
      description: body.description || '',
      imagePath: body.imagePath || '',
      customerName: body.customerName || '',
      vehicleName: body.vehicleName || '',
      articleContent: body.articleContent || '',
      displayOrder: body.displayOrder ?? 0,
      active: body.active !== false,
      createdAt: now,
      updatedAt: now,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json({ error: 'Failed to create gallery item', detail: error?.message }, { status: 500 });
  }
}
