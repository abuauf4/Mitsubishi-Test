'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, MessageCircle } from 'lucide-react';

export default function CreditSimulation() {
  const [creditPrice, setCreditPrice] = useState(289);
  const [creditDP, setCreditDP] = useState(30);
  const [creditTenor, setCreditTenor] = useState(48);

  const calculateMonthlyPayment = () => {
    const priceAmount = creditPrice * 1000000;
    const dpAmount = priceAmount * (creditDP / 100);
    const loanAmount = priceAmount - dpAmount;
    const monthlyInterest = 0.04 / 12;
    const totalMonths = creditTenor;
    const monthlyPayment =
      (loanAmount * monthlyInterest * Math.pow(1 + monthlyInterest, totalMonths)) /
      (Math.pow(1 + monthlyInterest, totalMonths) - 1);
    return Math.round(monthlyPayment);
  };

  const monthlyPayment = calculateMonthlyPayment();

  const getSliderBackground = (value: number, min: number, max: number) => {
    const percentage = ((value - min) / (max - min)) * 100;
    return `linear-gradient(to right, #E60012 0%, #E60012 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
  };

  return (
    <section className="relative py-24 sm:py-28 lg:py-32 bg-mitsu-light overflow-hidden">
      {/* Light pattern */}
      <div className="absolute inset-0 luxury-pattern-light" />

      {/* Decorative */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-center mb-14 sm:mb-18"
        >
          <span className="inline-flex items-center gap-3 text-mitsu-red text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase">
            <span className="w-10 h-px bg-gradient-to-r from-transparent to-mitsu-red/50" />
            Simulasi Kredit
            <span className="w-10 h-px bg-gradient-to-l from-transparent to-mitsu-red/50" />
          </span>
          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold text-mitsu-dark font-serif">
            Hitung Angsuran{' '}
            <span className="text-red-shimmer italic">Anda</span>
          </h2>
          <p className="mt-5 text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
            Gunakan kalkulator kredit untuk estimasi angsuran bulanan. Hubungi saya untuk penawaran resmi.
          </p>

          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gray-200" />
            <div className="w-1.5 h-1.5 bg-mitsu-red/50 rotate-45" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gray-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative card-light-red rounded-3xl p-6 sm:p-8 overflow-hidden card-shine-red">
            {/* Red top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-mitsu-red via-red-400 to-mitsu-red" />

            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-mitsu-red/5 rounded-2xl border border-mitsu-red/10">
                <Calculator className="w-6 h-6 text-mitsu-red" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-mitsu-dark font-serif">Simulasi Kredit</h3>
                <p className="text-sm text-gray-400">Hitung estimasi angsuran bulanan Anda</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
              {/* Inputs */}
              <div className="space-y-7">
                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-600 mb-3">
                    <span>Harga Kendaraan</span>
                    <span className="text-mitsu-red font-bold">Rp {creditPrice} Juta</span>
                  </label>
                  <input
                    type="range"
                    min="150"
                    max="700"
                    value={creditPrice}
                    onChange={(e) => setCreditPrice(parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: getSliderBackground(creditPrice, 150, 700) }}
                  />
                  <div className="flex justify-between text-[10px] text-gray-300 mt-2 uppercase tracking-wider">
                    <span>Rp 150 Jt</span>
                    <span>Rp 700 Jt</span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-600 mb-3">
                    <span>Uang Muka (DP)</span>
                    <span className="text-mitsu-red font-bold">{creditDP}%</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="5"
                    value={creditDP}
                    onChange={(e) => setCreditDP(parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: getSliderBackground(creditDP, 10, 80) }}
                  />
                  <div className="flex justify-between text-[10px] text-gray-300 mt-2 uppercase tracking-wider">
                    <span>10%</span>
                    <span>80%</span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-600 mb-3">
                    <span>Tenor</span>
                    <span className="text-mitsu-red font-bold">{creditTenor} Bulan</span>
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    step="12"
                    value={creditTenor}
                    onChange={(e) => setCreditTenor(parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: getSliderBackground(creditTenor, 12, 72) }}
                  />
                  <div className="flex justify-between text-[10px] text-gray-300 mt-2 uppercase tracking-wider">
                    <span>12 bln</span>
                    <span>72 bln</span>
                  </div>
                </div>
              </div>

              {/* Result */}
              <div className="relative bg-mitsu-light border border-gray-100 rounded-2xl p-6 sm:p-8 flex flex-col justify-center overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-mitsu-red/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-28 h-28 bg-mitsu-red/3 rounded-full blur-2xl" />

                {/* Red top accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-mitsu-red via-red-400 to-mitsu-red rounded-t-2xl" />

                <div className="relative z-10">
                  <p className="text-gray-400 text-sm mb-2">Estimasi Angsuran Bulanan</p>
                  <p className="text-4xl sm:text-5xl font-bold mb-1 tracking-tight font-serif text-mitsu-dark">
                    <span className="text-mitsu-red">Rp</span> {monthlyPayment.toLocaleString('id-ID')}
                  </p>
                  <p className="text-gray-300 text-xs mb-6">/bulan (estimasi, bunga 4%/tahun)</p>

                  <div className="space-y-3 text-sm">
                    {[
                      { label: 'Harga Kendaraan', value: `Rp ${(creditPrice * 1000000).toLocaleString('id-ID')}` },
                      { label: `Uang Muka (${creditDP}%)`, value: `Rp ${((creditPrice * 1000000 * creditDP) / 100).toLocaleString('id-ID')}` },
                      { label: 'Jumlah Pinjaman', value: `Rp ${((creditPrice * 1000000 * (100 - creditDP)) / 100).toLocaleString('id-ID')}` },
                      { label: 'Tenor', value: `${creditTenor} bulan` },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center">
                        <span className="text-gray-400">{item.label}</span>
                        <span className="font-medium text-mitsu-dark">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <a
                    href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Andi, saya ingin konsultasi kredit kendaraan Rp ${creditPrice} Juta, DP ${creditDP}%, tenor ${creditTenor} bulan`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-400 min-h-[44px] text-sm w-full glow-green active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat Saya untuk Penawaran
                  </a>

                  <p className="text-gray-300 text-xs mt-4">
                    *Simulasi ini bersifat estimasi. Hubungi saya untuk penawaran resmi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
