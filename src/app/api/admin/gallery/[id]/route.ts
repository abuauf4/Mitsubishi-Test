import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/** PUT — update a gallery item */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const now = new Date().toISOString();

    const fields: string[] = [];
    const args: (string | number)[] = [];

    if (body.type !== undefined) { fields.push('type = ?'); args.push(body.type); }
    if (body.title !== undefined) { fields.push('title = ?'); args.push(body.title); }
    if (body.description !== undefined) { fields.push('description = ?'); args.push(body.description); }
    if (body.imagePath !== undefined) { fields.push('imagePath = ?'); args.push(body.imagePath); }
    if (body.customerName !== undefined) { fields.push('customerName = ?'); args.push(body.customerName); }
    if (body.vehicleName !== undefined) { fields.push('vehicleName = ?'); args.push(body.vehicleName); }
    if (body.articleContent !== undefined) { fields.push('articleContent = ?'); args.push(body.articleContent); }
    if (body.displayOrder !== undefined) { fields.push('displayOrder = ?'); args.push(Number(body.displayOrder)); }
    if (body.active !== undefined) { fields.push('active = ?'); args.push(body.active ? 1 : 0); }

    fields.push('updatedAt = ?');
    args.push(now);
    args.push(id);

    await db.execute({
      sql: `UPDATE GalleryItem SET ${fields.join(', ')} WHERE id = ?`,
      args,
    });

    const updated = await db.execute({
      sql: 'SELECT * FROM GalleryItem WHERE id = ?',
      args: [id],
    });

    if (updated.rows.length === 0) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    try { revalidatePath('/'); revalidatePath('/api/gallery'); } catch {}

    const row = updated.rows[0];
    return NextResponse.json({
      ...row,
      active: row.active === 1,
      displayOrder: Number(row.displayOrder),
    });
  } catch (error: any) {
    console.error('Error updating gallery item:', error);
    return NextResponse.json({ error: 'Failed to update gallery item', detail: error?.message }, { status: 500 });
  }
}

/** DELETE — delete a gallery item */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const { id } = await params;
    await db.execute({
      sql: 'DELETE FROM GalleryItem WHERE id = ?',
      args: [id],
    });

    try { revalidatePath('/'); revalidatePath('/api/gallery'); } catch {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json({ error: 'Failed to delete gallery item', detail: error?.message }, { status: 500 });
  }
}
