/**
 * Update database URLs from PRIVATE blob → PUBLIC blob (v2).
 *
 * Improvements over v1:
 *   - Handles URLs that are not in url-mapping.json by doing substring matching
 *   - Better detection of private blob URLs in various formats
 *   - Verifies updated URLs are actually accessible
 *   - More detailed logging and summary
 *
 * After running migrate-to-public-blob-v2.ts, this script reads the URL mapping
 * and updates all image paths in the Turso database.
 *
 * Usage:
 *   1. First run: npx tsx scripts/migrate-to-public-blob-v2.ts
 *      (This generates scripts/url-mapping.json)
 *   2. Then run:  npx tsx scripts/update-db-blob-urls-v2.ts
 *
 * Required environment variables:
 *   - TURSO_DATABASE_URL
 *   - TURSO_AUTH_TOKEN
 *
 * Optional:
 *   - DRY_RUN=true  → Only show what would be changed, don't actually update
 *   - VERIFY_URLS=true → Verify each new URL is accessible (adds time)
 */

import { createClient } from '@libsql/client';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.env.DRY_RUN === 'true';
const VERIFY_URLS = process.env.VERIFY_URLS === 'true';

async function verifyUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

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
    console.error('   Run migrate-to-public-blob-v2.ts first to generate the mapping');
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
  let totalSkipped = 0;
  let totalVerified = 0;
  let totalVerifyFailed = 0;
  let totalPrivateRemaining = 0;

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

        // Check if this is still a private blob URL
        const isPrivateBlob = currentValue.includes('.private.blob.vercel-storage.com');
        if (isPrivateBlob) totalPrivateRemaining++;

        let newValue = currentValue;
        let matched = false;

        // Strategy 1: Direct URL match
        for (const [oldUrl, newUrl] of mappingEntries) {
          if (currentValue === oldUrl) {
            newValue = newUrl;
            matched = true;
            break;
          }
        }

        // Strategy 2: URL contained in value (for JSON/gallery fields)
        if (!matched) {
          for (const [oldUrl, newUrl] of mappingEntries) {
            if (currentValue.includes(oldUrl)) {
              newValue = currentValue.replace(oldUrl, newUrl);
              matched = true;
              break;
            }
          }
        }

        // Strategy 3: Proxy-wrapped URLs
        if (!matched && currentValue.includes('/api/image?url=')) {
          for (const [oldUrl, newUrl] of mappingEntries) {
            const encodedOldUrl = encodeURIComponent(oldUrl);
            if (currentValue.includes(`/api/image?url=${encodedOldUrl}`)) {
              newValue = newUrl; // Replace whole proxy URL with direct public URL
              matched = true;
              break;
            }
            // Also check non-encoded
            if (currentValue.includes(`/api/image?url=${oldUrl}`)) {
              newValue = newUrl;
              matched = true;
              break;
            }
          }
        }

        // Strategy 4: Pathname-based matching for private blobs not in mapping
        // This handles the case where the old URL format doesn't exactly match
        if (!matched && isPrivateBlob) {
          // Extract pathname from the private URL
          try {
            const privateUrlObj = new URL(currentValue);
            const privatePathname = privateUrlObj.pathname;

            // Find a mapping where the old URL has the same pathname
            for (const [oldUrl, newUrl] of mappingEntries) {
              try {
                const oldUrlObj = new URL(oldUrl);
                if (oldUrlObj.pathname === privatePathname) {
                  newValue = newUrl;
                  matched = true;
                  break;
                }
              } catch {
                // Skip invalid URLs in mapping
              }
            }
          } catch {
            // currentValue might not be a valid URL
          }
        }

        if (!matched) {
          if (isPrivateBlob) {
            console.warn(`   ⚠️ No mapping found for private URL in ${table}.${column} [${rowId}]: ${currentValue.substring(0, 100)}`);
          }
          totalSkipped++;
          continue;
        }

        if (newValue !== currentValue) {
          console.log(`📝 ${table}.${column} [${rowId}]:`);
          console.log(`   OLD: ${currentValue.substring(0, 120)}${currentValue.length > 120 ? '...' : ''}`);
          console.log(`   NEW: ${newValue.substring(0, 120)}${newValue.length > 120 ? '...' : ''}`);

          // Optional: Verify the new URL is accessible
          if (VERIFY_URLS && newValue.includes('.public.blob.vercel-storage.com')) {
            const isOk = await verifyUrl(newValue);
            if (!isOk) {
              console.warn(`   ⚠️ New URL is NOT accessible! Skipping update.`);
              totalVerifyFailed++;
              continue;
            }
            console.log(`   ✅ URL verified accessible`);
            totalVerified++;
          }

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
  console.log(`   Skipped (no mapping): ${totalSkipped}`);
  console.log(`   Private URLs remaining: ${totalPrivateRemaining}`);
  if (VERIFY_URLS) {
    console.log(`   Verified accessible: ${totalVerified}`);
    console.log(`   Verify failed: ${totalVerifyFailed}`);
  }
  console.log(`   ${DRY_RUN ? 'Run without DRY_RUN=true to apply changes' : 'Done!'}`);

  if (totalPrivateRemaining > 0 && !DRY_RUN) {
    console.log(`\n⚠️  There are still ${totalPrivateRemaining} private blob URLs in the database.`);
    console.log(`   This means some blobs were not migrated successfully.`);
    console.log(`   Re-run migrate-to-public-blob-v2.ts and then this script.`);
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
