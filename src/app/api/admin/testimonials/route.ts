import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

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

    const fields: string[] = [];
    const args: (string | number)[] = [];

    if (body.customerName !== undefined) { fields.push('customerName = ?'); args.push(body.customerName); }
    if (body.customerRole !== undefined) { fields.push('customerRole = ?'); args.push(body.customerRole); }
    if (body.content !== undefined) { fields.push('content = ?'); args.push(body.content); }
    if (body.rating !== undefined) { fields.push('rating = ?'); args.push(Number(body.rating)); }
    if (body.imagePath !== undefined) { fields.push('imagePath = ?'); args.push(body.imagePath); }
    if (body.displayOrder !== undefined) { fields.push('displayOrder = ?'); args.push(Number(body.displayOrder)); }
    if (body.active !== undefined) { fields.push('active = ?'); args.push(body.active ? 1 : 0); }

    fields.push('updatedAt = ?');
    args.push(now);
    args.push(id);

    await db.execute({
      sql: `UPDATE Testimonial SET ${fields.join(', ')} WHERE id = ?`,
      args,
    });

    const updated = await db.execute({
      sql: 'SELECT * FROM Testimonial WHERE id = ?',
      args: [id],
    });

    if (updated.rows.length === 0) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    const row = updated.rows[0];
    return NextResponse.json({
      ...row,
      active: row.active === 1,
      rating: Number(row.rating),
      displayOrder: Number(row.displayOrder),
    });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json({ error: 'Failed to update testimonial', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.', hint: 'Vercel Dashboard → Settings → Environment Variables' }, { status: 503 });
  }
  try {
    const { id } = await params;
    await db.execute({
      sql: 'DELETE FROM Testimonial WHERE id = ?',
      args: [id],
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json({ error: 'Failed to delete testimonial', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
