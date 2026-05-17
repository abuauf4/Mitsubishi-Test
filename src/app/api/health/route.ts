import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  const checks: Record<string, { status: string; detail?: string }> = {};

  // Check Turso
  if (tursoUrl && tursoToken) {
    try {
      const { createClient } = await import('@libsql/client');
      const db = createClient({ url: tursoUrl, authToken: tursoToken });
      const result = await db.execute('SELECT COUNT(*) as count FROM Vehicle');
      checks.turso = {
        status: '✅ Connected',
        detail: `${result.rows[0].count} vehicles in database`,
      };

      // Also check SiteConfig
      try {
        const configResult = await db.execute('SELECT key, value, type FROM SiteConfig');
        const configs = configResult.rows.map(r => ({
          key: r.key,
          value: typeof r.value === 'string' ? (r.value.length > 80 ? r.value.substring(0, 80) + '...' : r.value) : r.value,
          type: r.type,
        }));
        checks.site_config = {
          status: '✅ Found',
          detail: `${configs.length} configs: ${configs.map(c => c.key).join(', ')}`,
        };
      } catch (err: any) {
        checks.site_config = {
          status: '⚠️ Table missing',
          detail: 'SiteConfig table does not exist yet',
        };
      }
    } catch (err: any) {
      checks.turso = {
        status: '❌ Error',
        detail: err?.message || String(err),
      };
    }
  } else {
    checks.turso = {
      status: '❌ Not configured',
      detail: 'Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN',
    };
  }

  // Check Vercel Blob
  if (blobToken) {
    checks.blob = {
      status: '✅ Token found',
      detail: `BLOB_READ_WRITE_TOKEN is set (${blobToken.substring(0, 8)}...)`,
    };

    // Try to list blobs to check store type
    try {
      const { list } = await import('@vercel/blob');
      const { blobs } = await list({ token: blobToken, limit: 1 });
      if (blobs.length > 0) {
        const blobUrl = blobs[0].url;
        const isPublic = blobUrl.includes('.public.blob.vercel-storage.com');
        checks.blob.detail += ` | Store: ${isPublic ? 'PUBLIC ✅' : 'PRIVATE ⚠️'} | Sample URL: ${blobUrl.substring(0, 60)}...`;
      } else {
        checks.blob.detail += ' | No blobs found in store';
      }
    } catch (err: any) {
      checks.blob.detail += ` | List failed: ${err?.message || 'unknown'}`;
    }
  } else {
    checks.blob = {
      status: '❌ Token NOT found',
      detail: 'BLOB_READ_WRITE_TOKEN is not set. Uploads will fail on Vercel.',
    };
  }

  const allOk = Object.values(checks).every(c => c.status.includes('✅'));

  return NextResponse.json({
    status: allOk ? '✅ All systems operational' : '⚠️ Some issues detected',
    checks,
    env: {
      TURSO_DATABASE_URL: tursoUrl ? '✅ Set' : '❌ Missing',
      TURSO_AUTH_TOKEN: tursoToken ? '✅ Set' : '❌ Missing',
      BLOB_READ_WRITE_TOKEN: blobToken ? '✅ Set' : '❌ Missing',
    },
  }, { status: allOk ? 200 : 503 });
}
