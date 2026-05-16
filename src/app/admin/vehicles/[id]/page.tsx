'use client';

import { useEffect, useState, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, Plus, Trash2, ArrowLeft, Palette, Wrench, Sparkles, Layers, AlertTriangle, CheckSquare, Square, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

interface VehicleData {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  basePrice: string;
  imagePath: string;
  payload: string | null;
  specsShort: string;
  gallery?: string;
  displayOrder: number;
  active: boolean;
  variants: VehicleVariantData[];
  colors: VehicleColorData[];
  specs: VehicleSpecData[];
  features: VehicleFeatureData[];
}

interface VehicleVariantData {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  transmission: string;
  drivetrain: string | null;
  highlights: string;
  imagePath: string | null;
  displayOrder: number;
}

interface VehicleColorData {
  id: string;
  name: string;
  hex: string;
  variantId: string | null;
  imagePath: string | null;
  displayOrder: number;
}

interface VehicleSpecData {
  id: string;
  category: string;
  items: string;
  displayOrder: number;
}

interface VehicleFeatureData {
  id: string;
  icon: string;
  title: string;
  description: string;
  displayOrder: number;
}

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === 'new';
  const isStatic = id.startsWith('static-');
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleteSubId, setDeleteSubId] = useState<string | null>(null);
  const [deleteSubType, setDeleteSubType] = useState<string>('');

  // Basic info form
  const [form, setForm] = useState({
    slug: '',
    name: '',
    tagline: '',
    category: 'passenger',
    basePrice: '',
    imagePath: '',
    payload: '',
    specsShort: '[]',
    displayOrder: 0,
    active: true,
  });

  // Sub-entity forms
  const [variantForm, setVariantForm] = useState({ name: '', price: '', priceNum: 0, transmission: '', drivetrain: '', highlights: '[]', imagePath: '', displayOrder: 0 });
  const [colorForm, setColorForm] = useState({ name: '', hex: '#000000', variantIds: [] as string[], isGlobal: true, imagePath: '', displayOrder: 0 });
  const [colorFilterVariant, setColorFilterVariant] = useState<string>('all');
  const [specForm, setSpecForm] = useState({ category: '', items: '[]', displayOrder: 0 });
  const [featureForm, setFeatureForm] = useState({ icon: 'Zap', title: '', description: '', displayOrder: 0 });

  useEffect(() => {
    if (!isNew) fetchVehicle();
  }, [id, isNew]);

  async function fetchVehicle() {
    try {
      const res = await fetch(`/api/admin/vehicles/${id}`);
      const data = await res.json();
      // Ensure nested arrays exist to prevent .map() crashes
      const safeData = {
        ...data,
        variants: Array.isArray(data.variants) ? data.variants : [],
        colors: Array.isArray(data.colors) ? data.colors : [],
        specs: Array.isArray(data.specs) ? data.specs : [],
        features: Array.isArray(data.features) ? data.features : [],
      };
      setVehicle(safeData);
      setForm({
        slug: data.slug ?? '',
        name: data.name ?? '',
        tagline: data.tagline ?? '',
        category: data.category ?? 'passenger',
        basePrice: data.basePrice ?? '',
        imagePath: data.imagePath ?? '',
        payload: data.payload || '',
        specsShort: data.specsShort ?? '[]',
        displayOrder: data.displayOrder ?? 0,
        active: data.active ?? true,
      });
    } catch { toast.error('Failed to load vehicle'); }
    finally { setLoading(false); }
  }

  /**
   * For static vehicles (loaded from code, not DB), we need to save them
   * to the database first before they can have sub-entities added.
   * This function creates a DB record from the current form data and
   * redirects to the new DB-backed vehicle page.
   */
  async function handleSaveBasic() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        payload: form.payload || null,
      };

      if (isStatic) {
        // For static vehicles, always create a NEW DB record (POST)
        const res = await fetch('/api/admin/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const saved = await res.json();
          toast.success('Vehicle saved to database');
          // Redirect to the new DB-backed vehicle page
          window.location.href = `/admin/vehicles/${saved.id}`;
        } else {
          const err = await res.json().catch(() => ({}));
          toast.error(err.error || 'Failed to save vehicle', { description: err.detail || err.hint, duration: 6000 });
        }
      } else if (isNew) {
        const res = await fetch('/api/admin/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const saved = await res.json();
          toast.success('Vehicle created');
          window.location.href = `/admin/vehicles/${saved.id}`;
        } else {
          const err = await res.json().catch(() => ({}));
          toast.error(err.error || 'Failed to create vehicle', { description: err.detail || err.hint, duration: 6000 });
        }
      } else {
        // Existing DB vehicle, just update
        const res = await fetch(`/api/admin/vehicles/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast.success('Vehicle updated');
          fetchVehicle();
        } else {
          const err = await res.json().catch(() => ({}));
          toast.error(err.error || 'Failed to update vehicle', { description: err.detail || err.hint, duration: 6000 });
        }
      }
    } catch (error: any) { toast.error(`Network error: ${error?.message || 'Save failed'}`); }
    finally { setSaving(false); }
  }

  // Update sub-entity imagePath
  async function updateSubEntityImage(type: string, subId: string, imagePath: string) {
    if (!vehicle || vehicle.id.startsWith('static-')) return;
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicle.id}/${type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subId, imagePath }),
      });
      if (res.ok) {
        toast.success('Image updated successfully');
        fetchVehicle();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to update image');
      }
    } catch (error: any) {
      toast.error(`Network error: ${error?.message || 'Update failed'}`);
    }
  }

  // Inline update for color fields (name, hex, variantId, displayOrder)
  async function updateColorField(colorId: string, field: string, value: string | number | null) {
    if (!vehicle || vehicle.id.startsWith('static-')) return;
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicle.id}/colors`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: colorId, [field]: value }),
      });
      if (res.ok) {
        toast.success('Updated');
        fetchVehicle();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to update');
      }
    } catch (error: any) {
      toast.error(`Network error: ${error?.message || 'Update failed'}`);
    }
  }

  /**
   * Move a sub-entity (color or variant) up or down in display order.
   * Swaps displayOrder values with the adjacent item.
   */
  async function moveItemOrder(type: 'colors' | 'variants', itemId: string, direction: 'up' | 'down') {
    if (!vehicle || vehicle.id.startsWith('static-')) return;

    const items = type === 'colors' ? vehicle.colors : vehicle.variants;
    // Items are already sorted by displayOrder ASC from the API
    const sorted = [...items].sort((a, b) => a.displayOrder - b.displayOrder);
    const currentIndex = sorted.findIndex(item => item.id === itemId);

    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === sorted.length - 1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentItem = sorted[currentIndex];
    const swapItem = sorted[swapIndex];

    // Optimistic local update
    if (type === 'colors') {
      setVehicle(prev => prev ? {
        ...prev,
        colors: prev.colors.map(c => {
          if (c.id === currentItem.id) return { ...c, displayOrder: swapItem.displayOrder };
          if (c.id === swapItem.id) return { ...c, displayOrder: currentItem.displayOrder };
          return c;
        }),
      } : prev);
    } else {
      setVehicle(prev => prev ? {
        ...prev,
        variants: prev.variants.map(v => {
          if (v.id === currentItem.id) return { ...v, displayOrder: swapItem.displayOrder };
          if (v.id === swapItem.id) return { ...v, displayOrder: currentItem.displayOrder };
          return v;
        }),
      } : prev);
    }

    // Send both updates in parallel
    try {
      const apiPath = `/api/admin/vehicles/${vehicle.id}/${type}`;
      await Promise.all([
        fetch(apiPath, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: currentItem.id, displayOrder: swapItem.displayOrder }),
        }),
        fetch(apiPath, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: swapItem.id, displayOrder: currentItem.displayOrder }),
        }),
      ]);
      toast.success(`Moved ${direction === 'up' ? 'up' : 'down'}`);
      fetchVehicle();
    } catch (error: any) {
      toast.error('Failed to reorder');
      fetchVehicle(); // Revert on error
    }
  }

  // Sub-entity CRUD helpers
  async function addSubEntity(type: string, data: Record<string, unknown>) {
    if (!vehicle) return;
    if (vehicle.id.startsWith('static-')) {
      toast.error('Save this vehicle to database first', {
        description: 'Click "Save to Database" button at the top to create a DB record before adding sub-items.',
        duration: 6000,
      });
      return;
    }
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicle.id}/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) { toast.success('Added successfully'); fetchVehicle(); }
      else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to add', { description: err.detail || err.hint, duration: 6000 });
      }
    } catch (error: any) { toast.error(`Network error: ${error?.message || 'Failed to add'}`); }
  }

  async function deleteSubEntity(type: string, subId: string) {
    if (vehicle?.id.startsWith('static-')) {
      toast.error('Cannot delete items from a static vehicle');
      return;
    }
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicle?.id}/${type}?id=${subId}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Deleted'); fetchVehicle(); }
      else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to delete', { description: err.detail || err.hint, duration: 6000 });
      }
    } catch (error: any) { toast.error(`Network error: ${error?.message || 'Delete failed'}`); }
    finally { setDeleteSubId(null); setDeleteSubType(''); }
  }

  if (loading) return <Card className="animate-pulse"><CardContent className="p-6"><div className="h-64 bg-muted rounded" /></CardContent></Card>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/vehicles">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {isNew ? 'Add Vehicle' : vehicle?.name || 'Vehicle'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isNew ? 'Create a new vehicle entry' : `Edit ${vehicle?.name} details`}
          </p>
        </div>
        <Button onClick={handleSaveBasic} disabled={saving} className="bg-mitsu-red hover:bg-red-700 text-white">
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : isStatic ? 'Save to Database' : isNew ? 'Create Vehicle' : 'Save Basic Info'}
        </Button>
      </div>

      {/* Static vehicle warning */}
      {isStatic && (
        <Card className="mb-4 border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-600">This vehicle is loaded from static code, not from the database.</p>
              <p className="text-sm text-muted-foreground mt-1">
                To add variants, colors, specs, or features, you must first save this vehicle to the database.
                Click the <strong>&quot;Save to Database&quot;</strong> button above. This will create a new database record and redirect you.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic" className="text-xs sm:text-sm">Basic Info</TabsTrigger>
          <TabsTrigger value="variants" className="text-xs sm:text-sm">Variants {vehicle && `(${vehicle.variants.length})`}</TabsTrigger>
          <TabsTrigger value="colors" className="text-xs sm:text-sm">Colors {vehicle && `(${vehicle.colors.length})`}</TabsTrigger>
          <TabsTrigger value="specs" className="text-xs sm:text-sm">Specs {vehicle && `(${vehicle.specs.length})`}</TabsTrigger>
          <TabsTrigger value="features" className="text-xs sm:text-sm">Features {vehicle && `(${vehicle.features.length})`}</TabsTrigger>
        </TabsList>

        {/* BASIC INFO TAB */}
        <TabsContent value="basic">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Slug (URL)</Label>
                    <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="xpander" className="mt-1" />
                  </div>
                  <div>
                    <Label>Name</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="New Xpander" className="mt-1" />
                  </div>
                  <div>
                    <Label>Tagline</Label>
                    <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="MPV Keluarga 7-Seater" className="mt-1" />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passenger">Penumpang</SelectItem>
                        <SelectItem value="niaga-ringan">Niaga Ringan</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Base Price</Label>
                    <Input value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} placeholder="Mulai Rp 271 Juta" className="mt-1" />
                  </div>
                  <div>
                    <Label>Payload (optional)</Label>
                    <Input value={form.payload} onChange={(e) => setForm({ ...form, payload: e.target.value })} placeholder="1.015 Kg" className="mt-1" />
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
                <div className="space-y-4">
                  <ImageUpload value={form.imagePath} onChange={(path) => setForm({ ...form, imagePath: path })} label="Vehicle Image" />
                  <div>
                    <Label>Specs Short (JSON array)</Label>
                    <Textarea
                      value={form.specsShort}
                      onChange={(e) => setForm({ ...form, specsShort: e.target.value })}
                      className="mt-1 font-mono text-xs"
                      rows={3}
                      placeholder='["1.5L MIVEC", "CVT / Manual", "7 Penumpang"]'
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VARIANTS TAB */}
        <TabsContent value="variants">
          {!vehicle ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Save the vehicle first to manage variants.</CardContent></Card>
          ) : isStatic ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="font-semibold">Save this vehicle to database first</p>
              <p className="text-sm mt-1">Click &quot;Save to Database&quot; at the top, then you can manage variants.</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-4">
              {/* Add Variant Form */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Add Variant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div><Label>Name</Label><Input value={variantForm.name} onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })} className="mt-1" /></div>
                    <div><Label>Price</Label><Input value={variantForm.price} onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })} className="mt-1" placeholder="Rp 271.500.000" /></div>
                    <div><Label>Price Number (Juta)</Label><Input type="number" value={variantForm.priceNum} onChange={(e) => setVariantForm({ ...variantForm, priceNum: parseInt(e.target.value) || 0 })} className="mt-1" /></div>
                    <div><Label>Transmission</Label><Input value={variantForm.transmission} onChange={(e) => setVariantForm({ ...variantForm, transmission: e.target.value })} className="mt-1" /></div>
                    <div><Label>Drivetrain (optional)</Label><Input value={variantForm.drivetrain} onChange={(e) => setVariantForm({ ...variantForm, drivetrain: e.target.value })} className="mt-1" /></div>
                    <div><Label>Display Order</Label><Input type="number" value={variantForm.displayOrder} onChange={(e) => setVariantForm({ ...variantForm, displayOrder: parseInt(e.target.value) || 0 })} className="mt-1" /></div>
                  </div>
                  <div>
                    <Label>Highlights (JSON array)</Label>
                    <Textarea value={variantForm.highlights} onChange={(e) => setVariantForm({ ...variantForm, highlights: e.target.value })} className="mt-1 font-mono text-xs" rows={2} />
                  </div>
                  {/* IMAGE UPLOAD - PENTING! Upload gambar spesifik per varian */}
                  <div className="p-4 border-2 border-dashed border-green-300 bg-green-50/50 rounded-xl">
                    <p className="text-sm font-bold text-green-700 mb-2">📷 Upload Gambar Varian Ini</p>
                    <p className="text-xs text-muted-foreground mb-3">Upload foto mobil untuk varian ini. Kalau ada gambar, foto asli yang muncul di website saat varian dipilih.</p>
                    <ImageUpload value={variantForm.imagePath} onChange={(path) => setVariantForm({ ...variantForm, imagePath: path })} label="Gambar Mobil (Varian Ini)" />
                  </div>
                  <Button onClick={() => { addSubEntity('variants', variantForm); setVariantForm({ name: '', price: '', priceNum: 0, transmission: '', drivetrain: '', highlights: '[]', imagePath: '', displayOrder: 0 }); }} className="bg-mitsu-red hover:bg-red-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Add Variant
                  </Button>
                </CardContent>
              </Card>

              {/* Variants List */}
              {vehicle.variants.map((v, vIdx) => (
                <Card key={v.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-2 flex-1">
                        {/* Reorder buttons */}
                        <div className="flex flex-col gap-0.5 flex-shrink-0 mt-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={vIdx === 0}
                            onClick={() => moveItemOrder('variants', v.id, 'up')}
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={vIdx === vehicle.variants.length - 1}
                            onClick={() => moveItemOrder('variants', v.id, 'down')}
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{v.name}</h4>
                          <p className="text-sm text-muted-foreground">{v.price} • {v.transmission}{v.drivetrain ? ` • ${v.drivetrain}` : ''}</p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {(() => {
                              try {
                                return JSON.parse(v.highlights).map((h: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{h}</Badge>
                                ));
                              } catch { return null; }
                            })()}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => { setDeleteSubId(v.id); setDeleteSubType('variants'); }} className="text-destructive flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {/* Upload gambar untuk varian yang sudah ada */}
                    <div className="mt-4 p-3 border border-dashed border-green-300 bg-green-50/50 rounded-lg">
                      <p className="text-xs font-semibold text-green-700 mb-2">📷 Gambar Varian Ini</p>
                      <ImageUpload
                        value={v.imagePath || ''}
                        onChange={(path) => updateSubEntityImage('variants', v.id, path)}
                        label="Upload/Ubah Gambar Varian"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* COLORS TAB */}
        <TabsContent value="colors">
          {!vehicle ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Save the vehicle first to manage colors.</CardContent></Card>
          ) : isStatic ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="font-semibold">Save this vehicle to database first</p>
              <p className="text-sm mt-1">Click &quot;Save to Database&quot; at the top, then you can manage colors.</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-4">
              {/* Info Banner */}
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-4 flex items-start gap-3">
                  <Palette className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-semibold">Warna per Varian</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Centang <strong>Global</strong> = warna muncul di semua varian.
                      ATAU centang varian tertentu = warna hanya muncul di varian yang dipilih.
                      Bisa centang <strong>lebih dari 1 varian</strong> — cukup upload gambar sekali!
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Add Color Form */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Add Color
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div><Label>Name</Label><Input value={colorForm.name} onChange={(e) => setColorForm({ ...colorForm, name: e.target.value })} className="mt-1" placeholder="contoh: White Pearl" /></div>
                    <div>
                      <Label>Hex Color</Label>
                      <div className="flex gap-2 mt-1">
                        <input type="color" value={colorForm.hex} onChange={(e) => setColorForm({ ...colorForm, hex: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
                        <Input value={colorForm.hex} onChange={(e) => setColorForm({ ...colorForm, hex: e.target.value })} className="flex-1" />
                      </div>
                    </div>
                    <div><Label>Display Order</Label><Input type="number" value={colorForm.displayOrder} onChange={(e) => setColorForm({ ...colorForm, displayOrder: parseInt(e.target.value) || 0 })} className="mt-1" /></div>
                  </div>

                  {/* Multi-variant selector */}
                  <div className="mt-4">
                    <Label className="text-xs font-semibold">Assign ke Varian</Label>
                    <p className="text-[10px] text-muted-foreground mb-2">
                      Centang varian yang punya warna ini. Centang <strong>Global</strong> = muncul di semua.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {/* Global checkbox */}
                      <button
                        type="button"
                        onClick={() => setColorForm(prev => ({
                          ...prev,
                          isGlobal: !prev.isGlobal,
                          variantIds: !prev.isGlobal ? [] : prev.variantIds, // uncheck variants when going global
                        }))}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          colorForm.isGlobal
                            ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-sm'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {colorForm.isGlobal ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                        🌐 Global
                      </button>
                      {vehicle.variants.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setColorForm(prev => {
                            const ids = prev.variantIds.includes(v.id)
                              ? prev.variantIds.filter(id => id !== v.id)
                              : [...prev.variantIds, v.id];
                            return {
                              ...prev,
                              variantIds: ids,
                              isGlobal: ids.length === 0, // auto uncheck global when variants selected
                            };
                          })}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                            colorForm.variantIds.includes(v.id)
                              ? 'border-mitsu-dark bg-mitsu-dark/5 text-mitsu-dark shadow-sm'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {colorForm.variantIds.includes(v.id) ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                          {v.name}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      {colorForm.isGlobal
                        ? '✅ Warna muncul di semua varian'
                        : colorForm.variantIds.length > 0
                          ? `📎 Warna muncul di ${colorForm.variantIds.length} varian: ${colorForm.variantIds.map(vid => vehicle.variants.find(v => v.id === vid)?.name).filter(Boolean).join(', ')}`
                          : '⚠️ Pilih minimal Global atau 1 varian'
                      }
                    </p>
                  </div>

                  {/* IMAGE UPLOAD */}
                  <div className="mt-6 p-4 border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl">
                    <p className="text-sm font-bold text-blue-700 mb-2">📷 Upload Gambar Warna Ini</p>
                    <p className="text-xs text-muted-foreground mb-3">Upload foto mobil dalam warna ini. Cukup upload sekali — gambar dipakai di semua varian yang dipilih.</p>
                    <ImageUpload value={colorForm.imagePath} onChange={(path) => setColorForm({ ...colorForm, imagePath: path })} label="Gambar Mobil (Warna Ini)" />
                  </div>
                  <Button
                    onClick={async () => {
                      if (!vehicle) return;
                      const targets = colorForm.isGlobal
                        ? [null] // one global record
                        : colorForm.variantIds; // one record per variant
                      if (targets.length === 0) {
                        toast.error('Pilih minimal Global atau 1 varian');
                        return;
                      }
                      let successCount = 0;
                      for (const variantId of targets) {
                        try {
                          const res = await fetch(`/api/admin/vehicles/${vehicle.id}/colors`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              name: colorForm.name,
                              hex: colorForm.hex,
                              variantId: variantId,
                              imagePath: colorForm.imagePath,
                              displayOrder: colorForm.displayOrder,
                            }),
                          });
                          if (res.ok) successCount++;
                        } catch {}
                      }
                      if (successCount > 0) {
                        toast.success(`Added color to ${successCount} ${successCount === 1 ? 'target' : 'targets'}`);
                        fetchVehicle();
                      } else {
                        toast.error('Failed to add color');
                      }
                      setColorForm({ name: '', hex: '#000000', variantIds: [], isGlobal: true, imagePath: '', displayOrder: 0 });
                    }}
                    className="mt-4 bg-mitsu-red hover:bg-red-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Color
                  </Button>
                </CardContent>
              </Card>

              {/* Filter by variant */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground">Filter warna:</span>
                <div className="flex gap-1 flex-wrap">
                  <Button
                    size="sm"
                    variant={colorFilterVariant === 'all' ? 'default' : 'outline'}
                    onClick={() => setColorFilterVariant('all')}
                    className={colorFilterVariant === 'all' ? 'bg-mitsu-red hover:bg-red-700 text-white' : ''}
                  >
                    Semua ({vehicle.colors.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={colorFilterVariant === 'global' ? 'default' : 'outline'}
                    onClick={() => setColorFilterVariant('global')}
                    className={colorFilterVariant === 'global' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                  >
                    🌐 Global ({vehicle.colors.filter(c => !c.variantId).length})
                  </Button>
                  {vehicle.variants.map((v) => {
                    const count = vehicle.colors.filter(c => c.variantId === v.id).length;
                    return (
                      <Button
                        key={v.id}
                        size="sm"
                        variant={colorFilterVariant === v.id ? 'default' : 'outline'}
                        onClick={() => setColorFilterVariant(v.id)}
                        className={colorFilterVariant === v.id ? 'bg-mitsu-dark hover:bg-gray-800 text-white' : ''}
                      >
                        {v.name} ({count})
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Colors List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {vehicle.colors
                  .filter((c) => {
                    if (colorFilterVariant === 'all') return true;
                    if (colorFilterVariant === 'global') return !c.variantId;
                    return c.variantId === colorFilterVariant;
                  })
                  .map((c, cIdx, filteredArr) => {
                    const assignedVariant = c.variantId ? vehicle.variants.find(v => v.id === c.variantId) : null;
                    return (
                      <Card key={c.id} className={`relative group ${c.variantId ? 'border-mitsu-dark/20' : 'border-blue-200'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            {/* Reorder buttons */}
                            <div className="flex flex-col gap-0.5 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                disabled={cIdx === 0}
                                onClick={() => moveItemOrder('colors', c.id, 'up')}
                              >
                                <ChevronUp className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                disabled={cIdx === filteredArr.length - 1}
                                onClick={() => moveItemOrder('colors', c.id, 'down')}
                              >
                                <ChevronDown className="w-3 h-3" />
                              </Button>
                            </div>
                            {c.imagePath ? (
                              <div className="w-12 h-12 rounded-lg border overflow-hidden bg-muted/30 flex-shrink-0">
                                <img src={c.imagePath} alt={c.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg border flex-shrink-0" style={{ backgroundColor: c.hex }} />
                            )}
                            <div className="flex-1 min-w-0">
                              {/* Editable color name */}
                              <div className="flex items-center gap-1.5">
                                <Input
                                  value={c.name}
                                  onChange={(e) => {
                                    // Optimistic local update
                                    setVehicle(prev => prev ? {
                                      ...prev,
                                      colors: prev.colors.map(col => col.id === c.id ? { ...col, name: e.target.value } : col),
                                    } : prev);
                                  }}
                                  onBlur={(e) => {
                                    if (e.target.value !== c.name) {
                                      updateColorField(c.id, 'name', e.target.value);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      (e.target as HTMLInputElement).blur();
                                    }
                                  }}
                                  className="h-7 text-sm font-medium px-2 py-0 border-transparent hover:border-border focus:border-mitsu-red bg-transparent hover:bg-muted/50"
                                />
                                <Pencil className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                              </div>
                              {/* Editable hex color */}
                              <div className="flex items-center gap-1.5 mt-1">
                                <input
                                  type="color"
                                  value={c.hex}
                                  onChange={(e) => {
                                    setVehicle(prev => prev ? {
                                      ...prev,
                                      colors: prev.colors.map(col => col.id === c.id ? { ...col, hex: e.target.value } : col),
                                    } : prev);
                                  }}
                                  onBlur={(e) => {
                                    if (e.target.value !== c.hex) {
                                      updateColorField(c.id, 'hex', e.target.value);
                                    }
                                  }}
                                  className="w-6 h-6 rounded cursor-pointer border-0 p-0 flex-shrink-0"
                                />
                                <Input
                                  value={c.hex}
                                  onChange={(e) => {
                                    setVehicle(prev => prev ? {
                                      ...prev,
                                      colors: prev.colors.map(col => col.id === c.id ? { ...col, hex: e.target.value } : col),
                                    } : prev);
                                  }}
                                  onBlur={(e) => {
                                    if (e.target.value !== c.hex) {
                                      updateColorField(c.id, 'hex', e.target.value);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      (e.target as HTMLInputElement).blur();
                                    }
                                  }}
                                  className="h-6 text-xs font-mono px-2 py-0 border-transparent hover:border-border focus:border-mitsu-red bg-transparent hover:bg-muted/50"
                                />
                              </div>
                              {/* Variant badge */}
                              {assignedVariant ? (
                                <Badge variant="secondary" className="mt-1.5 text-[9px] bg-mitsu-dark/10 text-mitsu-dark">
                                  📎 {assignedVariant.name}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="mt-1.5 text-[9px] bg-blue-100 text-blue-700">
                                  🌐 Global
                                </Badge>
                              )}
                              {c.imagePath && <p className="text-[10px] text-green-600 mt-0.5">✓ has image</p>}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="flex-shrink-0 text-destructive h-8 w-8"
                              onClick={() => { setDeleteSubId(c.id); setDeleteSubType('colors'); }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          {/* Variant assignment - quick change */}
                          <div className="mb-3">
                            <Label className="text-[10px]">Assign ke Varian:</Label>
                            <Select
                              value={c.variantId || '__global__'}
                              onValueChange={(val) => {
                                const newVariantId = val === '__global__' ? null : val;
                                fetch(`/api/admin/vehicles/${vehicle.id}/colors`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: c.id, variantId: newVariantId }),
                                }).then(() => {
                                  toast.success('Variant assignment updated');
                                  fetchVehicle();
                                }).catch(() => toast.error('Failed to update variant assignment'));
                              }}
                            >
                              <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__global__">🌐 Global (Semua Varian)</SelectItem>
                                {vehicle.variants.map((v) => (
                                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Upload gambar untuk warna yang sudah ada */}
                          <div className="p-3 border border-dashed border-blue-300 bg-blue-50/50 rounded-lg">
                            <p className="text-xs font-semibold text-blue-700 mb-2">📷 Gambar Warna Ini</p>
                            <ImageUpload
                              value={c.imagePath || ''}
                              onChange={(path) => updateSubEntityImage('colors', c.id, path)}
                              label="Upload/Ubah Gambar Warna"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>

              {vehicle.colors.filter((c) => {
                if (colorFilterVariant === 'all') return true;
                if (colorFilterVariant === 'global') return !c.variantId;
                return c.variantId === colorFilterVariant;
              }).length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Palette className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-medium">Belum ada warna di kategori ini</p>
                    <p className="text-sm mt-1">Tambahkan warna baru di form di atas</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* SPECS TAB */}
        <TabsContent value="specs">
          {!vehicle ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Save the vehicle first to manage specs.</CardContent></Card>
          ) : isStatic ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="font-semibold">Save this vehicle to database first</p>
              <p className="text-sm mt-1">Click &quot;Save to Database&quot; at the top, then you can manage specs.</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wrench className="w-4 h-4" /> Add Spec Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><Label>Category</Label><Input value={specForm.category} onChange={(e) => setSpecForm({ ...specForm, category: e.target.value })} className="mt-1" placeholder="Mesin" /></div>
                    <div><Label>Display Order</Label><Input type="number" value={specForm.displayOrder} onChange={(e) => setSpecForm({ ...specForm, displayOrder: parseInt(e.target.value) || 0 })} className="mt-1" /></div>
                  </div>
                  <div className="mt-4">
                    <Label>Items (JSON array of {`{label, value}`})</Label>
                    <Textarea value={specForm.items} onChange={(e) => setSpecForm({ ...specForm, items: e.target.value })} className="mt-1 font-mono text-xs" rows={4} placeholder='[{"label":"Tipe Mesin","value":"4A91 1.5L"}]' />
                  </div>
                  <Button onClick={() => { addSubEntity('specs', specForm); setSpecForm({ category: '', items: '[]', displayOrder: 0 }); }} className="mt-4 bg-mitsu-red hover:bg-red-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Add Spec Category
                  </Button>
                </CardContent>
              </Card>

              {vehicle.specs.map((s) => (
                <Card key={s.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{s.category}</h4>
                      <Button variant="ghost" size="icon" onClick={() => { setDeleteSubId(s.id); setDeleteSubType('specs'); }} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {(() => {
                        try {
                          return JSON.parse(s.items).map((item: { label: string; value: string }, i: number) => (
                            <div key={i} className="flex text-sm">
                              <span className="text-muted-foreground w-40 flex-shrink-0">{item.label}</span>
                              <span className="text-foreground">{item.value}</span>
                            </div>
                          ));
                        } catch { return <p className="text-sm text-destructive">Invalid JSON</p>; }
                      })()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* FEATURES TAB */}
        <TabsContent value="features">
          {!vehicle ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Save the vehicle first to manage features.</CardContent></Card>
          ) : isStatic ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="font-semibold">Save this vehicle to database first</p>
              <p className="text-sm mt-1">Click &quot;Save to Database&quot; at the top, then you can manage features.</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Add Feature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Icon</Label><Input value={featureForm.icon} onChange={(e) => setFeatureForm({ ...featureForm, icon: e.target.value })} className="mt-1" placeholder="Shield" /></div>
                    <div><Label>Title</Label><Input value={featureForm.title} onChange={(e) => setFeatureForm({ ...featureForm, title: e.target.value })} className="mt-1" /></div>
                    <div className="sm:col-span-2"><Label>Description</Label><Textarea value={featureForm.description} onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })} className="mt-1" rows={2} /></div>
                    <div><Label>Display Order</Label><Input type="number" value={featureForm.displayOrder} onChange={(e) => setFeatureForm({ ...featureForm, displayOrder: parseInt(e.target.value) || 0 })} className="mt-1" /></div>
                  </div>
                  <Button onClick={() => { addSubEntity('features', featureForm); setFeatureForm({ icon: 'Zap', title: '', description: '', displayOrder: 0 }); }} className="mt-4 bg-mitsu-red hover:bg-red-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Add Feature
                  </Button>
                </CardContent>
              </Card>

              {vehicle.features.map((f) => (
                <Card key={f.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-mitsu-red/10 rounded-lg">
                          <span className="text-mitsu-red text-sm">{f.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{f.title}</h4>
                          <p className="text-sm text-muted-foreground">{f.description}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => { setDeleteSubId(f.id); setDeleteSubType('features'); }} className="text-destructive flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!deleteSubId}
        onOpenChange={() => { setDeleteSubId(null); setDeleteSubType(''); }}
        title="Delete Item"
        description="Are you sure you want to delete this item?"
        onConfirm={() => { if (deleteSubId && deleteSubType) deleteSubEntity(deleteSubType, deleteSubId); }}
      />
    </div>
  );
}
