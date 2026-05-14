import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/upload
 * Upload an image to Vercel Blob storage.
 * Returns the blob URL path that can be stored in the database.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 4MB.', hint: 'Compress your image first.' }, { status: 400 });
    }

    // Try Vercel Blob upload
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      return NextResponse.json({
        error: 'Blob storage not configured',
        hint: 'Set BLOB_READ_WRITE_TOKEN in Vercel environment variables, or use the URL mode to paste an external image URL.',
      }, { status: 503 });
    }

    try {
      const { put } = await import('@vercel/blob');
      const filename = `vehicles/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const blob = await put(filename, file, {
        access: 'public',
        token: blobToken,
      });

      // Return the blob URL — the frontend will store this in the database
      // We use the proxy path so images work in all environments
      const proxyPath = `/api/image?url=${encodeURIComponent(blob.url)}`;
      return NextResponse.json({ path: proxyPath, url: blob.url });
    } catch (blobError: any) {
      console.error('Blob upload failed:', blobError);
      return NextResponse.json({
        error: 'Failed to upload to blob storage',
        hint: blobError?.message || 'Try using URL mode instead.',
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed', detail: error?.message }, { status: 500 });
  }
}
