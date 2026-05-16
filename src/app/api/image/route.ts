import { NextRequest, NextResponse } from 'next/server';

/**
 * Image proxy for Vercel Blob URLs.
 * Uses signed URLs for private blob stores, with fallback to auth-header fetch.
 * Preserves PNG transparency by detecting content type from both headers and binary signature.
 * Never returns an SVG placeholder — always returns a real image or redirect.
 */

/**
 * Detect image type from binary signature (magic bytes).
 * This is more reliable than Content-Type headers which can be wrong.
 */
function detectImageType(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer.slice(0, 12));

  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return 'image/png';
  }

  // JPEG signature: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return 'image/jpeg';
  }

  // WebP signature: 52 49 46 46 ... 57 45 42 50
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return 'image/webp';
  }

  // GIF signature: 47 49 46 38
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return 'image/gif';
  }

  // AVIF signature
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70 &&
      bytes[8] === 0x61 && bytes[9] === 0x76 && bytes[10] === 0x69 && bytes[11] === 0x66) {
    return 'image/avif';
  }

  // Default: assume PNG to preserve transparency (safer than defaulting to JPEG)
  return 'image/png';
}

/**
 * Build response headers for an image.
 * Uses binary signature detection to determine the correct Content-Type,
 * which ensures PNG transparency is preserved.
 */
function buildImageHeaders(contentType: string): Record<string, string> {
  return {
    'Content-Type': contentType,
    'Cache-Control': 'public, s-maxage=300, max-age=300, stale-while-revalidate=86400',
    'Access-Control-Allow-Origin': '*',
  };
}

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
            const body = await res.arrayBuffer();
            // Use binary signature detection for accurate Content-Type
            const headerType = res.headers.get('content-type') || '';
            const detectedType = detectImageType(body);
            // Prefer detected type, but fall back to header if detection returns generic result
            const contentType = detectedType !== 'image/png' || headerType.includes('png') || !headerType.includes('/')
              ? detectedType
              : headerType;
            return new NextResponse(body, {
              status: 200,
              headers: buildImageHeaders(contentType),
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
            const body = await res.arrayBuffer();
            const detectedType = detectImageType(body);
            return new NextResponse(body, {
              status: 200,
              headers: buildImageHeaders(detectedType),
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
          const body = await res.arrayBuffer();
          const detectedType = detectImageType(body);
          return new NextResponse(body, {
            status: 200,
            headers: buildImageHeaders(detectedType),
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
      const body = await res.arrayBuffer();
      const detectedType = detectImageType(body);
      return new NextResponse(body, {
        status: 200,
        headers: buildImageHeaders(detectedType),
      });
    }

    // Non-blob fetch failed — redirect to fallback
    return NextResponse.redirect(new URL('/images/hero-cinematic.png', request.url));
  } catch (error: any) {
    console.error('Image proxy error:', error?.message || error);
    return NextResponse.redirect(new URL('/images/hero-cinematic.png', request.url));
  }
}
