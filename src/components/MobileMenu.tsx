'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';

interface NavLink {
  label: string;
  href: string;
  isRoute: boolean;
}

interface MobileMenuProps {
  links: NavLink[];
  onClose: () => void;
  onNavClick: (href: string, isRoute: boolean) => void;
}

export default function MobileMenu({ links, onClose, onNavClick }: MobileMenuProps) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl border-l border-gray-100"
      >
        {/* Red top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-mitsu-red" />

        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <img
                src="/mitsubishi-logo.png"
                alt="Mitsubishi Motor Indonesia Logo"
                className="w-7 h-7 object-contain"
              />
              <span className="text-mitsu-dark font-bold tracking-[0.15em] text-sm font-serif">MITSUBISHI</span>
            </div>
            <span className="text-mitsu-red/40 text-[9px] ml-9 tracking-[0.1em] uppercase">Motor Indonesia</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-mitsu-red hover:bg-mitsu-red/5 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="py-4">
          {links.map((link, index) => (
            <motion.div
              key={link.href + link.label}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Link
                href={link.href}
                onClick={() => onNavClick(link.href, link.isRoute)}
                className="flex items-center px-6 py-3 text-gray-500 hover:text-mitsu-red hover:bg-mitsu-red/5 hover:border-l-2 hover:border-l-mitsu-red transition-all text-xs font-bold tracking-[0.15em] uppercase"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all min-h-[44px] text-sm tracking-wide"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Hubungi via WhatsApp
          </a>
        </div>
      </motion.div>
    </>
  );
}
