/**
 * Image URL utilities for Vercel Blob Storage.
 *
 * OPTIMIZED: Instead of proxying through /api/image (which doubles bandwidth),
 * blob URLs are now returned DIRECTLY so the client loads from Vercel CDN.
 *
 * This eliminates:
 * - Server-side data transfer (Vercel Blob → Server)
 * - Fast origin transfer charges
 * - Server CPU/memory for image relay
 *
 * The /api/image route still exists as a fallback redirect for any
 * existing proxy paths stored in the database.
 */

/**
 * Get the displayable URL for an image.
 *
 * - Returns `undefined` when the input is null/empty.
 * - Already-proxied URLs (starting with /api/image?) are returned as-is
 *   (they'll redirect to the actual blob URL via 302).
 * - Vercel Blob Storage URLs are returned DIRECTLY (no proxy needed).
 * - All other URLs (local paths, external URLs) pass through unchanged.
 */
export function proxyBlobUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('/api/image?')) return url; // Legacy proxy paths still work (redirects)
  if (url.includes('vercel-storage.com') || url.includes('blob.vercel-storage.com')) {
    return url; // Return blob URL directly — client loads from CDN
  }
  return url;
}
