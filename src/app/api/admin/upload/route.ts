import { NextRequest, NextResponse } from 'next/server';

/**
 * Detect if a file is likely a PNG based on its extension or MIME type.
 * This ensures we explicitly set the correct content-type for Vercel Blob,
 * which is critical for preserving PNG transparency.
 */
function isPngFile(file: File): boolean {
  return file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 });
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Try uploading to Vercel Blob
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (token) {
      try {
        const { put } = await import('@vercel/blob');
        // Private stores require access:'private'. Public stores also accept it.
        // If your store is public and you want public URLs, change this to 'public'.

        // CRITICAL: Explicitly set contentType for PNG files to preserve transparency.
        // Without this, Vercel Blob might infer a wrong type from the filename or binary.
        const blobOptions: Record<string, any> = {
          token,
          addRandomSuffix: true,
          access: 'private',
        };
        if (isPngFile(file)) {
          blobOptions.contentType = 'image/png';
        }

        const blob = await put(`mitsubishi/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`, file, blobOptions);

        // Return the proxy path so images go through our /api/image proxy
        const proxyPath = `/api/image?url=${encodeURIComponent(blob.url)}`;

        return NextResponse.json({
          path: proxyPath,
          url: blob.url,
          downloadUrl: blob.downloadUrl,
        });
      } catch (blobError: any) {
        console.error('Blob upload failed:', blobError?.message);
        return NextResponse.json({
          error: 'Failed to upload to blob storage',
          hint: blobError?.message || 'Check BLOB_READ_WRITE_TOKEN environment variable',
        }, { status: 500 });
      }
    }

    // No blob token configured — return error
    return NextResponse.json({
      error: 'Image storage not configured',
      hint: 'Set BLOB_READ_WRITE_TOKEN in Vercel environment variables to enable image uploads. Or use URL mode to paste an existing image URL.',
    }, { status: 503 });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({
      error: 'Upload failed',
      detail: error?.message || String(error),
    }, { status: 500 });
  }
}
