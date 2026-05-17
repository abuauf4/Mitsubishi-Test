'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import MobileMenu from './MobileMenu';
import AnnouncementBar from './AnnouncementBar';
import { proxyBlobUrl } from '@/lib/image-utils';

const navLinks = [
  { label: 'Home', href: '/', isRoute: true },
  { label: 'Passenger Cars', href: '/passenger', isRoute: true },
  { label: 'Commercial Vehicles', href: '/commercial', isRoute: true },
  { label: 'Bandingkan', href: '/compare', isRoute: true },
  { label: 'Promo', href: '/#promo', isRoute: false },
  { label: 'Sales Consultant', href: '/#sales', isRoute: false },
  { label: 'Test Drive', href: '/#test-drive', isRoute: false },
];

// Default Mitsubishi 3-diamond SVG as fallback
function MitsubishiDiamond({ className = 'w-7 h-7 sm:w-8 sm:h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-label="Mitsubishi">
      <g transform="translate(50, 50)">
        <polygon fill="#E60012" points="0,-34 -12,-10 0,0 12,-10" />
        <polygon fill="#E60012" points="12,-10 0,0 12,22 24,0" />
        <polygon fill="#E60012" points="-12,-10 0,0 -12,22 -24,0" />
      </g>
    </svg>
  );
}

// Default FUSO logo as fallback (yellow text-based)
function FusoLogo({ className = 'w-7 h-7 sm:w-8 sm:h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={className} aria-label="FUSO">
      <text x="0" y="30" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="36" fill="#FFD600" letterSpacing="2">FUSO</text>
    </svg>
  );
}

