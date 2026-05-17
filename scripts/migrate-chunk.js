/**
 * Chunk Migration - Migrates specific range of blobs.
 * Usage: node scripts/migrate-chunk.js <start> <count>
 * Example: node scripts/migrate-chunk.js 0 10
 */

const { list, put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

const OLD_TOKEN = 'vercel_blob_rw_uCDtYEHtMPrstsIt_yHfn0mkSHmW5qwaEyXzyujw8VcKlU7';
const NEW_TOKEN = 'vercel_blob_rw_ftGjaVbjumjoCqcS_G8zlti3nsnfXq1AIdJ21tDpp5czp7g';
const mappingPath = path.join(__dirname, 'url-mapping.json');
const listPath = path.join(__dirname, 'private-blobs-list.json');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function detectContentType(p) {
  const ext = p.split('.').pop()?.toLowerCase();
  return { png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', webp:'image/webp', gif:'image/gif', avif:'image/avif', svg:'image/svg+xml' }[ext] || 'application/octet-stream';
}

async function main() {
  const start = parseInt(process.argv[2]) || 0;
  const count = parseInt(process.argv[3]) || 10;

  // Load blob list
  const allBlobs = JSON.parse(fs.readFileSync(listPath, 'utf-8'));
  const chunk = allBlobs.slice(start, start + count);

  console.log(`Migrating blobs ${start}-${start + chunk.length - 1} of ${allBlobs.length}`);

  // Load existing mapping
  let urlMapping = {};
  if (fs.existsSync(mappingPath)) {
    try { urlMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8')); } catch(e) {}
  }

  let success = 0, fail = 0;

  for (let i = 0; i < chunk.length; i++) {
    const blob = chunk[i];
    process.stdout.write(`  [${start + i + 1}/${allBlobs.length}] ${blob.pathname} ... `);

    try {
      // Download from private store with Bearer auth
      const dlRes = await fetch(blob.url, { headers: { Authorization: `Bearer ${OLD_TOKEN}` } });
      if (!dlRes.ok) throw new Error(`DL HTTP ${dlRes.status}`);
      const data = await dlRes.arrayBuffer();
      const ct = dlRes.headers.get('content-type') || detectContentType(blob.pathname);

      // Upload to public store
      const newBlob = await put(blob.pathname, data, {
        token: NEW_TOKEN,
        access: 'public',
        contentType: ct,
        addRandomSuffix: true,
      });

      urlMapping[blob.url] = newBlob.url;
      success++;
      console.log(`✅ (${(data.byteLength/1024).toFixed(0)}KB)`);

      // Save after each successful upload
      fs.writeFileSync(mappingPath, JSON.stringify(urlMapping, null, 2));

      if (i < chunk.length - 1) await sleep(500);

    } catch (error) {
      fail++;
      console.log(`❌ ${error.message}`);
    }
  }

  console.log(`\nChunk done: ✅${success} ❌${fail}`);
  console.log(`Total mappings: ${Object.keys(urlMapping).length}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
