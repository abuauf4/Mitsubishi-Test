'use client';

import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Folder, ChevronLeft, ChevronRight, Loader2, ImageOff, Check } from 'lucide-react';

interface BlobItem {
  url: string;
  pathname: string;
  size: number;
  sizeKB: string;
  uploadedAt: string;
  thumbUrl: string;
}

interface BlobPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentUrl?: string;
}

export default function BlobPicker({ open, onClose, onSelect, currentUrl }: BlobPickerProps) {
  const [blobs, setBlobs] = useState<BlobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const [folders, setFolders] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const limit = 30;

  const fetchBlobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search) params.set('search', search);
      if (folder) params.set('folder', folder);

      const res = await fetch(`/api/admin/list-blobs?${params}`);
      const data = await res.json();

      if (data.blobs) {
        setBlobs(data.blobs);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
      if (data.folders) {
        setFolders(data.folders);
      }
    } catch (err) {
      console.error('Failed to fetch blobs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, folder]);

  useEffect(() => {
    if (open) fetchBlobs();
  }, [open, fetchBlobs]);

  // Reset page when search/folder changes
  useEffect(() => {
    setPage(1);
  }, [search, folder]);

  function handleSelect(blob: BlobItem) {
    if (selectedUrl === blob.url) {
      setSelectedUrl(null);
      setPreviewUrl(null);
    } else {
      setSelectedUrl(blob.url);
      setPreviewUrl(blob.thumbUrl);
    }
  }

  function handleConfirm() {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
      setSelectedUrl(null);
      setPreviewUrl(null);
    }
  }

  function handleClose() {
    onClose();
    setSelectedUrl(null);
    setPreviewUrl(null);
  }

  // Get filename from pathname
  function getFilename(pathname: string) {
    const parts = pathname.split('/');
    return parts[parts.length - 1] || pathname;
  }

  // Format date
  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 pb-3 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-mitsu-red" />
            Pilih dari Blob Storage
            <span className="text-sm font-normal text-muted-foreground">
              ({total} gambar)
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="p-4 pb-2 border-b flex gap-2 flex-wrap flex-shrink-0">
          <div className="relative flex-1 min-w-[150px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama file..."
              className="pl-8 h-9 text-sm"
            />
          </div>
          <Select value={folder} onValueChange={setFolder}>
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <SelectValue placeholder="Semua folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua folder</SelectItem>
              {folders.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {loading ? (
            <div className="flex-1 flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-mitsu-red animate-spin" />
              <span className="ml-3 text-muted-foreground">Memuat gambar...</span>
            </div>
          ) : blobs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ImageOff className="w-12 h-12 mb-3" />
              <p className="font-semibold">Tidak ada gambar ditemukan</p>
              <p className="text-sm mt-1">Coba ubah filter atau upload gambar baru</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              {/* Image Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {blobs.map((blob) => {
                  const isSelected = selectedUrl === blob.url;
                  const isCurrent = currentUrl === blob.url;
                  return (
                    <button
                      key={blob.url}
                      type="button"
                      onClick={() => handleSelect(blob)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all group ${
                        isSelected
                          ? 'border-mitsu-red ring-2 ring-mitsu-red/30 scale-[0.97]'
                          : isCurrent
                            ? 'border-green-500 ring-1 ring-green-500/30'
                            : 'border-border hover:border-mitsu-red/50 hover:shadow-md'
                      }`}
                    >
                      <img
                        src={blob.thumbUrl}
                        alt={blob.pathname}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement;
                          // If direct URL fails, try via proxy (handles private blobs)
                          if (!el.src.includes('/api/image?') && blob.url.includes('vercel-storage.com')) {
                            el.src = `/api/image?url=${encodeURIComponent(blob.url)}`;
                          } else {
                            // Both failed — show placeholder
                            el.style.display = 'none';
                            const parent = el.parentElement;
                            if (parent && !parent.querySelector('.img-fallback')) {
                              const fallback = document.createElement('div');
                              fallback.className = 'img-fallback absolute inset-0 flex flex-col items-center justify-center bg-muted';
                              fallback.innerHTML = '<svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                              parent.appendChild(fallback);
                            }
                          }
                        }}
                      />
                      {/* Selection check */}
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-mitsu-red rounded-full p-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {/* Current image indicator */}
                      {isCurrent && !isSelected && (
                        <div className="absolute top-1 left-1 bg-green-500 rounded-full px-1.5 py-0.5">
                          <span className="text-[8px] text-white font-bold">AKTIF</span>
                        </div>
                      )}
                      {/* Hover overlay with filename */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[9px] text-white truncate" title={blob.pathname}>
                          {getFilename(blob.pathname)}
                        </p>
                        <p className="text-[8px] text-white/70">{blob.sizeKB}KB</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Preview panel + pagination + confirm */}
        <div className="border-t p-4 flex-shrink-0 space-y-3">
          {/* Selected preview */}
          {previewUrl && (
            <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
              <div className="w-16 h-16 rounded-md overflow-hidden border bg-muted flex items-center justify-center flex-shrink-0">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    if (!el.src.includes('/api/image?') && selectedUrl && selectedUrl.includes('vercel-storage.com')) {
                      el.src = `/api/image?url=${encodeURIComponent(selectedUrl!)}`;
                    } else {
                      el.style.display = 'none';
                    }
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {selectedUrl ? getFilename(decodeURIComponent(selectedUrl).split('/').pop() || '') : ''}
                </p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {selectedUrl}
                </p>
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1 || loading}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                Hal {page} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages || loading}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="h-9">
                Batal
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!selectedUrl}
                className="bg-mitsu-red hover:bg-red-700 text-white h-9"
              >
                <Check className="w-4 h-4 mr-1" /> Pilih Gambar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
