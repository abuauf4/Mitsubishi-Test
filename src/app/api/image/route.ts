import { NextRequest, NextResponse } from 'next/server';

/**
 * Image proxy for Vercel Blob URLs.
 * Uses signed URLs for private blob stores, with fallback to direct fetch.
 * Never returns an SVG placeholder — always returns a real image or redirect.
 */

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  // Detect if this is a Vercel Blob URL
  const isBlobUrl = url.includes('vercel-storage.com') || url.includes('blob.vercel-storage.com');

  try {
    // Strategy 1: For blob URLs, try signed URL first (works with private stores)
    if (isBlobUrl) {
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (token) {
        try {
          const { generateSignedUrl } = await import('@vercel/blob');
          const signedUrl = await generateSignedUrl({
            url,
            token,
            expiry: 3600, // 1 hour
          });

          const res = await fetch(signedUrl, { cache: 'no-store' });
          if (res.ok) {
            const contentType = res.headers.get('content-type') || 'image/jpeg';
            const body = await res.arrayBuffer();
            return new NextResponse(body, {
              status: 200,
              headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, s-maxage=300, max-age=300, stale-while-revalidate=86400',
                'Access-Control-Allow-Origin': '*',
              },
            });
          }
        } catch (signedErr) {
          console.warn('Signed URL fetch failed, trying direct fetch:', signedErr);
          // Fall through to direct fetch
        }
      }

      // Strategy 2: Direct fetch with auth header (for public stores or if signed URL failed)
      try {
        const headers: Record<string, string> = {};
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(url, { headers, cache: 'no-store' });
        if (res.ok) {
          const contentType = res.headers.get('content-type') || 'image/jpeg';
          const body = await res.arrayBuffer();
          return new NextResponse(body, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, s-maxage=300, max-age=300, stale-while-revalidate=86400',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      } catch {
        // Direct fetch also failed, fall through to redirect
      }

      // Strategy 3: Public fetch without auth (for public stores)
      try {
        const publicRes = await fetch(url, { cache: 'no-store' });
        if (publicRes.ok) {
          const contentType = publicRes.headers.get('content-type') || 'image/jpeg';
          const body = await publicRes.arrayBuffer();
          return new NextResponse(body, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, s-maxage=300, max-age=300, stale-while-revalidate=86400',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      } catch {
        // Public fetch also failed, fall through to redirect
      }

      // All blob fetch strategies failed — redirect to fallback
      return NextResponse.redirect(new URL('/images/hero-cinematic.png', request.url));
    }

    // Non-blob URL: direct fetch (for external images)
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const contentType = res.headers.get('content-type') || 'image/jpeg';
      const body = await res.arrayBuffer();
      return new NextResponse(body, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, s-maxage=300, max-age=300, stale-while-revalidate=86400',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Non-blob fetch failed — redirect to fallback
    return NextResponse.redirect(new URL('/images/hero-cinematic.png', request.url));
  } catch (error: any) {
    // Any unexpected error — redirect to fallback
    return NextResponse.redirect(new URL('/images/hero-cinematic.png', request.url));
  }
}
