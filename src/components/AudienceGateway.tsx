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
  headline,
  headlineColor,
  bgClass,
  ctaText,
  ctaColor,
  ctaBorder,
  direction,
}: {
  href: string;
  headline: string;
  headlineColor: string;
  bgClass: string;
  ctaText: string;
  ctaColor: string;
  ctaBorder: string;
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
        <h2
          className="text-6xl sm:text-7xl lg:text-8xl font-black leading-none tracking-tight"
          style={{ color: headlineColor }}
        >
          {headline}
        </h2>

        {/* CTA Bottom Right - outlined square */}
        <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8">
          <div
            className={`border-2 px-5 py-3 sm:px-6 sm:py-3.5 flex items-center gap-2.5 transition-all duration-200 group-hover:gap-3.5`}
            style={{ borderColor: ctaBorder }}
          >
            <span
              className="text-xs sm:text-sm font-bold tracking-[0.15em] uppercase"
              style={{ color: ctaColor }}
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
          headline: isPassenger ? 'PASSENGER' : 'FUSO',
          headlineColor: isPassenger ? '#E60012' : '#FFD600',
          bgClass: isPassenger ? 'bg-black' : 'bg-white',
          ctaText: isPassenger ? 'Jelajahi Lineup' : 'Lihat Armada',
          ctaColor: isPassenger ? '#E60012' : '#FFD600',
          ctaBorder: isPassenger ? '#E60012' : '#FFD600',
          direction: (index % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
        };
      })
    : [
        {
          href: '/passenger',
          headline: 'PASSENGER',
          headlineColor: '#E60012',
          bgClass: 'bg-black',
          ctaText: 'Jelajahi Lineup',
          ctaColor: '#E60012',
          ctaBorder: '#E60012',
          direction: 'left' as const,
        },
        {
          href: '/commercial',
          headline: 'FUSO',
          headlineColor: '#FFD600',
          bgClass: 'bg-white',
          ctaText: 'Lihat Armada',
          ctaColor: '#FFD600',
          ctaBorder: '#FFD600',
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
