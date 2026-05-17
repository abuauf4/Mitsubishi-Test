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
  variant?: 'default' | 'commercial';
}

export default function MobileMenu({ links, onClose, onNavClick, variant = 'default' }: MobileMenuProps) {
  const isCommercial = variant === 'commercial';

  const accentColor = isCommercial ? '#FFD600' : '#E60012';
  const bgClass = isCommercial ? 'bg-white' : 'bg-white';
  const textMain = isCommercial ? 'text-mitsu-dark' : 'text-mitsu-dark';
  const textSub = isCommercial ? 'text-mitsu-dark/50' : 'text-gray-500';
  const textHover = isCommercial ? 'hover:text-mitsu-fuso-yellow hover:bg-mitsu-fuso-yellow/5 hover:border-l-mitsu-fuso-yellow' : 'hover:text-mitsu-red hover:bg-mitsu-red/5 hover:border-l-mitsu-red';
  const border = isCommercial ? 'border-gray-100' : 'border-gray-100';
  const ctaBtn = isCommercial ? 'bg-mitsu-fuso-yellow hover:bg-mitsu-fuso-yellow-dark text-mitsu-obsidian' : 'bg-green-600 hover:bg-green-700 text-white';
  const logoBrand = isCommercial ? 'FUSO' : 'MITSUBISHI';
  const logoSub = isCommercial ? 'Commercial Vehicles' : 'Motor Indonesia';
  const logoSubColor = isCommercial ? 'text-mitsu-fuso-yellow/60' : 'text-mitsu-red/40';
  const logoIcon = isCommercial
    ? <FusoDiamondIcon />
    : <MitsuDiamondIcon />;

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
        className={`fixed top-0 right-0 bottom-0 w-[280px] ${bgClass} z-50 shadow-2xl border-l ${border}`}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: accentColor }} />

        <div className={`flex items-center justify-between p-4 border-b ${border}`}>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {logoIcon}
              <span className={`${textMain} font-bold tracking-[0.15em] text-sm font-serif`}>{logoBrand}</span>
            </div>
            <span className={`${logoSubColor} text-[9px] ml-9 tracking-[0.1em] uppercase`}>{logoSub}</span>
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
                className={`flex items-center px-6 py-3 ${textSub} ${textHover} transition-all text-xs font-bold tracking-[0.15em] uppercase border-l-2 border-l-transparent`}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className={`absolute bottom-0 left-0 right-0 p-6 border-t ${border}`}>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 w-full py-3 ${ctaBtn} font-bold rounded-xl transition-all min-h-[44px] text-sm tracking-wide`}
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

function MitsuDiamondIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-7 h-7 object-contain" aria-label="Mitsubishi">
      <g transform="translate(50, 50)">
        <polygon fill="#E60012" points="0,-34 -12,-10 0,0 12,-10" />
        <polygon fill="#E60012" points="12,-10 0,0 12,22 24,0" />
        <polygon fill="#E60012" points="-12,-10 0,0 -12,22 -24,0" />
      </g>
    </svg>
  );
}

function FusoDiamondIcon() {
  return (
    <svg viewBox="0 0 120 40" className="w-7 h-7 object-contain" aria-label="FUSO">
      <text x="0" y="30" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="36" fill="#FFD600" letterSpacing="2">FUSO</text>
    </svg>
  );
}
