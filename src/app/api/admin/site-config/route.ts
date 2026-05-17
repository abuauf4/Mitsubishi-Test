import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getStaticSiteConfig } from '@/lib/static-data';

export const dynamic = 'force-dynamic';

// Required logo configs that must always exist in the DB
const REQUIRED_LOGO_CONFIGS = [
  { key: 'logo_passenger', type: 'image', page: 'passenger', label: 'Mitsubishi Logo' },
  { key: 'logo_commercial', type: 'image', page: 'commercial', label: 'FUSO Logo' },
];

export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json(getStaticSiteConfig());
  }
  try {
    // Ensure SiteConfig table exists
    await db.execute({
      sql: `CREATE TABLE IF NOT EXISTS SiteConfig (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL DEFAULT '',
        type TEXT NOT NULL DEFAULT 'text',
        page TEXT NOT NULL DEFAULT 'home'
      )`,
      args: [],
    });

    // Auto-seed required logo configs if they don't exist
    for (const required of REQUIRED_LOGO_CONFIGS) {
      const existing = await db.execute({
        sql: 'SELECT id FROM SiteConfig WHERE key = ?',
        args: [required.key],
      });
      if (existing.rows.length === 0) {
        const id = crypto.randomUUID();
        await db.execute({
          sql: 'INSERT INTO SiteConfig (id, key, value, type, page) VALUES (?, ?, ?, ?, ?)',
          args: [id, required.key, '', required.type, required.page],
        });
        console.log(`[site-config] Auto-seeded: ${required.key}`);
      }
    }

    // Clean up configs with empty keys (bad data)
    await db.execute({
      sql: "DELETE FROM SiteConfig WHERE key = '' OR key IS NULL",
      args: [],
    });

    // Clean up configs with old private blob URLs that are broken
    // (pointing to disconnected stores)
    const allConfigs = await db.execute({
      sql: 'SELECT key, value FROM SiteConfig WHERE value LIKE "%private.blob.vercel-storage.com%"',
      args: [],
    });
    for (const row of allConfigs.rows) {
      console.log(`[site-config] WARNING: ${row.key} has private blob URL (may be broken): ${(row.value as string)?.substring(0, 60)}...`);
    }

    const result = await db.execute({
      sql: 'SELECT * FROM SiteConfig ORDER BY key ASC',
      args: [],
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
      // Skip configs with empty keys
      if (!config.key || config.key.trim() === '') {
        console.warn('[site-config] Skipping config with empty key');
        continue;
      }

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

    // Reject configs with empty keys
    if (!body.key || body.key.trim() === '') {
      return NextResponse.json({ error: 'Config key cannot be empty' }, { status: 400 });
    }

    const id = crypto.randomUUID();

    await db.execute({
      sql: 'INSERT INTO SiteConfig (id, key, value, type, page) VALUES (?, ?, ?, ?, ?)',
      args: [id, body.key, body.value ?? '', body.type ?? 'text', body.page ?? 'home'],
    });

    return NextResponse.json({
      id,
      key: body.key,
      value: body.value ?? '',
      type: body.type ?? 'text',
      page: body.page ?? 'home',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating site config:', error);
    return NextResponse.json({ error: 'Failed to create site config', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
