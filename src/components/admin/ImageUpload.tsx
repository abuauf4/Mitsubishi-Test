'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Link, AlertCircle, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageUploadProps {
  value: string;
  onChange: (path: string) => void;
  label?: string;
}

/**
 * Remove white/near-white background from an image using canvas flood-fill.
 * Starts from all 4 edges and makes connected white pixels transparent.
 * Preserves white areas that are enclosed inside the subject (e.g., car headlights).
 */
async function removeWhiteBackground(file: File, tolerance: number = 30): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
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

        // Make this pixel transparent with smooth anti-aliased edge
        const whiteness = Math.min(data[dataIdx], data[dataIdx + 1], data[dataIdx + 2]);
        const edgeFactor = (whiteness - (255 - tolerance)) / tolerance;
        data[dataIdx + 3] = Math.round((1 - edgeFactor) * 60);

        // Push neighbors (4-directional)
        stack.push(x + 1, y);
        stack.push(x - 1, y);
        stack.push(x, y + 1);
        stack.push(x, y - 1);
      }

      ctx.putImageData(imageData, 0, 0);

      // Convert canvas to PNG blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file); // Fallback: return original if canvas fails
            return;
          }
          // Create a new File with the same name but ensure .png extension
          const newName = file.name.replace(/\.[^.]+$/, '.png');
          const newFile = new File([blob], newName, { type: 'image/png' });
          resolve(newFile);
        },
        'image/png'
      );
    };

    img.onerror = () => resolve(file); // Fallback: return original on error
    img.src = URL.createObjectURL(file);
  });
}

export default function ImageUpload({ value, onChange, label = 'Image' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [removeBg, setRemoveBg] = useState(true); // Auto-remove white bg by default
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      let fileToUpload = file;

      // Auto-remove white background if enabled and file is an image (not already transparent)
      if (removeBg && file.type !== 'image/svg+xml') {
        setProcessing(true);
        try {
          fileToUpload = await removeWhiteBackground(file, 30);
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

  // Check if value is a Vercel Blob URL (external) or local path
  const isExternalUrl = value && (value.startsWith('http://') || value.startsWith('https://'));
  const isDataUrl = value && value.startsWith('data:');
  // Add cache-busting to proxy URLs so preview always shows the latest upload
  const previewSrc = value && value.startsWith('/api/image?')
    ? `${value}&_t=${Date.now()}`
    : value;

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      
      {/* Mode toggle */}
      <div className="flex gap-1 mb-2">
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

      {mode === 'url' ? (
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
          {/* Current path display */}
          <div className="flex gap-2">
            <Input
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="/images/example.png"
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
                  <span className="text-sm text-mitsu-red font-medium">Removing background...</span>
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

      {/* Preview — with checkerboard to show transparency */}
      {value && (
        <div className="mt-2 rounded-lg overflow-hidden border" style={{
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
          {isExternalUrl && (
            <p className="text-xs text-muted-foreground p-2 truncate bg-white/80" title={value}>
              🌐 External URL
            </p>
          )}
          {!isExternalUrl && !isDataUrl && value && (
            <p className="text-xs text-muted-foreground p-2 truncate bg-white/80" title={value}>
              📁 {value}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
