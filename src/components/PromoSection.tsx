'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Tag, ArrowRight, Flame, Sparkles, Zap } from 'lucide-react';

const promos = [
  {
    id: 1,
    title: 'Cashback Xpander Rp 15 Juta',
    description: 'Dapatkan cashback hingga Rp 15 juta untuk pembelian Mitsubishi Xpander baru. Promo terbatas!',
    badge: 'Terbatas',
    badgeIcon: Flame,
    vehicle: 'Xpander',
    color: 'bg-mitsu-red',
    accentColor: 'bg-mitsu-red',
  },
  {
    id: 2,
    title: 'DP Ringan Pajero Sport',
    description: 'Mulai DP Ringan untuk Pajero Sport. Miliki SUV tangguh dengan cicilan mulai Rp 8 Juta/bulan.',
    badge: 'Spesial',
    badgeIcon: Sparkles,
    vehicle: 'Pajero Sport',
    color: 'bg-mitsu-red',
    accentColor: 'bg-mitsu-red',
  },
  {
    id: 3,
    title: 'Bonus Aksesoris L300',
    description: 'Gratis paket aksesoris senilai Rp 5 Juta untuk setiap pembelian Mitsubishi L300 baru.',
    badge: 'Hot Deal',
    badgeIcon: Zap,
    vehicle: 'L300',
    color: 'bg-mitsu-red',
    accentColor: 'bg-mitsu-red',
  },
];

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 8,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        seconds -= 1;
        if (seconds < 0) { seconds = 59; minutes -= 1; }
        if (minutes < 0) { minutes = 59; hours -= 1; }
        if (hours < 0) { hours = 23; days -= 1; }
        if (days < 0) { days = 0; hours = 0; minutes = 0; seconds = 0; }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {[
        { value: timeLeft.days, label: 'Hari' },
        { value: timeLeft.hours, label: 'Jam' },
        { value: timeLeft.minutes, label: 'Menit' },
        { value: timeLeft.seconds, label: 'Detik' },
      ].map((item, i) => (
        <div key={item.label} className="text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-white shadow-sm border border-gray-100 rounded-xl">
            <span className="text-lg sm:text-xl font-bold text-mitsu-red font-mono">
              {String(item.value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] text-gray-400 mt-1 block uppercase tracking-wider font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function PromoSection() {
  return (
    <section id="promo" className="relative py-24 sm:py-28 lg:py-32 bg-mitsu-light overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-white" />

      {/* Luxury red dot pattern */}
      <div className="absolute inset-0 luxury-pattern-red-dots" />

      {/* Decorative Lines */}
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
          <span className="inline-flex items-center gap-3 text-mitsu-red text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase">
            <Tag className="w-4 h-4" />
            Promo Terbaru
          </span>
          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold text-mitsu-dark font-serif">
            Penawaran <span className="text-red-shimmer italic">Spesial</span>
          </h2>
          <p className="mt-5 text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
            Jangan lewatkan promo terbatas dari Mitsubishi. Segera dapatkan sebelum berakhir!
          </p>

          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-12 h-px bg-gray-200" />
            <div className="w-1.5 h-1.5 bg-mitsu-red/50 rotate-45" />
            <div className="w-12 h-px bg-gray-200" />
          </div>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center mb-14 sm:mb-18"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-mitsu-red/5 border border-mitsu-red/10 rounded-2xl">
            <Clock className="w-5 h-5 text-mitsu-red" />
            <span className="text-gray-500 text-sm font-medium">Berakhir dalam:</span>
            <CountdownTimer />
          </div>
        </motion.div>

        {/* Promo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {promos.map((promo, index) => {
            const BadgeIcon = promo.badgeIcon;
            return (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: '-50px' }}
                className="group"
              >
                <div className="relative rounded-2xl overflow-hidden border border-gray-100 hover:border-mitsu-red/20 hover:shadow-lg hover:shadow-mitsu-red/5 transition-all duration-500">
                  <div className="bg-white rounded-2xl">
                    {/* Top Gradient Bar */}
                    <div className={`h-[2px] ${promo.accentColor}`} />

                    <div className="p-6 sm:p-8">
                      {/* Badge + Vehicle */}
                      <div className="flex items-center justify-between mb-5">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 badge-red-light text-[10px] font-bold rounded-lg tracking-wider uppercase">
                          <span className="w-1.5 h-1.5 bg-mitsu-red rounded-full animate-pulse" />
                          {promo.badge}
                        </span>
                        <span className="text-gray-300 text-[10px] font-semibold tracking-wider uppercase">{promo.vehicle}</span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-mitsu-dark mb-3 leading-tight font-serif">
                        {promo.title}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-7">
                        {promo.description}
                      </p>

                      <a
                        href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Andi, saya tertarik dengan promo ${promo.title}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3.5 btn-mitsu-red rounded-xl transition-all duration-400 min-h-[44px] text-sm tracking-wide group-hover:shadow-lg group-hover:shadow-mitsu-red/15 active:scale-[0.98] font-bold"
                      >
                        Dapatkan Penawaran
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
