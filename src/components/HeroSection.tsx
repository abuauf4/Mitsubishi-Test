'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import type { HeroData } from '@/lib/fetch-hero';

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
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Helper: proxy blob URLs through /api/image
  const prepareImageUrl = (url: string) => {
    if (!url) return url;
    // Already proxied — don't double-proxy
    if (url.startsWith('/api/image?')) return url;
    // Proxy raw Vercel Blob URLs through /api/image
    if (url.includes('vercel-storage.com') || url.includes('blob.vercel-storage.com')) {
      return `/api/image?url=${encodeURIComponent(url)}`;
    }
    // Local images don't need proxying
    return url;
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
      className="relative w-full overflow-hidden bg-mitsu-obsidian"
    >
      {/* Image — scales naturally with viewport width, NO cropping ever */}
      <div className="relative w-full">
        <Image
          src={imageSrc || fallbackHero.imagePath}
          alt="Mitsubishi Motor Indonesia"
          width={1344}
          height={768}
          priority
          className="w-full h-auto block"
          sizes="100vw"
          unoptimized={(imageSrc || '').startsWith('/api/') || (imageSrc || '').includes('vercel-storage.com')}
          onError={() => {
            // On error, immediately switch to fallback — no SVG placeholder
            setImageSrc('/images/hero-cinematic.png');
          }}
        />

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
      </div>

      {/* Selengkapnya Button — transparent with white outline */}
      <motion.div
        className="absolute bottom-4 sm:bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 z-10"
        style={{ opacity: contentOpacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href={ctaLink}
            onClick={(e) => {
              if (ctaLink.startsWith('#')) {
                e.preventDefault();
                const id = ctaLink.slice(1);
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="group inline-flex items-center gap-2 px-8 py-3 sm:px-10 sm:py-3.5 rounded-xl transition-all duration-500 min-h-[44px] text-sm sm:text-base tracking-wider font-semibold bg-transparent border-2 border-white/60 text-white hover:bg-white/10 hover:border-white min-w-[44px]"
          >
            {hero.ctaText || 'Selengkapnya'}
            <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
          </Link>
        </motion.div>
      </motion.div>

      {/* Bottom red line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-mitsu-red/20 z-[4]" />
    </section>
  );
}
