'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Save } from 'lucide-react';

interface SiteConfig {
  id: string;
  key: string;
  value: string;
  type: string;
  page: string;
}

export default function SiteConfigPage() {
  const [configs, setConfigs] = useState<SiteConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  async function fetchConfigs() {
    try {
      const res = await fetch('/api/admin/site-config');
      const data = await res.json();
      setConfigs(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load site configs');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs }),
      });
      if (res.ok) {
        toast.success('Site configs saved successfully');
        fetchConfigs();
      } else {
        toast.error('Failed to save site configs');
      }
    } catch {
      toast.error('Failed to save site configs');
    } finally {
      setSaving(false);
    }
  }

  function addConfig() {
    setConfigs([...configs, { id: '', key: '', value: '', type: 'text', page: 'home' }]);
  }

  function removeConfig(index: number) {
    setConfigs(configs.filter((_, i) => i !== index));
  }

  function updateConfig(index: number, field: keyof SiteConfig, value: string) {
    const updated = [...configs];
    updated[index] = { ...updated[index], [field]: value };
    setConfigs(updated);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Site Configuration</h1>
          <p className="text-muted-foreground mt-1">Manage logos, badges, and site settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addConfig}>
            <Plus className="w-4 h-4 mr-2" /> Add Config
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-mitsu-red hover:bg-red-700 text-white">
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {configs.map((config, index) => (
          <Card key={config.id || index}>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <Label className="text-xs text-muted-foreground">Key</Label>
                  <Input
                    value={config.key}
                    onChange={(e) => updateConfig(index, 'key', e.target.value)}
                    placeholder="site_logo"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Value</Label>
                  <Input
                    value={config.value}
                    onChange={(e) => updateConfig(index, 'value', e.target.value)}
                    placeholder="Value"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <Select
                      value={config.type}
                      onValueChange={(v) => updateConfig(index, 'type', v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="url">URL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Page</Label>
                    <Select
                      value={config.page}
                      onValueChange={(v) => updateConfig(index, 'page', v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">Global</SelectItem>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="passenger">Passenger</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeConfig(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {configs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No site configs yet. Click &quot;Add Config&quot; to get started.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
