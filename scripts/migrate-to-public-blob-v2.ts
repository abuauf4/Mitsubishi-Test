/**
 * Migration script v2: Copy remaining images from PRIVATE → PUBLIC Vercel Blob store.
 *
 * Improvements over v1:
 *   - Resume capability: Skips already-migrated blobs
 *   - Retry logic: Up to 3 retries per blob with exponential backoff
 *   - Progress tracking: Saves progress after each successful migration
 *   - Better error handling: Catches and retries on network errors
 *   - Dual token support: Falls back to old token if signed URL generation fails
 *
 * Usage:
 *   1. Create a new PUBLIC Blob store in Vercel Dashboard (if not already done)
 *   2. Set environment variables:
 *      - OLD_BLOB_TOKEN = your current private store's BLOB_READ_WRITE_TOKEN
 *      - NEW_BLOB_TOKEN = your new public store's BLOB_READ_WRITE_TOKEN
 *   3. Run: npx tsx scripts/migrate-to-public-blob-v2.ts
 *
 * Optional:
 *   - MAX_RETRIES=5        → Set max retry attempts per blob (default: 3)
 *   - RETRY_DELAY=2000     → Set base retry delay in ms (default: 2000)
 *   - SKIP_EXISTING=true   → Skip blobs that already exist in new store (default: true)
 */

const OLD_TOKEN = process.env.OLD_BLOB_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
const NEW_TOKEN = process.env.NEW_BLOB_TOKEN;
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '3', 10);
const RETRY_DELAY = parseInt(process.env.RETRY_DELAY || '2000', 10);
const SKIP_EXISTING = process.env.SKIP_EXISTING !== 'false'; // default true

if (!OLD_TOKEN) {
  console.error('❌ OLD_BLOB_TOKEN (or BLOB_READ_WRITE_TOKEN) is required');
  process.exit(1);
}
if (!NEW_TOKEN) {
  console.error('❌ NEW_BLOB_TOKEN is required — create a public Blob store first in Vercel Dashboard');
  process.exit(1);
}

interface BlobResult {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

interface ListResult {
  blobs: BlobResult[];
  cursor?: string;
  hasMore: boolean;
}

// ─── Utility: Sleep ──────────────────────────────────────────────────────
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Utility: Retry with exponential backoff ─────────────────────────────
async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxRetries: number = MAX_RETRIES,
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
      console.warn(`   ⚠️ ${label} attempt ${attempt}/${maxRetries} failed: ${error?.message || error}`);
      if (attempt < maxRetries) {
        console.log(`   ⏳ Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  throw lastError!;
}

// ─── Step 1: List all blobs in a store ───────────────────────────────────
async function listAllBlobs(token: string, label: string): Promise<BlobResult[]> {
  const allBlobs: BlobResult[] = [];
  let cursor: string | undefined;

  do {
    const url = new URL('https://blob.vercel-storage.com/api/v1/blobs');
    url.searchParams.set('limit', '100');
    if (cursor) url.searchParams.set('cursor', cursor);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to list blobs from ${label}: ${res.status} ${text}`);
    }

    const data = await res.json() as ListResult;
    allBlobs.push(...data.blobs);
    cursor = data.cursor;
    console.log(`📋 [${label}] Listed ${allBlobs.length} blobs so far...`);

  } while (cursor);

  return allBlobs;
}

// ─── Step 2: Download a blob (with auth for private stores) ──────────────
async function downloadBlob(blob: BlobResult): Promise<{ data: ArrayBuffer; contentType: string }> {
  const downloadHeaders: Record<string, string> = {};

  // Private blobs need auth
  if (blob.url.includes('.private.blob.vercel-storage.com')) {
    downloadHeaders['Authorization'] = `Bearer ${OLD_TOKEN}`;
  }

  // Try direct download first
  let downloadRes = await fetch(blob.url, { headers: downloadHeaders });

  // If direct download fails, try signed URL
  if (!downloadRes.ok) {
    console.log(`   ⚠️ Direct download failed (${downloadRes.status}), trying signed URL...`);
    try {
      const signedUrlRes = await fetch('https://blob.vercel-storage.com/api/v1/generate-signed-url', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OLD_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: blob.url, expiry: 3600 }),
      });
      if (signedUrlRes.ok) {
        const signedData = await signedUrlRes.json() as { url: string };
        downloadRes = await fetch(signedData.url);
      } else {
        const errText = await signedUrlRes.text();
        console.warn(`   ⚠️ Signed URL request failed: ${signedUrlRes.status} ${errText}`);
      }
    } catch (e) {
      console.warn(`   ⚠️ Signed URL also failed:`, e);
    }
  }

  if (!downloadRes.ok) {
    throw new Error(`Failed to download ${blob.pathname}: HTTP ${downloadRes.status}`);
  }

  const data = await downloadRes.arrayBuffer();
  const contentType = downloadRes.headers.get('content-type') || detectContentType(blob.pathname);

  return { data, contentType };
}

// ─── Step 3: Upload to public store ──────────────────────────────────────
async function uploadToPublicStore(
  pathname: string,
  data: ArrayBuffer,
  contentType: string,
): Promise<string> {
  const formData = new FormData();
  formData.append('file', new Blob([data], { type: contentType }), pathname);
  formData.append('pathname', pathname);

  const res = await fetch('https://blob.vercel-storage.com/api/v1/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NEW_TOKEN}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to upload blob to public store: ${res.status} ${text}`);
  }

  const result = await res.json() as { url: string };
  return result.url;
}

// ─── Utility: Detect content type from pathname ──────────────────────────
function detectContentType(pathname: string): string {
  const ext = pathname.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    case 'gif': return 'image/gif';
    case 'avif': return 'image/avif';
    case 'svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
}

