'use client';

import { motion, useInView } from 'framer-motion';
import { Shield, Zap, HeadphonesIcon, Globe, Award, Wrench } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const values = [
  {
    icon: Shield,
    title: 'Kualitas Terjamin',
    description:
      'Setiap kendaraan Mitsubishi melewati standar kualitas global yang ketat. Dari proses produksi hingga pengiriman, kualitas selalu menjadi prioritas utama.',
    stat: { value: 60, suffix: '+', label: 'Tahun Berpengalaman' },
    accentColor: 'bg-mitsu-red',
    iconBg: 'bg-mitsu-red/8',
    iconColor: 'text-mitsu-red',
    borderColor: 'hover:border-mitsu-red/25',
  },
  {
    icon: Zap,
    title: 'Teknologi Terdepan',
    description:
      'Mitsubishi terus berinovasi dengan teknologi MIVEC, Super Select 4WD, dan sistem keselamatan aktif untuk pengalaman berkendara yang lebih baik.',
    stat: { value: 150, suffix: '+', label: 'Dealer Nasional' },
    accentColor: 'bg-mitsu-red',
    iconBg: 'bg-mitsu-red/8',
    iconColor: 'text-mitsu-red',
    borderColor: 'hover:border-mitsu-red/25',
  },
  {
    icon: HeadphonesIcon,
    title: 'Layanan Purna Jual',
    description:
      'Jaringan bengkel resmi dan spare part original tersebar di seluruh Indonesia. Layanan berkualitas untuk menjaga performa kendaraan Anda.',
    stat: { value: 500, suffix: '+', label: 'Mekanik Bersertifikat' },
    accentColor: 'bg-emerald-600',
    iconBg: 'bg-emerald-500/8',
    iconColor: 'text-emerald-600',
    borderColor: 'hover:border-emerald-500/25',
  },
  {
    icon: Globe,
    title: 'Jaringan Global',
    description:
      'Sebagai bagian dari Mitsubishi Motors Corporation, kami mendukung dengan jaringan global dan standar internasional yang terpercaya.',
    stat: { value: 160, suffix: '+', label: 'Negara' },
    accentColor: 'bg-amber-600',
    iconBg: 'bg-amber-500/8',
    iconColor: 'text-amber-600',
    borderColor: 'hover:border-amber-500/25',
  },
];

export default function WhyMitsubishi() {
  return (
    <section id="why-mitsubishi" className="relative py-24 sm:py-28 lg:py-32 overflow-hidden bg-mitsu-obsidian">
      {/* Background image for depth */}
      <Image
        src="/images/hero-cinematic.png"
        alt="Mitsubishi Background"
        fill
        className="object-cover object-center"
        sizes="100vw"
        priority={false}
        quality={60}
      />
      {/* Dark luxury background with red accent pattern */}

      {/* Subtle gradient overlay for readability - slightly transparent to let bg image show */}
      <div className="absolute inset-0 bg-mitsu-obsidian/90" />

      {/* Decorative corner */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l border-t border-white/10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r border-b border-white/10 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-center mb-16 sm:mb-20"
        >
          <span className="inline-flex items-center gap-3 text-mitsu-red text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase">
            <span className="w-10 h-px bg-mitsu-red/50" />
            Mengapa Mitsubishi
            <span className="w-10 h-px bg-mitsu-red/50" />
          </span>
          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-serif">
            Keunggulan{' '}
            <span className="text-mitsu-red">Mitsubishi</span>
          </h2>
          <p className="mt-5 text-white/50 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Lebih dari 60 tahun pengalaman di industri otomotif global. Mitsubishi terus berkomitmen menghadirkan kendaraan berkualitas untuk Indonesia.
          </p>
          
          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-12 h-px bg-white/20" />
            <div className="w-1.5 h-1.5 bg-mitsu-red/50 rotate-45" />
            <div className="w-12 h-px bg-white/20" />
          </div>
        </motion.div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: '-50px' }}
                className="group"
              >
                <div className={`relative p-6 sm:p-7 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm hover:border-mitsu-red/30 hover:bg-white/8 hover:-translate-y-1 transition-all duration-500 card-shine-red`}>
                  {/* Top accent line */}
                  <div className={`absolute top-0 left-0 right-0 h-[2px] ${value.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-t-lg`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5">
                      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-lg ${value.iconBg} group-hover:scale-110 transition-transform duration-400 border border-white/10`}>
                        <IconComponent className={`w-7 h-7 ${value.iconColor}`} />
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${value.iconColor} font-serif`}>
                          <AnimatedCounter target={value.stat.value} suffix={value.stat.suffix} />
                        </p>
                        <p className="text-[9px] text-white/40 uppercase tracking-wider font-medium">{value.stat.label}</p>
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3 font-serif">{value.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{value.description}</p>
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
