'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Save } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

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

  // Separate logo configs from general configs for better UX
  const logoConfigs = configs.filter(c => c.key.startsWith('logo_'));
  const generalConfigs = configs.filter(c => !c.key.startsWith('logo_'));

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

      {/* Logo Section - dedicated with image upload */}
      {logoConfigs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <svg viewBox="0 0 100 100" className="w-5 h-5">
              <g transform="translate(50, 50)">
                <polygon fill="#E60012" points="0,-34 -12,-10 0,0 12,-10" />
                <polygon fill="#E60012" points="12,-10 0,0 12,22 24,0" />
                <polygon fill="#E60012" points="-12,-10 0,0 -12,22 -24,0" />
              </g>
            </svg>
            Logos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {logoConfigs.map((config, idx) => {
              const realIdx = configs.indexOf(config);
              return (
                <Card key={config.id || `logo-${idx}`}>
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">
                          {config.key === 'logo_passenger' ? '🚗 Logo Passenger (Mitsubishi)' :
                           config.key === 'logo_commercial' ? '🚛 Logo Commercial (FUSO)' :
                           config.key === 'site_logo' ? '🌐 Site Logo' :
                           config.key.replace('logo_', 'Logo ').replace(/_/g, ' ')}
                        </Label>
                        <Select
                          value={config.page}
                          onValueChange={(v) => updateConfig(realIdx, 'page', v)}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs">
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
                      <ImageUpload
                        value={config.value}
                        onChange={(path) => updateConfig(realIdx, 'value', path)}
                        label={config.key === 'logo_passenger' ? 'Upload Logo Mitsubishi' :
                               config.key === 'logo_commercial' ? 'Upload Logo FUSO' : 'Upload Logo'}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* General Configs */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground mb-3">General Settings</h2>
        {generalConfigs.map((config, idx) => {
          const realIdx = configs.indexOf(config);
          return (
            <Card key={config.id || `gen-${idx}`}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <Label className="text-xs text-muted-foreground">Key</Label>
                    <Input
                      value={config.key}
                      onChange={(e) => updateConfig(realIdx, 'key', e.target.value)}
                      placeholder="site_logo"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Value</Label>
                    {config.type === 'image' ? (
                      <div className="mt-1">
                        <ImageUpload
                          value={config.value}
                          onChange={(path) => updateConfig(realIdx, 'value', path)}
                        />
                      </div>
                    ) : (
                      <Input
                        value={config.value}
                        onChange={(e) => updateConfig(realIdx, 'value', e.target.value)}
                        placeholder="Value"
                        className="mt-1"
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Type</Label>
                      <Select
                        value={config.type}
                        onValueChange={(v) => updateConfig(realIdx, 'type', v)}
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
                        onValueChange={(v) => updateConfig(realIdx, 'page', v)}
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
                      onClick={() => removeConfig(realIdx)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
