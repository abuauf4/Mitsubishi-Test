'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Car, Truck } from 'lucide-react';
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
  icon: Icon,
  label,
  headline,
  accentColor,
  bgClass,
  textClass,
  labelClass,
  direction,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  headline: string;
  accentColor: string;
  bgClass: string;
  textClass: string;
  labelClass: string;
  direction: 'left' | 'right';
}) {
  return (
    <Link href={href} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: direction === 'right' ? 0.1 : 0 }}
        viewport={{ once: true, margin: '-40px' }}
        className={`${bgClass} min-h-[320px] sm:min-h-[400px] lg:min-h-[480px] flex flex-col justify-between`}
      >
        {/* Top: Label */}
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4" style={{ color: accentColor }} />
          <span className={`text-[10px] font-bold tracking-[0.25em] uppercase ${labelClass}`}>
            {label}
          </span>
        </div>

        {/* Bottom: Headline + CTA */}
        <div>
          <h2 className={`text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight ${textClass}`}>
            {headline}
          </h2>
          <div className="flex items-center gap-2 mt-4">
            <span
              className="text-[11px] font-bold tracking-[0.15em] uppercase"
              style={{ color: accentColor }}
            >
              {label === 'Passenger Cars' ? 'Jelajahi Lineup' : 'Lihat Armada'}
            </span>
            <ArrowRight
              className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1"
              style={{ color: accentColor }}
            />
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
          icon: isPassenger ? Car : Truck,
          label: cat.title || (isPassenger ? 'Passenger Cars' : 'Commercial Vehicles'),
          headline: isPassenger ? 'LIFE.' : 'WORK.',
          accentColor: isPassenger ? '#E60012' : '#FFD600',
          bgClass: isPassenger ? 'bg-black' : 'bg-white',
          textClass: isPassenger ? 'text-white' : 'text-black',
          labelClass: isPassenger ? 'text-white/40' : 'text-black/40',
          direction: (index % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
        };
      })
    : [
        {
          href: '/passenger',
          icon: Car,
          label: 'Passenger Cars',
          headline: 'LIFE.',
          accentColor: '#E60012',
          bgClass: 'bg-black',
          textClass: 'text-white',
          labelClass: 'text-white/40',
          direction: 'left' as const,
        },
        {
          href: '/commercial',
          icon: Truck,
          label: 'Commercial Vehicles',
          headline: 'WORK.',
          accentColor: '#FFD600',
          bgClass: 'bg-white',
          textClass: 'text-black',
          labelClass: 'text-black/40',
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
