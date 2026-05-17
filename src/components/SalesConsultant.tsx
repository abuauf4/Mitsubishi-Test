'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle, Mail, Camera, Phone, MapPin,
  Award, Users, Car, Star, Clock
} from 'lucide-react';
import Image from 'next/image';

interface SalesData {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  title: string;
  description: string;
  imagePath: string;
}

const fallbackSales: SalesData = {
  name: 'Andi Pratama',
  phone: '0812-3456-7890',
  whatsapp: '081234567890',
  email: 'andi.pratama@mitsubishi.co.id',
  title: 'Sales Consultant',
  description: 'Saya adalah Sales Consultant resmi Mitsubishi dengan pengalaman lebih dari 10 tahun. Siap membantu Anda menemukan kendaraan yang tepat — mulai dari konsultasi, test drive, simulasi kredit, hingga proses pengiriman kendaraan.',
  imagePath: '/images/andi-profile.png',
};

const achievements = [
  { icon: Award, label: 'Top Sales 2024', desc: 'Penghargaan tertinggi' },
  { icon: Users, label: '500+ Pelanggan', desc: 'Telah dilayani' },
  { icon: Car, label: '10+ Tahun', desc: 'Pengalaman' },
  { icon: Star, label: 'Rating 4.9/5', desc: 'Dari pelanggan' },
];

