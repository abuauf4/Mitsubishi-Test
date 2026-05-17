/**
 * Run Migration: Copy all 88 images from PRIVATE → PUBLIC Vercel Blob store.
 * Uses @vercel/blob SDK directly.
 * 
 * OLD_TOKEN = private store (has the 88 photos)
 * NEW_TOKEN = public store (currently empty, target for migration)
 */

const { list, generateSignedUrl, put, head } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

const OLD_TOKEN = 'vercel_blob_rw_uCDtYEHtMPrstsIt_yHfn0mkSHmW5qwaEyXzyujw8VcKlU7';
const NEW_TOKEN = 'vercel_blob_rw_ftGjaVbjumjoCqcS_G8zlti3nsnfXq1AIdJ21tDpp5czp7g';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const BATCH_SAVE_INTERVAL = 5;
const DELAY_BETWEEN_BLOBS = 300;

const urlMapping = {};
let successCount = 0;
let failCount = 0;
const failedBlobs = [];

// Load existing mapping if resume
const mappingPath = path.join(__dirname, 'url-mapping.json');
if (fs.existsSync(mappingPath)) {
  try {
    const existing = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
    Object.assign(urlMapping, existing);
    console.log(`📂 Resuming with ${Object.keys(existing).length} existing mappings`);
  } catch (e) {
    console.log('📂 Starting fresh (no valid existing mapping)');
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry(fn, label) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
      console.warn(`   ⚠️ ${label} attempt ${attempt}/${MAX_RETRIES} failed: ${error?.message || error}`);
      if (attempt < MAX_RETRIES) {
        console.log(`   ⏳ Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  throw lastError;
}

function detectContentType(pathname) {
  const ext = pathname.split('.').pop()?.toLowerCase();
  const types = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    webp: 'image/webp', gif: 'image/gif', avif: 'image/avif',
    svg: 'image/svg+xml',
  };
  return types[ext] || 'application/octet-stream';
}

async function downloadPrivateBlob(blob) {
  let downloadRes = null;
  let method = '';

  // Method 1: generateSignedUrl via SDK
  try {
    const signedResult = await generateSignedUrl({
      url: blob.url,
      token: OLD_TOKEN,
      expiry: 3600,
    });
    const signedUrl = typeof signedResult === 'string'
      ? signedResult
      : signedResult?.url || String(signedResult);

    if (signedUrl && signedUrl.startsWith('http')) {
      downloadRes = await fetch(signedUrl);
      method = 'signedUrl';
    }
  } catch (e) {
    console.log(`   ⚠️ signedUrl failed: ${e.message}`);
  }

  // Method 2: Direct fetch with Bearer auth
  if (!downloadRes || !downloadRes.ok) {
    try {
      downloadRes = await fetch(blob.url, {
        headers: { Authorization: `Bearer ${OLD_TOKEN}` },
      });
      method = 'bearerAuth';
    } catch (e) {
      console.log(`   ⚠️ bearerAuth failed: ${e.message}`);
    }
  }

  // Method 3: REST API signed URL
  if (!downloadRes || !downloadRes.ok) {
    try {
      const apiRes = await fetch('https://blob.vercel-storage.com/api/v1/generate-signed-url', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OLD_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: blob.url, expiry: 3600 }),
      });
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.url) {
          downloadRes = await fetch(apiData.url);
          method = 'apiSignedUrl';
        }
      }
    } catch (e) {
      console.log(`   ⚠️ API signed URL failed: ${e.message}`);
    }
  }

  if (!downloadRes || !downloadRes.ok) {
    throw new Error(`All download methods failed for ${blob.pathname} (HTTP ${downloadRes?.status || 'no response'})`);
  }

  const data = await downloadRes.arrayBuffer();
  const contentType = downloadRes.headers.get('content-type') || detectContentType(blob.pathname);
  return { data, contentType, method };
}

async function uploadToPublicStore(pathname, data, contentType) {
  const newBlob = await put(pathname, data, {
    token: NEW_TOKEN,
    access: 'public',
    contentType,
    addRandomSuffix: false, // Keep same pathname for consistency
  });
  return newBlob.url;
}

async function main() {
  console.log('🚀 Starting Migration: PRIVATE → PUBLIC Blob Store\n');
  console.log(`   OLD token (private): ...${OLD_TOKEN.slice(-10)}`);
  console.log(`   NEW token (public):  ...${NEW_TOKEN.slice(-10)}\n`);

  // Step 1: List all blobs from old store
  console.log('📋 Step 1: Listing all blobs from private store...');
  const oldBlobs = [];
  let cursor = undefined;
  let hasMore = true;

  while (hasMore) {
    const result = await list({ token: OLD_TOKEN, limit: 100, cursor });
    for (const b of result.blobs) {
      oldBlobs.push({ url: b.url, pathname: b.pathname, size: b.size });
    }
    cursor = result.cursor;
    hasMore = result.hasMore;
  }

  console.log(`   Found ${oldBlobs.length} blobs in private store\n`);

  // Step 2: Check which blobs already exist in new store (for resume)
  console.log('📋 Step 2: Checking existing blobs in public store...');
  const newBlobs = [];
  cursor = undefined;
  hasMore = true;

  while (hasMore) {
    const result = await list({ token: NEW_TOKEN, limit: 100, cursor });
    for (const b of result.blobs) {
      newBlobs.push({ url: b.url, pathname: b.pathname, size: b.size });
    }
    cursor = result.cursor;
    hasMore = result.hasMore;
  }

  console.log(`   Found ${newBlobs.length} blobs already in public store`);

  // Build set of already-migrated pathnames
  const alreadyMigrated = new Set(newBlobs.map(b => b.pathname));
  
  // Also check urlMapping for already-migrated URLs
  const alreadyMappedUrls = new Set(Object.keys(urlMapping));

  // Filter blobs that need migration
  const blobsToMigrate = oldBlobs.filter(b => 
    !alreadyMigrated.has(b.pathname) && !alreadyMappedUrls.has(b.url)
  );

  console.log(`   Already migrated: ${oldBlobs.length - blobsToMigrate.length}`);
  console.log(`   Need to migrate: ${blobsToMigrate.length}\n`);

  if (blobsToMigrate.length === 0) {
    console.log('✅ All blobs already migrated!');
    // Still build the full URL mapping from already-migrated blobs
    for (const oldBlob of oldBlobs) {
      const matchingNew = newBlobs.find(nb => nb.pathname === oldBlob.pathname);
      if (matchingNew) {
        urlMapping[oldBlob.url] = matchingNew.url;
      }
    }
    fs.writeFileSync(mappingPath, JSON.stringify(urlMapping, null, 2));
    console.log(`💾 URL mapping saved (${Object.keys(urlMapping).length} mappings)`);
    return;
  }

  // Step 3: Migrate each blob
  console.log('📦 Step 3: Migrating blobs...\n');

  for (let i = 0; i < blobsToMigrate.length; i++) {
    const blob = blobsToMigrate[i];
    const progress = `[${i + 1}/${blobsToMigrate.length}]`;
    console.log(`${progress} ${blob.pathname} (${(blob.size / 1024).toFixed(1)} KB)`);

    try {
      // Download from private store
      const { data, contentType, method } = await withRetry(
        () => downloadPrivateBlob(blob),
        `Download ${blob.pathname}`,
      );
      console.log(`   ↓ Downloaded via ${method} (${(data.byteLength / 1024).toFixed(1)} KB)`);

      // Upload to public store
      const newUrl = await withRetry(
        () => uploadToPublicStore(blob.pathname, data, contentType),
        `Upload ${blob.pathname}`,
      );

      urlMapping[blob.url] = newUrl;
      successCount++;
      console.log(`   ✅ Migrated → ${newUrl.substring(0, 80)}...`);

      // Save progress incrementally
      if (successCount % BATCH_SAVE_INTERVAL === 0) {
        fs.writeFileSync(mappingPath, JSON.stringify(urlMapping, null, 2));
        console.log(`   💾 Progress saved (${successCount}/${blobsToMigrate.length})`);
      }

      // Delay between blobs
      if (i < blobsToMigrate.length - 1) {
        await sleep(DELAY_BETWEEN_BLOBS);
      }

    } catch (error) {
      console.error(`   ❌ FAILED after ${MAX_RETRIES} retries: ${error?.message || error}`);
      failCount++;
      failedBlobs.push({ pathname: blob.pathname, error: error?.message || String(error) });
    }
  }

  // Step 4: Save final URL mapping
  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📋 Total: ${blobsToMigrate.length}`);

  if (failedBlobs.length > 0) {
    console.log('\n❌ Failed blobs:');
    for (const fb of failedBlobs) {
      console.log(`   - ${fb.pathname}: ${fb.error.substring(0, 100)}`);
    }
  }

  // Build complete mapping including previously migrated
  for (const oldBlob of oldBlobs) {
    const matchingNew = newBlobs.find(nb => nb.pathname === oldBlob.pathname);
    if (matchingNew && !urlMapping[oldBlob.url]) {
      urlMapping[oldBlob.url] = matchingNew.url;
    }
  }

  fs.writeFileSync(mappingPath, JSON.stringify(urlMapping, null, 2));
  console.log(`\n💾 URL mapping saved to: ${mappingPath}`);
  console.log(`   Total mappings: ${Object.keys(urlMapping).length}`);

  if (failCount > 0) {
    console.log('\n⚠️  Some blobs failed. Re-run this script to retry.');
  } else {
    console.log('\n🎉 All blobs migrated successfully!');
  }

  console.log('\n📝 Next step: Update database URLs using the url-mapping.json');
  console.log('   (Need TURSO_DATABASE_URL and TURSO_AUTH_TOKEN)');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
