'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Link, AlertCircle, Eraser, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BlobPicker from '@/components/admin/BlobPicker';
import { proxyBlobUrl } from '@/lib/image-utils';

interface ImageUploadProps {
  value: string;
  onChange: (path: string) => void;
  label?: string;
}

/**
 * Check if an image already has significant transparency.
 * Returns true if >2% of pixels have alpha < 128 (semi-transparent or transparent).
 * This detects PNGs that are already transparent and should NOT be re-processed.
 */
function checkHasTransparency(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data, width, height } = imageData;
      const totalPixels = width * height;

      // Count transparent/semi-transparent pixels
      let transparentCount = 0;
      // Also check edge pixels specifically — if edges are transparent, the image is already cut out
      let edgeTransparent = 0;
      let edgeTotal = 0;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const alpha = data[(y * width + x) * 4 + 3];
          if (alpha < 128) transparentCount++;

          // Check edges (top, bottom, left, right rows)
          const isEdge = y === 0 || y === height - 1 || x === 0 || x === width - 1;
          if (isEdge) {
            edgeTotal++;
            if (alpha < 128) edgeTransparent++;
          }
        }
      }

      // Image is already transparent if:
      // 1. More than 2% of all pixels are transparent, OR
      // 2. More than 10% of edge pixels are transparent (strong indicator of cut-out image)
      const transparentRatio = transparentCount / totalPixels;
      const edgeTransparentRatio = edgeTransparent / edgeTotal;

      URL.revokeObjectURL(img.src);
      resolve(transparentRatio > 0.02 || edgeTransparentRatio > 0.1);
    };
    img.onerror = () => resolve(false);
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Remove white/near-white background from an image using canvas flood-fill.
 * Starts from all 4 edges and makes connected white pixels transparent.
 * Preserves white areas that are enclosed inside the subject (e.g., car headlights).
 * Improved version with better anti-aliasing and edge blending.
 */
async function removeWhiteBackground(file: File, tolerance: number = 30): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

      // CRITICAL: Clear canvas to transparent first, then draw image
      // This ensures transparent areas stay transparent
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data, width, height } = imageData;

      // Mark visited pixels to avoid re-processing
      const visited = new Uint8Array(width * height);

      // Check if a pixel is "white enough" to be background
      const isWhite = (idx: number): boolean => {
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];
        // Must be mostly opaque and close to white
        return a > 200 && r > 255 - tolerance && g > 255 - tolerance && b > 255 - tolerance;
      };

      // Scanline flood-fill — much faster than BFS with queue.shift()
      // Use a stack (LIFO) instead of queue for O(1) push/pop
      const stack: number[] = [];

      // Seed from all edge pixels
      for (let x = 0; x < width; x++) {
        if (isWhite(((0) * width + x) * 4)) stack.push(x, 0);
        if (isWhite(((height - 1) * width + x) * 4)) stack.push(x, height - 1);
      }
      for (let y = 1; y < height - 1; y++) {
        if (isWhite((y * width + 0) * 4)) stack.push(0, y);
        if (isWhite((y * width + (width - 1)) * 4)) stack.push(width - 1, y);
      }

      // Process stack — pairs of (x, y)
      while (stack.length > 0) {
        const y = stack.pop()!;
        const x = stack.pop()!;
        const pixelIdx = y * width + x;

        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        if (visited[pixelIdx]) continue;

        const dataIdx = pixelIdx * 4;
        if (!isWhite(dataIdx)) continue;

        visited[pixelIdx] = 1;

        // Calculate smooth anti-aliased edge with gradual alpha falloff
        const r = data[dataIdx];
        const g = data[dataIdx + 1];
        const b = data[dataIdx + 2];
        const whiteness = Math.min(r, g, b);
        const distanceFromWhite = 255 - whiteness;

        // Gradual alpha: pixels very close to white → more transparent
        // Pixels at the boundary (less white) → semi-transparent for smooth edges
        if (distanceFromWhite < tolerance * 0.3) {
          // Very white pixel — make fully transparent
          data[dataIdx + 3] = 0;
        } else if (distanceFromWhite < tolerance) {
          // Near-edge pixel — gradual alpha for anti-aliasing
          const edgeFactor = distanceFromWhite / tolerance;
          data[dataIdx + 3] = Math.round(edgeFactor * edgeFactor * 180);
        } else {
          // This shouldn't happen (isWhite would be false), but safety fallback
          data[dataIdx + 3] = 60;
        }

        // Push neighbors (4-directional)
        stack.push(x + 1, y);
        stack.push(x - 1, y);
        stack.push(x, y + 1);
        stack.push(x, y - 1);
      }

      ctx.putImageData(imageData, 0, 0);

      // Convert canvas to PNG blob — PNG preserves transparency
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file); // Fallback: return original if canvas fails
            return;
          }
          // Create a new File with the same name but ensure .png extension
          const newName = file.name.replace(/\.[^.]+$/, '.png');
          const newFile = new File([blob], newName, { type: 'image/png' });
          URL.revokeObjectURL(img.src);
          resolve(newFile);
        },
        'image/png'
      );
    };

    img.onerror = () => resolve(file); // Fallback: return original on error
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Convert an image file to PNG format, preserving transparency.
 * Used for non-PNG images that already have transparency (e.g., WebP with alpha).
 */
