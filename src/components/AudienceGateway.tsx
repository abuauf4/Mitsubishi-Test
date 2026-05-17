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
  titleLine1,
  titleLine2,
  description,
  accentBg,
  accentColor,
  accentBorder,
  hoverBg,
  ctaText,
  direction,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  accentBg: string;
  accentColor: string;
  accentBorder: string;
  hoverBg: string;
  ctaText: string;
  direction: 'left' | 'right';
}) {
  return (
    <Link href={href} className="block">
      <motion.div
        initial={{ opacity: 0, x: direction === 'left' ? -60 : 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, margin: '-80px' }}
        className={`group relative flex flex-col justify-between min-h-[320px] sm:min-h-[380px] p-8 sm:p-10 lg:p-12 rounded-2xl border-2 ${accentBorder} bg-white transition-all duration-500 hover:${accentBg} hover:shadow-2xl overflow-hidden`}
      >
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 transition-all duration-500 group-hover:h-1.5"
          style={{ backgroundColor: accentColor }}
        />

        {/* Background decorative element */}
        <div
          className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="absolute -left-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500"
          style={{ backgroundColor: accentColor }}
        />

        {/* Icon + Label */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <Icon
                className="w-6 h-6 transition-colors duration-500"
                style={{ color: accentColor }}
              />
            </div>
            <span
              className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase transition-colors duration-500"
              style={{ color: accentColor }}
            >
              {label}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-mitsu-dark leading-[1.1] mb-4 tracking-tight">
            {titleLine1}
            <br />
            <span className="transition-colors duration-500 group-hover:text-mitsu-dark" style={{ color: accentColor }}>
              {titleLine2}
            </span>
          </h2>

          {/* Description */}
          <p className="text-mitsu-dark/50 text-sm sm:text-base max-w-md leading-relaxed transition-colors duration-500 group-hover:text-mitsu-dark/70">
            {description}
          </p>
        </div>

        {/* CTA Button */}
        <div className="relative z-10 mt-8 flex items-center gap-3">
          <div
            className="flex items-center gap-2.5 px-5 py-3 rounded-lg font-bold text-xs sm:text-sm tracking-[0.1em] uppercase text-white transition-all duration-500 group-hover:gap-4 group-hover:shadow-lg"
            style={{ backgroundColor: accentColor }}
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Corner accent */}
        <div
          className="absolute bottom-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-all duration-500"
          style={{
            background: `linear-gradient(135deg, transparent 50%, ${accentColor}08 50%)`,
          }}
        />
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
          titleLine1: isPassenger ? 'Untuk Hidup' : 'Bisnis yang',
          titleLine2: isPassenger ? 'yang Lebih Baik' : 'Lebih Kuat',
          description: cat.description || (isPassenger
            ? 'MPV keluarga, SUV tangguh, hingga kendaraan listrik. Temukan kendaraan yang tepat untuk setiap perjalanan Anda.'
            : 'FUSO Commercial dari Canter hingga Heavy Duty untuk UMKM hingga enterprise.'),
          accentBg: isPassenger ? 'bg-mitsu-red/5' : 'bg-[#FFD600]/5',
          accentColor: isPassenger ? '#E60012' : '#FFD600',
          accentBorder: isPassenger ? 'border-mitsu-red/20 hover:border-mitsu-red' : 'border-[#FFD600]/30 hover:border-[#FFD600]',
          hoverBg: isPassenger ? 'bg-mitsu-red/5' : 'bg-[#FFD600]/5',
          ctaText: isPassenger ? 'Jelajahi Lineup' : 'Lihat Armada',
          direction: (index % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
        };
      })
    : [
        {
          href: '/passenger',
          icon: Car,
          label: 'Passenger Cars',
          titleLine1: 'Untuk Hidup',
          titleLine2: 'yang Lebih Baik',
          description: 'MPV keluarga, SUV tangguh, hingga kendaraan listrik. Temukan kendaraan yang tepat untuk setiap perjalanan Anda.',
          accentBg: 'bg-mitsu-red/5',
          accentColor: '#E60012',
          accentBorder: 'border-mitsu-red/20 hover:border-mitsu-red',
          hoverBg: 'bg-mitsu-red/5',
          ctaText: 'Jelajahi Lineup',
          direction: 'left' as const,
        },
        {
          href: '/commercial',
          icon: Truck,
          label: 'Commercial Vehicles',
          titleLine1: 'Bisnis yang',
          titleLine2: 'Lebih Kuat',
          description: 'FUSO Commercial dari Canter hingga Heavy Duty untuk UMKM hingga enterprise.',
          accentBg: 'bg-[#FFD600]/5',
          accentColor: '#FFD600',
          accentBorder: 'border-[#FFD600]/30 hover:border-[#FFD600]',
          hoverBg: 'bg-[#FFD600]/5',
          ctaText: 'Lihat Armada',
          direction: 'right' as const,
        },
      ];

  return (
    <section id="audience-gateway" className="relative w-full bg-white">
      <div className="h-px bg-gray-200" />

      {/* Section label */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-3 text-mitsu-red text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase">
            <span className="w-10 h-px bg-mitsu-red/50" />
            Pilih Kategori
            <span className="w-10 h-px bg-mitsu-red/50" />
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-mitsu-dark font-serif">
            Temukan Kendaraan <span className="text-mitsu-red">Anda</span>
          </h2>
        </motion.div>
      </div>

      {/* Cards Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
        <div className={`grid ${cards.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2'} gap-5 sm:gap-6`}>
          {cards.map((card, index) => (
            <GatewayCard key={card.href + '-' + index} {...card} />
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-200" />
    </section>
  );
}
