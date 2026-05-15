import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({
      error: 'Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.',
      hint: 'Vercel Dashboard → Settings → Environment Variables'
    }, { status: 503 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // If ID starts with 'static-', check if a DB record already exists for this linkHref
    // If yes, update it. If no, create a new one. This prevents duplicate records.
    if (id.startsWith('static-')) {
      const now = new Date().toISOString();
      const linkHref = body.linkHref ?? '';

      // Check if a record with this linkHref already exists
      const existing = linkHref
        ? await db.execute({
            sql: 'SELECT id FROM AudienceCategory WHERE linkHref = ? LIMIT 1',
            args: [linkHref],
          })
        : { rows: [] };

      if (existing.rows.length > 0) {
        // Update existing record
        const existingId = existing.rows[0].id as string;
        const fields: string[] = [];
        const args: (string | number)[] = [];

        if (body.title !== undefined) { fields.push('title = ?'); args.push(body.title); }
        if (body.description !== undefined) { fields.push('description = ?'); args.push(body.description); }
        if (body.imagePath !== undefined) { fields.push('imagePath = ?'); args.push(body.imagePath); }
        if (body.linkHref !== undefined) { fields.push('linkHref = ?'); args.push(body.linkHref); }
        if (body.displayOrder !== undefined) { fields.push('displayOrder = ?'); args.push(Number(body.displayOrder)); }
        if (body.active !== undefined) { fields.push('active = ?'); args.push(body.active ? 1 : 0); }

        fields.push('updatedAt = ?');
        args.push(now);
        args.push(existingId);

        await db.execute({
          sql: `UPDATE AudienceCategory SET ${fields.join(', ')} WHERE id = ?`,
          args,
        });

        // Purge caches
        try {
          revalidatePath('/');
          revalidatePath('/api/audience-categories');
        } catch (e) {
          console.warn('revalidatePath failed (non-critical):', e);
        }

        const updated = await db.execute({
          sql: 'SELECT * FROM AudienceCategory WHERE id = ?',
          args: [existingId],
        });
        const row = updated.rows[0];
        return NextResponse.json({
          ...row,
          active: row.active === 1,
          displayOrder: Number(row.displayOrder),
        });
      }

      // No existing record — create new
      const newId = crypto.randomUUID();

      await db.execute({
        sql: `INSERT INTO AudienceCategory (id, title, description, imagePath, linkHref, displayOrder, active, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          newId,
          body.title ?? '',
          body.description ?? '',
          body.imagePath ?? '',
          body.linkHref ?? '',
          body.displayOrder ?? 0,
          body.active !== false ? 1 : 0,
          now,
          now,
        ],
      });

      // Purge caches so category changes appear immediately
      try {
        revalidatePath('/');
        revalidatePath('/api/audience-categories');
      } catch (e) {
        console.warn('revalidatePath failed (non-critical):', e);
      }

      return NextResponse.json({
        id: newId,
        title: body.title ?? '',
        description: body.description ?? '',
        imagePath: body.imagePath ?? '',
        linkHref: body.linkHref ?? '',
        displayOrder: body.displayOrder ?? 0,
        active: body.active !== false,
        createdAt: now,
        updatedAt: now,
      }, { status: 201 });
    }
    const now = new Date().toISOString();

    const fields: string[] = [];
    const args: (string | number)[] = [];

    if (body.title !== undefined) { fields.push('title = ?'); args.push(body.title); }
    if (body.description !== undefined) { fields.push('description = ?'); args.push(body.description); }
    if (body.imagePath !== undefined) { fields.push('imagePath = ?'); args.push(body.imagePath); }
    if (body.linkHref !== undefined) { fields.push('linkHref = ?'); args.push(body.linkHref); }
    if (body.displayOrder !== undefined) { fields.push('displayOrder = ?'); args.push(Number(body.displayOrder)); }
    if (body.active !== undefined) { fields.push('active = ?'); args.push(body.active ? 1 : 0); }

    fields.push('updatedAt = ?');
    args.push(now);
    args.push(id);

    await db.execute({
      sql: `UPDATE AudienceCategory SET ${fields.join(', ')} WHERE id = ?`,
      args,
    });

    const updated = await db.execute({
      sql: 'SELECT * FROM AudienceCategory WHERE id = ?',
      args: [id],
    });

    if (updated.rows.length === 0) {
      return NextResponse.json({ error: 'Audience category not found' }, { status: 404 });
    }

    // Purge caches so category changes appear immediately
    try {
      revalidatePath('/');
      revalidatePath('/api/audience-categories');
    } catch (e) {
      console.warn('revalidatePath failed (non-critical):', e);
    }

    const row = updated.rows[0];
    return NextResponse.json({
      ...row,
      active: row.active === 1,
      displayOrder: Number(row.displayOrder),
    });
  } catch (error: any) {
    console.error('Error updating audience category:', error);
    return NextResponse.json({
      error: 'Failed to update audience category',
      detail: error?.message || String(error),
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({
      error: 'Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.',
      hint: 'Vercel Dashboard → Settings → Environment Variables'
    }, { status: 503 });
  }

  try {
    const { id } = await params;
    if (id.startsWith('static-')) {
      return NextResponse.json({
        error: 'Cannot delete static-prefixed record. It is fallback data, not a database record.'
      }, { status: 400 });
    }

    await db.execute({
      sql: 'DELETE FROM AudienceCategory WHERE id = ?',
      args: [id],
    });

    // Purge caches so category changes appear immediately
    try {
      revalidatePath('/');
      revalidatePath('/api/audience-categories');
    } catch (e) {
      console.warn('revalidatePath failed (non-critical):', e);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting audience category:', error);
    return NextResponse.json({
      error: 'Failed to delete audience category',
      detail: error?.message || String(error),
    }, { status: 500 });
  }
}
