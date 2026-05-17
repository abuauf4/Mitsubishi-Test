import { NextRequest, NextResponse } from 'next/server';

/**
 * Upload images to Vercel Blob Storage.
 *
 * The blob store is PRIVATE — must use access: 'private'.
 * Returns the raw blob URL. Display layer (proxyBlobUrl) handles signed URLs.
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

    const blob = await put(pathname, file, {
      access: 'private',
      token,
      addRandomSuffix: true,
    });

    // Always return the raw blob URL — proxyBlobUrl() handles display
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
