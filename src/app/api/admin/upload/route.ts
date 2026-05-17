import { NextRequest, NextResponse } from 'next/server';

/**
 * Upload images to Vercel Blob Storage.
 *
 * The blob store is PRIVATE — must use access: 'private'.
 * Private URLs go through /api/image which generates signed URLs.
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

    // Generate a unique pathname with timestamp to avoid collisions
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const pathname = `uploads/${timestamp}-${sanitizedName}`;

    const blob = await put(pathname, file, {
      access: 'private',
      token,
      addRandomSuffix: true,
    });

    // For private blobs, return the proxy URL so browser can display it
    // /api/image?url=... redirects to a signed URL automatically
    const displayUrl = blob.url.includes('.private.blob.vercel-storage.com')
      ? `/api/image?url=${encodeURIComponent(blob.url)}`
      : blob.url;

    return NextResponse.json({
      path: displayUrl,
      url: displayUrl,
      pathname: blob.pathname,
      size: blob.size,
      rawUrl: blob.url,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
