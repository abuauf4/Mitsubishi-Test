import { NextRequest, NextResponse } from 'next/server';

/**
 * Image handler for Vercel Blob URLs.
 *
 * OPTIMIZED: Instead of proxying image bytes (which doubles bandwidth —
 * Blob→Server + Server→Client), we now REDIRECT to the blob URL directly.
 * This means:
 * - Zero server-side data transfer
 * - Zero fast origin transfer
 * - Client loads image directly from Vercel's CDN
 * - Vercel Blob serves from edge cache automatically
 *
 * For private blobs: generates a signed URL with 1hr expiry and redirects.
 * For public blobs: redirects directly (no signed URL needed).
 * For non-blob URLs: redirects directly.
 */

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  // Decode the URL if it's encoded
  const decodedUrl = decodeURIComponent(url);

  // Detect if this is a Vercel Blob URL
  const isBlobUrl = decodedUrl.includes('vercel-storage.com') || decodedUrl.includes('blob.vercel-storage.com');

  try {
    // For blob URLs: try to redirect to a signed URL (private) or direct URL (public)
    if (isBlobUrl) {
      const token = process.env.BLOB_READ_WRITE_TOKEN;

      // Try generating a signed URL (works for both private and public stores)
      if (token) {
        try {
          const { generateSignedUrl } = await import('@vercel/blob');
          const result = await generateSignedUrl({
            url: decodedUrl,
            token,
            expiry: 3600, // 1 hour
          });

          // generateSignedUrl returns { url: string } in v1+, or string in older versions
          const signedUrl = typeof result === 'string' ? result : (result as any).url || String(result);

          // Redirect client to the signed URL — they load directly from Vercel CDN
          // No server-side data transfer needed!
          return NextResponse.redirect(signedUrl, 302);
        } catch (signedErr: any) {
          console.warn('Signed URL generation failed:', signedErr?.message || signedErr);
        }
      }

      // No token or signed URL failed — try redirecting directly (works for public stores)
      // Public blob URLs can be accessed directly without auth
      return NextResponse.redirect(decodedUrl, 302);
    }

    // Non-blob URL: redirect directly (external images don't need proxying)
    return NextResponse.redirect(decodedUrl, 302);
  } catch (error: any) {
    console.error('Image redirect error:', error?.message || error);
    // Fallback to a local image instead of erroring out
    return NextResponse.redirect(new URL('/images/hero-cinematic.png', request.url));
  }
}
