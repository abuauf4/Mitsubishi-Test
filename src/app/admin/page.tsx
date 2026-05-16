'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, MessageSquareQuote, MapPin, Settings, Users, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  vehicles: number;
  testimonials: number;
  dealers: number;
  configs: number;
  categories: number;
  heroes: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [vehicles, testimonials, dealers, configs, categories, heroes] = await Promise.all([
          fetch('/api/admin/vehicles').then(r => r.json()),
          fetch('/api/admin/testimonials').then(r => r.json()),
          fetch('/api/admin/dealer-locations').then(r => r.json()),
          fetch('/api/admin/site-config').then(r => r.json()),
          fetch('/api/admin/audience-categories').then(r => r.json()),
          fetch('/api/admin/hero').then(r => r.json()),
        ]);
        setStats({
          vehicles: Array.isArray(vehicles) ? vehicles.length : 0,
          testimonials: Array.isArray(testimonials) ? testimonials.length : 0,
          dealers: Array.isArray(dealers) ? dealers.length : 0,
          configs: Array.isArray(configs) ? configs.length : 0,
          categories: Array.isArray(categories) ? categories.length : 0,
          heroes: heroes ? 1 : 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cards = stats ? [
    { label: 'Vehicles', value: stats.vehicles, icon: Car, href: '/admin/vehicles', color: 'bg-mitsu-red' },
    { label: 'Testimonials', value: stats.testimonials, icon: MessageSquareQuote, href: '/admin/testimonials', color: 'bg-blue-600' },
    { label: 'Dealer Locations', value: stats.dealers, icon: MapPin, href: '/admin/dealers', color: 'bg-emerald-600' },
    { label: 'Site Configs', value: stats.configs, icon: Settings, href: '/admin/site-config', color: 'bg-mitsu-onyx' },
    { label: 'Categories', value: stats.categories, icon: Users, href: '/admin/categories', color: 'bg-amber-600' },
    { label: 'Hero Section', value: stats.heroes ? 'Active' : 'None', icon: ImageIcon, href: '/admin/hero', color: 'bg-rose-600' },
  ] : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to Mitsubishi Motor Indonesia Admin Panel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))
        ) : (
          cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.label} href={card.href}>
                <Card className="hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`${card.color} p-3 rounded-xl text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{card.label}</p>
                        <p className="text-2xl font-bold text-foreground">{card.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/vehicles">
            <Card className="hover:shadow-md transition-all cursor-pointer p-4">
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-mitsu-red" />
                <span className="text-sm font-medium">Manage Vehicles</span>
              </div>
            </Card>
          </Link>
          <Link href="/admin/testimonials">
            <Card className="hover:shadow-md transition-all cursor-pointer p-4">
              <div className="flex items-center gap-3">
                <MessageSquareQuote className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Edit Testimonials</span>
              </div>
            </Card>
          </Link>
          <Link href="/admin/site-config">
            <Card className="hover:shadow-md transition-all cursor-pointer p-4">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-mitsu-onyx" />
                <span className="text-sm font-medium">Site Settings</span>
              </div>
            </Card>
          </Link>
          <Link href="/admin/hero">
            <Card className="hover:shadow-md transition-all cursor-pointer p-4">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-rose-600" />
                <span className="text-sm font-medium">Edit Hero</span>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
