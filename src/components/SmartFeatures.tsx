'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Calculator, Building2, Search, ChevronRight } from 'lucide-react';

const vehicleDatabase = [
  // Passenger (7 models)
  { name: 'Xpander', type: 'mpv', category: 'passenger', price: 271, purpose: 'keluarga' },
  { name: 'Xpander Cross', type: 'mpv', category: 'passenger', price: 345, purpose: 'keluarga' },
  { name: 'Pajero Sport', type: 'suv', category: 'passenger', price: 586, purpose: 'petualangan' },
  { name: 'Destinator', type: 'suv', category: 'passenger', price: 397, purpose: 'keluarga' },
  { name: 'Xforce', type: 'suv', category: 'passenger', price: 390, purpose: 'keluarga' },
  { name: 'L100 EV', type: 'ev', category: 'passenger', price: 323, purpose: 'bisnis' },
  { name: 'L300', type: 'pickup', category: 'passenger', price: 240, purpose: 'bisnis' },
  // Niaga Ringan (1 model)
  { name: 'Triton', type: 'pickup', category: 'niaga-ringan', price: 325, purpose: 'petualangan' },
  // FUSO Commercial (5 models)
  { name: 'Canter FE 71', type: 'truk', category: 'commercial', price: 468, purpose: 'bisnis' },
  { name: 'Canter FE 74', type: 'truk', category: 'commercial', price: 532, purpose: 'bisnis' },
  { name: 'Canter FE 84', type: 'truk', category: 'commercial', price: 558, purpose: 'bisnis' },
  { name: 'FUSO Fighter X', type: 'truk', category: 'commercial', price: 970, purpose: 'bisnis' },
  { name: 'FUSO Heavy Duty', type: 'truk', category: 'commercial', price: 1350, purpose: 'bisnis' },
];

