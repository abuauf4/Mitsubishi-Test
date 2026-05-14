'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';

interface HeroData {
  title: string;
  subtitle: string;
  imagePath: string;
  ctaText: string;
  ctaLink: string;
}

const fallbackHero: HeroData = {
  title: 'Drive Your Ambition',
  subtitle: 'Temukan kendaraan Mitsubishi terbaik untuk hidup dan bisnis Anda',
  imagePath: '/images/hero-cinematic.png',
  ctaText: 'Selengkapnya',
  ctaLink: '#audience-gateway',
};

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const [hero, setHero] = useState<HeroData>(fallbackHero);
  const [imageSrc, setImageSrc] = useState<string | null>(null); // null = still loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHero() {
      try {
        const res = await fetch('/api/hero');
        if (!res.ok) {
          setImageSrc(fallbackHero.imagePath);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (data && data.imagePath) {
          setHero({
            title: data.title || fallbackHero.title,
            subtitle: data.subtitle || fallbackHero.subtitle,
            imagePath: data.imagePath,
            ctaText: data.ctaText || fallbackHero.ctaText,
            ctaLink: data.ctaLink || fallbackHero.ctaLink,
          });
          setImageSrc(data.imagePath);
        } else {
          setImageSrc(fallbackHero.imagePath);
        }
      } catch {
        setImageSrc(fallbackHero.imagePath);
      } finally {
        setLoading(false);
      }
    }
    fetchHero();
  }, []);

  const ctaLink = hero.ctaLink || '#audience-gateway';

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative w-full overflow-hidden bg-mitsu-obsidian"
    >
      {/* Image — scales naturally with viewport width, NO cropping ever */}
      <div className="relative w-full">
        {loading ? (
          // Skeleton placeholder while loading — no flash of old image
          <div className="w-full h-[50vh] sm:h-[60vh] lg:h-[75vh] bg-mitsu-obsidian animate-pulse" />
        ) : (
          <Image
            src={imageSrc || fallbackHero.imagePath}
            alt="Mitsubishi Motor Indonesia"
            width={1344}
            height={768}
            priority
            className="w-full h-auto block"
            sizes="100vw"
            unoptimized={(imageSrc || '').startsWith('/api/')}
            onError={() => {
              setImageSrc('/images/hero-cinematic.png');
            }}
          />
        )}

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 pointer-events-none" />
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
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mitsu-red/20 to-transparent z-[4]" />
    </section>
  );
}
