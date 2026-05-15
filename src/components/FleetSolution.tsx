'use client';

import { motion } from 'framer-motion';
import { Building2, ChevronRight, MessageCircle, Shield, Truck, Wrench, HeadphonesIcon } from 'lucide-react';

const fleetBenefits = [
  { icon: Shield, text: 'Konsultasi kebutuhan armada gratis' },
  { icon: Building2, text: 'Paket pembiayaan khusus fleet' },
  { icon: Truck, text: 'Diskon khusus pembelian volume' },
  { icon: Wrench, text: 'Prioritas layanan bengkel fleet' },
  { icon: HeadphonesIcon, text: 'Program maintenance terjadwal' },
  { icon: Building2, text: 'Dedicated account manager' },
];

export default function FleetSolution() {
  return (
    <section className="relative py-24 sm:py-28 lg:py-32 bg-mitsu-light overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        <div className="absolute top-0 left-0 w-full h-px bg-gray-200" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gray-200" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-center mb-14 sm:mb-18"
        >
          <span className="inline-flex items-center gap-3 text-mitsu-fuso-yellow-dark text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase">
            <span className="w-10 h-px bg-mitsu-fuso-yellow/50" />
            Fleet Solution
            <span className="w-10 h-px bg-mitsu-fuso-yellow/50" />
          </span>
          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold text-mitsu-dark font-serif">
            Solusi Armada untuk{' '}
            <span className="text-mitsu-fuso-yellow-dark italic">Bisnis Anda</span>
          </h2>
          <p className="mt-5 text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
            Saya siap membantu Anda menemukan solusi fleet terbaik untuk kebutuhan bisnis.
          </p>

          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-12 h-px bg-gray-200" />
            <div className="w-1.5 h-1.5 bg-mitsu-fuso-yellow/50 rotate-45" />
            <div className="w-12 h-px bg-gray-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative card-light-yellow border border-mitsu-fuso-yellow/10 rounded-3xl overflow-hidden">
            <div className="bg-white rounded-3xl p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-mitsu-fuso-yellow/5 rounded-2xl border border-mitsu-fuso-yellow/10">
                      <Building2 className="w-6 h-6 text-mitsu-fuso-yellow-dark" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-mitsu-dark font-serif">Fleet Solution</h3>
                      <p className="text-sm text-gray-400">Solusi armada untuk bisnis Anda</p>
                    </div>
                  </div>

                  <p className="text-gray-500 leading-relaxed mb-6 text-sm sm:text-base">
                    Saya menyediakan solusi fleet terpadu untuk kebutuhan bisnis Anda.
                    Mulai dari konsultasi pemilihan kendaraan, paket pembiayaan khusus,
                    hingga layanan after sales yang menyeluruh.
                  </p>

                  <ul className="space-y-3">
                    {fleetBenefits.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <li key={item.text} className="flex items-start gap-3 group/benefit">
                          <div className="w-6 h-6 rounded-lg bg-mitsu-fuso-yellow/5 flex items-center justify-center mt-0.5 flex-shrink-0 group-hover/benefit:bg-mitsu-fuso-yellow/15 transition-colors border border-mitsu-fuso-yellow/10">
                            <IconComponent className="w-3 h-3 text-mitsu-fuso-yellow-dark" />
                          </div>
                          <span className="text-sm text-gray-600 group-hover/benefit:text-mitsu-dark transition-colors">{item.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="relative bg-mitsu-fuso-yellow/8 border border-mitsu-fuso-yellow/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-center overflow-hidden">
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-mitsu-fuso-yellow rounded-t-2xl" />

                  <div className="relative z-10">
                    <Building2 className="w-12 h-12 text-mitsu-fuso-yellow-dark mb-4" />
                    <h4 className="text-xl font-bold text-mitsu-dark mb-2 font-serif">Butuh Solusi Fleet?</h4>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                      Saya siap membantu menemukan solusi terbaik untuk bisnis Anda. Konsultasi gratis!
                    </p>
                    <a
                      href="https://wa.me/6281234567890?text=Halo%20Andi,%20saya%20ingin%20konsultasi%20kebutuhan%20fleet%20untuk%20bisnis%20saya"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all duration-400 min-h-[44px] text-sm w-full active:scale-[0.98]"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Konsultasi Gratis
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
