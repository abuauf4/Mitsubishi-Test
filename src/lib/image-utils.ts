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
 * - PUBLIC blob URLs (`.public.blob.vercel-storage.com`): returned directly.
 * - PRIVATE blob URLs (`.private.blob.vercel-storage.com`): returned directly
 *   — the /api/image route will redirect via 302 to a signed URL.
 * - All other URLs (local paths, external URLs) pass through unchanged.
 */
export function proxyBlobUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  // Already a direct URL to a PUBLIC blob store — no proxy needed!
  if (url.includes('.public.blob.vercel-storage.com')) {
    return url;
  }

  // Handle old proxy URLs: unwrap if the target is now a public store
  if (url.startsWith('/api/image?url=')) {
    const innerUrl = decodeURIComponent(url.replace('/api/image?url=', ''));
    // If the inner URL is a public blob, serve directly
    if (innerUrl.includes('.public.blob.vercel-storage.com')) {
      return innerUrl;
    }
    // Otherwise keep the proxy for private store URLs (redirects via 302)
    return url;
  }

  // Direct URL to a Vercel Blob — return directly
  // The /api/image route will handle redirects for private blobs
  if (url.includes('vercel-storage.com') || url.includes('blob.vercel-storage.com')) {
    // Check if it looks like a public URL (has .public. in subdomain)
    if (url.includes('.public.')) {
      return url; // Public — no proxy needed
    }
    // Private blob — needs the proxy route for signed URL redirect
    return `/api/image?url=${encodeURIComponent(url)}`;
  }

  // Non-blob URL (local path, external URL, etc.)
  return url;
}

/**
 * Check if a URL is a Vercel Blob URL (public or private).
 * Useful for determining if `unoptimized` prop is needed on Next.js Image.
 */
export function isBlobUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('vercel-storage.com') || url.includes('blob.vercel-storage.com');
}

/**
 * Check if a URL needs the `unoptimized` prop on Next.js Image component.
 * Blob CDN URLs and proxy URLs need unoptimized because Next.js Image
 * Optimization can't reliably fetch from Vercel Blob CDN.
 */
export function needsUnoptimized(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith('/api/image?') || isBlobUrl(url);
}
