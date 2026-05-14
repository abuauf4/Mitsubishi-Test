/**
 * Turso (libSQL) database client for Vercel compatibility.
 *
 * All API routes use getDb() to get a fresh Turso client per request.
 * Returns null if TURSO_DATABASE_URL is not configured,
 * in which case routes fall back to static data.
 */

import { createClient, type Client } from '@libsql/client';

/**
 * Get the Turso database client.
 * Creates a fresh client per invocation for serverless safety.
 * Returns null if TURSO_DATABASE_URL is not configured.
 */
export function getDb(): Client | null {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    return null;
  }

  try {
    const client = createClient({
      url,
      authToken: authToken || undefined,
    });
    return client;
  } catch (error) {
    console.error('Failed to create Turso client:', error);
    return null;
  }
}

/** Check if Turso DB is available */
export function isTursoAvailable(): boolean {
  return !!process.env.TURSO_DATABASE_URL;
}
