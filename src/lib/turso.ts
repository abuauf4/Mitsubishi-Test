/**
 * Turso (libSQL) database client for Vercel compatibility.
 * 
 * Turso provides cloud SQLite that works on serverless platforms.
 * Unlike local SQLite, Turso connections work over HTTP.
 * 
 * In serverless, we create a new client per invocation to avoid
 * stale connection issues across cold starts.
 */

import { createClient, type Client } from '@libsql/client';

/**
 * Get the Turso database client.
 * Creates a fresh client per invocation for serverless safety.
 * Returns null if TURSO_DATABASE_URL is not configured.
 */
export function getTursoDb(): Client | null {
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
