'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Settings,
  Image,
  LayoutGrid,
  MessageSquareQuote,
  HeadphonesIcon,
  MapPin,
  Car,
  Menu,
  X,
  ChevronRight,
  Camera,
  Database,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/site-config', label: 'Site Config', icon: Settings },
  { href: '/admin/hero', label: 'Hero', icon: Image },
  { href: '/admin/categories', label: 'Categories', icon: LayoutGrid },
  { href: '/admin/gallery', label: 'Gallery', icon: Camera },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { href: '/admin/sales', label: 'Sales', icon: HeadphonesIcon },
  { href: '/admin/dealers', label: 'Dealers', icon: MapPin },
  { href: '/admin/vehicles', label: 'Vehicles', icon: Car },
  { href: '/admin/migrate', label: 'DB Migration', icon: Database },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-3">
          <img
            src="/mitsubishi-logo.png"
            alt="Mitsubishi Motor Indonesia Logo"
            className="w-10 h-10 object-contain rounded-lg"
          />
          <div>
            <h1 className="text-white font-bold text-sm">MITSUBISHI</h1>
            <p className="text-white/50 text-xs">Motor Indonesia Admin</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-mitsu-red text-white shadow-lg shadow-mitsu-red/25'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
        >
          <span>← Back to Site</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-mitsu-dark p-2 rounded-lg text-white shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 w-64 bg-mitsu-dark/95 backdrop-blur-xl z-50 transform transition-transform lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-mitsu-dark/95 backdrop-blur-xl border-r border-white/10 flex-col flex-shrink-0 min-h-screen">
        {sidebarContent}
      </aside>
    </>
  );
}
