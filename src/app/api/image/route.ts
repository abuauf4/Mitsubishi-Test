import { NextRequest, NextResponse } from 'next/server';

/**
 * Image proxy for Vercel Blob URLs.
 * Without BLOB_READ_WRITE_TOKEN, we attempt a public fetch.
 * Falls back to a placeholder if the fetch fails.
 */

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const headers: Record<string, string> = {};
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      headers,
      cache: 'no-store',
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      // If blob fetch fails, return a simple SVG placeholder
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="#F5F5F5"><rect width="400" height="300"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="sans-serif" font-size="14">Image unavailable</text></svg>`;
      return new NextResponse(svg, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache',
        },
      });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, s-maxage=86400, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="#F5F5F5"><rect width="400" height="300"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="sans-serif" font-size="14">Image unavailable</text></svg>`;
    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache',
      },
    });
  }
}
