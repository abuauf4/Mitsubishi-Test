'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Truck, Weight, Gauge, Zap } from 'lucide-react';
import { niagaRinganVehicles, commercialVehicles } from '@/data/vehicles';

const niagaRinganCards = [
  {
    name: 'Triton',
    tagline: 'Engineered Beyond Tough — Double Cabin Andalan',
    payload: 'Double Cab',
    image: '/images/l200.png',
    specs: ['2.4L MIVEC Turbo Diesel', '181 PS', 'Super Select 4WD'],
    icon: Truck,
  },
];

const fusoCommercialCards = [
  {
    name: 'Canter FE 71',
    tagline: 'Light Duty Truck Andalan UMKM — 110 PS',
    payload: '3.4 Ton',
    image: '/api/image?url=https%3A%2F%2Fucdtyehtmprstsit.private.blob.vercel-storage.com%2Fmitsubishi%2F1778708367639-commercial_canter-fe-71_main_fe-71-a.webp',
    specs: ['3.9L Turbo Intercooler 110 PS', 'Payload 3.4 Ton', 'Engkel 4-Wheeler'],
    icon: Weight,
  },
  {
    name: 'Canter FE 74',
    tagline: 'Medium Duty Truck 125 PS',
    payload: '5.2 Ton',
    image: '/api/image?url=https%3A%2F%2Fucdtyehtmprstsit.private.blob.vercel-storage.com%2Fmitsubishi%2F1778708377768-commercial_canter-fe-74_main_CANTER-FE-74.webp',
    specs: ['3.9L Turbo Intercooler 125 PS', 'Payload 5.2 Ton', '6-Wheeler'],
    icon: Weight,
  },
  {
    name: 'Canter FE 84G',
    tagline: 'Medium Duty Truck 136 PS',
    payload: '6.2 Ton',
    image: '/api/image?url=https%3A%2F%2Fucdtyehtmprstsit.private.blob.vercel-storage.com%2Fmitsubishi%2F1778708386401-commercial_canter-fe-84g_main_CANTER-FE-84G-1.webp',
    specs: ['3.9L Turbo Intercooler 136 PS', 'Payload 6.2 Ton', '6-Wheeler HD'],
    icon: Weight,
  },
  {
    name: 'FUSO Fighter X',
    tagline: 'Medium Duty Truck Armada Profesional',
    payload: '8 - 16 Ton',
    image: '/api/image?url=https%3A%2F%2Fucdtyehtmprstsit.private.blob.vercel-storage.com%2Fmitsubishi%2F1778708418762-commercial_fighter-x-fm65-th_main_th-home-img.webp',
    specs: ['7.5L 6M60 VGT 240-270 PS', 'Eaton 9-Speed', 'Euro 4'],
    icon: Truck,
  },
  {
    name: 'FUSO Heavy Duty',
    tagline: 'Tractor Head untuk Operasi Besar',
    payload: '44 Ton GCW',
    image: '/api/image?url=https%3A%2F%2Fucdtyehtmprstsit.private.blob.vercel-storage.com%2Fmitsubishi%2F1778708486155-commercial_fz-heavy-duty_main_FZ.jpg',
    specs: ['7.5L 6M60 VGT 270 PS', 'Tractor Head', 'Euro 4'],
    icon: Truck,
  },
];

