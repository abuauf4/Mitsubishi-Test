/**
 * Batch Migration Script - Migrates one batch at a time.
 * Usage: node scripts/migrate-batch.js <batch-number>
 * Example: node scripts/migrate-batch.js 1
 */

const { list, generateSignedUrl, put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

const OLD_TOKEN = 'vercel_blob_rw_uCDtYEHtMPrstsIt_yHfn0mkSHmW5qwaEyXzyujw8VcKlU7';
const NEW_TOKEN = 'vercel_blob_rw_ftGjaVbjumjoCqcS_G8zlti3nsnfXq1AIdJ21tDpp5czp7g';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const DELAY_BETWEEN_BLOBS = 500;
const mappingPath = path.join(__dirname, 'url-mapping.json');

// Load existing mapping
let urlMapping = {};
if (fs.existsSync(mappingPath)) {
  try {
    urlMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
    console.log(`📂 Loaded ${Object.keys(urlMapping).length} existing mappings`);
  } catch (e) {}
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function withRetry(fn, label) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try { return await fn(); }
    catch (error) {
      lastError = error;
      const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
      console.warn(`   ⚠️ ${label} attempt ${attempt}/${MAX_RETRIES}: ${error?.message || error}`);
      if (attempt < MAX_RETRIES) await sleep(delay);
    }
  }
  throw lastError;
}

function detectContentType(p) {
  const ext = p.split('.').pop()?.toLowerCase();
  return { png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', webp:'image/webp', gif:'image/gif', avif:'image/avif', svg:'image/svg+xml' }[ext] || 'application/octet-stream';
}

async function downloadPrivateBlob(blob) {
  let res = null, method = '';

  // Method 1: generateSignedUrl SDK
  try {
    const sr = await generateSignedUrl({ url: blob.url, token: OLD_TOKEN, expiry: 3600 });
    const su = typeof sr === 'string' ? sr : sr?.url || String(sr);
    if (su?.startsWith('http')) { res = await fetch(su); method = 'signedUrl'; }
  } catch (e) { console.log(`   ⚠️ signedUrl: ${e.message}`); }

  // Method 2: Bearer auth
  if (!res?.ok) {
    try { res = await fetch(blob.url, { headers: { Authorization: `Bearer ${OLD_TOKEN}` } }); method = 'bearer'; }
    catch (e) { console.log(`   ⚠️ bearer: ${e.message}`); }
  }

  if (!res?.ok) throw new Error(`Download failed: HTTP ${res?.status || 'no response'}`);
  const data = await res.arrayBuffer();
  const ct = res.headers.get('content-type') || detectContentType(blob.pathname);
  return { data, contentType: ct, method };
}

async function uploadToPublicStore(pathname, data, contentType) {
  const newBlob = await put(pathname, data, { token: NEW_TOKEN, access: 'public', contentType, addRandomSuffix: false });
  return newBlob.url;
}

async function main() {
  const batchNum = parseInt(process.argv[2]);
  if (!batchNum) { console.error('Usage: node migrate-batch.js <batch-number>'); process.exit(1); }

  const batchPath = path.join(__dirname, `batch-${batchNum}.json`);
  if (!fs.existsSync(batchPath)) { console.error(`Batch file not found: ${batchPath}`); process.exit(1); }

  const blobs = JSON.parse(fs.readFileSync(batchPath, 'utf-8'));
  console.log(`🚀 Migrating batch ${batchNum}: ${blobs.length} blobs\n`);

  let success = 0, fail = 0;
  const failed = [];

  for (let i = 0; i < blobs.length; i++) {
    const blob = blobs[i];
    console.log(`[${i+1}/${blobs.length}] ${blob.pathname} (${(blob.size/1024).toFixed(1)}KB)`);

    try {
      const { data, contentType, method } = await withRetry(() => downloadPrivateBlob(blob), `DL ${blob.pathname}`);
      const newUrl = await withRetry(() => uploadToPublicStore(blob.pathname, data, contentType), `UL ${blob.pathname}`);
      urlMapping[blob.url] = newUrl;
      success++;
      console.log(`   ✅ → ${newUrl.substring(0, 70)}...`);

      // Save progress every blob
      fs.writeFileSync(mappingPath, JSON.stringify(urlMapping, null, 2));

      if (i < blobs.length - 1) await sleep(DELAY_BETWEEN_BLOBS);
    } catch (error) {
      console.error(`   ❌ FAILED: ${error?.message || error}`);
      fail++;
      failed.push(blob.pathname);
    }
  }

  console.log(`\n📊 Batch ${batchNum} done: ✅${success} ❌${fail}`);
  if (failed.length > 0) console.log('Failed:', failed.join(', '));
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
