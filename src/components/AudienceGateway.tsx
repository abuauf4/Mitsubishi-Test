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
  direction,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  headline: string;
  subline: string;
  description: string;
  accentColor: string;
  direction: 'left' | 'right';
}) {
  return (
    <Link href={href} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: direction === 'right' ? 0.15 : 0 }}
        viewport={{ once: true, margin: '-60px' }}
        className="relative bg-mitsu-dark min-h-[340px] sm:min-h-[400px] flex flex-col justify-between p-8 sm:p-10 lg:p-12 transition-colors duration-300"
      >
        {/* Top section */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <Icon className="w-5 h-5" style={{ color: accentColor }} />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/50">
              {label}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-white leading-[1.05] tracking-tight mb-4">
            {headline}
            <br />
            <span style={{ color: accentColor }}>{subline}</span>
          </h2>

          <p className="text-white/40 text-sm leading-relaxed max-w-sm">
            {description}
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="flex items-center gap-2 mt-8">
          <span
            className="text-[11px] font-bold tracking-[0.15em] uppercase transition-colors duration-300 group-hover:text-white"
            style={{ color: accentColor }}
          >
            {label === 'Passenger Cars' ? 'Jelajahi Lineup' : 'Lihat Armada'}
          </span>
          <ArrowRight
            className="w-3.5 h-3.5 transition-all duration-300 group-hover:translate-x-1.5"
            style={{ color: accentColor }}
          />
        </div>

        {/* Left accent stripe */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-300 group-hover:w-[5px]"
          style={{ backgroundColor: accentColor }}
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
          headline: isPassenger ? 'Untuk Hidup' : 'Bisnis yang',
          subline: isPassenger ? 'yang Lebih Baik' : 'Lebih Kuat',
          description: cat.description || (isPassenger
            ? 'MPV keluarga, SUV tangguh, hingga kendaraan listrik. Temukan kendaraan yang tepat untuk setiap perjalanan Anda.'
            : 'FUSO Commercial dari Canter hingga Heavy Duty untuk UMKM hingga enterprise.'),
          accentColor: isPassenger ? '#E60012' : '#FFD600',
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className={`grid ${cards.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2'} gap-px bg-white/10`}>
          {cards.map((card, index) => (
            <GatewayCard key={card.href + '-' + index} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