export default function CommercialVehicles() {
  return (
    <section id="commercial" className="relative py-16 sm:py-20 lg:py-24 bg-mitsu-dark overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.03) 35px, rgba(255,255,255,0.03) 70px)',
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-10 sm:mb-14"
        >
          <span className="text-mitsu-red text-xs sm:text-sm font-semibold tracking-widest uppercase">
            Commercial Vehicles
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Tenaga untuk Bisnis Anda
          </h2>
          <p className="mt-3 text-white/60 text-base sm:text-lg max-w-xl">
            Armada niaga terpercaya untuk UMKM hingga enterprise. Dibangun untuk ketahanan dan produktivitas.
          </p>
        </motion.div>

        {/* ==================== Section 1: Kendaraan Niaga Ringan ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12 sm:mb-16"
        >
          {/* Niaga Ringan Section Header */}
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-1 h-8 bg-mitsu-red rounded-full" />
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Kendaraan Niaga Ringan</h3>
              <p className="text-white/50 text-sm mt-0.5">Mitsubishi Motors — Triton</p>
            </div>
          </div>

          {/* Niaga Ringan Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {niagaRinganCards.map((vehicle, index) => {
              const IconComponent = vehicle.icon;
              return (
                <motion.div
                  key={vehicle.name}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-mitsu-red/50 transition-all duration-500 card-shine-red">
                    {/* Vehicle Image */}
                    <div className="relative h-[280px] sm:h-[300px] bg-gradient-to-b from-white/5 to-transparent overflow-hidden">
                      <img
                        src={vehicle.image}
                        alt={`Mitsubishi ${vehicle.name}`}
                        className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Payload Badge */}
                      <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-mitsu-red rounded-lg">
                        <IconComponent className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-bold">{vehicle.payload}</span>
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="p-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-white">
                        Mitsubishi {vehicle.name}
                      </h3>
                      <p className="mt-1 text-white/50 text-sm">{vehicle.tagline}</p>

                      {/* Specs */}
                      <div className="mt-4 space-y-2">
                        {vehicle.specs.map((spec) => (
                          <div key={spec} className="flex items-center gap-2 text-white/70 text-sm">
                            <div className="w-1 h-1 bg-mitsu-red rounded-full" />
                            {spec}
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <button className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-mitsu-red hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 min-h-[44px] text-sm tracking-wide">
                        Lihat Detail
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ==================== Section 2: FUSO Commercial ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          {/* FUSO Section Header */}
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-1 h-8 bg-mitsu-fuso-yellow rounded-full" />
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">FUSO Commercial</h3>
              <p className="text-white/50 text-sm mt-0.5">KTB Fuso — Canter, Fighter X, Heavy Duty</p>
            </div>
          </div>

          {/* FUSO Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {fusoCommercialCards.map((vehicle, index) => {
              const IconComponent = vehicle.icon;
              return (
                <motion.div
                  key={vehicle.name}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-mitsu-fuso-yellow/50 transition-all duration-500 card-shine-yellow">
                    {/* Vehicle Image */}
                    <div className="relative h-[280px] sm:h-[300px] bg-gradient-to-b from-white/5 to-transparent overflow-hidden">
                      <img
                        src={vehicle.image}
                        alt={`Mitsubishi ${vehicle.name}`}
                        className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Payload Badge */}
                      <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-mitsu-fuso-yellow rounded-lg">
                        <IconComponent className="w-4 h-4 text-mitsu-dark" />
                        <span className="text-mitsu-dark text-sm font-bold">{vehicle.payload}</span>
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="p-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-white">
                        {vehicle.name}
                      </h3>
                      <p className="mt-1 text-white/50 text-sm">{vehicle.tagline}</p>

                      {/* Specs */}
                      <div className="mt-4 space-y-2">
                        {vehicle.specs.map((spec) => (
                          <div key={spec} className="flex items-center gap-2 text-white/70 text-sm">
                            <div className="w-1 h-1 bg-mitsu-fuso-yellow rounded-full" />
                            {spec}
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <button className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-mitsu-fuso-yellow hover:bg-mitsu-fuso-yellow-dark text-mitsu-dark font-semibold rounded-lg transition-all duration-300 min-h-[44px] text-sm tracking-wide">
                        Hubungi Sales
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-white/50 text-sm">
            Butuh solusi fleet untuk bisnis Anda?{' '}
            <a
              href="#test-drive"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#test-drive')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-mitsu-fuso-yellow hover:text-mitsu-fuso-yellow-dark font-semibold transition-colors"
            >
              Konsultasi sekarang →
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
