import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getStaticSiteConfig } from '@/lib/static-data';

export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json(getStaticSiteConfig());
  }
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM SiteConfig ORDER BY key ASC',
      args: []
    });
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching site configs:', error);
    return NextResponse.json({ error: 'Failed to fetch site configs' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.', hint: 'Vercel Dashboard → Settings → Environment Variables' }, { status: 503 });
  }
  try {
    const body = await request.json();
    const { configs } = body as { configs: { key: string; value: string; type: string; page: string }[] };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any[] = [];

    for (const config of configs) {
      // Check if the key exists
      const existing = await db.execute({
        sql: 'SELECT id FROM SiteConfig WHERE key = ?',
        args: [config.key],
      });

      if (existing.rows.length > 0) {
        // Update
        await db.execute({
          sql: 'UPDATE SiteConfig SET value = ?, type = ?, page = ? WHERE key = ?',
          args: [config.value, config.type, config.page, config.key],
        });
        const updated = await db.execute({
          sql: 'SELECT * FROM SiteConfig WHERE key = ?',
          args: [config.key],
        });
        if (updated.rows.length > 0) results.push(updated.rows[0]);
      } else {
        // Insert
        const id = crypto.randomUUID();
        await db.execute({
          sql: 'INSERT INTO SiteConfig (id, key, value, type, page) VALUES (?, ?, ?, ?, ?)',
          args: [id, config.key, config.value, config.type, config.page],
        });
        results.push({
          id,
          key: config.key,
          value: config.value,
          type: config.type,
          page: config.page,
        });
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error updating site configs:', error);
    return NextResponse.json({ error: 'Failed to update site configs', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
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

    await db.execute({
      sql: 'INSERT INTO SiteConfig (id, key, value, type, page) VALUES (?, ?, ?, ?, ?)',
      args: [id, body.key ?? '', body.value ?? '', body.type ?? 'text', body.page ?? 'home'],
    });

    return NextResponse.json({
      id,
      key: body.key ?? '',
      value: body.value ?? '',
      type: body.type ?? 'text',
      page: body.page ?? 'home',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating site config:', error);
    return NextResponse.json({ error: 'Failed to create site config', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
