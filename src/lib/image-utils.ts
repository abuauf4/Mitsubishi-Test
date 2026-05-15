/**
 * Image URL utilities for Vercel Blob Storage.
 *
 * Centralizes the proxy logic so every API route and server
 * utility uses the same transformation — no more copy-paste.
 */

/**
 * Proxy raw Vercel Blob URLs through /api/image so clients can load them.
 *
 * - Returns `undefined` when the input is null/empty.
 * - Already-proxied URLs (starting with /api/image?) are returned as-is.
 * - Vercel Blob Storage URLs are rewritten to go through the image proxy.
 * - All other URLs (local paths, external URLs) pass through unchanged.
 */
export function proxyBlobUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('/api/image?')) return url;
  if (url.includes('vercel-storage.com') || url.includes('blob.vercel-storage.com')) {
    return `/api/image?url=${encodeURIComponent(url)}`;
  }
  return url;
}
