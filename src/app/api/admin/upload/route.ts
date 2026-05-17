import { NextRequest, NextResponse } from 'next/server';

/**
 * Upload images to Vercel Blob Storage.
 *
 * IMPORTANT: The Vercel Blob store is configured as PRIVATE,
 * so we MUST use access: 'private' when uploading.
 * Public access on a private store will throw an error.
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

    // MUST use access: 'private' because the store is private
    const blob = await put(pathname, file, {
      access: 'private',
      token,
      addRandomSuffix: true,
    });

    return NextResponse.json({
      path: blob.url,
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
    });
  } catch (error: any) {
    console.error('Upload error:', error);

    // Provide helpful error messages
    const message = error?.message || 'Upload failed';
    if (message.includes('public access on a private store')) {
      return NextResponse.json(
        { error: 'Cannot use public access on a private store. The upload route has been configured for private access.', hint: 'This should be fixed now — please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
