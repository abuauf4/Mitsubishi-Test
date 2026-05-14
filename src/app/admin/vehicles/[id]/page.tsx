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
import { Save, Plus, Trash2, ArrowLeft, Palette, Wrench, Sparkles, Layers } from 'lucide-react';
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
  displayOrder: number;
}

interface VehicleColorData {
  id: string;
  name: string;
  hex: string;
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
  const [variantForm, setVariantForm] = useState({ name: '', price: '', priceNum: 0, transmission: '', drivetrain: '', highlights: '[]', displayOrder: 0 });
  const [colorForm, setColorForm] = useState({ name: '', hex: '#000000', displayOrder: 0 });
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

  async function handleSaveBasic() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        payload: form.payload || null,
      };
      const url = isNew ? '/api/admin/vehicles' : `/api/admin/vehicles/${id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const saved = await res.json();
        toast.success(isNew ? 'Vehicle created' : 'Vehicle updated');
        if (isNew) {
          window.location.href = `/admin/vehicles/${saved.id}`;
        } else {
          fetchVehicle();
        }
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to save vehicle', { description: err.detail || err.hint, duration: 6000 });
      }
    } catch (error: any) { toast.error(`Network error: ${error?.message || 'Save failed'}`); }
    finally { setSaving(false); }
  }

  // Sub-entity CRUD helpers
  async function addSubEntity(type: string, data: Record<string, unknown>) {
    if (!vehicle) return;
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
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Basic Info'}
        </Button>
      </div>

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
                  <Button onClick={() => { addSubEntity('variants', variantForm); setVariantForm({ name: '', price: '', priceNum: 0, transmission: '', drivetrain: '', highlights: '[]', displayOrder: 0 }); }} className="bg-mitsu-red hover:bg-red-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Add Variant
                  </Button>
                </CardContent>
              </Card>

              {/* Variants List */}
              {vehicle.variants.map((v) => (
                <Card key={v.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
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
                      <Button variant="ghost" size="icon" onClick={() => { setDeleteSubId(v.id); setDeleteSubType('variants'); }} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Add Color
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><Label>Name</Label><Input value={colorForm.name} onChange={(e) => setColorForm({ ...colorForm, name: e.target.value })} className="mt-1" /></div>
                    <div>
                      <Label>Hex Color</Label>
                      <div className="flex gap-2 mt-1">
                        <input type="color" value={colorForm.hex} onChange={(e) => setColorForm({ ...colorForm, hex: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
                        <Input value={colorForm.hex} onChange={(e) => setColorForm({ ...colorForm, hex: e.target.value })} className="flex-1" />
                      </div>
                    </div>
                    <div><Label>Display Order</Label><Input type="number" value={colorForm.displayOrder} onChange={(e) => setColorForm({ ...colorForm, displayOrder: parseInt(e.target.value) || 0 })} className="mt-1" /></div>
                  </div>
                  <Button onClick={() => { addSubEntity('colors', colorForm); setColorForm({ name: '', hex: '#000000', displayOrder: 0 }); }} className="mt-4 bg-mitsu-red hover:bg-red-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Add Color
                  </Button>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {vehicle.colors.map((c) => (
                  <Card key={c.id} className="relative group">
                    <CardContent className="p-3 text-center">
                      <div className="w-full h-12 rounded-lg mb-2 border" style={{ backgroundColor: c.hex }} />
                      <p className="text-xs font-medium text-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.hex}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-1 -right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-white"
                        onClick={() => { setDeleteSubId(c.id); setDeleteSubType('colors'); }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* SPECS TAB */}
        <TabsContent value="specs">
          {!vehicle ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Save the vehicle first to manage specs.</CardContent></Card>
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
