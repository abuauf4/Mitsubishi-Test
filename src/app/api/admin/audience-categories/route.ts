import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getStaticCategories } from '@/lib/static-data';

/**
 * GET /api/admin/audience-categories
 * Returns all audience categories (including inactive) for admin management.
 */
export async function GET() {
  const db = getDb();
  if (!db) {
    // Return static categories with static- prefix IDs
    const staticCats = getStaticCategories();
    return NextResponse.json(staticCats.map((cat: any, i: number) => ({
      ...cat,
      id: `static-${i}`,
      active: true,
      displayOrder: i,
    })));
  }

  try {
    const result = await db.execute({
      sql: 'SELECT * FROM AudienceCategory ORDER BY displayOrder ASC',
      args: [],
    });
    if (result.rows.length === 0) {
      // Return static fallback so admin has something to work with
      const staticCats = getStaticCategories();
      return NextResponse.json(staticCats.map((cat: any, i: number) => ({
        ...cat,
        id: `static-${i}`,
        active: true,
        displayOrder: i,
      })));
    }
    const categories = result.rows.map((row) => ({
      ...row,
      active: row.active === 1,
      displayOrder: Number(row.displayOrder),
    }));
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching audience categories:', error);
    const staticCats = getStaticCategories();
    return NextResponse.json(staticCats.map((cat: any, i: number) => ({
      ...cat,
      id: `static-${i}`,
      active: true,
      displayOrder: i,
    })));
  }
}

/**
 * POST /api/admin/audience-categories
 * Create a new audience category.
 */
export async function POST(request: NextRequest) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({
      error: 'Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.',
      hint: 'Vercel Dashboard → Settings → Environment Variables'
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    const now = new Date().toISOString();
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

    // Purge caches so category changes appear immediately (BEFORE return!)
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
  } catch (error: any) {
    console.error('Error creating audience category:', error);
    return NextResponse.json({
      error: 'Failed to create audience category',
      detail: error?.message || String(error),
    }, { status: 500 });
  }
}
