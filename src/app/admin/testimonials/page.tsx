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
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

interface Testimonial {
  id: string;
  customerName: string;
  customerRole: string;
  content: string;
  rating: number;
  imagePath: string;
  displayOrder: number;
  active: boolean;
}

const emptyTestimonial: Omit<Testimonial, 'id'> = {
  customerName: '',
  customerRole: '',
  content: '',
  rating: 5,
  imagePath: '',
  displayOrder: 0,
  active: true,
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(emptyTestimonial);

  useEffect(() => { fetchTestimonials(); }, []);

  async function fetchTestimonials() {
    try {
      const res = await fetch('/api/admin/testimonials');
      const data = await res.json();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load testimonials'); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyTestimonial);
    setDialogOpen(true);
  }

  function openEdit(t: Testimonial) {
    setEditing(t);
    setForm({ customerName: t.customerName, customerRole: t.customerRole, content: t.content, rating: t.rating, imagePath: t.imagePath, displayOrder: t.displayOrder, active: t.active });
    setDialogOpen(true);
  }

  async function handleSave() {
    try {
      if (editing) {
        const res = await fetch(`/api/admin/testimonials/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) { toast.success('Testimonial updated'); fetchTestimonials(); setDialogOpen(false); }
        else {
          const err = await res.json().catch(() => ({}));
          toast.error(err.error || 'Failed to update testimonial', { description: err.detail || err.hint, duration: 6000 });
        }
      } else {
        const res = await fetch('/api/admin/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) { toast.success('Testimonial created'); fetchTestimonials(); setDialogOpen(false); }
        else {
          const err = await res.json().catch(() => ({}));
          toast.error(err.error || 'Failed to create testimonial', { description: err.detail || err.hint, duration: 6000 });
        }
      }
    } catch (error: any) { toast.error(`Network error: ${error?.message || 'Operation failed'}`); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${deleteId}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Testimonial deleted'); fetchTestimonials(); }
      else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to delete testimonial', { description: err.detail || err.hint, duration: 6000 });
      }
    } catch { toast.error('Delete failed'); }
    finally { setDeleteId(null); }
  }

  function renderStars(rating: number) {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
    ));
  }

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent></Card>)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Testimonials</h1>
          <p className="text-muted-foreground mt-1">Manage customer testimonials</p>
        </div>
        <Button onClick={openAdd} className="bg-mitsu-red hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Testimonial
        </Button>
      </div>

      <div className="space-y-3">
        {testimonials.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{t.customerName}</h3>
                    <Badge variant={t.active ? 'default' : 'secondary'} className={t.active ? 'bg-emerald-100 text-emerald-700' : ''}>
                      {t.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.customerRole}</p>
                  <div className="flex gap-0.5 mt-1">{renderStars(t.rating)}</div>
                  <p className="text-sm text-foreground mt-2 line-clamp-2">{t.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">Order: {t.displayOrder}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(t.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Customer Name</Label>
              <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Customer Role</Label>
              <Input value={form.customerRole} onChange={(e) => setForm({ ...form, customerRole: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="mt-1" rows={4} />
            </div>
            <div>
              <Label>Rating (1-5)</Label>
              <div className="flex gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} type="button" onClick={() => setForm({ ...form, rating: i + 1 })}>
                    <Star className={`w-6 h-6 ${i < form.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} hover:scale-110 transition-transform`} />
                  </button>
                ))}
              </div>
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
        title="Delete Testimonial"
        description="Are you sure you want to delete this testimonial?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
