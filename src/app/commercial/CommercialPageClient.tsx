'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Truck, Sparkles, Zap } from 'lucide-react';
import PageHero from '@/components/shared/PageHero';
import VehicleCard from '@/components/shared/VehicleCard';
import FleetSolution from '@/components/FleetSolution';
import { VehicleData } from '@/data/vehicles';
import type { HeroData } from '@/lib/fetch-hero';
import { proxyBlobUrl } from '@/lib/image-utils';

interface Props {
  commercial: VehicleData[];
  initialHeroData?: HeroData;
}

export default function CommercialPageClient({ commercial, initialHeroData }: Props) {
  // Start with server-provided data if available, otherwise defaults
  const defaultImage = '/images/l300.png';
  const defaultTitle = 'Commercial Vehicles Mitsubishi';
  const defaultSubtitle = 'Dari niaga ringan hingga heavy duty. Solusi armada terpercaya untuk bisnis Anda.';

  const [heroImage, setHeroImage] = useState(initialHeroData?.imagePath || defaultImage);
  const [heroTitle, setHeroTitle] = useState(initialHeroData?.title || defaultTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(initialHeroData?.subtitle || defaultSubtitle);

  // Helper: resolve blob URLs (direct for public, proxy for private)
  const prepareImageUrl = (url: string) => {
    return proxyBlobUrl(url) || url;
  };

  useEffect(() => {
    // If we already have server data, skip the fetch (unless it's static fallback)
    if (initialHeroData && !initialHeroData.id?.startsWith('static-')) return;

    async function fetchHero() {
      try {
        const res = await fetch('/api/hero?page=commercial', { cache: 'no-store' });
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
  }, [initialHeroData]);

  return (
    <>
      {/* Hero */}
      <PageHero
        title={heroTitle}
        subtitle={heroSubtitle}
        backgroundImage={heroImage}
        breadcrumbs={[
          { label: 'Commercial Vehicles', href: '/commercial' },
        ]}
        accentColor="text-mitsu-fuso-yellow"
        theme="yellow"
        fallbackImage="/images/l300.png"
      />

      {/* ==================== FUSO Commercial ==================== */}
      <section className="relative py-24 sm:py-28 lg:py-32 bg-white overflow-hidden">

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="mb-12 sm:mb-16"
          >
            <span className="inline-flex items-center gap-3 text-mitsu-fuso-yellow-dark text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase">
              <Truck className="w-4 h-4" />
              FUSO Commercial
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-mitsu-dark font-serif">
              Lineup FUSO{' '}
              <span className="text-mitsu-fuso-yellow-dark italic">Commercial</span>
            </h2>
            <p className="mt-4 text-gray-500 text-base sm:text-lg max-w-xl">
              Solusi armada FUSO dari KTB — Canter, Fighter X, hingga Heavy Duty untuk bisnis skala besar.
            </p>

            {/* Ornamental divider */}
            <div className="flex items-center gap-3 mt-5">
              <div className="w-10 h-px bg-mitsu-fuso-yellow/40" />
              <div className="w-1.5 h-1.5 bg-mitsu-fuso-yellow/40 rotate-45" />
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
              { label: '6 Model', icon: Truck },
              { label: 'Mulai Rp 468 Jt', icon: Sparkles },
              { label: '3.4 - 44 Ton', icon: Truck },
            ].map((stat) => {
              const IconComponent = stat.icon;
              return (
                <span key={stat.label} className="inline-flex items-center gap-2 px-4 py-2 bg-mitsu-fuso-yellow/5 border border-mitsu-fuso-yellow/10 text-mitsu-fuso-yellow-dark text-[10px] font-bold rounded-xl tracking-wider uppercase">
                  <IconComponent className="w-3.5 h-3.5" />
                  {stat.label}
                </span>
              );
            })}
          </motion.div>

          {/* FUSO Commercial Vehicle Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {commercial.map((vehicle, index) => (
              <VehicleCard
                key={vehicle.slug}
                name={vehicle.name}
                tagline={vehicle.tagline}
                price={vehicle.basePrice}
                image={vehicle.image}
                specs={vehicle.specsShort}
                variant="commercial"
                payload={vehicle.payload}
                slug={vehicle.slug}
                index={index}
                whatsappMessage={`Halo, saya tertarik dengan ${vehicle.name}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Solution */}
      <div id="fleet">
        <FleetSolution />
      </div>

      {/* CTA */}
      <section className="relative py-20 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-mitsu-fuso-yellow/5" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-mitsu-dark mb-4 font-serif">
              Butuh solusi fleet untuk bisnis Anda?
            </h2>
            <p className="text-gray-500 text-base sm:text-lg mb-8 max-w-xl mx-auto">
              Konsultasi gratis dengan sales consultant kami. Solusi armada terbaik untuk kebutuhan bisnis Anda.
            </p>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Andi,%20saya%20ingin%20konsultasi%20kebutuhan%20fleet%20untuk%20bisnis%20saya"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-mitsu-dark hover:bg-mitsu-onyx text-mitsu-fuso-yellow font-bold rounded-xl transition-all duration-400 min-h-[44px] text-base shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 tracking-wide"
            >
              <MessageCircle className="w-5 h-5" />
              Konsultasi Gratis
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