export default function SalesConsultant() {
  const [sales, setSales] = useState<SalesData>(fallbackSales);
  const [photoSrc, setPhotoSrc] = useState(fallbackSales.imagePath);

  useEffect(() => {
    async function fetchSales() {
      try {
        const res = await fetch('/api/sales', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const c = data[0];
          setSales({
            name: c.name || fallbackSales.name,
            phone: c.phone || fallbackSales.phone,
            whatsapp: c.whatsapp || fallbackSales.whatsapp,
            email: c.email || fallbackSales.email,
            title: c.title || fallbackSales.title,
            description: c.description || fallbackSales.description,
            imagePath: c.imagePath || fallbackSales.imagePath,
          });
          if (c.imagePath) {
            setPhotoSrc(c.imagePath);
          }
        }
      } catch {
        // Use fallback
      }
    }
    fetchSales();
  }, []);

  // Build contact links dynamically from sales data
  const contacts = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: sales.phone,
      href: `https://wa.me/${sales.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Halo ${sales.name}, saya ingin bertanya tentang kendaraan Mitsubishi`)}`,
      gradient: 'bg-green-600',
      hoverGradient: 'hover:bg-green-700',
    },
    {
      icon: Camera,
      label: 'Instagram',
      value: `@${sales.name.split(' ')[0].toLowerCase()}.mitsubishi`,
      href: `https://instagram.com/${sales.name.split(' ')[0].toLowerCase()}.mitsubishi`,
      gradient: 'bg-purple-600',
      hoverGradient: 'hover:bg-purple-700',
    },
    {
      icon: Mail,
      label: 'Email',
      value: sales.email,
      href: `mailto:${sales.email}`,
      gradient: 'bg-blue-600',
      hoverGradient: 'hover:bg-blue-700',
    },
    {
      icon: Phone,
      label: 'Telepon',
      value: sales.phone,
      href: `tel:+${sales.phone.replace(/\D/g, '')}`,
      gradient: 'bg-amber-600',
      hoverGradient: 'hover:bg-amber-700',
    },
  ];

  return (
    <section id="sales" className="relative py-24 sm:py-28 lg:py-32 bg-white overflow-hidden">
      {/* Luxury grid pattern */}
      <div className="absolute inset-0 luxury-pattern-grid" />

      {/* Decorative */}
      <div className="absolute top-0 left-0 w-full h-px bg-gray-200" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gray-200" />

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
            Sales Consultant
            <span className="w-10 h-px bg-mitsu-red/50" />
          </span>
          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold text-mitsu-dark font-serif">
            Konsultasi dengan{' '}
            <span className="text-mitsu-red">Ahlinya</span>
          </h2>
          <p className="mt-5 text-gray-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Hubungi sales consultant kami untuk konsultasi, test drive, dan penawaran terbaik.
          </p>

          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-12 h-px bg-gray-200" />
            <div className="w-1.5 h-1.5 bg-mitsu-red/50 rotate-45" />
            <div className="w-12 h-px bg-gray-200" />
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="relative card-light-red rounded-lg p-6 sm:p-8 overflow-hidden card-shine-red">
              {/* Red top accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-mitsu-red" />
              
              {/* Decorative glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-mitsu-red/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-mitsu-red/5 rounded-full blur-3xl" />

              <div className="relative z-10">
                {/* Photo + Name */}
                <div className="flex flex-col items-center mb-6">
                  {/* Half-body photo */}
                  <div className="relative w-36 sm:w-44 h-48 sm:h-56 rounded-lg overflow-hidden border-2 border-mitsu-red/15 shadow-lg shadow-mitsu-red/5 mb-4">
                    <Image
                      src={photoSrc}
                      alt={`${sales.name} - ${sales.title}`}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 640px) 144px, 176px"
                      unoptimized={photoSrc.startsWith('/api/')}
                      onError={() => {
                        setPhotoSrc('/images/andi-profile.png');
                      }}
                    />
                    {/* Online indicator */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-green-500/90 rounded">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      <span className="text-white text-[9px] font-bold">Online</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-mitsu-dark font-serif">{sales.name}</h3>
                    <p className="text-mitsu-red text-xs font-medium mt-0.5 tracking-wide">{sales.title}</p>
                    <p className="text-gray-400 text-[11px] mt-1 flex items-center gap-1.5 justify-center">
                      <MapPin className="w-3 h-3" />
                      PT. Mitsubishi Motors Jakarta
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {sales.description}
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {achievements.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <div key={item.label} className="bg-mitsu-red/5 border border-mitsu-red/8 rounded-lg p-2 text-center group hover:bg-mitsu-red/8 transition-colors duration-300">
                        <IconComponent className="w-3 h-3 text-mitsu-red mx-auto mb-1" />
                        <p className="text-mitsu-dark text-[10px] font-bold leading-tight">{item.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Operating Hours */}
                <div className="bg-mitsu-red/5 border border-mitsu-red/8 rounded-lg px-3 py-2 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-mitsu-red flex-shrink-0" />
                  <div>
                    <p className="text-mitsu-dark text-[10px] font-semibold">Senin - Sabtu: 08:00 - 17:00 WIB</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact + CTA */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            {/* Contact Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {contacts.map((contact, index) => {
                const IconComponent = contact.icon;
                return (
                  <motion.a
                    key={contact.label}
                    href={contact.href}
                    target={contact.href.startsWith('http') ? '_blank' : undefined}
                    rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group relative flex items-center gap-2.5 p-3 rounded-lg card-light hover-red-border-light transition-all duration-400"
                  >
                    <div className={`w-8 h-8 rounded-lg ${contact.gradient} ${contact.hoverGradient} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.1em]">{contact.label}</p>
                      <p className="text-mitsu-dark text-[11px] font-semibold mt-0.5 truncate">{contact.value}</p>
                    </div>
                  </motion.a>
                );
              })}
            </div>

            {/* Main CTA */}
            <div className="relative card-light-red rounded-lg p-5 overflow-hidden card-shine-red">
              {/* Red top accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-mitsu-red" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-mitsu-red/5 rounded-full blur-3xl" />

              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-mitsu-dark text-base sm:text-lg font-bold font-serif">
                    Siap Membantu Anda!
                  </h4>
                  <p className="text-gray-500 text-xs mt-1">
                    Konsultasi gratis, tanpa komitmen. Dapatkan penawaran harga terbaik.
                  </p>
                </div>
                <a
                  href={`https://wa.me/${sales.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Halo ${sales.name}, saya ingin konsultasi tentang kendaraan Mitsubishi`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all duration-300 text-xs tracking-wide hover:shadow-lg hover:shadow-green-500/15 active:scale-95"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chat WhatsApp
                </a>
              </div>
            </div>

            {/* Dealer Info */}
            <div className="mt-3 p-4 card-light rounded-lg hover-red-border-light transition-all duration-400">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-mitsu-red/8 rounded-lg flex items-center justify-center flex-shrink-0 border border-mitsu-red/10">
                  <MapPin className="w-4 h-4 text-mitsu-red" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-mitsu-dark text-xs font-bold">PT. Mitsubishi Motors Jakarta Pusat</h4>
                  <p className="text-gray-400 text-[11px] mt-0.5">Jl. Jend. Sudirman No. 123, Jakarta Pusat 10220</p>
                  <p className="text-gray-400 text-[11px] mt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3 h-3" />
                    (021) 555-1234
                  </p>
                </div>
                <a
                  href="https://maps.google.com/?q=PT+Mitsubishi+Motors+Jakarta+Pusat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 px-3 py-1.5 text-mitsu-red hover:bg-mitsu-red/5 rounded-lg text-[11px] font-semibold transition-all duration-300 border border-mitsu-red/10 hover:border-mitsu-red/25 flex items-center"
                >
                  Arah
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
