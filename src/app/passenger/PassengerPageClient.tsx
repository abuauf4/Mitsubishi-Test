'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Car, Sparkles } from 'lucide-react';
import PageHero from '@/components/shared/PageHero';
import VehicleCard from '@/components/shared/VehicleCard';
import { VehicleData } from '@/data/vehicles';

interface Props {
  vehicles: VehicleData[];
}

export default function PassengerPageClient({ vehicles }: Props) {
  const [heroImage, setHeroImage] = useState('/images/xpander.png');
  const [heroTitle, setHeroTitle] = useState('Passenger Cars Mitsubishi');
  const [heroSubtitle, setHeroSubtitle] = useState('Dari MPV keluarga hingga SUV premium. Temukan kendaraan yang tepat untuk setiap perjalanan Anda.');

  // Helper: proxy blob URLs and add cache-busting
  const prepareImageUrl = (url: string) => {
    if (!url) return url;
    if (url.includes('vercel-storage.com') || url.includes('blob.vercel-storage.com')) {
      return `/api/image?url=${encodeURIComponent(url)}&_t=${Date.now()}&_cb=${Math.random()}`;
    }
    if (url.startsWith('/api/')) {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}_t=${Date.now()}`;
    }
    return url;
  };

  useEffect(() => {
    async function fetchHero() {
      try {
        const res = await fetch(`/api/hero?page=passenger&_t=${Date.now()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.imagePath) {
          setHeroImage(prepareImageUrl(data.imagePath));
          if (data.title) setHeroTitle(data.title);
          if (data.subtitle) setHeroSubtitle(data.subtitle);
        }
      } catch {
        // Silently fall back to defaults
      }
    }
    fetchHero();
  }, []);

  return (
    <>
      {/* Hero */}
      <PageHero
        title={heroTitle}
        subtitle={heroSubtitle}
        backgroundImage={heroImage}
        breadcrumbs={[
          { label: 'Passenger Cars', href: '/passenger' },
        ]}
        theme="red"
      />

      {/* Vehicle Grid */}
      <section className="relative py-24 sm:py-28 lg:py-32 bg-white overflow-hidden">
        {/* Luxury pattern background */}
        <div className="absolute inset-0 luxury-pattern-light" />

        {/* Decorative diamond pattern corners */}
        <div className="absolute top-0 left-0 pointer-events-none">
          <div className="w-24 h-24 border-l border-t border-gray-200" />
          <div className="absolute top-6 left-6 w-1 h-1 bg-mitsu-red/30 rotate-45" />
          <div className="absolute top-12 left-12 w-1 h-1 bg-mitsu-red/20 rotate-45" />
        </div>
        <div className="absolute bottom-0 right-0 pointer-events-none">
          <div className="w-24 h-24 border-r border-b border-gray-200" />
          <div className="absolute bottom-6 right-6 w-1 h-1 bg-mitsu-red/30 rotate-45" />
          <div className="absolute bottom-12 right-12 w-1 h-1 bg-mitsu-red/20 rotate-45" />
        </div>

        {/* Subtle radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-mitsu-red/[0.02] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="mb-12 sm:mb-16"
          >
            <span className="inline-flex items-center gap-3 text-mitsu-red text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase">
              <Car className="w-4 h-4" />
              Passenger Cars
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-mitsu-dark font-serif">
              Lineup Kendaraan{' '}
              <span className="text-red-shimmer italic">Passenger</span>
            </h2>
            <p className="mt-4 text-gray-500 text-base sm:text-lg max-w-xl">
              Pilihan kendaraan passenger terbaik dari Mitsubishi Motor Indonesia.
            </p>

            {/* Ornamental divider */}
            <div className="flex items-center gap-3 mt-5">
              <div className="w-10 h-px bg-gradient-to-r from-mitsu-red/40 to-transparent" />
              <div className="w-1.5 h-1.5 bg-mitsu-red/40 rotate-45" />
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-10 flex flex-wrap gap-3"
          >
            {[
              { label: '8 Model', icon: Car },
              { label: 'Mulai Rp 240 Jt', icon: Sparkles },
              { label: 'MPV, SUV, EV & Pickup', icon: Car },
            ].map((stat) => {
              const IconComponent = stat.icon;
              return (
                <span key={stat.label} className="inline-flex items-center gap-2 px-4 py-2 badge-red-light text-[10px] font-bold rounded-xl tracking-wider uppercase">
                  <IconComponent className="w-3.5 h-3.5" />
                  {stat.label}
                </span>
              );
            })}
          </motion.div>

          {/* Vehicle Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {vehicles.map((vehicle, index) => (
              <VehicleCard
                key={vehicle.slug}
                name={vehicle.name}
                tagline={vehicle.tagline}
                price={vehicle.basePrice}
                image={vehicle.image}
                specs={vehicle.specsShort}
                variant="passenger"
                slug={vehicle.slug}
                index={index}
                whatsappMessage={`Halo, saya tertarik dengan Mitsubishi ${vehicle.name}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 sm:py-24 bg-mitsu-light overflow-hidden">
        {/* Luxury pattern */}
        <div className="absolute inset-0 luxury-pattern-light" />

        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-16 h-16 border-l border-t border-gray-200 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-r border-b border-gray-200 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-mitsu-dark mb-4 font-serif">
              Tertarik dengan kendaraan{' '}
              <span className="text-red-shimmer italic">passenger</span>?
            </h2>
            <p className="text-gray-500 text-base sm:text-lg mb-8 max-w-xl mx-auto">
              Hubungi sales consultant kami untuk konsultasi gratis, test drive, dan penawaran harga terbaik!
            </p>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Andi,%20saya%20tertarik%20dengan%20kendaraan%20passenger%20Mitsubishi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-400 min-h-[44px] text-base tracking-wide glow-green hover:scale-105 active:scale-95"
            >
              <MessageCircle className="w-5 h-5" />
              Hubungi Sales Consultant
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