interface SiteConfigItem {
  id: string;
  key: string;
  value: string;
  type: string;
  page: string;
}

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [siteConfig, setSiteConfig] = useState<SiteConfigItem[]>([]);
  const [logoError, setLogoError] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/site-config', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setSiteConfig(data);
            // Reset logo errors when config changes
            setLogoError({});
          }
        }
      } catch {
        // Use defaults
      }
    }
    fetchConfig();
  }, [pathname]);

  // Resolve image URL from config — for public blobs, return directly
  // For private blobs, route through /api/image proxy
  const getConfigValue = (key: string, fallback: string): string => {
    const item = siteConfig.find(c => c.key === key);
    if (!item || !item.value) return fallback;
    return proxyBlobUrl(item.value) || item.value;
  };

  // Check if a logo has a custom uploaded value (not the default)
  const hasCustomLogo = (key: string): boolean => {
    const item = siteConfig.find(c => c.key === key);
    return !!(item && item.value && item.value !== '/mitsubishi-logo.png' && item.value !== '');
  };

  // Determine which logos to show based on route
  const isPassenger = pathname.startsWith('/passenger');
  const isCommercial = pathname.startsWith('/commercial');
  const isHome = pathname === '/';

  const passengerLogoSrc = getConfigValue('logo_passenger', '/mitsubishi-logo.png');
  const commercialLogoSrc = getConfigValue('logo_commercial', '/mitsubishi-logo.png');

  const hasPassengerLogo = hasCustomLogo('logo_passenger') && !logoError['passenger'];
  const hasCommercialLogo = hasCustomLogo('logo_commercial') && !logoError['commercial'];

  const handleNavClick = useCallback((href: string, isRoute: boolean) => {
    setMobileOpen(false);
    if (isRoute) return;
    const hash = href.includes('#') ? href.split('#')[1] : null;
    if (hash) {
      if (pathname !== '/' && !href.startsWith(pathname)) {
        router.push('/#' + hash);
      } else {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [pathname, router]);

  return (
    <>
      <header className="sticky top-0 z-50">
        {/* Red marquee announcement bar */}
        <AnnouncementBar />

        {/* Main navbar */}
        <nav className="bg-mitsu-dark shadow-lg">
          {/* Red accent line at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-px">
            <div className="h-full bg-mitsu-red/20" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Logo - dynamic based on route */}
              <Link href="/" className="flex items-center gap-3 group">
                {isHome ? (
                  /* Home: show both Mitsubishi + FUSO logos */
                  <>
                    <div className="flex items-center gap-3">
                      {hasPassengerLogo ? (
                        <img
                          src={passengerLogoSrc}
                          alt="Mitsubishi"
                          className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                          onError={() => setLogoError(prev => ({ ...prev, passenger: true }))}
                        />
                      ) : (
                        <MitsubishiDiamond />
                      )}
                      <span className="text-[13px] sm:text-sm font-bold tracking-[0.3em] uppercase text-white">
                        MITSUBISHI
                      </span>
                    </div>
                    <div className="w-px h-6 bg-white/20" />
                    <div className="flex items-center gap-2">
                      {hasCommercialLogo ? (
                        <img
                          src={commercialLogoSrc}
                          alt="FUSO"
                          className="w-10 h-5 sm:w-12 sm:h-6 object-contain"
                          onError={() => setLogoError(prev => ({ ...prev, commercial: true }))}
                        />
                      ) : (
                        <FusoLogo />
                      )}
                    </div>
                  </>
                ) : isPassenger ? (
                  /* Passenger page: Mitsubishi logo only */
                  <div className="flex items-center gap-3">
                    {hasPassengerLogo ? (
                      <img
                        src={passengerLogoSrc}
                        alt="Mitsubishi"
                        className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                        onError={() => setLogoError(prev => ({ ...prev, passenger: true }))}
                      />
                    ) : (
                      <MitsubishiDiamond />
                    )}
                    <span className="text-[13px] sm:text-sm font-bold tracking-[0.3em] uppercase text-white">
                      MITSUBISHI
                    </span>
                  </div>
                ) : isCommercial ? (
                  /* Commercial page: FUSO logo only */
                  <div className="flex items-center gap-2">
                    {hasCommercialLogo ? (
                      <img
                        src={commercialLogoSrc}
                        alt="FUSO"
                        className="w-12 h-6 sm:w-16 sm:h-8 object-contain"
                        onError={() => setLogoError(prev => ({ ...prev, commercial: true }))}
                      />
                    ) : (
                      <FusoLogo className="w-16 h-8 sm:w-20 sm:h-10" />
                    )}
                    <span className="text-[13px] sm:text-sm font-bold tracking-[0.2em] uppercase text-[#FFD600]">
                      FUSO
                    </span>
                  </div>
                ) : (
                  /* Other pages: Mitsubishi default */
                  <div className="flex items-center gap-3">
                    <MitsubishiDiamond />
                    <span className="text-[13px] sm:text-sm font-bold tracking-[0.3em] uppercase text-white">
                      MITSUBISHI
                    </span>
                  </div>
                )}
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (link.isRoute && pathname === link.href);
                  return (
                    <Link
                      key={link.href + link.label}
                      href={link.href}
                      onClick={() => handleNavClick(link.href, link.isRoute)}
                      className={`relative px-4 py-2 text-[11px] font-semibold tracking-[0.15em] uppercase transition-all duration-400 rounded-lg group ${
                        isActive
                          ? 'text-mitsu-red'
                          : 'text-white/60 hover:text-mitsu-red/80 hover:bg-white/[0.03]'
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-mitsu-red rounded-full" />
                      )}
                    </Link>
                  );
                })}

                {/* WhatsApp CTA */}
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Andi,%20saya%20ingin%20bertanya%20tentang%20kendaraan%20Mitsubishi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 px-6 py-2.5 btn-mitsu-red text-xs font-bold rounded-xl transition-all duration-400 min-h-[44px] flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Hubungi Kami
                </a>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:bg-white/10"
                aria-label="Buka menu navigasi"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu
            links={navLinks}
            onClose={() => setMobileOpen(false)}
            onNavClick={handleNavClick}
          />
        )}
      </AnimatePresence>
    </>
  );
}
