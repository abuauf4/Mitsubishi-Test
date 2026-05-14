import { NextResponse } from 'next/server';

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
