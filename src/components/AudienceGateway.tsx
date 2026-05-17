'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DBCategory {
  id: string;
  title: string;
  description: string;
  imagePath: string;
  linkHref: string;
  displayOrder: number;
  active: boolean;
}

function GatewayCard({
  href,
  label,
  headline,
  accentColor,
  bgClass,
  textClass,
  borderColor,
  ctaText,
  direction,
}: {
  href: string;
  label: string;
  headline: string;
  accentColor: string;
  bgClass: string;
  textClass: string;
  borderColor: string;
  ctaText: string;
  direction: 'left' | 'right';
}) {
  return (
    <Link href={href} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: direction === 'right' ? 0.1 : 0 }}
        viewport={{ once: true, margin: '-40px' }}
        className={`${bgClass} min-h-[320px] sm:min-h-[400px] lg:min-h-[480px] flex flex-col items-center justify-center relative`}
      >
        {/* Centered Headline */}
        <h2 className={`text-6xl sm:text-7xl lg:text-8xl font-black leading-none tracking-tight ${textClass}`}>
          {headline}
        </h2>

        {/* CTA Bottom Right - outlined square */}
        <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8">
          <div
            className="border-2 px-5 py-3 sm:px-6 sm:py-3.5 flex items-center gap-2.5 transition-all duration-200 group-hover:gap-3.5"
            style={{ borderColor: accentColor }}
          >
            <span
              className="text-xs sm:text-sm font-bold tracking-[0.15em] uppercase"
              style={{ color: accentColor }}
            >
              {ctaText}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function AudienceGateway() {
  const [dbCategories, setDbCategories] = useState<DBCategory[] | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/audience-categories', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setDbCategories(data);
        }
      } catch {
        // Silently fall back
      }
    }
    fetchCategories();
  }, []);

  const cards = dbCategories && dbCategories.length > 0
    ? dbCategories.map((cat, index) => {
        const isPassenger = cat.linkHref.includes('passenger');
        return {
          href: cat.linkHref || (isPassenger ? '/passenger' : '/commercial'),
          label: cat.title || (isPassenger ? 'Passenger Cars' : 'Commercial Vehicles'),
          headline: isPassenger ? 'LIFE.' : 'WORK.',
          accentColor: isPassenger ? '#E60012' : '#FFD600',
          bgClass: isPassenger ? 'bg-black' : 'bg-white',
          textClass: isPassenger ? 'text-white' : 'text-black',
          borderColor: isPassenger ? '#E60012' : '#FFD600',
          ctaText: isPassenger ? 'Jelajahi Lineup' : 'Lihat Armada',
          direction: (index % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
        };
      })
    : [
        {
          href: '/passenger',
          label: 'Passenger Cars',
          headline: 'LIFE.',
          accentColor: '#E60012',
          bgClass: 'bg-black',
          textClass: 'text-white',
          borderColor: '#E60012',
          ctaText: 'Jelajahi Lineup',
          direction: 'left' as const,
        },
        {
          href: '/commercial',
          label: 'Commercial Vehicles',
          headline: 'WORK.',
          accentColor: '#FFD600',
          bgClass: 'bg-white',
          textClass: 'text-black',
          borderColor: '#FFD600',
          ctaText: 'Lihat Armada',
          direction: 'right' as const,
        },
      ];

  return (
    <section id="audience-gateway" className="relative w-full">
      <div className={`grid ${cards.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        {cards.map((card, index) => (
          <GatewayCard key={card.href + '-' + index} {...card} />
        ))}
      </div>
    </section>
  );
}
