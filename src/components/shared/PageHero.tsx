'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Breadcrumb from './Breadcrumb';
import ParticleField from '../ParticleField';
import { useRef, useState, useEffect } from 'react';

interface PageHeroProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  breadcrumbs: { label: string; href: string }[];
  accentColor?: string;
  theme?: 'red' | 'yellow';
  fallbackImage?: string;
}

export default function PageHero({
  title,
  subtitle,
  backgroundImage,
  breadcrumbs,
  accentColor = 'text-mitsu-red',
  theme = 'red',
  fallbackImage = '/images/xpander.png',
}: PageHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '5%']);

  const highlightWords = ['Mitsubishi', 'Komersial', 'Passenger'];

  // Preload next image before showing it — prevents blank/black flash
  const [displayedImage, setDisplayedImage] = useState(backgroundImage);
  const [nextImageLoaded, setNextImageLoaded] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (backgroundImage === displayedImage) return;
    setImageError(false);
    // Preload the new image first
    setNextImageLoaded(false);
    const img = new window.Image();
    img.onload = () => {
      setNextImageLoaded(true);
      setDisplayedImage(backgroundImage);
    };
    img.onerror = () => {
      // Image failed to load — use fallback instead of broken image
      setNextImageLoaded(true);
      if (backgroundImage !== fallbackImage) {
        setDisplayedImage(fallbackImage);
      } else {
        setDisplayedImage(backgroundImage);
      }
    };
    // For /api/ proxy URLs, use them directly; for others, set src
    img.src = backgroundImage;
  }, [backgroundImage, displayedImage, fallbackImage]);

  return (
    <section ref={sectionRef} className="relative w-full min-h-[40vh] sm:min-h-[50vh] lg:min-h-[55vh] overflow-hidden bg-mitsu-obsidian">
      {/* Background Image with Parallax — seamless crossfade, NO blank flash */}
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: bgY }}>
        {/* No AnimatePresence mode = simultaneous crossfade, old stays until new is fully visible */}
        <AnimatePresence>
          <motion.div
            key={displayedImage}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <Image
              src={displayedImage}
              alt={title}
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority
              unoptimized={displayedImage.startsWith('/api/') || displayedImage.includes('vercel-storage.com')}
              onError={() => {
                // Replace broken image with fallback
                if (displayedImage !== fallbackImage) {
                  setDisplayedImage(fallbackImage);
                }
              }}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Flat overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Particle Effects - hidden on mobile */}
      <div className="hidden sm:block">
        <ParticleField />
      </div>

      {/* Luxury Decorative Lines - hidden on mobile */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block" style={{ zIndex: 2 }}>
        <div className={`absolute top-8 left-8 w-16 h-16 border-l border-t ${theme === 'yellow' ? 'border-mitsu-fuso-yellow/12' : 'border-mitsu-red/12'}`} />
        <div className={`absolute bottom-8 right-8 w-16 h-16 border-r border-b ${theme === 'yellow' ? 'border-mitsu-fuso-yellow/12' : 'border-mitsu-red/12'}`} />
        <div className={`absolute top-1/3 left-0 w-full h-px ${theme === 'yellow' ? 'bg-mitsu-fuso-yellow/10' : 'bg-mitsu-red/10'}`} />
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
            <div className={`w-10 h-px ${theme === 'yellow' ? 'bg-mitsu-fuso-yellow/40' : 'bg-mitsu-red/40'}`} />
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

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-white/30 z-[3]" />
      
      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-px ${theme === 'yellow' ? 'bg-mitsu-fuso-yellow/20' : 'bg-mitsu-red/20'} z-[4]`} />
    </section>
  );
}
