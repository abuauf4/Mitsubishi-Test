import { NextRequest, NextResponse } from 'next/server';

/**
 * Image proxy for Vercel Blob Storage.
 *
 * For PRIVATE blobs: fetches the image server-side using Bearer token auth
 * (same pattern as @vercel/blob's get() function) and returns the bytes.
 *
 * For PUBLIC blobs and non-blob URLs: redirects directly.
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

  // PRIVATE blob URL — fetch server-side and proxy the bytes
  // This is the EXACT same pattern used by @vercel/blob's get() function:
  //   fetch(blobUrl, { headers: { authorization: `Bearer ${token}` } })
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    console.error('[image-proxy] BLOB_READ_WRITE_TOKEN not set');
    return new NextResponse('Server misconfiguration: missing blob token', { status: 503 });
  }

  try {
    console.log('[image-proxy] Fetching private blob:', decodedUrl.substring(0, 80) + '...');

    const imageResponse = await fetch(decodedUrl, {
      method: 'GET',
      headers: {
        // This is the same auth pattern @vercel/blob's get() uses internally
        authorization: `Bearer ${token}`,
      },
    });

    if (!imageResponse.ok) {
      console.error(`[image-proxy] Blob fetch failed: ${imageResponse.status} ${imageResponse.statusText}`);

      // If Bearer auth fails, try with token as query parameter (some blob stores support this)
      const urlWithToken = new URL(decodedUrl);
      urlWithToken.searchParams.set('token', token);
      console.log('[image-proxy] Retrying with token query param...');

      const retryResponse = await fetch(urlWithToken.toString());
      if (!retryResponse.ok) {
        console.error(`[image-proxy] Retry also failed: ${retryResponse.status}`);
        return new NextResponse(`Failed to fetch image: ${imageResponse.status}`, { status: imageResponse.status });
      }

      const contentType = retryResponse.headers.get('content-type') || 'image/png';
      const imageBuffer = await retryResponse.arrayBuffer();
      console.log(`[image-proxy] Success via retry! Content-Type: ${contentType}, Size: ${imageBuffer.byteLength}`);

      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      });
    }

    const contentType = imageResponse.headers.get('content-type') || 'image/png';
    const imageBuffer = await imageResponse.arrayBuffer();
    console.log(`[image-proxy] Success! Content-Type: ${contentType}, Size: ${imageBuffer.byteLength}`);

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error: any) {
    console.error('[image-proxy] Error:', error?.message || error);
    return new NextResponse('Failed to load image', { status: 500 });
  }
}
