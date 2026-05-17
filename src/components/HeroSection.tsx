'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import type { HeroData } from '@/lib/fetch-hero';
import { proxyBlobUrl } from '@/lib/image-utils';

interface HeroSectionProps {
  initialData?: HeroData;
}

const fallbackHero: HeroData = {
  id: 'static-hero-home',
  title: 'Drive Your Ambition',
  subtitle: 'Temukan kendaraan Mitsubishi terbaik untuk hidup dan bisnis Anda',
  imagePath: '/images/hero-cinematic.png',
  ctaText: 'Selengkapnya',
  ctaLink: '#audience-gateway',
  page: 'home',
  active: true,
};

export default function HeroSection({ initialData }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  // Helper: resolve blob URLs (direct for public, proxy for private)
  const prepareImageUrl = (url: string) => {
    return proxyBlobUrl(url) || url;
  };

  // Start with server-provided data if available, otherwise fallback
  const startData = initialData || fallbackHero;
  const startImage = initialData
    ? prepareImageUrl(initialData.imagePath)
    : fallbackHero.imagePath;

  const [hero, setHero] = useState<HeroData>(startData);
  const [imageSrc, setImageSrc] = useState<string>(startImage);

  useEffect(() => {
    // If we already have server data, skip the fetch (unless it's static fallback)
    if (initialData && !initialData.id?.startsWith('static-')) return;

    async function fetchHero() {
      try {
        const res = await fetch('/api/hero?page=home', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.imagePath) {
          const preparedUrl = prepareImageUrl(data.imagePath);
          setHero({
            id: data.id || fallbackHero.id,
            title: data.title || fallbackHero.title,
            subtitle: data.subtitle || fallbackHero.subtitle,
            imagePath: preparedUrl,
            ctaText: data.ctaText || fallbackHero.ctaText,
            ctaLink: data.ctaLink || fallbackHero.ctaLink,
            page: data.page || fallbackHero.page,
            active: data.active ?? fallbackHero.active,
          });
          setImageSrc(preparedUrl);
        }
      } catch {
        // Keep fallback data — already set as initial state
      }
    }
    fetchHero();
  }, [initialData]);

  const ctaLink = hero.ctaLink || '#audience-gateway';

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative w-full overflow-hidden bg-black"
    >
      {/* 
        Desktop: full viewport width, image scales naturally
        Mobile: fixed min-height so it's not too short, image fully visible (no crop)
      */}
      <div className="relative w-full min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh]">
        <Image
          src={imageSrc || fallbackHero.imagePath}
          alt="Mitsubishi Motor Indonesia"
          width={1920}
          height={1080}
          priority
          className="w-full h-auto block"
          sizes="100vw"
          unoptimized={(imageSrc || '').startsWith('/api/') || (imageSrc || '').includes('vercel-storage.com')}
          onError={() => {
            setImageSrc('/images/hero-cinematic.png');
          }}
        />

        {/* Bottom gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Selengkapnya Button */}
      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-10">
        <Link
          href={ctaLink}
          onClick={(e) => {
            if (ctaLink.startsWith('#')) {
              e.preventDefault();
              const id = ctaLink.slice(1);
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="group inline-flex items-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3 transition-all duration-300 text-sm sm:text-base tracking-wider font-semibold bg-transparent border border-white/50 text-white hover:bg-white/10 hover:border-white min-w-[44px] min-h-[44px]"
        >
          {hero.ctaText || 'Selengkapnya'}
          <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
        </Link>
      </div>

      {/* Bottom red line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-mitsu-red z-10" />
    </section>
  );
}
