'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ArrowUp } from 'lucide-react';

export default function FloatingWhatsApp() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* ===== Mobile Sticky Bottom Bar (sm and below) ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
        <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/[0.06] px-4 py-2.5 flex items-center gap-2 safe-bottom">
          {/* Primary CTA - Premium red */}
          <a
            href="https://wa.me/6281234567890?text=Halo%20Andi,%20saya%20ingin%20bertanya%20tentang%20kendaraan%20Mitsubishi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 btn-premium-cta rounded-xl text-[11px] font-extrabold tracking-wider min-h-[48px]"
          >
            <MessageCircle className="w-4 h-4" />
            CHAT SALES
          </a>
          {/* Secondary - Booking Test Drive */}
          <a
            href="https://wa.me/6281234567890?text=Halo%20Andi,%20saya%20ingin%20booking%20test%20drive%20Mitsubishi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 btn-premium-dark rounded-xl text-[11px] font-bold tracking-wider min-h-[48px]"
          >
            BOOKING TEST DRIVE
          </a>
          {showTop && (
            <button
              onClick={scrollToTop}
              className="w-11 h-11 flex items-center justify-center bg-[#1A1A1A] rounded-xl text-white/50 border border-white/[0.06] hover:text-white/80 transition-colors min-h-[48px]"
              aria-label="Kembali ke atas"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ===== Desktop: Floating WhatsApp + Back-to-Top (sm and up) ===== */}
      <div className="hidden sm:block">
        {/* Back to Top */}
        <AnimatePresence>
          {showTop && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={scrollToTop}
              className="fixed bottom-24 right-6 z-40 w-11 h-11 bg-[#111111] hover:bg-[#1A1A1A] rounded-xl flex items-center justify-center shadow-xl border border-white/[0.06] text-white/40 hover:text-white/80 transition-all duration-300 hover:shadow-2xl"
              aria-label="Kembali ke atas"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* WhatsApp FAB - Premium dark with red glow on hover */}
        <motion.a
          href="https://wa.me/6281234567890?text=Halo%20Andi,%20saya%20ingin%20bertanya%20tentang%20kendaraan%20Mitsubishi"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.6, type: 'spring', stiffness: 200 }}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#0A0A0A] hover:bg-[#111111] rounded-2xl flex items-center justify-center shadow-xl border border-white/[0.08] transition-all duration-400 hover:scale-110 active:scale-95 group hover:border-[#D6001C]/30 hover:shadow-[0_0_20px_rgba(214,0,28,0.15)]"
          aria-label="Hubungi Andi via WhatsApp"
        >
          <MessageCircle className="w-6 h-6 text-[#25D366] group-hover:text-[#25D366] transition-colors" />
          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-4 py-2.5 bg-[#111111] text-white/80 text-[10px] font-bold rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none group-hover:translate-x-0 translate-x-2 tracking-[0.1em] uppercase border border-white/[0.06]">
            Chat Sales Mitsubishi
            <span className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-[#111111] rotate-45 border-r border-b border-white/[0.06]" />
          </span>
        </motion.a>
      </div>
    </>
  );
}
