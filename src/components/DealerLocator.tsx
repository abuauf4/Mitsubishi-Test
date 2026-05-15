'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Phone, Navigation, Building2 } from 'lucide-react';

const dealers = [
  {
    id: 1,
    name: 'Mitsubishi Jakarta Pusat',
    address: 'Jl. Jend. Sudirman No. 123, Jakarta Pusat',
    phone: '(021) 555-1234',
    city: 'Jakarta',
  },
  {
    id: 2,
    name: 'Mitsubishi Surabaya',
    address: 'Jl. Ahmad Yani No. 456, Surabaya',
    phone: '(031) 555-5678',
    city: 'Surabaya',
  },
  {
    id: 3,
    name: 'Mitsubishi Bandung',
    address: 'Jl. Soekarno-Hatta No. 789, Bandung',
    phone: '(022) 555-9012',
    city: 'Bandung',
  },
  {
    id: 4,
    name: 'Mitsubishi Medan',
    address: 'Jl. Gatot Subroto No. 321, Medan',
    phone: '(061) 555-3456',
    city: 'Medan',
  },
  {
    id: 5,
    name: 'Mitsubishi Semarang',
    address: 'Jl. Pemuda No. 654, Semarang',
    phone: '(024) 555-7890',
    city: 'Semarang',
  },
];

export default function DealerLocator() {
  const [searchCity, setSearchCity] = useState('');

  const filteredDealers = dealers.filter(
    (dealer) =>
      dealer.city.toLowerCase().includes(searchCity.toLowerCase()) ||
      dealer.name.toLowerCase().includes(searchCity.toLowerCase()) ||
      dealer.address.toLowerCase().includes(searchCity.toLowerCase())
  );

  return (
    <section id="dealer" className="relative py-20 sm:py-24 lg:py-28 bg-white overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #333 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 text-mitsu-red text-xs sm:text-sm font-semibold tracking-widest uppercase">
            <span className="w-8 h-px bg-mitsu-red" />
            Dealer Location
            <span className="w-8 h-px bg-mitsu-red" />
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-mitsu-dark">
            Temukan Dealer{' '}
            <span className="text-mitsu-red">Terdekat</span>
          </h2>
          <p className="mt-4 text-mitsu-text/60 text-base sm:text-lg max-w-2xl mx-auto">
            Lebih dari 150 dealer resmi tersebar di seluruh Indonesia. Cari dealer terdekat dengan Anda.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden bg-gray-50 min-h-[380px] sm:min-h-[480px] border border-gray-200/50"
          >
            {/* Stylized Map */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                {/* Grid lines */}
                <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#333" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Map pin markers */}
                <div className="absolute top-[25%] left-[30%] flex flex-col items-center">
                  <div className="w-10 h-10 bg-mitsu-red rounded-xl flex items-center justify-center shadow-lg shadow-mitsu-red/30 red-pulse">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <span className="mt-1.5 text-xs font-semibold text-mitsu-dark bg-white px-2.5 py-1 rounded-lg shadow-sm border border-gray-100">Jakarta</span>
                </div>
                <div className="absolute top-[40%] left-[65%] flex flex-col items-center">
                  <div className="w-8 h-8 bg-mitsu-red/80 rounded-lg flex items-center justify-center shadow-md">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="mt-1.5 text-xs font-medium text-mitsu-dark bg-white px-2 py-0.5 rounded shadow-sm">Surabaya</span>
                </div>
                <div className="absolute top-[45%] left-[35%] flex flex-col items-center">
                  <div className="w-8 h-8 bg-mitsu-red/80 rounded-lg flex items-center justify-center shadow-md">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="mt-1.5 text-xs font-medium text-mitsu-dark bg-white px-2 py-0.5 rounded shadow-sm">Bandung</span>
                </div>
                <div className="absolute top-[15%] left-[55%] flex flex-col items-center">
                  <div className="w-8 h-8 bg-mitsu-red/80 rounded-lg flex items-center justify-center shadow-md">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="mt-1.5 text-xs font-medium text-mitsu-dark bg-white px-2 py-0.5 rounded shadow-sm">Medan</span>
                </div>
                <div className="absolute top-[50%] left-[50%] flex flex-col items-center">
                  <div className="w-8 h-8 bg-mitsu-red/80 rounded-lg flex items-center justify-center shadow-md">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="mt-1.5 text-xs font-medium text-mitsu-dark bg-white px-2 py-0.5 rounded shadow-sm">Semarang</span>
                </div>

                {/* Center branding */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm border border-gray-100">
                  <img src="/mitsubishi-logo.png" alt="Mitsubishi" className="w-5 h-5 object-contain" />
                  <span className="text-xs font-bold text-mitsu-dark tracking-wide">MITSUBISHI DEALER</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dealer List */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          >
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Cari berdasarkan kota..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-mitsu-red focus:ring-2 focus:ring-mitsu-red/20 text-sm outline-none transition-all min-h-[44px] bg-white shadow-sm"
              />
            </div>

            {/* Dealer Cards */}
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredDealers.length === 0 ? (
                <div className="text-center py-10 text-mitsu-text/40">
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Tidak ada dealer ditemukan untuk &quot;{searchCity}&quot;</p>
                </div>
              ) : (
                filteredDealers.map((dealer, index) => (
                  <motion.div
                    key={dealer.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="p-4 sm:p-5 bg-white rounded-2xl border border-gray-100 hover:border-mitsu-red/20 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-mitsu-dark text-sm sm:text-base group-hover:text-mitsu-red transition-colors">
                          {dealer.name}
                        </h4>
                        <div className="mt-2 space-y-1.5">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-mitsu-red mt-0.5 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-mitsu-text/50">{dealer.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-mitsu-red flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-mitsu-text/50">{dealer.phone}</span>
                          </div>
                        </div>
                      </div>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(dealer.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 text-mitsu-red hover:bg-mitsu-red/5 rounded-xl transition-colors text-xs font-medium min-h-[44px] min-w-[44px] justify-center border border-transparent hover:border-mitsu-red/10"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Petunjuk</span>
                      </a>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
