import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * POST /api/admin/migrate
 * Run schema migrations to add missing columns.
 * Safe to call multiple times — uses "ADD COLUMN" which is idempotent
 * (will error silently if column already exists).
 */
export async function POST() {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const migrations: { sql: string; description: string }[] = [
    {
      sql: 'ALTER TABLE Vehicle ADD COLUMN gallery TEXT',
      description: 'Add gallery column to Vehicle',
    },
    {
      sql: 'ALTER TABLE VehicleVariant ADD COLUMN imagePath TEXT',
      description: 'Add imagePath column to VehicleVariant',
    },
    {
      sql: 'ALTER TABLE VehicleVariant ADD COLUMN description TEXT',
      description: 'Add description column to VehicleVariant',
    },
  ];

  const results: { description: string; status: string; error?: string }[] = [];

  for (const migration of migrations) {
    try {
      await db.execute({ sql: migration.sql, args: [] });
      results.push({ description: migration.description, status: 'applied' });
    } catch (error: any) {
      // Column already exists — that's fine
      if (error?.message?.includes('duplicate column name') || error?.message?.includes('already exists')) {
        results.push({ description: migration.description, status: 'already_exists' });
      } else {
        results.push({ description: migration.description, status: 'error', error: error?.message || String(error) });
      }
    }
  }

  return NextResponse.json({ migrations: results });
}
