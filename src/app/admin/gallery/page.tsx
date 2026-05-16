'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Image as ImageIcon, FileText, Truck } from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import ImageUpload from '@/components/admin/ImageUpload';

interface GalleryItem {
  id: string;
  type: 'delivery' | 'article';
  title: string;
  description: string;
  imagePath: string;
  customerName: string;
  vehicleName: string;
  articleContent: string;
  displayOrder: number;
  active: boolean;
}

const emptyItem: Omit<GalleryItem, 'id'> = {
  type: 'delivery',
  title: '',
  description: '',
  imagePath: '',
  customerName: '',
  vehicleName: '',
  articleContent: '',
  displayOrder: 0,
  active: true,
};

export default function GalleryAdminPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState(emptyItem);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    try {
      const res = await fetch('/api/admin/gallery');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load gallery items'); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyItem);
    setDialogOpen(true);
  }

  function openEdit(item: GalleryItem) {
    setEditing(item);
    setForm({
      type: item.type,
      title: item.title,
      description: item.description,
      imagePath: item.imagePath,
      customerName: item.customerName,
      vehicleName: item.vehicleName,
      articleContent: item.articleContent,
      displayOrder: item.displayOrder,
      active: item.active,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    try {
      if (editing) {
        const res = await fetch(`/api/admin/gallery/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) { toast.success('Gallery item updated'); fetchItems(); setDialogOpen(false); }
        else {
          const err = await res.json().catch(() => ({}));
          toast.error(err.error || 'Failed to update', { description: err.detail || err.hint, duration: 6000 });
        }
      } else {
        const res = await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) { toast.success('Gallery item created'); fetchItems(); setDialogOpen(false); }
        else {
          const err = await res.json().catch(() => ({}));
          toast.error(err.error || 'Failed to create', { description: err.detail || err.hint, duration: 6000 });
        }
      }
    } catch (error: any) { toast.error(`Network error: ${error?.message || 'Operation failed'}`); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/gallery/${deleteId}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Gallery item deleted'); fetchItems(); }
      else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to delete', { description: err.detail || err.hint, duration: 6000 });
      }
    } catch { toast.error('Delete failed'); }
    finally { setDeleteId(null); }
  }

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent></Card>)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gallery</h1>
          <p className="text-muted-foreground mt-1">Manage delivery photos & articles</p>
        </div>
        <Button onClick={openAdd} className="bg-mitsu-red hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            {/* Image preview */}
            <div className="relative h-48 bg-muted">
              {item.imagePath ? (
                <img
                  src={item.imagePath.startsWith('/api/image?') ? `${item.imagePath}&_t=${Date.now()}` : item.imagePath}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/hero-cinematic.png'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  {item.type === 'delivery' ? <Truck className="w-12 h-12" /> : <FileText className="w-12 h-12" />}
                </div>
              )}
              {/* Type badge */}
              <div className="absolute top-3 left-3">
                <Badge className={item.type === 'delivery' ? 'bg-mitsu-red text-white' : 'bg-mitsu-fuso-yellow text-mitsu-dark'}>
                  {item.type === 'delivery' ? '📸 Delivery' : '📝 Article'}
                </Badge>
              </div>
              {/* Active badge */}
              <div className="absolute top-3 right-3">
                <Badge variant={item.active ? 'default' : 'secondary'} className={item.active ? 'bg-emerald-100 text-emerald-700' : ''}>
                  {item.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground line-clamp-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              {item.customerName && (
                <p className="text-xs text-muted-foreground mt-2">👤 {item.customerName}</p>
              )}
              {item.vehicleName && (
                <p className="text-xs text-muted-foreground">🚗 {item.vehicleName}</p>
              )}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground">Order: {item.displayOrder}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <Card className="mt-4">
          <CardContent className="p-8 text-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">No gallery items yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Add your first delivery photo or article</p>
            <Button onClick={openAdd} className="mt-4 bg-mitsu-red hover:bg-red-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Gallery Item' : 'Add Gallery Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Type selector */}
            <div>
              <Label>Type</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant={form.type === 'delivery' ? 'default' : 'outline'}
                  onClick={() => setForm({ ...form, type: 'delivery' })}
                  className={form.type === 'delivery' ? 'bg-mitsu-red text-white' : ''}
                >
                  <Truck className="w-4 h-4 mr-2" /> Delivery Photo
                </Button>
                <Button
                  type="button"
                  variant={form.type === 'article' ? 'default' : 'outline'}
                  onClick={() => setForm({ ...form, type: 'article' })}
                  className={form.type === 'article' ? 'bg-mitsu-fuso-yellow text-mitsu-dark' : ''}
                >
                  <FileText className="w-4 h-4 mr-2" /> Article
                </Button>
              </div>
            </div>

            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" placeholder={form.type === 'delivery' ? 'Serah Terima Xpander - Budi Santoso' : 'Tips Merawat Mobil Mitsubishi'} />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" rows={2} placeholder={form.type === 'delivery' ? 'Selamat atas pengambilan unit baru!' : 'Ringkasan singkat artikel...'} />
            </div>

            <ImageUpload
              value={form.imagePath}
              onChange={(path) => setForm({ ...form, imagePath: path })}
              label={form.type === 'delivery' ? 'Delivery Photo' : 'Article Image'}
            />

            {form.type === 'delivery' && (
              <>
                <div>
                  <Label>Customer Name</Label>
                  <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="mt-1" placeholder="Budi Santoso" />
                </div>
                <div>
                  <Label>Vehicle Name</Label>
                  <Input value={form.vehicleName} onChange={(e) => setForm({ ...form, vehicleName: e.target.value })} className="mt-1" placeholder="New Xpander Cross" />
                </div>
              </>
            )}

            {form.type === 'article' && (
              <div>
                <Label>Article Content</Label>
                <Textarea value={form.articleContent} onChange={(e) => setForm({ ...form, articleContent: e.target.value })} className="mt-1" rows={6} placeholder="Write your article content here..." />
              </div>
            )}

            <div>
              <Label>Display Order</Label>
              <Input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })} className="mt-1" />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={(checked) => setForm({ ...form, active: checked })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-mitsu-red hover:bg-red-700 text-white">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Gallery Item"
        description="Are you sure you want to delete this gallery item?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