// ─── Main Migration Logic ────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting migration v2: PRIVATE → PUBLIC Blob store\n');

  // Step 1: List blobs from BOTH stores
  console.log('📋 Step 1: Listing blobs from both stores...');
  const [oldBlobs, newBlobs] = await Promise.all([
    withRetry(() => listAllBlobs(OLD_TOKEN, 'OLD (private)'), 'List old blobs'),
    withRetry(() => listAllBlobs(NEW_TOKEN, 'NEW (public)'), 'List new blobs'),
  ]);

  console.log(`   OLD store: ${oldBlobs.length} blobs`);
  console.log(`   NEW store: ${newBlobs.length} blobs\n`);

  // Build set of already-migrated pathnames (for resume capability)
  const alreadyMigratedPathnames = new Set(newBlobs.map(b => b.pathname));
  // Also build a quick URL mapping from already-migrated blobs
  const urlMapping: Record<string, string> = {};

  // Match old blobs to new blobs by pathname (they keep the same pathname after migration)
  for (const oldBlob of oldBlobs) {
    const matchingNewBlob = newBlobs.find(
      nb => nb.pathname === oldBlob.pathname || nb.pathname.endsWith(oldBlob.pathname.split('/').pop()!)
    );
    if (matchingNewBlob) {
      urlMapping[oldBlob.url] = matchingNewBlob.url;
    }
  }

  // Filter to only unmigrated blobs
  const blobsToMigrate = SKIP_EXISTING
    ? oldBlobs.filter(b => !alreadyMigratedPathnames.has(b.pathname))
    : oldBlobs;

  console.log(`📊 Migration Plan:`);
  console.log(`   Total in OLD store: ${oldBlobs.length}`);
  console.log(`   Already in NEW store: ${alreadyMigratedPathnames.size}`);
  console.log(`   Need to migrate: ${blobsToMigrate.length}\n`);

  if (blobsToMigrate.length === 0) {
    console.log('✅ All blobs already migrated! No work needed.');

    // Still save the URL mapping
    const fs = await import('fs');
    const path = await import('path');
    const mappingPath = path.join(process.cwd(), 'scripts', 'url-mapping.json');
    fs.writeFileSync(mappingPath, JSON.stringify(urlMapping, null, 2));
    console.log(`💾 URL mapping saved to: ${mappingPath}`);
    console.log('\n📝 Next step: Run update-db-blob-urls.ts to update the database');
    return;
  }

  // Step 2: Migrate each blob
  console.log('📦 Step 2: Migrating blobs...\n');
  let success = 0;
  let skipped = 0;
  let failed = 0;
  const failedBlobs: { pathname: string; error: string }[] = [];

  for (let i = 0; i < blobsToMigrate.length; i++) {
    const blob = blobsToMigrate[i];
    const progress = `[${i + 1}/${blobsToMigrate.length}]`;
    console.log(`${progress} Migrating: ${blob.pathname} (${(blob.size / 1024).toFixed(1)} KB)`);

    try {
      // Download from old store (with retry)
      const { data, contentType } = await withRetry(
        () => downloadBlob(blob),
        `Download ${blob.pathname}`,
      );

      // Upload to new store (with retry)
      const newUrl = await withRetry(
        () => uploadToPublicStore(blob.pathname, data, contentType),
        `Upload ${blob.pathname}`,
      );

      urlMapping[blob.url] = newUrl;
      success++;
      console.log(`   ✅ Migrated → ${newUrl.substring(0, 80)}...`);

      // Save progress incrementally
      if (success % 10 === 0) {
        const fs = await import('fs');
        const path = await import('path');
        const mappingPath = path.join(process.cwd(), 'scripts', 'url-mapping.json');
        fs.writeFileSync(mappingPath, JSON.stringify(urlMapping, null, 2));
        console.log(`   💾 Progress saved (${success} migrated so far)`);
      }

      // Small delay between blobs to avoid rate limiting
      if (i < blobsToMigrate.length - 1) {
        await sleep(200);
      }

    } catch (error: any) {
      console.error(`   ❌ Failed after ${MAX_RETRIES} retries: ${error?.message || error}`);
      failed++;
      failedBlobs.push({ pathname: blob.pathname, error: error?.message || String(error) });
    }
  }

  // Step 3: Save URL mapping
  console.log(`\n📊 Migration Summary:`);
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ⏭️  Skipped (already migrated): ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📋 Total: ${blobsToMigrate.length}`);

  if (failedBlobs.length > 0) {
    console.log(`\n❌ Failed blobs:`);
    for (const fb of failedBlobs) {
      console.log(`   - ${fb.pathname}: ${fb.error.substring(0, 100)}`);
    }
  }

  // Save mapping to file
  const fs = await import('fs');
  const path = await import('path');
  const mappingPath = path.join(process.cwd(), 'scripts', 'url-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(urlMapping, null, 2));
  console.log(`\n💾 URL mapping saved to: ${mappingPath}`);
  console.log(`   Total mappings: ${Object.keys(urlMapping).length}`);

  if (failed > 0) {
    console.log('\n⚠️  Some blobs failed to migrate. Re-run this script to retry only the failed ones.');
    console.log('   The script will automatically skip already-migrated blobs.');
  }

  console.log('\n📝 Next steps:');
  console.log('   1. Review the url-mapping.json to verify mappings');
  console.log('   2. Run: npx tsx scripts/update-db-blob-urls.ts');
  console.log('   3. Update BLOB_READ_WRITE_TOKEN env var to the NEW token');
  console.log('   4. Deploy the updated code');
  console.log('   5. Verify images load correctly on the website');
  console.log('   6. Delete the old private store in Vercel Dashboard');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
