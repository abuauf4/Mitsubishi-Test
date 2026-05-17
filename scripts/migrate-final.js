/**
 * FINAL Migration Script - All 88 blobs from PRIVATE → PUBLIC
 * Uses Bearer auth download (confirmed working) + put() upload
 */

const { list, put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

const OLD_TOKEN = 'vercel_blob_rw_uCDtYEHtMPrstsIt_yHfn0mkSHmW5qwaEyXzyujw8VcKlU7';
const NEW_TOKEN = 'vercel_blob_rw_ftGjaVbjumjoCqcS_G8zlti3nsnfXq1AIdJ21tDpp5czp7g';
const mappingPath = path.join(__dirname, 'url-mapping.json');
const progressPath = path.join(__dirname, 'migration-progress.json');

// Load existing state
let urlMapping = {};
let migratedUrls = new Set();

if (fs.existsSync(mappingPath)) {
  try {
    urlMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
    migratedUrls = new Set(Object.keys(urlMapping));
    console.log(`📂 Resuming: ${migratedUrls.size} already migrated`);
  } catch (e) {}
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function detectContentType(p) {
  const ext = p.split('.').pop()?.toLowerCase();
  return { png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', webp:'image/webp', gif:'image/gif', avif:'image/avif', svg:'image/svg+xml' }[ext] || 'application/octet-stream';
}

async function main() {
  console.log('🚀 MIGRATION: PRIVATE → PUBLIC\n');

  // List all blobs from old store
  console.log('📋 Listing private store blobs...');
  const oldBlobs = [];
  let cursor, hasMore = true;
  while (hasMore) {
    const r = await list({ token: OLD_TOKEN, limit: 100, cursor });
    oldBlobs.push(...r.blobs.map(b => ({ url: b.url, pathname: b.pathname, size: b.size })));
    cursor = r.cursor; hasMore = r.hasMore;
  }
  console.log(`   Found ${oldBlobs.length} blobs\n`);

  // Filter already migrated
  const toMigrate = oldBlobs.filter(b => !migratedUrls.has(b.url));
  console.log(`   Already migrated: ${oldBlobs.length - toMigrate.length}`);
  console.log(`   Need to migrate: ${toMigrate.length}\n`);

  if (toMigrate.length === 0) {
    console.log('✅ All done!');
    fs.writeFileSync(mappingPath, JSON.stringify(urlMapping, null, 2));
    return;
  }

  let success = 0, fail = 0;
  const failed = [];

  for (let i = 0; i < toMigrate.length; i++) {
    const blob = toMigrate[i];
    const pct = ((i + 1) / toMigrate.length * 100).toFixed(0);
    process.stdout.write(`[${pct}%] ${blob.pathname} `);

    try {
      // Download from private store
      const dlRes = await fetch(blob.url, { headers: { Authorization: `Bearer ${OLD_TOKEN}` } });
      if (!dlRes.ok) throw new Error(`Download HTTP ${dlRes.status}`);
      const data = await dlRes.arrayBuffer();
      const ct = dlRes.headers.get('content-type') || detectContentType(blob.pathname);

      // Upload to public store
      const newBlob = await put(blob.pathname, data, {
        token: NEW_TOKEN,
        access: 'public',
        contentType: ct,
        addRandomSuffix: true, // Avoid conflicts with existing blobs
      });

      urlMapping[blob.url] = newBlob.url;
      migratedUrls.add(blob.url);
      success++;

      // Save progress every 3 blobs
      if (success % 3 === 0) {
        fs.writeFileSync(mappingPath, JSON.stringify(urlMapping, null, 2));
      }

      console.log(`✅ ${newBlob.url.substring(0, 50)}...`);

      // Rate limiting delay
      if (i < toMigrate.length - 1) await sleep(400);

    } catch (error) {
      fail++;
      failed.push({ pathname: blob.pathname, error: error?.message });
      console.log(`❌ ${error?.message}`);
    }
  }

  // Final save
  fs.writeFileSync(mappingPath, JSON.stringify(urlMapping, null, 2));

  console.log(`\n📊 DONE: ✅${success} ❌${fail} / ${toMigrate.length}`);
  console.log(`💾 URL mapping: ${Object.keys(urlMapping).length} entries saved to url-mapping.json`);

  if (failed.length > 0) {
    console.log('\n❌ Failed:');
    failed.forEach(f => console.log(`   - ${f.pathname}: ${f.error}`));
    fs.writeFileSync(path.join(__dirname, 'migration-failed.json'), JSON.stringify(failed, null, 2));
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
