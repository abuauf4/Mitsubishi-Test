'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

interface VehicleListItem {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  basePrice: string;
  imagePath: string;
  active: boolean;
  displayOrder: number;
  _count: { variants: number; colors: number; specs: number; features: number };
}

const categoryLabels: Record<string, string> = {
  passenger: 'Penumpang',
  'niaga-ringan': 'Niaga Ringan',
  commercial: 'Commercial',
};

const categoryColors: Record<string, string> = {
  passenger: 'bg-mitsu-red/10 text-mitsu-red',
  'niaga-ringan': 'bg-amber-100 text-amber-700',
  commercial: 'bg-mitsu-fuso-yellow/10 text-mitsu-fuso-yellow-dark',
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => { fetchVehicles(); }, []);

  async function fetchVehicles() {
    try {
      const res = await fetch('/api/admin/vehicles');
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load vehicles'); }
    finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/vehicles/${deleteId}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Vehicle deleted'); fetchVehicles(); }
      else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to delete vehicle', { description: err.detail || err.hint, duration: 6000 });
      }
    } catch (error: any) { toast.error(`Network error: ${error?.message || 'Delete failed'}`); }
    finally { setDeleteId(null); }
  }

  const filtered = filterCategory === 'all' ? vehicles : vehicles.filter(v => v.category === filterCategory);

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent></Card>)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vehicles</h1>
          <p className="text-muted-foreground mt-1">Manage all vehicles — {vehicles.length} total</p>
        </div>
        <Link href="/admin/vehicles/new">
          <Button className="bg-mitsu-red hover:bg-red-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Vehicle
          </Button>
        </Link>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-4">
        {['all', 'passenger', 'niaga-ringan', 'commercial'].map((cat) => (
          <Button
            key={cat}
            variant={filterCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory(cat)}
            className={filterCategory === cat ? 'bg-mitsu-red hover:bg-red-700 text-white' : ''}
          >
            {cat === 'all' ? 'All' : categoryLabels[cat] || cat}
          </Button>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead className="text-center">Variants</TableHead>
                <TableHead className="text-center">Colors</TableHead>
                <TableHead className="text-center">Specs</TableHead>
                <TableHead className="text-center">Features</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <div className="w-10 h-10 rounded bg-muted overflow-hidden">
                      {v.imagePath && <img src={v.imagePath} alt={v.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{v.name}</p>
                      <p className="text-xs text-muted-foreground">{v.tagline}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[v.category] || 'bg-gray-100 text-gray-700'}`}>
                      {categoryLabels[v.category] || v.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{v.basePrice}</TableCell>
                  <TableCell className="text-center">{v._count.variants}</TableCell>
                  <TableCell className="text-center">{v._count.colors}</TableCell>
                  <TableCell className="text-center">{v._count.specs}</TableCell>
                  <TableCell className="text-center">{v._count.features}</TableCell>
                  <TableCell>
                    <Badge variant={v.active ? 'default' : 'secondary'} className={v.active ? 'bg-emerald-100 text-emerald-700' : ''}>
                      {v.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/vehicles/${v.id}`}>
                        <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                      </Link>
                      <Link href={`/admin/vehicles/${v.id}`}>
                        <Button variant="ghost" size="icon"><Pencil className="w-4 h-4" /></Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(v.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No vehicles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Vehicle"
        description="Are you sure you want to delete this vehicle and all its variants, colors, specs, and features?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
