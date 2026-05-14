'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

interface SalesConsultant {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  title: string;
  description: string;
  imagePath: string;
  active: boolean;
}

export default function SalesPage() {
  const [consultants, setConsultants] = useState<SalesConsultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Omit<SalesConsultant, 'id'>>({
    name: '', phone: '', whatsapp: '', email: '', title: '', description: '', imagePath: '', active: true,
  });

  useEffect(() => { fetchConsultants(); }, []);

  async function fetchConsultants() {
    try {
      const res = await fetch('/api/admin/sales');
      const data = await res.json();
      const safeData = Array.isArray(data) ? data : [];
      setConsultants(safeData);
      if (safeData.length > 0) {
        const c = safeData[0];
        setForm({ name: c.name, phone: c.phone, whatsapp: c.whatsapp, email: c.email, title: c.title, description: c.description, imagePath: c.imagePath, active: c.active });
      }
    } catch { toast.error('Failed to load sales consultant'); }
    finally { setLoading(false); }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const existingId = consultants.length > 0 ? consultants[0].id : undefined;
      const res = await fetch('/api/admin/sales', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: existingId, ...form }),
      });
      if (res.ok) { toast.success('Sales consultant saved'); fetchConsultants(); }
      else toast.error('Failed to save sales consultant');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  }

  if (loading) return <Card className="animate-pulse"><CardContent className="p-6"><div className="h-64 bg-muted rounded" /></CardContent></Card>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales Consultant</h1>
          <p className="text-muted-foreground mt-1">Edit the sales consultant information displayed on the site</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-mitsu-red hover:bg-red-700 text-white">
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>WhatsApp</Label>
                <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div className="space-y-4">
              <ImageUpload value={form.imagePath} onChange={(path) => setForm({ ...form, imagePath: path })} label="Photo" />
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" rows={4} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.active} onCheckedChange={(checked) => setForm({ ...form, active: checked })} />
                <Label>Active</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
