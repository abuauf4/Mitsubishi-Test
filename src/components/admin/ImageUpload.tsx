'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Link, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageUploadProps {
  value: string;
  onChange: (path: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = 'Image' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
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
    }
  }, [onChange]);

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
              {uploading ? (
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

      {/* Preview */}
      {value && (
        <div className="mt-2 rounded-lg overflow-hidden border bg-muted/30">
          <img
            src={previewSrc}
            alt="Preview"
            className="w-full h-32 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {isExternalUrl && (
            <p className="text-xs text-muted-foreground p-2 truncate" title={value}>
              🌐 External URL
            </p>
          )}
          {!isExternalUrl && !isDataUrl && value && (
            <p className="text-xs text-muted-foreground p-2 truncate" title={value}>
              📁 {value}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
