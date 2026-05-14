'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, AlertCircle } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

interface HeroData {
  id: string;
  title: string;
  subtitle: string;
  imagePath: string;
  ctaText: string;
  ctaLink: string;
  page: string;
  active: boolean;
}

const PAGES = [
  { value: 'home', label: 'Home' },
  { value: 'passenger', label: 'Passenger' },
  { value: 'commercial', label: 'Commercial' },
] as const;

const DEFAULT_HERO: Omit<HeroData, 'id'> = {
  title: 'Drive Your Ambition',
  subtitle: 'Temukan kendaraan Mitsubishi terbaik untuk hidup dan bisnis Anda',
  imagePath: '/images/hero-cinematic.png',
  ctaText: 'Selengkapnya',
  ctaLink: '#audience-gateway',
  page: 'home',
  active: true,
};

export default function HeroPage() {
  const [hero, setHero] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'fallback' | 'unknown'>('unknown');
  const [currentPage, setCurrentPage] = useState<string>('home');

  useEffect(() => {
    fetchHero(currentPage);
  }, [currentPage]);

  async function fetchHero(page: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/hero?page=${page}`);
      const data = await res.json();
      if (data && !data.error && data.id) {
        // If ID starts with "static-", we're using fallback data
        setDbStatus(data.id.startsWith('static-') ? 'fallback' : 'connected');
        setHero({ ...data, page });
      } else if (data && data.error) {
        toast.error(data.error);
      } else {
        setHero(null);
      }
    } catch (error) {
      toast.error('Failed to load hero data');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!hero) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...hero, page: currentPage }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Hero section saved successfully');
        setDbStatus('connected');
        setHero(data);
      } else {
        const errorMsg = data.error || 'Failed to save hero section';
        const hint = data.hint ? `\n💡 ${data.hint}` : '';
        const detail = data.detail ? `\n📋 ${data.detail}` : '';
        toast.error(`${errorMsg}${hint}${detail}`, { duration: 8000 });
      }
    } catch (error: any) {
      toast.error(`Network error: ${error?.message || 'Failed to save'}`);
    } finally {
      setSaving(false);
    }
  }

  function handlePageChange(page: string) {
    setCurrentPage(page);
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6"><div className="h-64 bg-muted rounded" /></CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hero Section</h1>
          <p className="text-muted-foreground mt-1">Edit the hero section for each page</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-mitsu-red hover:bg-red-700 text-white">
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Page Selector Tabs */}
      <div className="mb-6">
        <Label className="mb-2 block text-sm font-medium text-muted-foreground">Select Page</Label>
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-muted/50 p-1 gap-1">
          {PAGES.map((p) => (
            <button
              key={p.value}
              onClick={() => handlePageChange(p.value)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${
                currentPage === p.value
                  ? 'bg-mitsu-red text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Database Status Warning */}
      {dbStatus === 'fallback' && (
        <div className="mb-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">Using fallback data</p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              The database is not connected. Changes will not be saved. Please set <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">TURSO_DATABASE_URL</code> and <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">TURSO_AUTH_TOKEN</code> in Vercel environment variables.
            </p>
          </div>
        </div>
      )}

      {!hero ? (
        <div className="text-center py-12 text-muted-foreground">
          No hero section found for <strong>{PAGES.find(p => p.value === currentPage)?.label}</strong> page.{' '}
          <Button variant="link" onClick={() => setHero({
            ...DEFAULT_HERO,
            id: '',
            page: currentPage,
          })}>Create one</Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Preview */}
            {hero.imagePath && (
              <div className="rounded-lg overflow-hidden border bg-muted/30">
                <img
                  src={hero.imagePath}
                  alt="Hero preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hero-title">Title</Label>
                  <Input
                    id="hero-title"
                    value={hero.title}
                    onChange={(e) => setHero({ ...hero, title: e.target.value })}
                    placeholder="Drive Your Ambition"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="hero-subtitle">Subtitle</Label>
                  <Input
                    id="hero-subtitle"
                    value={hero.subtitle}
                    onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                    placeholder="Temukan kendaraan Mitsubishi terbaik..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="hero-cta-text">CTA Button Text</Label>
                  <Input
                    id="hero-cta-text"
                    value={hero.ctaText}
                    onChange={(e) => setHero({ ...hero, ctaText: e.target.value })}
                    placeholder="Lihat Kendaraan"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="hero-cta-link">CTA Button Link</Label>
                  <Input
                    id="hero-cta-link"
                    value={hero.ctaLink}
                    onChange={(e) => setHero({ ...hero, ctaLink: e.target.value })}
                    placeholder="/passenger"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <ImageUpload
                  value={hero.imagePath}
                  onChange={(path) => setHero({ ...hero, imagePath: path })}
                  label="Hero Image"
                />
                <div className="flex items-center gap-3 pt-4">
                  <Switch
                    checked={hero.active}
                    onCheckedChange={(checked) => setHero({ ...hero, active: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
