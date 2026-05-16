/**
 * Auto-migration utility for Turso DB.
 * Ensures required columns exist before queries run.
 * Safe to call multiple times — uses ALTER TABLE ADD COLUMN which is idempotent.
 */

import { getDb } from './db';

let migrationPromise: Promise<void> | null = null;
let migrationDone = false;

const MIGRATIONS = [
  'ALTER TABLE Vehicle ADD COLUMN gallery TEXT',
  'ALTER TABLE VehicleVariant ADD COLUMN imagePath TEXT',
  'ALTER TABLE VehicleVariant ADD COLUMN description TEXT',
  "ALTER TABLE Hero ADD COLUMN page TEXT NOT NULL DEFAULT 'home'",
  'ALTER TABLE VehicleColor ADD COLUMN variantId TEXT',
];

const CREATE_TABLES = [
  `CREATE TABLE IF NOT EXISTS GalleryItem (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'delivery',
    title TEXT NOT NULL DEFAULT '',
    description TEXT DEFAULT '',
    imagePath TEXT DEFAULT '',
    customerName TEXT DEFAULT '',
    vehicleName TEXT DEFAULT '',
    articleContent TEXT DEFAULT '',
    displayOrder INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )`,
];

/**
 * Run all pending migrations once per server lifecycle.
 * Subsequent calls are no-ops (the promise is cached).
 */
export async function ensureMigrations(): Promise<void> {
  if (migrationDone) return;
  if (!migrationPromise) {
    migrationPromise = runMigrations();
  }
  await migrationPromise;
  migrationDone = true;
}

async function runMigrations(): Promise<void> {
  const db = getDb();
  if (!db) return;

  // Create new tables first
  for (const sql of CREATE_TABLES) {
    try {
      await db.execute({ sql, args: [] });
    } catch (error: any) {
      const msg = (error?.message || '').toLowerCase();
      if (msg.includes('already exists')) continue;
      console.warn('Create table warning:', sql.substring(0, 60), error?.message);
    }
  }

  // Then run column-level migrations
  for (const sql of MIGRATIONS) {
    try {
      await db.execute({ sql, args: [] });
    } catch (error: any) {
      // Column already exists — that's fine, skip
      const msg = (error?.message || '').toLowerCase();
      if (msg.includes('duplicate column name') || msg.includes('already exists')) {
        continue;
      }
      // Table might not exist yet — also fine (schema.sql CREATE IF NOT EXISTS handles it)
      if (msg.includes('no such table')) {
        continue;
      }
      console.warn('Migration warning:', sql, error?.message);
    }
  }
}
