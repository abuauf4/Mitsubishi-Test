'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Car, Sparkles, Mail, Shuffle, Zap } from 'lucide-react';
import VehicleCard from '@/components/shared/VehicleCard';
import { VehicleData } from '@/data/vehicles';
import Link from 'next/link';

interface Props {
  vehicles: VehicleData[];
  initialHeroData?: any;
}

export default function PassengerPageClient({ vehicles }: Props) {
  return (
    <>
      {/* Compact Header — white background matching page */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 luxury-pattern-light" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/50" />
        {/* Decorative lines */}
        <div className="absolute top-6 left-6 w-12 h-12 border-l border-t border-mitsu-red/10 pointer-events-none" />
        <div className="absolute bottom-6 right-6 w-12 h-12 border-r border-b border-mitsu-red/10 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <span className="inline-flex items-center gap-3 text-mitsu-red text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase mb-4">
            <Car className="w-4 h-4" />
            Passenger Cars
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-mitsu-dark leading-tight font-serif">
            Lineup Kendaraan{' '}
            <span className="text-mitsu-red">Passenger</span>
          </h1>
          <p className="mt-3 text-gray-500 text-sm sm:text-base max-w-xl">
            Dari MPV keluarga hingga SUV premium. Temukan kendaraan yang tepat untuk setiap perjalanan Anda.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-10 h-px bg-mitsu-red/30" />
            <div className="w-1.5 h-1.5 bg-mitsu-red/30 rotate-45" />
          </div>
        </div>
        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-100" />
      </section>

      {/* Vehicle Grid */}
      <section className="relative py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quick Stats + Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-10 flex flex-wrap items-center gap-3"
          >
            {[
              { label: '8 Model', icon: Car },
              { label: 'Mulai Rp 240 Jt', icon: Sparkles },
              { label: 'MPV, SUV, EV & Pickup', icon: Zap },
            ].map((stat) => {
              const IconComponent = stat.icon;
              return (
                <span key={stat.label} className="inline-flex items-center gap-2 px-4 py-2 bg-mitsu-red/5 border border-mitsu-red/10 text-mitsu-red text-[10px] font-bold rounded-xl tracking-wider uppercase">
                  <IconComponent className="w-3.5 h-3.5" />
                  {stat.label}
                </span>
              );
            })}
            <Link
              href="/compare"
              className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 bg-mitsu-red/5 border border-mitsu-red/15 text-mitsu-red text-xs font-bold rounded-xl tracking-wide hover:bg-mitsu-red/10 hover:border-mitsu-red/25 transition-all cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              Bandingkan Kendaraan
            </Link>
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

      {/* Newsletter */}
      <section className="relative py-16 sm:py-20 bg-gray-50 overflow-hidden">
        <div className="absolute inset-0 luxury-pattern-light" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-mitsu-red/10 mb-6">
              <Mail className="w-7 h-7 text-mitsu-red" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-mitsu-dark font-serif mb-3">
              Dapatkan Info Terbaru
            </h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-lg mx-auto mb-8">
              Berlangganan newsletter kami untuk mendapatkan informasi promo terbaru, peluncuran model baru, dan tips otomotif langsung di inbox Anda.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Masukkan email Anda"
                className="flex-1 px-4 py-3.5 rounded-xl bg-white border border-gray-200 text-mitsu-dark placeholder-gray-400 text-sm focus:outline-none focus:border-mitsu-red/50 focus:ring-1 focus:ring-mitsu-red/30 transition-all"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-mitsu-red hover:bg-mitsu-red/80 text-white font-bold rounded-xl transition-all text-sm tracking-wide hover:scale-[1.02] active:scale-[0.98] min-h-[44px] whitespace-nowrap cursor-pointer"
              >
                Berlangganan
              </button>
            </form>
            <p className="mt-3 text-[10px] text-gray-500">Kami tidak akan membagikan email Anda kepada pihak ketiga.</p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 sm:py-24 bg-gray-50 overflow-hidden">

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-mitsu-dark mb-4 font-serif">
              Tertarik dengan kendaraan{' '}
              <span className="text-mitsu-red">passenger</span>?
            </h2>
            <p className="text-gray-500 text-base sm:text-lg mb-8 max-w-xl mx-auto">
              Hubungi sales consultant kami untuk konsultasi gratis, test drive, dan penawaran harga terbaik!
            </p>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Andi,%20saya%20tertarik%20dengan%20kendaraan%20passenger%20Mitsubishi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all duration-400 min-h-[44px] text-base tracking-wide hover:scale-105 active:scale-95"
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
