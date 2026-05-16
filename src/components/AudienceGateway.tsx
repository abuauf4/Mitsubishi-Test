'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Car, Truck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { proxyBlobUrl } from '@/lib/image-utils';

interface DBCategory {
  id: string;
  title: string;
  description: string;
  imagePath: string;
  linkHref: string;
  displayOrder: number;
  active: boolean;
}

function ModernGatewayCard({
  href,
  image,
  imageAlt,
  badge,
  badgeBg,
  titleLine1,
  titleLine2,
  titleAccent,
  description,
  stats,
  accentColor,
  hoverAccent,
  direction,
}: {
  href: string;
  image: string;
  imageAlt: string;
  badge: string;
  badgeBg: string;
  titleLine1: string;
  titleLine2: string;
  titleAccent: string;
  description: string;
  stats: { label: string; value: string }[];
  accentColor: string;
  hoverAccent: string;
  direction: 'left' | 'right';
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState(image);

  useEffect(() => {
    setImgSrc(image);
  }, [image]);

  // 3D tilt on mouse move
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['4deg', '-4deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-4deg', '4deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <Link href={href} className="block">
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, x: direction === 'left' ? -80 : 80 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, margin: '-100px' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative group cursor-pointer overflow-hidden min-h-[380px] sm:min-h-[480px] lg:min-h-[520px] rounded-2xl sm:rounded-none lg:first:rounded-l-2xl lg:last:rounded-r-2xl"
      >
        {/* Background Image */}
        <Image
          src={imgSrc}
          alt={imageAlt}
          fill
          className="object-cover object-center transition-transform duration-[1.2s] ease-out group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized={imgSrc.startsWith('/api/') || imgSrc.includes('vercel-storage.com')}
          onError={() => {
            // Fall back to local image — never show broken/empty
            if (!imgSrc.includes('/images/')) {
              setImgSrc('/images/xpander.png');
            }
          }}
        />

        {/* Dark gradient for readability */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-black/20" />

        {/* Animated border glow on hover */}
        <div className={`absolute inset-0 rounded-2xl sm:rounded-none lg:first:rounded-l-2xl lg:last:rounded-r-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
          style={{ boxShadow: `inset 0 0 0 2px ${hoverAccent}40, 0 0 30px ${hoverAccent}15` }}
        />

        {/* Top accent line with animation */}
        <div className="absolute top-0 left-0 right-0 h-[3px] overflow-hidden">
          <motion.div
            className="h-full"
            style={{ backgroundColor: accentColor }}
            initial={{ scaleX: 0, originX: direction === 'left' ? 0 : 1 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Floating particles on hover */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  backgroundColor: `${accentColor}60`,
                  left: `${15 + i * 15}%`,
                  bottom: '20%',
                }}
                initial={{ y: 0, opacity: 0 }}
                animate={{
                  y: [0, -80 - i * 20],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5 + i * 0.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        )}

        {/* Content - positioned at bottom */}
        <div className={`absolute bottom-0 left-0 right-0 z-10 p-6 sm:p-8 lg:p-10 ${direction === 'right' ? 'text-right' : ''}`}>
          {/* Badge */}
          <motion.div
            style={{ transform: 'translateZ(40px)' }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 ${badgeBg} rounded-full mb-4 ${direction === 'right' ? 'ml-auto' : ''}`}
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
            <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase">{badge}</span>
          </motion.div>

          {/* Title */}
          <div style={{ transform: 'translateZ(30px)' }}>
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight font-serif ${direction === 'right' ? 'ml-auto max-w-md' : 'max-w-md'}`}>
              {titleLine1}
              <br />
              <span style={{ color: titleAccent }} className="italic">{titleLine2}</span>
            </h2>
          </div>

          {/* Description */}
          <p className={`text-white/60 text-sm sm:text-base max-w-sm mb-5 leading-relaxed ${direction === 'right' ? 'ml-auto' : ''}`}
            style={{ transform: 'translateZ(20px)' }}
          >
            {description}
          </p>

          {/* Stats row */}
          <div className={`flex items-center gap-4 mb-5 ${direction === 'right' ? 'justify-end' : ''}`}
            style={{ transform: 'translateZ(15px)' }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="px-3 py-1.5 rounded-lg bg-white/8 backdrop-blur-sm border border-white/10">
                <p className="text-white font-bold text-xs">{stat.value}</p>
                <p className="text-white/40 text-[9px]">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className={`flex items-center gap-2.5 group/cta ${direction === 'right' ? 'justify-end' : ''}`}
            style={{ transform: 'translateZ(25px)' }}
          >
            <span className="text-white/60 group-hover/cta:text-white font-semibold text-xs tracking-[0.15em] uppercase transition-colors duration-400">
              {badge === 'Passenger Cars' ? 'Jelajahi Lineup' : 'Lihat Armada'}
            </span>
            <motion.div
              className={`w-9 h-9 rounded-full border border-white/20 flex items-center justify-center transition-all duration-400`}
              style={{
                borderColor: isHovered ? accentColor : 'rgba(255,255,255,0.2)',
                backgroundColor: isHovered ? accentColor : 'transparent',
              }}
            >
              <ArrowRight className={`w-3.5 h-3.5 transition-all duration-400 ${isHovered ? 'text-white' : 'text-white/60'} ${isHovered ? 'translate-x-0.5' : ''}`} />
            </motion.div>
          </div>
        </div>

        {/* Bottom shine effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
      </motion.div>
    </Link>
  );
}

/** Default hardcoded cards as fallback */
const HARDCODED_CARDS = [
  {
    href: '/passenger',
    image: '/images/xpander.png',
    imageAlt: 'Mitsubishi Passenger Cars',
    badge: 'Passenger Cars',
    badgeBg: 'bg-mitsu-red/90',
    titleLine1: 'Untuk Hidup',
    titleLine2: 'yang Lebih Baik',
    titleAccent: '#FF6B6B',
    description: 'MPV keluarga, SUV tangguh, hingga kendaraan listrik. Temukan kendaraan yang tepat untuk setiap perjalanan Anda.',
    stats: [
      { label: 'Model', value: '8' },
      { label: 'Mulai', value: 'Rp 240Jt' },
      { label: 'Kategori', value: 'MPV, SUV & EV' },
    ],
    accentColor: '#E60012',
    hoverAccent: '#E60012',
    direction: 'left' as const,
  },
  {
    href: '/commercial',
    image: '/images/l300.png',
    imageAlt: 'Mitsubishi Commercial Vehicles',
    badge: 'Commercial Vehicles',
    badgeBg: 'bg-mitsu-fuso-yellow/90',
    titleLine1: 'Bisnis yang',
    titleLine2: 'Lebih Kuat',
    titleAccent: '#FFD600',
    description: 'FUSO Commercial dari Canter hingga Heavy Duty untuk UMKM hingga enterprise.',
    stats: [
      { label: 'Model', value: '6' },
      { label: 'Mulai', value: 'Rp 468Jt' },
      { label: 'Payload', value: '3.4-44 Ton' },
    ],
    accentColor: '#FFD600',
    hoverAccent: '#FFD600',
    direction: 'right' as const,
  },
];

function getCategoryTheme(linkHref: string) {
  if (linkHref.includes('passenger')) {
    return {
      accentColor: '#E60012',
      hoverAccent: '#E60012',
      badgeBg: 'bg-mitsu-red/90',
      titleAccent: '#FF6B6B',
    };
  }
  if (linkHref.includes('commercial')) {
    return {
      accentColor: '#FFD600',
      hoverAccent: '#FFD600',
      badgeBg: 'bg-mitsu-fuso-yellow/90',
      titleAccent: '#FFD600',
    };
  }
  return {
    accentColor: '#E60012',
    hoverAccent: '#E60012',
    badgeBg: 'bg-mitsu-red/90',
    titleAccent: '#FF6B6B',
  };
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
          // Use DB categories — they have real images uploaded via admin
          // Only skip if ALL categories are static fallbacks with no custom images
          const hasRealImages = data.some((cat: DBCategory) => cat.imagePath && !cat.imagePath.startsWith('/images/'));
          if (hasRealImages || !data[0]?.id?.startsWith('static')) {
            setDbCategories(data);
          }
        }
      } catch {
        // Silently fall back to hardcoded cards
      }
    }
    fetchCategories();
  }, []);

  // Helper: resolve blob URLs (direct for public, proxy for private)
  const proxyImage = (url: string) => {
    return proxyBlobUrl(url) || '';
  };

  // Build cards from DB data or use hardcoded fallback
  const cards = dbCategories && dbCategories.length > 0
    ? dbCategories.map((cat, index) => {
        const theme = getCategoryTheme(cat.linkHref);
        const isRed = cat.linkHref.includes('passenger');
        const fallbackImg = isRed ? '/images/xpander.png' : '/images/l300.png';
        const proxiedImage = cat.imagePath ? proxyImage(cat.imagePath) : fallbackImg;
        return {
          href: cat.linkHref || (isRed ? '/passenger' : '/commercial'),
          image: proxiedImage || fallbackImg,
          imageAlt: cat.title || (isRed ? 'Passenger Cars' : 'Commercial Vehicles'),
          badge: cat.title || (isRed ? 'Passenger Cars' : 'Commercial Vehicles'),
          badgeBg: theme.badgeBg,
          titleLine1: cat.title?.includes('Passenger') ? 'Untuk Hidup' : cat.title?.includes('Commercial') ? 'Bisnis yang' : cat.title || 'Pilihan',
          titleLine2: isRed ? 'yang Lebih Baik' : 'Lebih Kuat',
          titleAccent: theme.titleAccent,
          description: cat.description || (isRed ? 'MPV keluarga, SUV tangguh, hingga kendaraan listrik.' : 'Niaga ringan hingga heavy duty untuk bisnis Anda.'),
          stats: isRed
            ? [
                { label: 'Model', value: '8' },
                { label: 'Mulai', value: 'Rp 240Jt' },
                { label: 'Kategori', value: 'MPV, SUV & EV' },
              ]
            : [
                { label: 'Model', value: '6' },
                { label: 'Mulai', value: 'Rp 468Jt' },
                { label: 'Payload', value: '3.4-44 Ton' },
              ],
          accentColor: theme.accentColor,
          hoverAccent: theme.hoverAccent,
          direction: (index % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
        };
      })
    : HARDCODED_CARDS;

  return (
    <section id="audience-gateway" className="relative w-full bg-white">
      <div className="h-px bg-gray-200" />

      {/* Section label */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-3 text-mitsu-red text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase">
            <span className="w-10 h-px bg-mitsu-red/50" />
            Pilih Kategori
            <span className="w-10 h-px bg-mitsu-red/50" />
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-mitsu-dark font-serif">
            Temukan Kendaraan <span className="text-red-shimmer italic">Anda</span>
          </h2>
        </motion.div>
      </div>

      {/* Cards Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
        <div className={`grid ${cards.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2'} gap-4 sm:gap-5`}>
          {cards.map((card, index) => (
            <ModernGatewayCard key={card.href + '-' + index} {...card} />
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-200" />
    </section>
  );
}
