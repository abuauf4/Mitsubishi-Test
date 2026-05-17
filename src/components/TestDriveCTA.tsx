'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, User, Phone, Car, MapPin, Calendar, Clock } from 'lucide-react';

const vehicleOptions = [
  { category: 'Kendaraan Penumpang', vehicles: [
    'Mitsubishi Xpander',
    'Mitsubishi Xpander Cross',
    'Mitsubishi Pajero Sport',
    'Mitsubishi Destinator',
    'Mitsubishi Xforce',
    'Mitsubishi L100 EV',
    'Mitsubishi L300',
  ]},
  { category: 'Kendaraan Niaga Ringan', vehicles: [
    'Mitsubishi Triton',
  ]},
  { category: 'FUSO Commercial', vehicles: [
    'Mitsubishi Canter FE 71',
    'Mitsubishi Canter FE 74',
    'Mitsubishi Canter FE 84',
    'Mitsubishi FUSO Fighter X',
    'Mitsubishi FUSO Heavy Duty',
  ]},
];

const dealerOptions = [
  'PT. Mitsubishi Motors Jakarta Pusat',
];

export default function TestDriveCTA() {
  const [formData, setFormData] = useState({
    nama: '',
    phone: '',
    kendaraan: '',
    dealer: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section id="test-drive" className="relative py-24 sm:py-28 lg:py-32 overflow-hidden bg-white">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/images/dealership.png"
          alt="Mitsubishi Dealership"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-white/93" />

      {/* Luxury crosshatch pattern */}
      <div className="absolute inset-0 luxury-pattern-crosshatch" />

      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        <div className="absolute top-0 left-0 w-full h-px bg-gray-200" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gray-200" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-3 text-mitsu-red text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase">
              <Calendar className="w-4 h-4" />
              Test Drive
            </span>
            <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold text-mitsu-dark leading-tight font-serif">
              Rasakan Sendiri
              <br />
              <span className="text-mitsu-red">Pengalaman Mitsubishi</span>
            </h2>
            <p className="mt-5 text-gray-500 text-base sm:text-lg max-w-lg leading-relaxed">
              Jadwalkan test drive di dealer terdekat dan buktikan sendiri kualitas kendaraan Mitsubishi.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-white border border-gray-100 shadow-sm rounded-lg p-4">
                <div className="p-2 bg-mitsu-red/5 rounded-lg border border-mitsu-red/10">
                  <Car className="w-5 h-5 text-mitsu-red" />
                </div>
                <div>
                  <p className="text-mitsu-dark text-sm font-semibold">Gratis</p>
                  <p className="text-gray-400 text-xs">Tanpa biaya</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white border border-gray-100 shadow-sm rounded-lg p-4">
                <div className="p-2 bg-mitsu-red/5 rounded-lg border border-mitsu-red/10">
                  <MapPin className="w-5 h-5 text-mitsu-red" />
                </div>
                <div>
                  <p className="text-mitsu-dark text-sm font-semibold">150+</p>
                  <p className="text-gray-400 text-xs">Dealer Indonesia</p>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/6281234567890?text=Halo%20Andi,%20saya%20ingin%20test%20drive%20Mitsubishi"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 px-7 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all duration-400 min-h-[44px] text-sm tracking-wide hover:scale-105 active:scale-95"
            >
              <MessageCircle className="w-5 h-5" />
              Chat via WhatsApp
            </a>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          >
            <div className="relative card-light-red rounded-lg p-6 sm:p-8 shadow-2xl card-shine-red">
              {/* Red top accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-mitsu-red rounded-t-lg" />

              <h3 className="text-xl font-bold text-mitsu-dark mb-1 font-serif">Jadwalkan Test Drive</h3>
              <p className="text-gray-400 text-sm mb-6">Isi formulir dan sales consultant kami akan menghubungi Anda.</p>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-mitsu-red/5 border border-mitsu-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-7 h-7 text-mitsu-red" />
                  </div>
                  <h4 className="text-lg font-bold text-mitsu-dark mb-2 font-serif">Terima Kasih!</h4>
                  <p className="text-gray-500 text-sm">
                    Sales consultant kami akan segera menghubungi Anda untuk konfirmasi jadwal test drive.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mitsu-red/40" />
                      <input
                        type="text"
                        required
                        value={formData.nama}
                        onChange={(e) => handleChange('nama', e.target.value)}
                        placeholder="Masukkan nama Anda"
                        className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 focus:border-mitsu-red/30 focus:ring-2 focus:ring-mitsu-red/10 text-sm outline-none transition-all min-h-[44px] bg-mitsu-light text-mitsu-dark placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      No. HP
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mitsu-red/40" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 focus:border-mitsu-red/30 focus:ring-2 focus:ring-mitsu-red/10 text-sm outline-none transition-all min-h-[44px] bg-mitsu-light text-mitsu-dark placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      Pilih Kendaraan
                    </label>
                    <select
                      required
                      value={formData.kendaraan}
                      onChange={(e) => handleChange('kendaraan', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-mitsu-red/30 focus:ring-2 focus:ring-mitsu-red/10 text-sm outline-none transition-all min-h-[44px] bg-mitsu-light text-gray-600"
                    >
                      <option value="" className="bg-white">-- Pilih Kendaraan --</option>
                      {vehicleOptions.map((group) => (
                        <optgroup key={group.category} label={group.category}>
                          {group.vehicles.map((v) => (
                            <option key={v} value={v} className="bg-white">{v}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      Pilih Dealer
                    </label>
                    <select
                      required
                      value={formData.dealer}
                      onChange={(e) => handleChange('dealer', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-mitsu-red/30 focus:ring-2 focus:ring-mitsu-red/10 text-sm outline-none transition-all min-h-[44px] bg-mitsu-light text-gray-600"
                    >
                      <option value="" className="bg-white">-- Pilih Dealer --</option>
                      {dealerOptions.map((d) => (
                        <option key={d} value={d} className="bg-white">{d}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 btn-mitsu-red rounded-lg transition-all duration-400 min-h-[44px] text-sm tracking-wide mt-2 active:scale-[0.98] font-bold"
                  >
                    <Send className="w-4 h-4" />
                    Jadwalkan Sekarang
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
