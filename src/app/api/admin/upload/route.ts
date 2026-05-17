import { NextRequest, NextResponse } from 'next/server';

/**
 * Upload images to Vercel Blob Storage.
 *
 * Strategy: Try public access first (for public stores), then fallback to
 * private (for private stores). Public blob URLs are directly accessible
 * without a proxy, which is simpler and more reliable.
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: 'BLOB_READ_WRITE_TOKEN not set', hint: 'Add it in Vercel Dashboard → Settings → Environment Variables' },
        { status: 503 }
      );
    }

    const { put } = await import('@vercel/blob');

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const pathname = `uploads/${timestamp}-${sanitizedName}`;

    // Try public access first — public URLs are directly accessible without proxy
    let blob;
    try {
      blob = await put(pathname, file, {
        access: 'public',
        token,
        addRandomSuffix: true,
      });
      console.log('[upload] Uploaded as PUBLIC blob:', blob.url.substring(0, 80) + '...');
    } catch (publicErr: any) {
      // Store is private — can't use public access. Fall back to private.
      console.log('[upload] Public access failed (' + (publicErr?.message || 'unknown') + '), trying private...');
      blob = await put(pathname, file, {
        access: 'private',
        token,
        addRandomSuffix: true,
      });
      console.log('[upload] Uploaded as PRIVATE blob:', blob.url.substring(0, 80) + '...');
    }

    // Return the raw blob URL — proxyBlobUrl() handles display resolution
    return NextResponse.json({
      path: blob.url,
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
