/**
 * Update database URLs from PRIVATE blob → PUBLIC blob.
 *
 * After running migrate-to-public-blob.ts, this script reads the URL mapping
 * and updates all image paths in the Turso database.
 *
 * Usage:
 *   1. First run: npx tsx scripts/migrate-to-public-blob.ts
 *      (This generates scripts/url-mapping.json)
 *   2. Then run:  npx tsx scripts/update-db-blob-urls.ts
 *
 * Required environment variables:
 *   - TURSO_DATABASE_URL
 *   - TURSO_AUTH_TOKEN
 *
 * Optional:
 *   - DRY_RUN=true  → Only show what would be changed, don't actually update
 */

import { createClient } from '@libsql/client';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DRY_RUN = process.env.DRY_RUN === 'true';

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('❌ TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required');
    console.error('   Set them in your .env file or pass as environment variables');
    process.exit(1);
  }

  // Load URL mapping from migration script
  const mappingPath = join(__dirname, 'url-mapping.json');
  if (!existsSync(mappingPath)) {
    console.error('❌ url-mapping.json not found');
    console.error('   Run migrate-to-public-blob.ts first to generate the mapping');
    process.exit(1);
  }

  const urlMapping: Record<string, string> = JSON.parse(readFileSync(mappingPath, 'utf-8'));
  const mappingEntries = Object.entries(urlMapping);

  if (mappingEntries.length === 0) {
    console.log('✅ No URLs to update. Mapping is empty.');
    return;
  }

  console.log(`📋 Loaded ${mappingEntries.length} URL mappings from url-mapping.json\n`);
  if (DRY_RUN) {
    console.log('🔍 DRY RUN — no changes will be made\n');
  }

  const db = createClient({ url, authToken });

  // Tables and columns that contain image paths
  const imageColumns: { table: string; column: string; idColumn: string }[] = [
    { table: 'Vehicle', column: 'imagePath', idColumn: 'id' },
    { table: 'VehicleVariant', column: 'imagePath', idColumn: 'id' },
    { table: 'VehicleColor', column: 'imagePath', idColumn: 'id' },
    { table: 'Hero', column: 'imagePath', idColumn: 'id' },
    { table: 'AudienceCategory', column: 'imagePath', idColumn: 'id' },
    { table: 'Testimonial', column: 'imagePath', idColumn: 'id' },
    { table: 'SalesConsultant', column: 'imagePath', idColumn: 'id' },
    { table: 'DealerLocation', column: 'embeddingUrl', idColumn: 'id' },
    { table: 'SiteConfig', column: 'value', idColumn: 'id' },
    { table: 'GalleryItem', column: 'imagePath', idColumn: 'id' },
  ];

  let totalUpdated = 0;

  for (const { table, column, idColumn } of imageColumns) {
    try {
      // Check if table exists
      const tableCheck = await db.execute({
        sql: "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        args: [table],
      });

      if (tableCheck.rows.length === 0) {
        console.log(`⏭️  Table ${table} doesn't exist — skipping`);
        continue;
      }

      // Check if column exists
      const colCheck = await db.execute({
        sql: `PRAGMA table_info(${table})`,
        args: [],
      });
      const colExists = colCheck.rows.some(r => r.name === column);

      if (!colExists) {
        console.log(`⏭️  Column ${table}.${column} doesn't exist — skipping`);
        continue;
      }

      // Get all rows with this column
      const rows = await db.execute({
        sql: `SELECT ${idColumn}, ${column} FROM ${table} WHERE ${column} IS NOT NULL AND ${column} != ''`,
        args: [],
      });

      for (const row of rows.rows) {
        const rowId = row[idColumn] as string;
        const currentValue = row[column] as string;

        if (!currentValue) continue;

        let newValue = currentValue;

        // Apply all URL mappings
        for (const [oldUrl, newUrl] of mappingEntries) {
          if (currentValue.includes(oldUrl) || currentValue === oldUrl) {
            newValue = currentValue.replace(oldUrl, newUrl);
          }
          // Also check for proxy-wrapped URLs
          if (currentValue.includes(`/api/image?url=${encodeURIComponent(oldUrl)}`)) {
            newValue = newUrl; // Replace the whole proxy URL with the direct public URL
          }
          if (currentValue.includes(`/api/image?url=${oldUrl}`)) {
            newValue = newUrl;
          }
        }

        // Also update any remaining .private. references to .public. if they match
        if (currentValue.includes('.private.blob.vercel-storage.com')) {
          // Try to find a matching public URL in the mapping
          for (const [oldUrl, newUrl] of mappingEntries) {
            if (currentValue.includes(oldUrl)) {
              newValue = currentValue.replace(oldUrl, newUrl);
            }
          }
        }

        if (newValue !== currentValue) {
          console.log(`📝 ${table}.${column} [${rowId}]:`);
          console.log(`   OLD: ${currentValue.substring(0, 100)}${currentValue.length > 100 ? '...' : ''}`);
          console.log(`   NEW: ${newValue.substring(0, 100)}${newValue.length > 100 ? '...' : ''}`);

          if (!DRY_RUN) {
            await db.execute({
              sql: `UPDATE ${table} SET ${column} = ? WHERE ${idColumn} = ?`,
              args: [newValue, rowId],
            });
            console.log(`   ✅ Updated`);
          } else {
            console.log(`   🔍 Would update (dry run)`);
          }
          totalUpdated++;
        }
      }
    } catch (error: any) {
      console.error(`❌ Error processing ${table}.${column}:`, error?.message);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ${DRY_RUN ? 'Would update' : 'Updated'}: ${totalUpdated} rows`);
  console.log(`   ${DRY_RUN ? 'Run without DRY_RUN=true to apply changes' : 'Done!'}`);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
