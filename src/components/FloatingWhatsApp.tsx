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
        <div className="bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-2.5 flex items-center gap-2 safe-bottom">
          <a
            href="https://wa.me/6281234567890?text=Halo%20Andi,%20saya%20ingin%20bertanya%20tentang%20kendaraan%20Mitsubishi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl text-xs tracking-wide"
          >
            <MessageCircle className="w-4 h-4" />
            Chat WhatsApp
          </a>
          {showTop && (
            <button
              onClick={scrollToTop}
              className="w-10 h-10 flex items-center justify-center bg-mitsu-light rounded-xl text-mitsu-dark border border-gray-200"
              aria-label="Kembali ke atas"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ===== Desktop: Floating WhatsApp + Back-to-Top (md and up) ===== */}
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
              className="fixed bottom-24 right-6 z-40 w-11 h-11 bg-white hover:bg-mitsu-light rounded-xl flex items-center justify-center shadow-lg border border-gray-200 text-mitsu-dark/60 hover:text-mitsu-red transition-all duration-300 hover:shadow-xl"
              aria-label="Kembali ke atas"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* WhatsApp FAB */}
        <motion.a
          href="https://wa.me/6281234567890?text=Halo%20Andi,%20saya%20ingin%20bertanya%20tentang%20kendaraan%20Mitsubishi"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.6, type: 'spring', stiffness: 200 }}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 whatsapp-pulse transition-all duration-400 hover:scale-110 active:scale-95 group"
          aria-label="Hubungi Andi via WhatsApp"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-4 py-2.5 bg-white text-mitsu-dark text-[10px] font-semibold rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-400 whitespace-nowrap pointer-events-none group-hover:translate-x-0 translate-x-2 tracking-wider uppercase border border-gray-200">
            Chat Andi via WhatsApp
            <span className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-white rotate-45 border-r border-b border-gray-200" />
          </span>
        </motion.a>
      </div>
    </>
  );
}