async function convertToPng(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const newName = file.name.replace(/\.[^.]+$/, '.png');
          const newFile = new File([blob], newName, { type: 'image/png' });
          URL.revokeObjectURL(img.src);
          resolve(newFile);
        },
        'image/png'
      );
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

export default function ImageUpload({ value, onChange, label = 'Image' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url' | 'blob'>('upload');
  const [removeBg, setRemoveBg] = useState(true); // Auto-remove white bg by default
  const [blobPickerOpen, setBlobPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      let fileToUpload = file;

      // Auto-remove white background if enabled and file is an image
      if (removeBg && file.type !== 'image/svg+xml') {
        setProcessing(true);
        try {
          // FIRST: Check if the image already has transparency (e.g., transparent PNG)
          // If it does, skip bg removal to preserve the original transparency
          const alreadyTransparent = await checkHasTransparency(file);
          if (alreadyTransparent) {
            console.log('Image already has transparency — skipping background removal');
            // For transparent PNGs, just ensure it's saved as PNG
            if (file.type === 'image/png') {
              fileToUpload = file; // Upload original as-is
            } else {
              // Non-PNG with transparency (rare) — convert to PNG to preserve alpha
              fileToUpload = await convertToPng(file);
            }
          } else {
            // Image has no transparency — run background removal
            console.log('Image has no transparency — removing white background');
            fileToUpload = await removeWhiteBackground(file, 30);
          }
        } catch (e) {
          console.warn('Background removal failed, uploading original:', e);
        }
        setProcessing(false);
      }

      const formData = new FormData();
      formData.append('file', fileToUpload);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.path) {
        onChange(data.path);
        setUploadError(null);
      } else {
        const errMsg = data.error || 'Upload failed';
        const hint = data.hint ? ` — ${data.hint}` : '';
        setUploadError(`${errMsg}${hint}`);
      }
    } catch (error: any) {
      setUploadError(error?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  }, [onChange, removeBg]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  // Get a displayable filename from the URL
  const getDisplayName = (url: string) => {
    if (!url) return '';
    if (url.startsWith('/images/')) return url.replace('/images/', '');
    try {
      const decoded = decodeURIComponent(url);
      const parts = decoded.split('/');
      const filename = parts[parts.length - 1] || '';
      // Remove timestamp prefix like "1234567890-"
      return filename.replace(/^\d+-/, '');
    } catch {
      return url.split('/').pop() || url;
    }
  };

  // Always resolve through proxy for private blob URLs
  const isExternalUrl = value && (value.startsWith('http://') || value.startsWith('https://'));
  const isDataUrl = value && value.startsWith('data:');
  // proxyBlobUrl converts private blob URLs to /api/image?url=... proxy
  const resolvedUrl = proxyBlobUrl(value) || value;
  const previewSrc = resolvedUrl && resolvedUrl.startsWith('/api/image?')
    ? `${resolvedUrl}&_t=${Date.now()}`
    : resolvedUrl;

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}

      {/* Current image preview (ALWAYS visible when there's a value) */}
      {value && (
        <div className="relative rounded-lg overflow-hidden border" style={{
          backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
          backgroundSize: '12px 12px',
          backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
        }}>
          <img
            src={previewSrc}
            alt="Preview"
            className="w-full h-32 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* Remove button */}
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
            title="Hapus gambar"
          >
            <X className="w-3 h-3" />
          </button>
          {/* Filename badge */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
            <p className="text-[10px] text-white truncate" title={value}>
              {isExternalUrl ? '☁️ ' : '📁 '}{getDisplayName(value)}
            </p>
          </div>
        </div>
      )}

      {/* Mode toggle — 3 modes now */}
      <div className="flex gap-1">
        <Button
          type="button"
          variant={mode === 'blob' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('blob')}
          className={mode === 'blob' ? 'bg-mitsu-red text-white' : ''}
        >
          <Database className="w-3 h-3 mr-1" /> Storage
        </Button>
        <Button
          type="button"
          variant={mode === 'upload' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('upload')}
          className={mode === 'upload' ? 'bg-mitsu-red text-white' : ''}
        >
          <Upload className="w-3 h-3 mr-1" /> Upload
        </Button>
        <Button
          type="button"
          variant={mode === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('url')}
          className={mode === 'url' ? 'bg-mitsu-red text-white' : ''}
        >
          <Link className="w-3 h-3 mr-1" /> URL
        </Button>
      </div>

      {mode === 'blob' ? (
        /* Blob browser mode — pick from existing Vercel Blob Storage */
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setBlobPickerOpen(true)}
            className="w-full h-auto py-6 border-2 border-dashed hover:border-mitsu-red/50 hover:bg-mitsu-red/5 transition-all"
          >
            <div className="flex flex-col items-center gap-1">
              <Database className="w-6 h-6 text-mitsu-red" />
              <span className="text-sm font-medium">Pilih dari Storage</span>
              <span className="text-[10px] text-muted-foreground">Browse gambar yang udah diupload</span>
            </div>
          </Button>
          <BlobPicker
            open={blobPickerOpen}
            onClose={() => setBlobPickerOpen(false)}
            onSelect={(url) => {
              onChange(url);
            }}
            currentUrl={value}
          />
        </div>
      ) : mode === 'url' ? (
        /* URL input mode */
        <div className="flex gap-2">
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.png or /images/example.png"
            className="flex-1"
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange('')}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ) : (
        /* Upload mode */
        <>
          {/* Upload drop zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
              uploading ? 'opacity-50 pointer-events-none' :
              dragOver ? 'border-mitsu-red bg-mitsu-red/5' : 'border-border hover:border-mitsu-red/50'
            }`}
            onClick={() => !uploading && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex items-center justify-center gap-2">
              {processing ? (
                <>
                  <Eraser className="w-5 h-5 text-mitsu-red animate-pulse" />
                  <span className="text-sm text-mitsu-red font-medium">Processing image...</span>
                </>
              ) : uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-mitsu-red border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">Uploading...</span>
                </>
              ) : value ? (
                <>
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click or drop to replace</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click or drop image to upload</span>
                </>
              )}
            </div>
            {/* Background removal toggle */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={removeBg}
                  onChange={(e) => setRemoveBg(e.target.checked)}
                  className="rounded border-gray-300 text-mitsu-red focus:ring-mitsu-red w-3 h-3"
                />
                <Eraser className="w-3 h-3" />
                Auto-remove white background
              </label>
            </div>
          </div>
        </>
      )}

      {/* Upload error */}
      {uploadError && (
        <div className="flex items-start gap-2 p-2 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-700 dark:text-red-300">{uploadError}</p>
        </div>
      )}
    </div>
  );
}
