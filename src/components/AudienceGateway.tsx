'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { proxyBlobUrl } from '@/lib/image-utils';

interface DBCategory {
  id: string;
  title: string;
  description: string;
  imagePath: string;
  linkHref: string;
  displayOrder: number;
  active: boolean;
}

/**
 * Category section — "LIFE." and "WORK." split design.
 *
 * Top half: White background, bold "LIFE." → Passenger Cars
 * Bottom half: Dark background with subtle vehicle image, bold "WORK." → Commercial Fleet
 *
 * Inspired by premium automotive brand sites — minimal, bold, confident.
 */
export default function AudienceGateway() {
  const [dbCategories, setDbCategories] = useState<DBCategory[] | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/audience-categories', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const hasRealImages = data.some((cat: DBCategory) => cat.imagePath && !cat.imagePath.startsWith('/images/'));
          if (hasRealImages || !data[0]?.id?.startsWith('static')) {
            setDbCategories(data);
          }
        }
      } catch {
        // Silently fall back to defaults
      }
    }
    fetchCategories();
  }, []);

  // Resolve blob URLs
  const proxyImage = (url: string) => proxyBlobUrl(url) || '';

  // Determine image for each section
  const passengerImage = dbCategories?.find(c => c.linkHref?.includes('passenger'))
    ? proxyImage(dbCategories.find(c => c.linkHref?.includes('passenger'))!.imagePath) || '/images/xpander.png'
    : '/images/xpander.png';

  const commercialImage = dbCategories?.find(c => c.linkHref?.includes('commercial'))
    ? proxyImage(dbCategories.find(c => c.linkHref?.includes('commercial'))!.imagePath) || '/images/l300.png'
    : '/images/l300.png';

  return (
    <section id="audience-gateway" className="relative w-full">
      {/* ═══════════════════════════════════════════ */}
      {/* LIFE — Passenger Cars (White)              */}
      {/* ═══════════════════════════════════════════ */}
      <Link href="/passenger" className="block group">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-50px' }}
          className="relative bg-white overflow-hidden"
        >
          {/* Subtle background image — very low opacity */}
          <div className="absolute inset-0 opacity-[0.04]">
            <Image
              src={passengerImage}
              alt=""
              fill
              className="object-cover object-center"
              unoptimized={passengerImage.startsWith('/api/') || passengerImage.includes('vercel-storage.com')}
            />
          </div>

          {/* Red accent line on hover */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-mitsu-red scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />

          <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-20 lg:py-28">
            {/* Category number + label */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-mitsu-red uppercase">
                01_Passenger
              </span>
              <span className="flex-1 h-px bg-mitsu-red/20 max-w-[80px]" />
            </div>

            {/* Big title */}
            <h2 className="text-6xl sm:text-7xl lg:text-[120px] font-black text-mitsu-dark leading-[0.85] tracking-tight">
              LIFE<span className="text-mitsu-red">.</span>
            </h2>

            {/* Subtitle */}
            <p className="mt-4 sm:mt-6 text-sm sm:text-base text-gray-500 max-w-md leading-relaxed">
              MPV keluarga, SUV tangguh, hingga kendaraan listrik. Temukan kendaraan yang tepat untuk setiap perjalanan Anda.
            </p>

            {/* CTA */}
            <div className="mt-6 sm:mt-8 flex items-center gap-3 group/cta">
              <span className="text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase text-mitsu-dark group-hover/cta:text-mitsu-red transition-colors duration-300">
                Jelajahi Lineup
              </span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-mitsu-dark/20 group-hover/cta:border-mitsu-red group-hover/cta:bg-mitsu-red flex items-center justify-center transition-all duration-300">
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-mitsu-dark/40 group-hover/cta:text-white transition-all duration-300 group-hover/cta:translate-x-0.5" />
              </div>
            </div>
          </div>

          {/* Bottom separator */}
          <div className="h-px bg-gray-200" />
        </motion.div>
      </Link>

      {/* ═══════════════════════════════════════════ */}
      {/* WORK — Commercial Fleet (Dark)             */}
      {/* ═══════════════════════════════════════════ */}
      <Link href="/commercial" className="block group">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          viewport={{ once: true, margin: '-50px' }}
          className="relative bg-[#0A0A0A] overflow-hidden"
        >
          {/* Background vehicle image — subtle */}
          <div className="absolute inset-0 opacity-[0.08]">
            <Image
              src={commercialImage}
              alt=""
              fill
              className="object-cover object-center"
              unoptimized={commercialImage.startsWith('/api/') || commercialImage.includes('vercel-storage.com')}
            />
          </div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Red accent line on hover */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-mitsu-red scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />

          <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-20 lg:py-28">
            {/* Category number + label */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-mitsu-red uppercase">
                02_Commercial_Fleet
              </span>
              <span className="flex-1 h-px bg-mitsu-red/30 max-w-[80px]" />
            </div>

            {/* Big title */}
            <h2 className="text-6xl sm:text-7xl lg:text-[120px] font-black text-white leading-[0.85] tracking-tight">
              WORK<span className="text-mitsu-red">.</span>
            </h2>

            {/* Subtitle */}
            <p className="mt-4 sm:mt-6 text-sm sm:text-base text-gray-500 max-w-md leading-relaxed">
              FUSO Commercial dari Canter hingga Heavy Duty. Solusi niaga untuk UMKM hingga enterprise.
            </p>

            {/* CTA */}
            <div className="mt-6 sm:mt-8 flex items-center gap-3 group/cta">
              <span className="text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase text-white/60 group-hover/cta:text-mitsu-red transition-colors duration-300">
                Lihat Armada
              </span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white/15 group-hover/cta:border-mitsu-red group-hover/cta:bg-mitsu-red flex items-center justify-center transition-all duration-300">
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/30 group-hover/cta:text-white transition-all duration-300 group-hover/cta:translate-x-0.5" />
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </section>
  );
}
