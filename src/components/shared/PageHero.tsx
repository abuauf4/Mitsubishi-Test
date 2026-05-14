'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Breadcrumb from './Breadcrumb';
import ParticleField from '../ParticleField';
import { useRef } from 'react';

interface PageHeroProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  breadcrumbs: { label: string; href: string }[];
  accentColor?: string;
  theme?: 'red' | 'yellow';
}

export default function PageHero({
  title,
  subtitle,
  backgroundImage,
  breadcrumbs,
  accentColor = 'text-mitsu-red',
  theme = 'red',
}: PageHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '5%']);

  const highlightWords = ['Mitsubishi', 'Komersial', 'Passenger'];

  return (
    <section ref={sectionRef} className="relative w-full min-h-[40vh] sm:min-h-[50vh] lg:min-h-[55vh] overflow-hidden bg-mitsu-obsidian">
      {/* Background Image with Parallax — uses AnimatePresence for seamless crossfade */}
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: bgY }}>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={backgroundImage}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <Image
              src={backgroundImage}
              alt={title}
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority
              unoptimized={backgroundImage.startsWith('/api/') || backgroundImage.includes('vercel-storage.com')}
              onError={(e) => {
                // Prevent blank by keeping the image element but suppressing error
                const target = e.target as HTMLImageElement;
                target.style.opacity = '0.5';
              }}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20 sm:from-black/60 sm:via-black/15 sm:to-black/10" />
      <div className="absolute inset-0 noise-overlay" />

      {/* Particle Effects - hidden on mobile */}
      <div className="hidden sm:block">
        <ParticleField />
      </div>

      {/* Luxury Decorative Lines - hidden on mobile */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block" style={{ zIndex: 2 }}>
        <div className={`absolute top-8 left-8 w-16 h-16 border-l border-t ${theme === 'yellow' ? 'border-mitsu-fuso-yellow/12' : 'border-mitsu-red/12'}`} />
        <div className={`absolute bottom-8 right-8 w-16 h-16 border-r border-b ${theme === 'yellow' ? 'border-mitsu-fuso-yellow/12' : 'border-mitsu-red/12'}`} />
        <div className={`absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent ${theme === 'yellow' ? 'via-mitsu-fuso-yellow/8' : 'via-mitsu-red/8'} to-transparent`} />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col justify-end h-full min-h-[40vh] sm:min-h-[50vh] lg:min-h-[55vh] px-4 sm:px-6 lg:px-8 pb-10 sm:pb-16 max-w-7xl mx-auto"
        style={{ y: contentY }}
      >
        <Breadcrumb items={breadcrumbs} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight font-serif">
            {title.split(' ').map((word, i) => (
              <span key={i}>
                {i > 0 && ' '}
                {highlightWords.includes(word) ? (
                  <span className={`${accentColor} italic`}>{word}</span>
                ) : (
                  word
                )}
              </span>
            ))}
          </h1>

          {/* Ornamental divider */}
          <div className="flex items-center gap-3 my-3 sm:my-4">
            <div className={`w-10 h-px bg-gradient-to-r ${theme === 'yellow' ? 'from-mitsu-fuso-yellow/40' : 'from-mitsu-red/40'} to-transparent`} />
            <div className={`w-1.5 h-1.5 ${theme === 'yellow' ? 'bg-mitsu-fuso-yellow/40' : 'bg-mitsu-red/40'} rotate-45`} />
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-white/40 text-sm sm:text-lg md:text-xl max-w-2xl leading-relaxed"
          >
            {subtitle}
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/50 to-transparent z-[3]" />
      
      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${theme === 'yellow' ? 'via-mitsu-fuso-yellow/15' : 'via-mitsu-red/15'} to-transparent z-[4]`} />
    </section>
  );
}
