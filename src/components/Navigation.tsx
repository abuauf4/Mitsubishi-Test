'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Menu, Search, Phone } from 'lucide-react';
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
function MitsubishiDiamond({ className = 'w-8 h-8 sm:w-10 sm:h-10' }: { className?: string }) {
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
function FusoLogo({ className = 'w-14 h-6 sm:w-16 sm:h-8', color = '#FFD600' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={className} aria-label="FUSO">
      <text x="0" y="30" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="36" fill={color} letterSpacing="2">FUSO</text>
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
  const [scrolled, setScrolled] = useState(false);
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
            setLogoError({});
          }
        }
      } catch {
        // Use defaults
      }
    }
    fetchConfig();
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getConfigValue = (key: string, fallback: string): string => {
    const item = siteConfig.find(c => c.key === key);
    if (!item || !item.value) return fallback;
    return proxyBlobUrl(item.value) || item.value;
  };

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

  // Theme based on page context
  const isCommercialPage = isCommercial;

  // Navbar background — pure black like passenger card, white for commercial
  const navBg = isCommercialPage
    ? scrolled
      ? 'bg-white/95 backdrop-blur-md shadow-sm'
      : 'bg-white'
    : scrolled
      ? 'bg-black/95 backdrop-blur-md'
      : 'bg-black';

  const borderColor = isCommercialPage ? 'border-black/5' : 'border-white/[0.04]';

  // Text colors
  const textColor = isCommercialPage ? 'text-mitsu-dark/60' : 'text-white/60';
  const textHoverColor = isCommercialPage ? 'hover:text-mitsu-fuso-yellow' : 'hover:text-mitsu-red/80';
  const activeTextColor = isCommercialPage ? 'text-mitsu-fuso-yellow' : 'text-mitsu-red';

  // CTA button
  const ctaBtnClass = isCommercialPage
    ? 'btn-fuso-yellow text-mitsu-obsidian'
    : 'btn-mitsu-red text-white';

  // Accent line
  const accentColor = isCommercialPage ? 'bg-mitsu-fuso-yellow/20' : 'bg-mitsu-red/20';

  // Mobile menu button
  const mobileBtnClass = isCommercialPage
    ? 'text-mitsu-dark/70 hover:bg-mitsu-fuso-yellow/5'
    : 'text-white hover:bg-white/10';

  return (
    <>
      <header className="sticky top-0 z-50">
        {/* Announcement bar — red for home/passenger, yellow for commercial */}
        <AnnouncementBar variant={isCommercialPage ? 'commercial' : 'default'} />

        {/* Main navbar */}
        <nav className={`${navBg} shadow-lg transition-all duration-500 border-b ${borderColor}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-20 sm:h-24 lg:h-[88px]">

              {/* Left: Mobile menu button */}
              <div className="flex-1 flex items-center">
                <button
                  onClick={() => setMobileOpen(true)}
                  className={`lg:hidden p-2 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${mobileBtnClass}`}
                  aria-label="Buka menu navigasi"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>

              {/* Center: Logo(s) */}
              <div className="flex-1 flex items-center justify-center">
                <Link href="/" className="flex items-center justify-center group">
                  {isHome ? (
                    /* Home: both logos side by side with divider */
                    <div className="flex items-center gap-4 sm:gap-6">
                      {!logoError['passenger'] ? (
                        <img
                          src={passengerLogoSrc}
                          alt="Mitsubishi"
                          className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                          onError={() => setLogoError(prev => ({ ...prev, passenger: true }))}
                        />
                      ) : (
                        <MitsubishiDiamond className="w-10 h-10 sm:w-12 sm:h-12" />
                      )}
                      <div className="w-px h-10 bg-white/20" />
                      {!logoError['commercial'] ? (
                        <img
                          src={commercialLogoSrc}
                          alt="FUSO"
                          className="w-16 h-7 sm:w-20 sm:h-9 object-contain"
                          onError={() => setLogoError(prev => ({ ...prev, commercial: true }))}
                        />
                      ) : (
                        <FusoLogo className="w-16 h-7 sm:w-20 sm:h-9" color="#FFD600" />
                      )}
                    </div>
                  ) : isPassenger ? (
                    /* Passenger page: Mitsubishi logo only (use image like footer/sidebar) */
                    !logoError['passenger'] ? (
                      <img
                        src={passengerLogoSrc}
                        alt="Mitsubishi"
                        className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                        onError={() => setLogoError(prev => ({ ...prev, passenger: true }))}
                      />
                    ) : (
                      <MitsubishiDiamond className="w-10 h-10 sm:w-12 sm:h-12" />
                    )
                  ) : isCommercial ? (
                    /* Commercial page: FUSO logo only */
                    !logoError['commercial'] ? (
                      <img
                        src={commercialLogoSrc}
                        alt="FUSO"
                        className="w-20 h-8 sm:w-24 sm:h-10 object-contain"
                        onError={() => setLogoError(prev => ({ ...prev, commercial: true }))}
                      />
                    ) : (
                      <FusoLogo className="w-20 h-8 sm:w-24 sm:h-10" color="#FFD600" />
                    )
                  ) : (
                    /* Other pages: Mitsubishi logo (image like footer/sidebar) */
                    !logoError['passenger'] ? (
                      <img
                        src={passengerLogoSrc}
                        alt="Mitsubishi"
                        className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                        onError={() => setLogoError(prev => ({ ...prev, passenger: true }))}
                      />
                    ) : (
                      <MitsubishiDiamond className="w-10 h-10 sm:w-12 sm:h-12" />
                    )
                  )}
                </Link>
              </div>

              {/* Right: Desktop Navigation */}
              <div className="flex-1 flex items-center justify-end">
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
                            ? activeTextColor
                            : `${textColor} ${textHoverColor} hover:bg-white/[0.03]`
                        }`}
                      >
                        {link.label}
                        {isActive && (
                          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full ${
                            isCommercialPage ? 'bg-mitsu-fuso-yellow' : 'bg-mitsu-red'
                          }`} />
                        )}
                      </Link>
                    );
                  })}

                  {/* Search */}
                  <button
                    className={`flex items-center justify-center w-8 h-8 transition-colors ml-2 ${
                      isCommercialPage ? 'text-mitsu-dark/40 hover:text-mitsu-dark' : 'text-white/40 hover:text-white'
                    }`}
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4" />
                  </button>

                  {/* WhatsApp CTA */}
                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Andi,%20saya%20ingin%20bertanya%20tentang%20kendaraan%20Mitsubishi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`ml-4 px-6 py-2.5 ${ctaBtnClass} text-xs font-bold rounded-xl transition-all duration-400 min-h-[44px] flex items-center gap-2`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Hubungi Kami
                  </a>
                </div>

                {/* Mobile: search + CTA (tablet) */}
                <div className="hidden sm:flex lg:hidden items-center gap-2">
                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Andi,%20saya%20ingin%20bertanya%20tentang%20kendaraan%20Mitsubishi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-2 ${ctaBtnClass} text-[10px] font-bold rounded-lg transition-all min-h-[40px] flex items-center gap-1.5`}
                  >
                    <Phone className="w-3 h-3" />
                    <span className="hidden md:inline">Hubungi</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px">
            <div className={`h-full ${accentColor}`} />
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu
            links={navLinks}
            onClose={() => setMobileOpen(false)}
            onNavClick={handleNavClick}
            variant={isCommercialPage ? 'commercial' : 'default'}
          />
        )}
      </AnimatePresence>
    </>
  );
}
