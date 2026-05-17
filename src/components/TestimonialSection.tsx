'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Budi Santoso',
    role: 'Pemilik Xpander Cross',
    text: 'Proses pembelian sangat mudah dan transparan. Pak Andi sangat membantu dari awal konsultasi sampai pengiriman unit. Pelayanan terbaik yang pernah saya dapatkan!',
    rating: 5,
    vehicle: 'Xpander Cross',
  },
  {
    name: 'Siti Rahayu',
    role: 'Pemilik Pajero Sport',
    text: 'Saya sudah 2 kali beli mobil Mitsubishi dari Pak Andi. Selalu update promo terbaru dan bantu proses kredit sampai tuntas. Recommended banget!',
    rating: 5,
    vehicle: 'Pajero Sport',
  },
  {
    name: 'Ahmad Fauzi',
    role: 'Fleet Manager PT. Jaya Mandiri',
    text: 'Kami sudah mempercayakan armada perusahaan ke Mitsubishi sejak 2018. Pak Andi selalu responsif dan memberikan solusi fleet yang tepat sesuai kebutuhan bisnis kami.',
    rating: 5,
    vehicle: 'Canter FE 74',
  },
  {
    name: 'Dewi Lestari',
    role: 'Pemilik Xforce',
    text: 'Xforce pilihan yang tepat untuk keseharian di kota. Desainnya cantik, nyaman dikendarai, dan irit bbm. Terima kasih Pak Andi atas rekomendasinya!',
    rating: 5,
    vehicle: 'Xforce',
  },
  {
    name: 'Rudi Hartono',
    role: 'Pemilik L300 Pick-Up',
    text: 'L300 andalan usaha saya sudah 5 tahun, mesinnya awet dan pemeliharaan murah. Pak Andi juga bantu urus after sales dengan cepat.',
    rating: 4,
    vehicle: 'L300 Pick-Up',
  },
  {
    name: 'Maya Putri',
    role: 'Pemilik New Xpander',
    text: 'Pengalaman beli mobil pertama kali jadi menyenangkan. Pak Andi sabar menjelaskan semua detail dan membantu dapatkan promo terbaik. Very satisfied!',
    rating: 5,
    vehicle: 'New Xpander',
  },
];

export default function TestimonialSection() {
  return (
    <section id="testimonial" className="relative py-20 sm:py-24 lg:py-28 bg-white overflow-hidden">
      {/* Luxury diagonal pattern */}
      <div className="absolute inset-0 luxury-pattern-diagonal" />
      <div className="absolute top-0 left-0 w-full h-px bg-gray-200" />

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-16 h-16 border-l border-t border-mitsu-red/10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-r border-b border-mitsu-red/10 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-flex items-center gap-3 text-mitsu-red text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase">
            <span className="w-10 h-px bg-mitsu-red/50" />
            Testimoni Pelanggan
            <span className="w-10 h-px bg-mitsu-red/50" />
          </span>
          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold text-mitsu-dark font-serif">
            Dipercaya Ratusan{' '}
            <span className="text-mitsu-red">Pelanggan</span>
          </h2>
          <p className="mt-4 text-gray-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Kepuasan pelanggan adalah prioritas utama kami. Simak pengalaman mereka yang telah memilih Mitsubishi.
          </p>
        </motion.div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: '-30px' }}
            >
              <div className="h-full p-5 sm:p-6 rounded-xl card-light hover-red-border-light transition-all duration-400 flex flex-col">
                {/* Quote icon */}
                <Quote className={`w-6 h-6 ${index < 3 ? 'text-mitsu-red/15' : 'text-mitsu-fuso-yellow/15'} mb-3`} />

                {/* Rating */}
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < item.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>

                {/* Text */}
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed flex-1 mb-4">
                  &ldquo;{item.text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-mitsu-red/8 flex items-center justify-center flex-shrink-0">
                    <span className="text-mitsu-red text-xs font-bold">{item.name.charAt(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-mitsu-dark text-xs font-bold truncate">{item.name}</p>
                    <p className="text-gray-400 text-[10px] truncate">{item.role}</p>
                  </div>
                  {/* Vehicle badge */}
                  <span className="ml-auto flex-shrink-0 px-2 py-0.5 text-[9px] font-bold rounded-md bg-mitsu-light text-gray-500 border border-gray-100">
                    {item.vehicle}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
