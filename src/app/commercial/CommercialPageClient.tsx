'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Truck, Sparkles, Zap } from 'lucide-react';
import VehicleCard from '@/components/shared/VehicleCard';
import FleetSolution from '@/components/FleetSolution';
import { VehicleData } from '@/data/vehicles';

interface Props {
  commercial: VehicleData[];
  initialHeroData?: any;
}

export default function CommercialPageClient({ commercial }: Props) {
  return (
    <>
      {/* Compact Header — no hero image */}
      <section className="relative bg-mitsu-obsidian overflow-hidden">
        <div className="absolute inset-0 luxury-pattern-yellow" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-mitsu-obsidian/50" />
        {/* Decorative lines */}
        <div className="absolute top-6 left-6 w-12 h-12 border-l border-t border-mitsu-fuso-yellow/15 pointer-events-none" />
        <div className="absolute bottom-6 right-6 w-12 h-12 border-r border-b border-mitsu-fuso-yellow/15 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <span className="inline-flex items-center gap-3 text-mitsu-fuso-yellow-dark text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase mb-4">
            <Truck className="w-4 h-4" />
            FUSO Commercial
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight font-serif">
            Lineup FUSO{' '}
            <span className="text-mitsu-fuso-yellow-dark">Commercial</span>
          </h1>
          <p className="mt-3 text-white/40 text-sm sm:text-base max-w-xl">
            Dari niaga ringan hingga heavy duty. Solusi armada terpercaya untuk bisnis Anda.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-10 h-px bg-mitsu-fuso-yellow/40" />
            <div className="w-1.5 h-1.5 bg-mitsu-fuso-yellow/40 rotate-45" />
          </div>
        </div>
        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-mitsu-fuso-yellow/20" />
      </section>

      {/* ==================== FUSO Commercial ==================== */}
      <section className="relative py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
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