export default function SmartFeatures() {
  const [activeTab, setActiveTab] = useState<'finder' | 'credit' | 'fleet'>('finder');

  // Vehicle Finder State
  const [finderType, setFinderType] = useState('all');
  const [finderBudget, setFinderBudget] = useState('all');
  const [finderPurpose, setFinderPurpose] = useState('all');

  // Credit Simulation State
  const [creditPrice, setCreditPrice] = useState(289);
  const [creditDP, setCreditDP] = useState(30);
  const [creditTenor, setCreditTenor] = useState(48);

  const filteredVehicles = vehicleDatabase.filter((v) => {
    if (finderType !== 'all' && v.type !== finderType) return false;
    if (finderBudget !== 'all') {
      const maxPrice = parseInt(finderBudget);
      if (v.price > maxPrice) return false;
    }
    if (finderPurpose !== 'all' && v.purpose !== finderPurpose) return false;
    return true;
  });

  const calculateMonthlyPayment = () => {
    const priceAmount = creditPrice * 1000000;
    const dpAmount = priceAmount * (creditDP / 100);
    const loanAmount = priceAmount - dpAmount;
    const monthlyInterest = 0.04 / 12; // 4% annual
    const totalMonths = creditTenor;
    const monthlyPayment =
      (loanAmount * monthlyInterest * Math.pow(1 + monthlyInterest, totalMonths)) /
      (Math.pow(1 + monthlyInterest, totalMonths) - 1);
    return Math.round(monthlyPayment);
  };

  const monthlyPayment = calculateMonthlyPayment();

  const tabs = [
    { id: 'finder' as const, label: 'Vehicle Finder', icon: Search },
    { id: 'credit' as const, label: 'Simulasi Kredit', icon: Calculator },
    { id: 'fleet' as const, label: 'Fleet Solution', icon: Building2 },
  ];

  return (
    <section id="smart-features" className="relative py-16 sm:py-20 lg:py-24 bg-mitsu-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="text-mitsu-red text-xs sm:text-sm font-semibold tracking-widest uppercase">
            Smart Features
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold text-mitsu-dark">
            Tools Cerdas untuk Anda
          </h2>
          <p className="mt-3 text-mitsu-text/70 text-base sm:text-lg max-w-2xl mx-auto">
            Temukan kendaraan yang tepat, hitung kredit, atau konsultasi kebutuhan fleet Anda.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="flex bg-white rounded-lg p-1.5 shadow-sm border border-gray-100">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all duration-300 min-h-[44px] ${
                    activeTab === tab.id
                      ? 'bg-mitsu-red text-white shadow-md'
                      : 'text-mitsu-text/70 hover:text-mitsu-dark hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          {/* Vehicle Finder */}
          {activeTab === 'finder' && (
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-mitsu-red/10 rounded-lg">
                  <Car className="w-5 h-5 text-mitsu-red" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-mitsu-dark">Temukan Kendaraan Anda</h3>
                  <p className="text-sm text-mitsu-text/60">Filter berdasarkan kebutuhan Anda</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-mitsu-text mb-2">Tipe Kendaraan</label>
                  <select
                    value={finderType}
                    onChange={(e) => setFinderType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-mitsu-red focus:ring-1 focus:ring-mitsu-red text-sm outline-none transition-all min-h-[44px]"
                  >
                    <option value="all">Semua Tipe</option>
                    <option value="mpv">MPV</option>
                    <option value="suv">SUV</option>
                    <option value="pickup">Pickup</option>
                    <option value="ev">Electric Vehicle</option>
                    <option value="truk">Truk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-mitsu-text mb-2">Budget Maks</label>
                  <select
                    value={finderBudget}
                    onChange={(e) => setFinderBudget(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-mitsu-red focus:ring-1 focus:ring-mitsu-red text-sm outline-none transition-all min-h-[44px]"
                  >
                    <option value="all">Semua Budget</option>
                    <option value="200">Di bawah Rp 200 Juta</option>
                    <option value="400">Rp 200 - 400 Juta</option>
                    <option value="600">Rp 400 - 600 Juta</option>
                    <option value="1000">Rp 600 Juta - 1 Miliar</option>
                    <option value="1500">Di atas Rp 1 Miliar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-mitsu-text mb-2">Kebutuhan</label>
                  <select
                    value={finderPurpose}
                    onChange={(e) => setFinderPurpose(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-mitsu-red focus:ring-1 focus:ring-mitsu-red text-sm outline-none transition-all min-h-[44px]"
                  >
                    <option value="all">Semua Kebutuhan</option>
                    <option value="keluarga">Keluarga</option>
                    <option value="petualangan">Petualangan</option>
                    <option value="bisnis">Bisnis</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVehicles.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-mitsu-text/50">
                    <Car className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Tidak ada kendaraan yang cocok dengan filter Anda.</p>
                    <p className="text-sm mt-1">Coba ubah kriteria pencarian.</p>
                  </div>
                ) : (
                  filteredVehicles.map((v) => (
                    <div
                      key={v.name}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-mitsu-red/5 hover:border-mitsu-red/20 border border-transparent transition-all cursor-pointer group"
                    >
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Car className="w-5 h-5 text-mitsu-red" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-mitsu-dark text-sm">Mitsubishi {v.name}</h4>
                        <p className="text-xs text-mitsu-text/50">Mulai Rp {v.price} Juta</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-mitsu-text/30 group-hover:text-mitsu-red transition-colors" />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Credit Simulation */}
          {activeTab === 'credit' && (
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-mitsu-red/10 rounded-lg">
                  <Calculator className="w-5 h-5 text-mitsu-red" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-mitsu-dark">Simulasi Kredit</h3>
                  <p className="text-sm text-mitsu-text/60">Hitung estimasi angsuran bulanan Anda</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-mitsu-text mb-2">
                      Harga Kendaraan: Rp {creditPrice} Juta
                    </label>
                    <input
                      type="range"
                      min="150"
                      max="1500"
                      value={creditPrice}
                      onChange={(e) => setCreditPrice(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-mitsu-red"
                    />
                    <div className="flex justify-between text-xs text-mitsu-text/40 mt-1">
                      <span>Rp 150 Jt</span>
                      <span>Rp 1,5 M</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-mitsu-text mb-2">
                      Uang Muka (DP): {creditDP}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      step="5"
                      value={creditDP}
                      onChange={(e) => setCreditDP(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-mitsu-red"
                    />
                    <div className="flex justify-between text-xs text-mitsu-text/40 mt-1">
                      <span>10%</span>
                      <span>80%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-mitsu-text mb-2">
                      Tenor: {creditTenor} Bulan
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      step="12"
                      value={creditTenor}
                      onChange={(e) => setCreditTenor(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-mitsu-red"
                    />
                    <div className="flex justify-between text-xs text-mitsu-text/40 mt-1">
                      <span>12 bln</span>
                      <span>72 bln</span>
                    </div>
                  </div>
                </div>

                {/* Result */}
                <div className="bg-mitsu-dark rounded-lg p-6 sm:p-8 text-white flex flex-col justify-center">
                  <p className="text-white/60 text-sm mb-2">Estimasi Angsuran Bulanan</p>
                  <p className="text-3xl sm:text-4xl font-bold mb-1">
                    Rp {monthlyPayment.toLocaleString('id-ID')}
                  </p>
                  <p className="text-white/50 text-xs mb-6">/bulan (estimasi, bunga 4%/tahun)</p>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Harga Kendaraan</span>
                      <span>Rp {(creditPrice * 1000000).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Uang Muka ({creditDP}%)</span>
                      <span>Rp {((creditPrice * 1000000 * creditDP) / 100).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Jumlah Pinjaman</span>
                      <span>
                        Rp {((creditPrice * 1000000 * (100 - creditDP)) / 100).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Tenor</span>
                      <span>{creditTenor} bulan</span>
                    </div>
                  </div>

                  <p className="text-white/30 text-xs mt-6">
                    *Simulasi ini bersifat estimasi. Hubungi dealer untuk penawaran resmi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Fleet Solution */}
          {activeTab === 'fleet' && (
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-mitsu-red/10 rounded-lg">
                  <Building2 className="w-5 h-5 text-mitsu-red" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-mitsu-dark">Fleet Solution</h3>
                  <p className="text-sm text-mitsu-text/60">Solusi armada untuk bisnis Anda</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-mitsu-text/70 leading-relaxed mb-6">
                    Mitsubishi menyediakan solusi fleet terpadu untuk kebutuhan bisnis Anda.
                    Mulai dari konsultasi pemilihan kendaraan, paket pembiayaan khusus,
                    hingga layanan after sales yang menyeluruh.
                  </p>

                  <ul className="space-y-3">
                    {[
                      'Konsultasi kebutuhan armada gratis',
                      'Paket pembiayaan khusus fleet',
                      'Diskon khusus pembelian volume',
                      'Prioritas layanan bengkel fleet',
                      'Program maintenance terjadwal',
                      'Dedicated account manager',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-mitsu-red/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <ChevronRight className="w-3 h-3 text-mitsu-red" />
                        </div>
                        <span className="text-sm text-mitsu-text/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-mitsu-dark rounded-lg p-6 sm:p-8 text-white flex flex-col justify-center">
                  <Building2 className="w-10 h-10 text-mitsu-red mb-4" />
                  <h4 className="text-xl font-bold mb-2">Butuh Solusi Fleet?</h4>
                  <p className="text-white/60 text-sm mb-6">
                    Tim fleet specialist kami siap membantu menemukan solusi terbaik untuk bisnis Anda.
                  </p>
                  <a
                    href="#test-drive"
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector('#test-drive')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-mitsu-red hover:bg-red-700 text-white font-semibold rounded-lg transition-colors min-h-[44px] text-sm"
                  >
                    Konsultasi Sekarang
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
