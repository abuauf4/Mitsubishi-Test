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
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

interface DealerLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  embeddingUrl: string;
  active: boolean;
}

const emptyDealer: Omit<DealerLocation, 'id'> = {
  name: '', address: '', phone: '', latitude: 0, longitude: 0, embeddingUrl: '', active: true,
};

export default function DealersPage() {
  const [dealers, setDealers] = useState<DealerLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<DealerLocation | null>(null);
  const [form, setForm] = useState(emptyDealer);

  useEffect(() => { fetchDealers(); }, []);

  async function fetchDealers() {
    try {
      const res = await fetch('/api/admin/dealer-locations');
      const data = await res.json();
      setDealers(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load dealers'); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyDealer);
    setDialogOpen(true);
  }

  function openEdit(d: DealerLocation) {
    setEditing(d);
    setForm({ name: d.name, address: d.address, phone: d.phone, latitude: d.latitude, longitude: d.longitude, embeddingUrl: d.embeddingUrl, active: d.active });
    setDialogOpen(true);
  }

  async function handleSave() {
    try {
      if (editing) {
        const res = await fetch(`/api/admin/dealer-locations/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) { toast.success('Dealer updated'); fetchDealers(); setDialogOpen(false); }
        else toast.error('Failed to update dealer');
      } else {
        const res = await fetch('/api/admin/dealer-locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) { toast.success('Dealer created'); fetchDealers(); setDialogOpen(false); }
        else toast.error('Failed to create dealer');
      }
    } catch { toast.error('Operation failed'); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/dealer-locations/${deleteId}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Dealer deleted'); fetchDealers(); }
      else toast.error('Failed to delete dealer');
    } catch { toast.error('Delete failed'); }
    finally { setDeleteId(null); }
  }

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent></Card>)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dealer Locations</h1>
          <p className="text-muted-foreground mt-1">Manage dealer / showroom locations</p>
        </div>
        <Button onClick={openAdd} className="bg-mitsu-red hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Dealer
        </Button>
      </div>

      <div className="space-y-3">
        {dealers.map((d) => (
          <Card key={d.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-mitsu-red/10 rounded-lg flex-shrink-0">
                  <MapPin className="w-5 h-5 text-mitsu-red" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{d.name}</h3>
                    <Badge variant={d.active ? 'default' : 'secondary'} className={d.active ? 'bg-emerald-100 text-emerald-700' : ''}>
                      {d.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{d.address}</p>
                  <p className="text-xs text-muted-foreground mt-1">📞 {d.phone} • 📍 {d.latitude}, {d.longitude}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(d.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Dealer' : 'Add Dealer'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Latitude</Label>
                <Input type="number" step="0.0001" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })} className="mt-1" />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input type="number" step="0.0001" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Google Maps Embed URL</Label>
              <Input value={form.embeddingUrl} onChange={(e) => setForm({ ...form, embeddingUrl: e.target.value })} className="mt-1" />
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
        title="Delete Dealer"
        description="Are you sure you want to delete this dealer location?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
