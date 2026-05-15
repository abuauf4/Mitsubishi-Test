import { NextRequest, NextResponse } from 'next/server';

/**
 * Image proxy for Vercel Blob URLs.
 * Uses signed URLs for private blob stores, with fallback to auth-header fetch.
 * Never returns an SVG placeholder — always returns a real image or redirect.
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

  const imageHeaders = {
    'Content-Type': 'image/jpeg',
    'Cache-Control': 'public, s-maxage=300, max-age=300, stale-while-revalidate=86400',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    // Strategy 1: For blob URLs, try signed URL first (required for private stores)
    if (isBlobUrl) {
      const token = process.env.BLOB_READ_WRITE_TOKEN;
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

          const res = await fetch(signedUrl, { cache: 'no-store' });
          if (res.ok) {
            const contentType = res.headers.get('content-type') || 'image/jpeg';
            const body = await res.arrayBuffer();
            return new NextResponse(body, {
              status: 200,
              headers: { ...imageHeaders, 'Content-Type': contentType },
            });
          }
          console.warn(`Signed URL fetch returned ${res.status}, trying auth header...`);
        } catch (signedErr: any) {
          console.warn('Signed URL failed:', signedErr?.message || signedErr);
        }

        // Strategy 2: Direct fetch with Authorization header (for private stores)
        try {
          const res = await fetch(decodedUrl, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          });
          if (res.ok) {
            const contentType = res.headers.get('content-type') || 'image/jpeg';
            const body = await res.arrayBuffer();
            return new NextResponse(body, {
              status: 200,
              headers: { ...imageHeaders, 'Content-Type': contentType },
            });
          }
          console.warn(`Auth header fetch returned ${res.status}, trying public fetch...`);
        } catch (authErr: any) {
          console.warn('Auth header fetch failed:', authErr?.message || authErr);
        }
      }

      // Strategy 3: Public fetch without auth (for public stores)
      try {
        const res = await fetch(decodedUrl, { cache: 'no-store' });
        if (res.ok) {
          const contentType = res.headers.get('content-type') || 'image/jpeg';
          const body = await res.arrayBuffer();
          return new NextResponse(body, {
            status: 200,
            headers: { ...imageHeaders, 'Content-Type': contentType },
          });
        }
      } catch {
        // Public fetch also failed
      }

      // All blob fetch strategies failed — redirect to fallback
      console.error(`All fetch strategies failed for blob URL: ${decodedUrl.substring(0, 100)}...`);
      return NextResponse.redirect(new URL('/images/hero-cinematic.png', request.url));
    }

    // Non-blob URL: direct fetch (for external images)
    const res = await fetch(decodedUrl, { cache: 'no-store' });
    if (res.ok) {
      const contentType = res.headers.get('content-type') || 'image/jpeg';
      const body = await res.arrayBuffer();
      return new NextResponse(body, {
        status: 200,
        headers: { ...imageHeaders, 'Content-Type': contentType },
      });
    }

    // Non-blob fetch failed — redirect to fallback
    return NextResponse.redirect(new URL('/images/hero-cinematic.png', request.url));
  } catch (error: any) {
    console.error('Image proxy error:', error?.message || error);
    return NextResponse.redirect(new URL('/images/hero-cinematic.png', request.url));
  }
}
