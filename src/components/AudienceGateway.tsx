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
  subline,
  description,
  accentColor,
  bgClass,
  textClass,
  subtextClass,
  descriptionClass,
  ctaHoverClass,
  direction,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  headline: string;
  subline: string;
  description: string;
  accentColor: string;
  bgClass: string;
  textClass: string;
  subtextClass: string;
  descriptionClass: string;
  ctaHoverClass: string;
  direction: 'left' | 'right';
}) {
  return (
    <Link href={href} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: direction === 'right' ? 0.1 : 0 }}
        viewport={{ once: true, margin: '-40px' }}
        className={`${bgClass} min-h-[300px] sm:min-h-[360px] flex flex-col justify-between`}
      >
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Icon className="w-5 h-5" style={{ color: accentColor }} />
            <span className={`text-[11px] font-bold tracking-[0.2em] uppercase ${descriptionClass}`}>
              {label}
            </span>
          </div>

          <h2 className={`text-3xl sm:text-4xl lg:text-[44px] font-black leading-[1.05] tracking-tight mb-3 ${textClass}`}>
            {headline}
            <br />
            <span style={{ color: accentColor }}>{subline}</span>
          </h2>

          <p className={`text-sm leading-relaxed max-w-sm ${descriptionClass}`}>
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-8">
          <span
            className={`text-[11px] font-bold tracking-[0.15em] uppercase transition-colors duration-200 ${ctaHoverClass}`}
            style={{ color: accentColor }}
          >
            {label === 'Passenger Cars' ? 'Jelajahi Lineup' : 'Lihat Armada'}
          </span>
          <ArrowRight
            className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1"
            style={{ color: accentColor }}
          />
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
          headline: isPassenger ? 'Untuk Hidup' : 'Bisnis yang',
          subline: isPassenger ? 'yang Lebih Baik' : 'Lebih Kuat',
          description: cat.description || (isPassenger
            ? 'MPV keluarga, SUV tangguh, hingga kendaraan listrik. Temukan kendaraan yang tepat untuk setiap perjalanan Anda.'
            : 'FUSO Commercial dari Canter hingga Heavy Duty untuk UMKM hingga enterprise.'),
          accentColor: isPassenger ? '#E60012' : '#FFD600',
          bgClass: isPassenger ? 'bg-black' : 'bg-white',
          textClass: isPassenger ? 'text-white' : 'text-black',
          subtextClass: isPassenger ? 'text-white' : 'text-black',
          descriptionClass: isPassenger ? 'text-white/40' : 'text-black/40',
          ctaHoverClass: isPassenger ? 'group-hover:text-white' : 'group-hover:text-black',
          direction: (index % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
        };
      })
    : [
        {
          href: '/passenger',
          icon: Car,
          label: 'Passenger Cars',
          headline: 'Untuk Hidup',
          subline: 'yang Lebih Baik',
          description: 'MPV keluarga, SUV tangguh, hingga kendaraan listrik. Temukan kendaraan yang tepat untuk setiap perjalanan Anda.',
          accentColor: '#E60012',
          bgClass: 'bg-black',
          textClass: 'text-white',
          subtextClass: 'text-white',
          descriptionClass: 'text-white/40',
          ctaHoverClass: 'group-hover:text-white',
          direction: 'left' as const,
        },
        {
          href: '/commercial',
          icon: Truck,
          label: 'Commercial Vehicles',
          headline: 'Bisnis yang',
          subline: 'Lebih Kuat',
          description: 'FUSO Commercial dari Canter hingga Heavy Duty untuk UMKM hingga enterprise.',
          accentColor: '#FFD600',
          bgClass: 'bg-white',
          textClass: 'text-black',
          subtextClass: 'text-black',
          descriptionClass: 'text-black/40',
          ctaHoverClass: 'group-hover:text-black',
          direction: 'right' as const,
        },
      ];

  return (
    <section id="audience-gateway" className="relative w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-4">
        <div className="text-center">
          <p className="text-mitsu-red text-[11px] font-bold tracking-[0.25em] uppercase mb-3">
            Pilih Kategori
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-mitsu-dark">
            Temukan Kendaraan Anda
          </h2>
        </div>
      </div>

      <div className={`grid ${cards.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
        {cards.map((card, index) => (
          <GatewayCard key={card.href + '-' + index} {...card} />
        ))}
      </div>
    </section>
  );
}
