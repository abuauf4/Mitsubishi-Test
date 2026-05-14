import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getStaticSales } from '@/lib/static-data';

export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json(getStaticSales());
  }
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM SalesConsultant ORDER BY createdAt DESC',
      args: []
    });
    const consultants = result.rows.map(row => ({
      ...row,
      active: row.active === 1,
    }));
    return NextResponse.json(consultants);
  } catch (error) {
    console.error('Error fetching sales consultants:', error);
    return NextResponse.json({ error: 'Failed to fetch sales consultants' }, { status: 500 });
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
    const now = new Date().toISOString();

    if (id && typeof id === 'string' && id.startsWith('static-')) {
      return NextResponse.json({ error: 'Cannot update static-prefixed record. Please create a new record instead.', hint: 'Remove the id field or use POST to create a new database record.' }, { status: 400 });
    }

    if (id) {
      // Update existing
      const fields: string[] = [];
      const args: (string | number)[] = [];

      if (data.name !== undefined) { fields.push('name = ?'); args.push(data.name); }
      if (data.phone !== undefined) { fields.push('phone = ?'); args.push(data.phone); }
      if (data.whatsapp !== undefined) { fields.push('whatsapp = ?'); args.push(data.whatsapp); }
      if (data.email !== undefined) { fields.push('email = ?'); args.push(data.email); }
      if (data.title !== undefined) { fields.push('title = ?'); args.push(data.title); }
      if (data.description !== undefined) { fields.push('description = ?'); args.push(data.description); }
      if (data.imagePath !== undefined) { fields.push('imagePath = ?'); args.push(data.imagePath); }
      if (data.active !== undefined) { fields.push('active = ?'); args.push(data.active ? 1 : 0); }

      fields.push('updatedAt = ?');
      args.push(now);
      args.push(id);

      await db.execute({
        sql: `UPDATE SalesConsultant SET ${fields.join(', ')} WHERE id = ?`,
        args,
      });

      const updated = await db.execute({
        sql: 'SELECT * FROM SalesConsultant WHERE id = ?',
        args: [id],
      });

      if (updated.rows.length === 0) {
        return NextResponse.json({ error: 'Sales consultant not found' }, { status: 404 });
      }

      const row = updated.rows[0];
      return NextResponse.json({
        ...row,
        active: row.active === 1,
      });
    } else {
      // Create new
      const newId = crypto.randomUUID();
      await db.execute({
        sql: `INSERT INTO SalesConsultant (id, name, phone, whatsapp, email, title, description, imagePath, active, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          newId,
          data.name ?? '',
          data.phone ?? '',
          data.whatsapp ?? '',
          data.email ?? '',
          data.title ?? 'Sales Consultant',
          data.description ?? '',
          data.imagePath ?? '',
          data.active !== false ? 1 : 0,
          now,
          now,
        ]
      });

      return NextResponse.json({
        id: newId,
        name: data.name ?? '',
        phone: data.phone ?? '',
        whatsapp: data.whatsapp ?? '',
        email: data.email ?? '',
        title: data.title ?? 'Sales Consultant',
        description: data.description ?? '',
        imagePath: data.imagePath ?? '',
        active: data.active !== false,
        createdAt: now,
        updatedAt: now,
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error updating sales consultant:', error);
    return NextResponse.json({ error: 'Failed to update sales consultant', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.', hint: 'Vercel Dashboard → Settings → Environment Variables' }, { status: 503 });
  }
  try {
    const body = await request.json();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO SalesConsultant (id, name, phone, whatsapp, email, title, description, imagePath, active, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        body.name ?? '',
        body.phone ?? '',
        body.whatsapp ?? '',
        body.email ?? '',
        body.title ?? 'Sales Consultant',
        body.description ?? '',
        body.imagePath ?? '',
        body.active !== false ? 1 : 0,
        now,
        now,
      ]
    });

    return NextResponse.json({
      id,
      name: body.name ?? '',
      phone: body.phone ?? '',
      whatsapp: body.whatsapp ?? '',
      email: body.email ?? '',
      title: body.title ?? 'Sales Consultant',
      description: body.description ?? '',
      imagePath: body.imagePath ?? '',
      active: body.active !== false,
      createdAt: now,
      updatedAt: now,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating sales consultant:', error);
    return NextResponse.json({ error: 'Failed to create sales consultant', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
