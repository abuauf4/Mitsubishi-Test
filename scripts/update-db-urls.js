/**
 * Update Database URLs - Replace private blob URLs with public blob URLs.
 * 
 * Prerequisites:
 *   1. Run migrate-chunk.js first (already done - 88/88 migrated)
 *   2. Set environment variables:
 *      - TURSO_DATABASE_URL=libsql://your-db-name.turso.io
 *      - TURSO_AUTH_TOKEN=your-auth-token
 * 
 * Optional:
 *   - DRY_RUN=true  → Only show what would be changed, don't actually update
 *   - VERIFY_URLS=true → Verify each new URL is accessible (adds time)
 * 
 * Usage:
 *   DRY_RUN=true TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... node scripts/update-db-urls.js
 */

const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.env.DRY_RUN === 'true';
const VERIFY_URLS = process.env.VERIFY_URLS === 'true';
const mappingPath = path.join(__dirname, 'url-mapping.json');

async function verifyUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch { return false; }
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('❌ TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required');
    console.error('   Example: TURSO_DATABASE_URL=libsql://xxx.turso.io TURSO_AUTH_TOKEN=yyy node scripts/update-db-urls.js');
    process.exit(1);
  }

  // Load URL mapping
  if (!fs.existsSync(mappingPath)) {
    console.error('❌ url-mapping.json not found. Run migration first.');
    process.exit(1);
  }

  const urlMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
  const mappingEntries = Object.entries(urlMapping);
  console.log(`📋 Loaded ${mappingEntries.length} URL mappings\n`);

  if (DRY_RUN) console.log('🔍 DRY RUN — no changes will be made\n');

  const db = createClient({ url, authToken });

  // Tables and columns that contain image paths
  const imageColumns = [
    { table: 'Vehicle', column: 'imagePath', idColumn: 'id' },
    { table: 'VehicleVariant', column: 'imagePath', idColumn: 'id' },
    { table: 'VehicleColor', column: 'imagePath', idColumn: 'id' },
    { table: 'Hero', column: 'imagePath', idColumn: 'id' },
    { table: 'AudienceCategory', column: 'imagePath', idColumn: 'id' },
    { table: 'Testimonial', column: 'imagePath', idColumn: 'id' },
    { table: 'SalesConsultant', column: 'imagePath', idColumn: 'id' },
    { table: 'DealerLocation', column: 'embeddingUrl', idColumn: 'id' },
    { table: 'SiteConfig', column: 'value', idColumn: 'id' },
  ];

  let totalUpdated = 0, totalSkipped = 0, totalPrivateRemaining = 0, totalVerified = 0, totalVerifyFailed = 0;

  for (const { table, column, idColumn } of imageColumns) {
    try {
      // Check if table exists
      const tableCheck = await db.execute({ sql: "SELECT name FROM sqlite_master WHERE type='table' AND name=?", args: [table] });
      if (tableCheck.rows.length === 0) { console.log(`⏭️  Table ${table} doesn't exist — skipping`); continue; }

      // Check if column exists
      const colCheck = await db.execute({ sql: `PRAGMA table_info(${table})`, args: [] });
      const colExists = colCheck.rows.some(r => r.name === column);
      if (!colExists) { console.log(`⏭️  Column ${table}.${column} doesn't exist — skipping`); continue; }

      // Get all rows with this column
      const rows = await db.execute({
        sql: `SELECT ${idColumn}, ${column} FROM ${table} WHERE ${column} IS NOT NULL AND ${column} != ''`,
        args: [],
      });

      console.log(`\n📋 ${table}.${column}: ${rows.rows.length} rows`);

      for (const row of rows.rows) {
        const rowId = row[idColumn];
        const currentValue = row[column];
        if (!currentValue) continue;

        const isPrivateBlob = currentValue.includes('.private.blob.vercel-storage.com');
        if (isPrivateBlob) totalPrivateRemaining++;

        let newValue = currentValue;
        let matched = false;

        // Strategy 1: Direct URL match
        for (const [oldUrl, newUrl] of mappingEntries) {
          if (currentValue === oldUrl) { newValue = newUrl; matched = true; break; }
        }

        // Strategy 2: URL contained in value (for JSON fields)
        if (!matched) {
          for (const [oldUrl, newUrl] of mappingEntries) {
            if (currentValue.includes(oldUrl)) { newValue = currentValue.replace(oldUrl, newUrl); matched = true; break; }
          }
        }

        // Strategy 3: Proxy-wrapped URLs (/api/image?url=...)
        if (!matched && currentValue.includes('/api/image?url=')) {
          for (const [oldUrl, newUrl] of mappingEntries) {
            const encodedOldUrl = encodeURIComponent(oldUrl);
            if (currentValue.includes(`/api/image?url=${encodedOldUrl}`)) { newValue = newUrl; matched = true; break; }
            if (currentValue.includes(`/api/image?url=${oldUrl}`)) { newValue = newUrl; matched = true; break; }
          }
        }

        // Strategy 4: Pathname-based matching for private blobs not in mapping
        if (!matched && isPrivateBlob) {
          try {
            const privateUrlObj = new URL(currentValue);
            const privatePathname = privateUrlObj.pathname;
            for (const [oldUrl, newUrl] of mappingEntries) {
              try {
                const oldUrlObj = new URL(oldUrl);
                if (oldUrlObj.pathname === privatePathname) { newValue = newUrl; matched = true; break; }
              } catch {}
            }
          } catch {}
        }

        if (!matched) {
          if (isPrivateBlob) console.warn(`   ⚠️ No mapping for private URL in ${table}.${column} [${rowId}]: ${currentValue.substring(0, 80)}`);
          totalSkipped++;
          continue;
        }

        if (newValue !== currentValue) {
          console.log(`   📝 ${table}.${column} [${rowId}]:`);
          console.log(`      OLD: ${currentValue.substring(0, 100)}`);
          console.log(`      NEW: ${newValue.substring(0, 100)}`);

          // Optional: Verify new URL
          if (VERIFY_URLS && newValue.includes('.public.blob.vercel-storage.com')) {
            const isOk = await verifyUrl(newValue);
            if (!isOk) { console.warn(`      ⚠️ New URL NOT accessible! Skipping.`); totalVerifyFailed++; continue; }
            console.log(`      ✅ URL verified`);
            totalVerified++;
          }

          if (!DRY_RUN) {
            await db.execute({ sql: `UPDATE ${table} SET ${column} = ? WHERE ${idColumn} = ?`, args: [newValue, rowId] });
            console.log(`      ✅ Updated`);
          } else {
            console.log(`      🔍 Would update (dry run)`);
          }
          totalUpdated++;
        }
      }
    } catch (error) {
      console.error(`❌ Error processing ${table}.${column}:`, error?.message);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ${DRY_RUN ? 'Would update' : 'Updated'}: ${totalUpdated} rows`);
  console.log(`   Skipped (no mapping): ${totalSkipped}`);
  console.log(`   Private URLs remaining: ${totalPrivateRemaining}`);
  if (VERIFY_URLS) { console.log(`   Verified: ${totalVerified}, Failed: ${totalVerifyFailed}`); }

  if (totalPrivateRemaining > 0 && !DRY_RUN) {
    console.log(`\n⚠️  ${totalPrivateRemaining} private URLs still in database.`);
  }

  console.log(`\n${DRY_RUN ? 'Run without DRY_RUN=true to apply changes' : '✅ Done!'}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
