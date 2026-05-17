'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

interface SiteConfig {
  id: string;
  key: string;
  value: string;
  type: string;
  page: string;
}

// Default values that mirror what the website shows when no custom logo is uploaded
const LOGO_DEFAULTS: Record<string, { label: string; defaultValue: string; page: string }> = {
  logo_passenger: {
    label: '🚗 Logo Passenger (Mitsubishi)',
    defaultValue: '',
    page: 'passenger',
  },
  logo_commercial: {
    label: '🚛 Logo Commercial (FUSO) — Navbar Putih',
    defaultValue: '',
    page: 'commercial',
  },
  logo_commercial_dark: {
    label: '🚛 Logo FUSO Dark — Navbar Hitam (Home)',
    defaultValue: '',
    page: 'home',
  },
  site_logo: {
    label: '🌐 Site Logo',
    defaultValue: '',
    page: 'global',
  },
};

export default function SiteConfigPage() {
  const [configs, setConfigs] = useState<SiteConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  async function fetchConfigs() {
    try {
      const res = await fetch('/api/admin/site-config', { cache: 'no-store' });
      const data = await res.json();

      if (Array.isArray(data)) {
        // Ensure all required logo configs exist in the list
        // If they're missing from DB response, add them as empty entries
        const existingKeys = new Set(data.map((c: SiteConfig) => c.key));
        const merged = [...data];

        for (const [key, def] of Object.entries(LOGO_DEFAULTS)) {
          if (!existingKeys.has(key)) {
            merged.push({
              id: '',
              key,
              value: def.defaultValue,
              type: 'image',
              page: def.page,
            });
          }
        }

        // Sort: logo_ entries first, then alphabetically
        merged.sort((a: SiteConfig, b: SiteConfig) => {
          const aIsLogo = a.key.startsWith('logo_') ? 0 : 1;
          const bIsLogo = b.key.startsWith('logo_') ? 0 : 1;
          if (aIsLogo !== bIsLogo) return aIsLogo - bIsLogo;
          return a.key.localeCompare(b.key);
        });

        setConfigs(merged);
      } else {
        setConfigs([]);
      }
    } catch (error) {
      toast.error('Failed to load site configs');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveResult(null);

    try {
      // Filter out configs with empty keys before saving
      const validConfigs = configs.filter(c => c.key.trim() !== '');

      const res = await fetch('/api/admin/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: validConfigs }),
      });

      const responseData = await res.json();

      if (res.ok) {
        toast.success('Site configs saved successfully');
        setSaveResult({ success: true, message: `Saved ${validConfigs.length} configs` });
        // Re-fetch to get the latest data from DB
        await fetchConfigs();
      } else {
        const errMsg = responseData.error || 'Failed to save site configs';
        const detail = responseData.detail ? `: ${responseData.detail}` : '';
        toast.error(errMsg + detail);
        setSaveResult({ success: false, message: errMsg + detail });
      }
    } catch (err: any) {
      toast.error('Failed to save site configs');
      setSaveResult({ success: false, message: err?.message || 'Network error' });
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
    // Clear save result when user makes changes
    setSaveResult(null);
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

  // Get display label for a logo config
  const getLogoLabel = (key: string) => {
    return LOGO_DEFAULTS[key]?.label || key.replace('logo_', 'Logo ').replace(/_/g, ' ');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Site Configuration</h1>
          <p className="text-muted-foreground mt-1">Manage logos, badges, and site settings</p>
        </div>
        <div className="flex items-center gap-3">
          {saveResult && (
            <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${
              saveResult.success
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {saveResult.success
                ? <CheckCircle2 className="w-3.5 h-3.5" />
                : <AlertTriangle className="w-3.5 h-3.5" />
              }
              {saveResult.message}
            </div>
          )}
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
          <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
            <svg viewBox="0 0 100 100" className="w-5 h-5">
              <g transform="translate(50, 50)">
                <polygon fill="#E60012" points="0,-34 -12,-10 0,0 12,-10" />
                <polygon fill="#E60012" points="12,-10 0,0 12,22 24,0" />
                <polygon fill="#E60012" points="-12,-10 0,0 -12,22 -24,0" />
              </g>
            </svg>
            Logos
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            Upload logo custom untuk mengganti logo default di website. Kosongkan jika ingin pakai logo default.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {logoConfigs.map((config, idx) => {
              const realIdx = configs.indexOf(config);
              return (
                <Card key={config.id || `logo-${config.key}-${idx}`}>
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">
                          {getLogoLabel(config.key)}
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

                      {/* Show current default preview if no custom logo uploaded */}
                      {!config.value && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-dashed">
                          <div className={`flex items-center justify-center w-10 h-10 rounded ${config.key === 'logo_commercial_dark' ? 'bg-black' : 'bg-mitsu-dark'}`}>
                            {config.key === 'logo_commercial_dark' ? (
                              <svg viewBox="0 0 120 40" className="w-8 h-4">
                                <text x="0" y="30" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="36" fill="#FFD600" letterSpacing="2">FUSO</text>
                              </svg>
                            ) : config.key === 'logo_commercial' ? (
                              <svg viewBox="0 0 120 40" className="w-8 h-4">
                                <text x="0" y="30" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="36" fill="#1A1A1A" letterSpacing="2">FUSO</text>
                              </svg>
                            ) : (
                              <svg viewBox="0 0 100 100" className="w-6 h-6">
                                <g transform="translate(50, 50)">
                                  <polygon fill="#E60012" points="0,-34 -12,-10 0,0 12,-10" />
                                  <polygon fill="#E60012" points="12,-10 0,0 12,22 24,0" />
                                  <polygon fill="#E60012" points="-12,-10 0,0 -12,22 -24,0" />
                                </g>
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">
                              {config.key === 'logo_commercial_dark' ? 'Default: FUSO Kuning (untuk bg hitam)' :
                               config.key === 'logo_commercial' ? 'Default: FUSO Hitam (untuk bg putih)' :
                               'Default Logo'}
                            </p>
                            <p className="text-[10px] text-muted-foreground">Upload gambar untuk mengganti</p>
                          </div>
                        </div>
                      )}

                      <ImageUpload
                        value={config.value}
                        onChange={(path) => updateConfig(realIdx, 'value', path)}
                        label={config.key === 'logo_passenger' ? 'Upload Logo Mitsubishi' :
                               config.key === 'logo_commercial_dark' ? 'Upload Logo FUSO (Dark/Navbar Hitam)' :
                               config.key === 'logo_commercial' ? 'Upload Logo FUSO (Navbar Putih)' : 'Upload Logo'}
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
