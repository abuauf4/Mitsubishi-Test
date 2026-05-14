'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import ImageUpload from '@/components/admin/ImageUpload';

interface AudienceCategory {
  id: string;
  title: string;
  description: string;
  imagePath: string;
  linkHref: string;
  displayOrder: number;
  active: boolean;
}

const emptyCategory: Omit<AudienceCategory, 'id'> = {
  title: '',
  description: '',
  imagePath: '',
  linkHref: '',
  displayOrder: 0,
  active: true,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<AudienceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<AudienceCategory | null>(null);
  const [form, setForm] = useState(emptyCategory);

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/admin/audience-categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyCategory);
    setDialogOpen(true);
  }

  function openEdit(cat: AudienceCategory) {
    setEditing(cat);
    setForm({ title: cat.title, description: cat.description, imagePath: cat.imagePath, linkHref: cat.linkHref, displayOrder: cat.displayOrder, active: cat.active });
    setDialogOpen(true);
  }

  async function handleSave() {
    try {
      if (editing) {
        const res = await fetch(`/api/admin/audience-categories/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) { toast.success('Category updated'); fetchCategories(); setDialogOpen(false); }
        else toast.error('Failed to update category');
      } else {
        const res = await fetch('/api/admin/audience-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) { toast.success('Category created'); fetchCategories(); setDialogOpen(false); }
        else toast.error('Failed to create category');
      }
    } catch { toast.error('Operation failed'); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/audience-categories/${deleteId}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Category deleted'); fetchCategories(); }
      else toast.error('Failed to delete category');
    } catch { toast.error('Delete failed'); }
    finally { setDeleteId(null); }
  }

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent></Card>)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audience Categories</h1>
          <p className="text-muted-foreground mt-1">Manage passenger/commercial category cards</p>
        </div>
        <Button onClick={openAdd} className="bg-mitsu-red hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {cat.imagePath && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img src={cat.imagePath} alt={cat.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{cat.title}</h3>
                    <Badge variant={cat.active ? 'default' : 'secondary'} className={cat.active ? 'bg-emerald-100 text-emerald-700' : ''}>
                      {cat.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{cat.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">Order: {cat.displayOrder} • Link: {cat.linkHref}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(cat.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" />
            </div>
            <ImageUpload value={form.imagePath} onChange={(path) => setForm({ ...form, imagePath: path })} label="Image" />
            <div>
              <Label>Link Href</Label>
              <Input value={form.linkHref} onChange={(e) => setForm({ ...form, linkHref: e.target.value })} className="mt-1" />
            </div>
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
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}
