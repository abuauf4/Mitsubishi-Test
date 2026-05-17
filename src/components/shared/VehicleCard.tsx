'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface VehicleCardProps {
  name: string;
  tagline: string;
  price: string;
  image: string;
  specs: string[];
  whatsappMessage?: string;
  variant?: 'passenger' | 'commercial' | 'niaga-ringan';
  payload?: string;
  slug: string;
  index?: number;
}

export default function VehicleCard({
  name,
  tagline,
  price,
  image,
  specs,
  whatsappMessage,
  variant = 'passenger',
  payload,
  slug,
  index = 0,
}: VehicleCardProps) {
  const isCommercial = variant === 'commercial';
  const isNiagaRingan = variant === 'niaga-ringan';
  // niaga-ringan uses RED accent like passenger, commercial uses YELLOW accent
  const useYellowAccent = isCommercial;
  const waLink = `https://wa.me/6281234567890?text=${encodeURIComponent(whatsappMessage || `Halo Andi, saya tertarik dengan Mitsubishi ${name}`)}`;
  const detailPath = (isCommercial || isNiagaRingan) ? `/commercial/${slug}` : `/passenger/${slug}`;
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: '-50px' }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transform, transition: transform ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)' }}
        className={`group rounded-lg overflow-hidden ${
          useYellowAccent
            ? 'card-light-yellow hover-yellow-border-light'
            : 'card-light-red hover-red-border-light'
        } transition-all duration-500`}
      >
        <div className="rounded-lg overflow-hidden bg-white">
          {/* Vehicle Image - clickable */}
          <Link href={detailPath} className="block">
            <div className={`relative h-[200px] sm:h-[240px] overflow-hidden ${useYellowAccent ? 'vehicle-image-bg-light-yellow' : 'vehicle-image-bg-light'}`}>
              <Image
                src={image}
                alt={`Mitsubishi ${name}`}
                fill
                className="object-contain relative z-[1] transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized={image.startsWith('/api/') || image.includes('vercel-storage.com')}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('/images/')) {
                    target.src = '/images/xpander.png';
                  }
                }}
              />

              {/* Price Badge */}
              <div className="absolute top-3 left-3 z-[2]">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 ${useYellowAccent ? 'bg-mitsu-fuso-yellow text-mitsu-dark' : 'bg-mitsu-red text-white'} text-[10px] sm:text-xs font-bold rounded-md shadow-md ${useYellowAccent ? 'shadow-mitsu-fuso-yellow/20' : 'shadow-mitsu-red/20'}`}>
                  {price}
                </span>
              </div>

              {/* Payload Badge (commercial only) */}
              {payload && (
                <div className="absolute top-3 right-3 z-[2] flex items-center gap-1 px-2 py-1 bg-mitsu-fuso-yellow/5 border border-mitsu-fuso-yellow/10 rounded-md">
                  <span className="text-mitsu-fuso-yellow-dark text-[10px] font-bold">{payload}</span>
                </div>
              )}

              {/* Hover overlay */}
              <div className={`absolute inset-0 z-[3] ${useYellowAccent ? 'bg-mitsu-fuso-yellow/5' : 'bg-mitsu-red/5'} opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center`}>
                <span className={`px-4 py-2 ${useYellowAccent ? 'bg-mitsu-fuso-yellow' : 'bg-mitsu-red'} text-white text-xs font-bold rounded-lg shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-400`}>
                  Lihat Detail
                </span>
              </div>
            </div>
          </Link>

          {/* Vehicle Info */}
          <div className="p-4 sm:p-5">
            <Link href={detailPath}>
              <h3 className="text-base sm:text-lg font-bold text-mitsu-dark font-serif hover:underline decoration-mitsu-red/30 underline-offset-4">
                Mitsubishi {name}
              </h3>
            </Link>
            <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
              {tagline}
            </p>

            {/* Specs */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {specs.map((spec) => (
                <span
                  key={spec}
                  className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-mitsu-light text-gray-600 border border-gray-100"
                >
                  {spec}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-4 flex items-center gap-2">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300 text-[11px] tracking-wide hover:shadow-md hover:shadow-green-500/15 active:scale-[0.97]"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
              <Link
                href={detailPath}
                className={`flex items-center gap-1.5 px-3 py-1.5 ${useYellowAccent ? 'btn-fuso-yellow' : 'btn-mitsu-red'} rounded-lg transition-all duration-300 text-[11px] tracking-wide active:scale-[0.97] font-semibold`}
              >
                Detail
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
