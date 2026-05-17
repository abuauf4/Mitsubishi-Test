import { NextRequest, NextResponse } from 'next/server';

/**
 * Upload images to Vercel Blob Storage.
 *
 * The store was migrated from private to public.
 * Use access: 'public' so URLs are directly accessible.
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

    // Store is public — uploaded URLs are directly accessible without signing
    const blob = await put(pathname, file, {
      access: 'public',
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

    const message = error?.message || 'Upload failed';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
