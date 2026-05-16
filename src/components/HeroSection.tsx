'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Phone, Car } from 'lucide-react';
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
  ctaText: 'Konsultasi Promo Hari Ini',
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
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

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
      className="relative w-full overflow-hidden bg-mitsu-obsidian min-h-[70vh] sm:min-h-[80vh] lg:min-h-screen"
    >
      {/* Cinematic background image with parallax scale */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{ scale: imageScale }}
      >
        <Image
          src={imageSrc || fallbackHero.imagePath}
          alt="Mitsubishi Motor Indonesia"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          unoptimized={(imageSrc || '').startsWith('/api/') || (imageSrc || '').includes('vercel-storage.com')}
          onError={() => {
            setImageSrc('/images/hero-cinematic.png');
          }}
        />
      </motion.div>

      {/* Cinematic vignette overlay - dark edges for premium feel */}
      <div className="absolute inset-0 vignette pointer-events-none z-[1]" />

      {/* Dark gradient overlay - strong from left for text readability */}
      <div className="absolute inset-0 hero-gradient-cinematic pointer-events-none z-[2]" />

      {/* Subtle carbon fiber texture overlay */}
      <div className="absolute inset-0 carbon-fiber opacity-30 pointer-events-none z-[2]" />

      {/* Content overlay */}
      <motion.div
        className="absolute inset-0 z-10 flex flex-col justify-end pb-20 sm:pb-24 lg:pb-28 px-6 sm:px-12 lg:px-20"
        style={{ opacity: contentOpacity }}
      >
        <div className="max-w-3xl">
          {/* Brand tag */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="h-[2px] w-8 bg-[#D6001C]" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.3em] uppercase text-white/50">
              Mitsubishi Motor Indonesia
            </span>
          </motion.div>

          {/* Main title - bold, masculine typography */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[0.95] text-white mb-4"
          >
            {hero.title || 'Drive Your Ambition'}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base lg:text-lg text-white/60 max-w-xl mb-8 leading-relaxed font-light"
          >
            {hero.subtitle || 'Temukan kendaraan Mitsubishi terbaik untuk hidup dan bisnis Anda'}
          </motion.p>

          {/* CTA Buttons - Premium, urgent, masculine */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
          >
            {/* Primary CTA - Bold red */}
            <a
              href="https://wa.me/6281234567890?text=Halo%20Andi,%20saya%20ingin%20konsultasi%20promo%20Mitsubishi%20hari%20ini"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium-cta px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm inline-flex items-center gap-2.5 min-h-[48px]"
            >
              <Phone className="w-4 h-4" />
              Konsultasi Promo Hari Ini
            </a>

            {/* Secondary CTA - Dark outline */}
            <Link
              href="/passenger"
              className="btn-premium-dark px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm inline-flex items-center gap-2.5 min-h-[48px]"
            >
              <Car className="w-4 h-4" />
              Lihat Semua Model
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
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
          className="flex flex-col items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors duration-300 group"
        >
          <span className="text-[9px] tracking-[0.25em] uppercase font-medium">Scroll</span>
          <ChevronDown className="w-4 h-4 scroll-indicator" />
        </Link>
      </motion.div>

      {/* Bottom red accent line - subtle but premium */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D6001C]/40 to-transparent z-[4]" />
    </section>
  );
}
