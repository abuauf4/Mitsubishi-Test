'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Globe, Camera, Mail, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const footerLinks = {
  kendaraan: {
    title: 'Kendaraan',
    links: [
      { label: 'Xpander', href: '/passenger' },
      { label: 'Xpander Cross', href: '/passenger' },
      { label: 'Pajero Sport', href: '/passenger' },
      { label: 'Xforce', href: '/passenger' },
      { label: 'Destinator', href: '/passenger' },
      { label: 'L100 EV', href: '/passenger' },
      { label: 'L300', href: '/passenger' },
      { label: 'Triton', href: '/commercial' },
      { label: 'Canter', href: '/commercial' },
      { label: 'FUSO', href: '/commercial' },
    ],
  },
  layanan: {
    title: 'Layanan',
    links: [
      { label: 'Test Drive', href: '/#test-drive' },
      { label: 'Simulasi Kredit', href: '/passenger#credit' },
      { label: 'Bandingkan Kendaraan', href: '/compare' },
      { label: 'Promo Terbaru', href: '/#promo' },
      { label: 'Fleet Solution', href: '/commercial#fleet' },
      { label: 'Sales Consultant', href: '/#sales' },
    ],
  },
  perusahaan: {
    title: 'Perusahaan',
    links: [
      { label: 'Tentang Mitsubishi', href: '/#why-mitsubishi' },
      { label: 'Karir', href: '#' },
      { label: 'Berita & Media', href: '#' },
      { label: 'Hubungi Kami', href: '/#sales' },
    ],
  },
  kontak: {
    title: 'Hubungi Sales',
    links: [
      { label: 'WhatsApp: 0812-3456-7890', href: 'https://wa.me/6281234567890', external: true },
      { label: 'Instagram: @andi.mitsubishi', href: 'https://instagram.com/andi.mitsubishi', external: true },
      { label: 'Email: andi.pratama@mitsubishi.co.id', href: 'mailto:andi.pratama@mitsubishi.co.id', external: true },
      { label: 'Telepon: 0812-3456-7890', href: 'tel:+6281234567890', external: true },
    ],
  },
};

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="relative bg-mitsu-obsidian overflow-hidden">
      {/* Top Gold Divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-mitsu-red/25" />

      {/* Background Pattern */}
      <div className="absolute inset-0 luxury-pattern-red" />
      <div className="absolute inset-0 noise-overlay" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 mb-14">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/mitsubishi-logo.png"
                alt="Mitsubishi Motor Indonesia Logo"
                className="w-8 h-8 object-contain"
              />
              <div>
                <span className="text-white font-bold text-sm tracking-[0.2em] font-serif">MITSUBISHI</span>
                <span className="block text-mitsu-red/30 text-[8px] tracking-[0.15em] uppercase">Motor Indonesia</span>
              </div>
            </div>
            <p className="text-white/20 text-xs leading-relaxed mb-5">
              Drive Your Ambition. Solusi kendaraan terpercaya untuk hidup dan bisnis Anda.
            </p>
            <div className="flex items-center gap-2">
              {[
                { icon: Globe, href: '#', label: 'Website' },
                { icon: Camera, href: 'https://instagram.com/andi.mitsubishi', label: 'Instagram' },
                { icon: Mail, href: 'mailto:andi.pratama@mitsubishi.co.id', label: 'Email' },
              ].map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/3 hover:bg-mitsu-red/10 text-white/20 hover:text-mitsu-red transition-all duration-400 hover:scale-110 border border-white/5 hover:border-mitsu-red/15"
                  >
                    <IconComponent className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Vehicles */}
          <div>
            <h4 className="text-white font-semibold text-xs mb-5 tracking-[0.15em] uppercase flex items-center gap-2">
              <span className="w-4 h-px bg-mitsu-red/40" />
              {footerLinks.kendaraan.title}
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.kendaraan.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/25 hover:text-mitsu-red text-xs transition-colors duration-400 hover:translate-x-1 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold text-xs mb-5 tracking-[0.15em] uppercase flex items-center gap-2">
              <span className="w-4 h-px bg-mitsu-red/40" />
              {footerLinks.layanan.title}
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.layanan.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/25 hover:text-mitsu-red text-xs transition-colors duration-400 hover:translate-x-1 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-xs mb-5 tracking-[0.15em] uppercase flex items-center gap-2">
              <span className="w-4 h-px bg-mitsu-red/40" />
              {footerLinks.perusahaan.title}
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.perusahaan.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/25 hover:text-mitsu-red text-xs transition-colors duration-400 hover:translate-x-1 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-xs mb-5 tracking-[0.15em] uppercase flex items-center gap-2">
              <span className="w-4 h-px bg-mitsu-red/40" />
              {footerLinks.kontak.title}
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.kontak.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="text-white/25 hover:text-mitsu-red text-xs transition-colors duration-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ornamental divider */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px bg-white/5" />
          <div className="w-1 h-1 bg-mitsu-red/30 rotate-45" />
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Newsletter Section */}
        <div className="mb-10 p-6 rounded-lg border border-white/5 bg-white/2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold text-sm font-serif">Dapatkan Informasi Terbaru</h4>
              <p className="text-white/25 text-xs mt-1">Promo, model terbaru, dan penawaran eksklusif langsung di inbox Anda.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full sm:w-auto">
              {subscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 border border-green-500/20 rounded-lg"
                >
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-xs font-semibold">Berhasil berlangganan!</span>
                </motion.div>
              ) : (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email Anda"
                    className="flex-1 sm:w-56 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-mitsu-red/40 focus:ring-1 focus:ring-mitsu-red/20 transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-mitsu-red hover:bg-mitsu-red/80 text-white text-xs font-bold rounded-lg transition-all hover:scale-105 active:scale-95 min-h-[40px]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Kirim</span>
                  </button>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-white/15 text-[10px] tracking-wider">
              &copy; {new Date().getFullYear()} Mitsubishi Motor Indonesia. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-mitsu-red/20 text-[9px] tracking-[0.25em] uppercase font-serif italic">Drive Your Ambition</span>
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-white/3 hover:bg-mitsu-red/8 text-white/25 hover:text-mitsu-red rounded-lg transition-colors text-xs font-semibold min-h-[44px] border border-white/5 hover:border-mitsu-red/15 tracking-wider uppercase"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              Kembali ke Atas
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}
