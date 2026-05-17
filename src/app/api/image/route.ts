import { NextRequest, NextResponse } from 'next/server';

/**
 * Image proxy for Vercel Blob Storage.
 *
 * For private blobs: fetches the image server-side using the blob token
 * and streams the bytes back to the client. This is the most reliable
 * approach since:
 * 1. `generateSignedUrl` doesn't exist in @vercel/blob@2.x
 * 2. Direct redirects to private blob URLs return 403
 * 3. Client-side <img> tags can't authenticate to private blob storage
 *
 * For public blobs and non-blob URLs: redirects directly.
 */

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  const decodedUrl = decodeURIComponent(url);

  // PUBLIC blob URLs — redirect directly (no proxy needed)
  if (decodedUrl.includes('.public.blob.vercel-storage.com')) {
    return NextResponse.redirect(decodedUrl, 302);
  }

  // Non-blob URL: redirect directly
  const isBlobUrl = decodedUrl.includes('vercel-storage.com') || decodedUrl.includes('blob.vercel-storage.com');

  if (!isBlobUrl) {
    return NextResponse.redirect(decodedUrl, 302);
  }

  // PRIVATE blob URL — proxy the image bytes server-side
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    console.error('BLOB_READ_WRITE_TOKEN not set — cannot fetch private blob');
    return new NextResponse('Server misconfiguration: missing blob token', { status: 503 });
  }

  try {
    // Method 1: Try getDownloadUrl from @vercel/blob (generates a short-lived signed URL)
    try {
      const { getDownloadUrl } = await import('@vercel/blob');
      const downloadUrl = await getDownloadUrl(decodedUrl, {
        token,
        expiresIn: 3600,
      });

      // Fetch the image from the signed download URL
      const imageResponse = await fetch(downloadUrl);

      if (!imageResponse.ok) {
        throw new Error(`Download URL fetch failed: ${imageResponse.status}`);
      }

      const contentType = imageResponse.headers.get('content-type') || 'image/png';
      const imageBuffer = await imageResponse.arrayBuffer();

      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          'CDN-Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (downloadUrlErr: any) {
      console.warn('getDownloadUrl failed, trying direct fetch with token:', downloadUrlErr?.message || downloadUrlErr);
    }

    // Method 2: Direct fetch with authorization header
    const imageResponse = await fetch(decodedUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!imageResponse.ok) {
      console.error(`Direct fetch failed: ${imageResponse.status} ${imageResponse.statusText}`);
      return new NextResponse(`Failed to fetch image: ${imageResponse.status}`, { status: imageResponse.status });
    }

    const contentType = imageResponse.headers.get('content-type') || 'image/png';
    const imageBuffer = await imageResponse.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'CDN-Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('Image proxy error:', error?.message || error);
    return new NextResponse('Failed to load image', { status: 500 });
  }
}
