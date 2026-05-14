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

    if (body.name !== undefined) { fields.push('name = ?'); args.push(body.name); }
    if (body.address !== undefined) { fields.push('address = ?'); args.push(body.address); }
    if (body.phone !== undefined) { fields.push('phone = ?'); args.push(body.phone); }
    if (body.latitude !== undefined) { fields.push('latitude = ?'); args.push(Number(body.latitude)); }
    if (body.longitude !== undefined) { fields.push('longitude = ?'); args.push(Number(body.longitude)); }
    if (body.embeddingUrl !== undefined) { fields.push('embeddingUrl = ?'); args.push(body.embeddingUrl); }
    if (body.active !== undefined) { fields.push('active = ?'); args.push(body.active ? 1 : 0); }

    fields.push('updatedAt = ?');
    args.push(now);
    args.push(id);

    await db.execute({
      sql: `UPDATE DealerLocation SET ${fields.join(', ')} WHERE id = ?`,
      args,
    });

    const updated = await db.execute({
      sql: 'SELECT * FROM DealerLocation WHERE id = ?',
      args: [id],
    });

    if (updated.rows.length === 0) {
      return NextResponse.json({ error: 'Dealer location not found' }, { status: 404 });
    }

    const row = updated.rows[0];
    return NextResponse.json({
      ...row,
      active: row.active === 1,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
    });
  } catch (error) {
    console.error('Error updating dealer location:', error);
    return NextResponse.json({ error: 'Failed to update dealer location', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
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
      sql: 'DELETE FROM DealerLocation WHERE id = ?',
      args: [id],
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dealer location:', error);
    return NextResponse.json({ error: 'Failed to delete dealer location', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
