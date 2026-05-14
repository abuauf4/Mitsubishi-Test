import { NextRequest, NextResponse } from 'next/server';
import { getDb, isTursoAvailable } from '@/lib/db';
import { getStaticHero } from '@/lib/static-data';

export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json(getStaticHero());
  }
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM Hero WHERE active = 1 LIMIT 1',
      args: []
    });
    if (result.rows.length === 0) {
      // No hero in DB yet, try to get any hero
      const anyHero = await db.execute({
        sql: 'SELECT * FROM Hero LIMIT 1',
        args: []
      });
      if (anyHero.rows.length === 0) {
        return NextResponse.json(null);
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
    return NextResponse.json({ error: 'Failed to fetch hero' }, { status: 500 });
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
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const now = new Date().toISOString();

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

      const row = updated.rows[0];
      return NextResponse.json({
        ...row,
        active: row.active === 1,
      });
    } else {
      // Create new (id is null or static-*)
      const newId = crypto.randomUUID();
      await db.execute({
        sql: `INSERT INTO Hero (id, title, subtitle, imagePath, ctaText, ctaLink, active, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          newId,
          data.title ?? '',
          data.subtitle ?? '',
          data.imagePath ?? '/images/hero-cinematic.png',
          data.ctaText ?? 'Selengkapnya',
          data.ctaLink ?? '#audience-gateway',
          data.active !== false ? 1 : 0,
          now,
          now,
        ]
      });

      return NextResponse.json({
        id: newId,
        title: data.title ?? '',
        subtitle: data.subtitle ?? '',
        imagePath: data.imagePath ?? '/images/hero-cinematic.png',
        ctaText: data.ctaText ?? 'Selengkapnya',
        ctaLink: data.ctaLink ?? '#audience-gateway',
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
