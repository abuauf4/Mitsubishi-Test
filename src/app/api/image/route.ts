import { NextRequest, NextResponse } from 'next/server';

/**
 * Image proxy for Vercel Blob URLs.
 * Falls back to a redirect to a local image if the fetch fails.
 * Never returns an SVG placeholder — always returns a real image or redirect.
 */

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    // Try fetching with auth token first
    const headers: Record<string, string> = {};
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      headers,
      cache: 'no-store',
    });

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

    // If auth fetch failed, try public fetch (no auth header)
    if (token) {
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
    }

    // All fetches failed — redirect to fallback image instead of SVG placeholder
    // This ensures Next.js Image component shows a real image, not "Image unavailable"
    return NextResponse.redirect(new URL('/images/hero-cinematic.png', request.url));
  } catch (error: any) {
    // Network error or other — redirect to fallback
    return NextResponse.redirect(new URL('/images/hero-cinematic.png', request.url));
  }
}
