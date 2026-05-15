import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb, isTursoAvailable } from '@/lib/db';
import { getStaticHero } from '@/lib/static-data';
import { ensureMigrations } from '@/lib/auto-migrate';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || 'home';

  const db = getDb();
  if (!db) {
    // Return static data with a static- prefix ID so admin knows it's fallback
    const staticData = getStaticHero(page);
    return NextResponse.json(staticData);
  }

  // Ensure migrations have run
  await ensureMigrations();

  try {
    const result = await db.execute({
      sql: 'SELECT * FROM Hero WHERE active = 1 AND page = ? LIMIT 1',
      args: [page],
    });
    if (result.rows.length === 0) {
      // No active hero for this page, try to get any hero for this page
      const anyHero = await db.execute({
        sql: 'SELECT * FROM Hero WHERE page = ? LIMIT 1',
        args: [page],
      });
      if (anyHero.rows.length === 0) {
        // No hero at all for this page — return static fallback
        const staticData = getStaticHero(page);
        return NextResponse.json(staticData);
      }
      const hero = {
        ...anyHero.rows[0],
        active: anyHero.rows[0].active === 1,
      };
      return NextResponse.json(hero);
    }
    const hero = {
      ...result.rows[0],
      active: result.rows[0].active === 1,
    };
    return NextResponse.json(hero);
  } catch (error) {
    console.error('Error fetching hero:', error);
    const staticData = getStaticHero(page);
    return NextResponse.json(staticData);
  }
}

export async function PUT(request: NextRequest) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({
      error: 'Database not configured. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables.',
      hint: 'Go to Vercel Dashboard → Settings → Environment Variables'
    }, { status: 503 });
  }

  // Ensure migrations have run before writing
  await ensureMigrations();

  try {
    const body = await request.json();
    const { id, ...data } = body;
    const now = new Date().toISOString();
    const page = data.page || 'home';

    if (id && !id.startsWith('static-')) {
      // Update existing
      const fields: string[] = [];
      const args: (string | number)[] = [];

      if (data.title !== undefined) { fields.push('title = ?'); args.push(data.title); }
      if (data.subtitle !== undefined) { fields.push('subtitle = ?'); args.push(data.subtitle); }
      if (data.imagePath !== undefined) { fields.push('imagePath = ?'); args.push(data.imagePath); }
      if (data.ctaText !== undefined) { fields.push('ctaText = ?'); args.push(data.ctaText); }
      if (data.ctaLink !== undefined) { fields.push('ctaLink = ?'); args.push(data.ctaLink); }
      if (data.active !== undefined) { fields.push('active = ?'); args.push(data.active ? 1 : 0); }
      if (data.page !== undefined) { fields.push('page = ?'); args.push(data.page); }

      fields.push('updatedAt = ?');
      args.push(now);
      args.push(id);

      await db.execute({
        sql: `UPDATE Hero SET ${fields.join(', ')} WHERE id = ?`,
        args,
      });

      const updated = await db.execute({
        sql: 'SELECT * FROM Hero WHERE id = ?',
        args: [id],
      });

      if (updated.rows.length === 0) {
        return NextResponse.json({ error: 'Hero not found after update' }, { status: 404 });
      }

      // Purge all hero caches so the public API serves fresh data immediately
      try {
        revalidatePath('/');
        revalidatePath('/passenger');
        revalidatePath('/commercial');
        // Also revalidate the API routes so they return fresh data
        revalidatePath('/api/hero');
      } catch (e) {
        // revalidatePath might not work in all environments, but that's OK
        console.warn('revalidatePath failed (non-critical):', e);
      }

      const row = updated.rows[0];
      return NextResponse.json({
        ...row,
        active: row.active === 1,
      });
    } else {
      // Create new (id is null or static-*)
      // But first check if a record already exists for this page — update it instead of creating duplicate
      const existing = await db.execute({
        sql: 'SELECT id FROM Hero WHERE page = ? LIMIT 1',
        args: [page],
      });

      if (existing.rows.length > 0) {
        // Record exists — update it with the new data
        const existingId = existing.rows[0].id as string;
        const fields: string[] = [];
        const args: (string | number)[] = [];

        if (data.title !== undefined) { fields.push('title = ?'); args.push(data.title); }
        if (data.subtitle !== undefined) { fields.push('subtitle = ?'); args.push(data.subtitle); }
        if (data.imagePath !== undefined) { fields.push('imagePath = ?'); args.push(data.imagePath); }
        if (data.ctaText !== undefined) { fields.push('ctaText = ?'); args.push(data.ctaText); }
        if (data.ctaLink !== undefined) { fields.push('ctaLink = ?'); args.push(data.ctaLink); }
        if (data.active !== undefined) { fields.push('active = ?'); args.push(data.active ? 1 : 0); }

        fields.push('updatedAt = ?');
        args.push(now);
        args.push(existingId);

        await db.execute({
          sql: `UPDATE Hero SET ${fields.join(', ')} WHERE id = ?`,
          args,
        });

        // Purge caches
        try {
          revalidatePath('/');
          revalidatePath('/passenger');
          revalidatePath('/commercial');
          revalidatePath('/api/hero');
        } catch (e) {
          console.warn('revalidatePath failed (non-critical):', e);
        }

        const updated = await db.execute({
          sql: 'SELECT * FROM Hero WHERE id = ?',
          args: [existingId],
        });
        const row = updated.rows[0];
        return NextResponse.json({
          ...row,
          active: row.active === 1,
        });
      }

      // No existing record — create new
      const newId = crypto.randomUUID();
      await db.execute({
        sql: `INSERT INTO Hero (id, title, subtitle, imagePath, ctaText, ctaLink, page, active, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          newId,
          data.title ?? '',
          data.subtitle ?? '',
          data.imagePath ?? '/images/hero-cinematic.png',
          data.ctaText ?? 'Selengkapnya',
          data.ctaLink ?? '#audience-gateway',
          page,
          data.active !== false ? 1 : 0,
          now,
          now,
        ]
      });

      // Purge all hero caches so the public API serves fresh data immediately
      try {
        revalidatePath('/');
        revalidatePath('/passenger');
        revalidatePath('/commercial');
        revalidatePath('/api/hero');
      } catch (e) {
        console.warn('revalidatePath failed (non-critical):', e);
      }

      return NextResponse.json({
        id: newId,
        title: data.title ?? '',
        subtitle: data.subtitle ?? '',
        imagePath: data.imagePath ?? '/images/hero-cinematic.png',
        ctaText: data.ctaText ?? 'Selengkapnya',
        ctaLink: data.ctaLink ?? '#audience-gateway',
        page,
        active: data.active !== false,
        createdAt: now,
        updatedAt: now,
      }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error updating hero:', error);
    return NextResponse.json({
      error: 'Failed to update hero',
      detail: error?.message || String(error),
    }, { status: 500 });
  }
}
