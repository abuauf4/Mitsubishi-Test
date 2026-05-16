/**
 * Migration script: Copy all images from PRIVATE Vercel Blob store to PUBLIC store.
 *
 * Usage:
 *   1. Create a new PUBLIC Blob store in Vercel Dashboard
 *   2. Set environment variables:
 *      - OLD_BLOB_TOKEN = your current private store's BLOB_READ_WRITE_TOKEN
 *      - NEW_BLOB_TOKEN = your new public store's BLOB_READ_WRITE_TOKEN
 *   3. Run: npx tsx scripts/migrate-to-public-blob.ts
 *
 * The script will:
 *   - List all blobs in the OLD (private) store
 *   - Download each blob
 *   - Re-upload to the NEW (public) store
 *   - Output a URL mapping (old URL → new URL) as JSON
 *   - Save the mapping to scripts/url-mapping.json for reference
 */

const OLD_TOKEN = process.env.OLD_BLOB_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
const NEW_TOKEN = process.env.NEW_BLOB_TOKEN;

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

async function listAllBlobs(token: string): Promise<BlobResult[]> {
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
      throw new Error(`Failed to list blobs: ${res.status} ${text}`);
    }

    const data = await res.json() as ListResult;
    allBlobs.push(...data.blobs);
    cursor = data.cursor;
    console.log(`📋 Listed ${allBlobs.length} blobs so far...`);

  } while (cursor);

  return allBlobs;
}

async function uploadToPublicStore(pathname: string, data: ArrayBuffer, contentType: string): Promise<string> {
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
    throw new Error(`Failed to upload blob: ${res.status} ${text}`);
  }

  const result = await res.json() as { url: string };
  return result.url;
}

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

async function main() {
  console.log('🚀 Starting migration from PRIVATE → PUBLIC Blob store\n');

  // Step 1: List all blobs in the old store
  console.log('📋 Step 1: Listing all blobs in the OLD (private) store...');
  const oldBlobs = await listAllBlobs(OLD_TOKEN);
  console.log(`   Found ${oldBlobs.length} blobs to migrate\n`);

  if (oldBlobs.length === 0) {
    console.log('✅ No blobs to migrate. Done!');
    return;
  }

  // Step 2: Migrate each blob
  console.log('📦 Step 2: Migrating blobs...\n');
  const urlMapping: Record<string, string> = {};
  let success = 0;
  let failed = 0;

  for (let i = 0; i < oldBlobs.length; i++) {
    const blob = oldBlobs[i];
    const progress = `[${i + 1}/${oldBlobs.length}]`;
    console.log(`${progress} Migrating: ${blob.pathname} (${(blob.size / 1024).toFixed(1)} KB)`);

    try {
      // For private stores, we need auth to download
      const downloadHeaders: Record<string, string> = {};
      if (blob.url.includes('.private.blob.vercel-storage.com')) {
        downloadHeaders['Authorization'] = `Bearer ${OLD_TOKEN}`;
      }

      let downloadRes = await fetch(blob.url, { headers: downloadHeaders });

      // If direct auth fetch fails, try signed URL via REST API
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
          }
        } catch (e) {
          console.warn(`   ⚠️ Signed URL also failed:`, e);
        }
      }

      if (!downloadRes.ok) {
        console.error(`   ❌ Failed to download: ${downloadRes.status}`);
        failed++;
        continue;
      }

      const data = await downloadRes.arrayBuffer();
      const contentType = downloadRes.headers.get('content-type') || detectContentType(blob.pathname);

      // Upload to new public store
      const newUrl = await uploadToPublicStore(blob.pathname, data, contentType);
      urlMapping[blob.url] = newUrl;
      success++;

      console.log(`   ✅ Migrated → ${newUrl.substring(0, 80)}...`);
    } catch (error: any) {
      console.error(`   ❌ Failed: ${error?.message || error}`);
      failed++;
    }
  }

  // Step 3: Save URL mapping
  console.log(`\n📊 Migration Summary:`);
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📋 Total: ${oldBlobs.length}`);

  // Save mapping to file
  const fs = await import('fs');
  const path = await import('path');
  const mappingPath = path.join(__dirname, 'url-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(urlMapping, null, 2));
  console.log(`\n💾 URL mapping saved to: ${mappingPath}`);

  console.log('\n✅ Migration complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Update BLOB_READ_WRITE_TOKEN env var to the NEW token');
  console.log('   2. Deploy the updated code (proxyBlobUrl now serves public URLs directly)');
  console.log('   3. Verify images load correctly on the website');
  console.log('   4. Delete the old private store in Vercel Dashboard');
}

main().catch(console.error);
