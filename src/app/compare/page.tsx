'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, Check, X, ArrowLeft, Shuffle, Star
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { passengerVehicles, commercialVehicles, VehicleData } from '@/data/vehicles';

const allVehicles = [...passengerVehicles, ...commercialVehicles];

export default function ComparePage() {
  const [selected, setSelected] = useState<VehicleData[]>([]);
  const [showSelector, setShowSelector] = useState(true);
  const maxCompare = 3;

  const toggleVehicle = (v: VehicleData) => {
    setSelected(prev => {
      const exists = prev.find(p => p.slug === v.slug);
      if (exists) return prev.filter(p => p.slug !== v.slug);
      if (prev.length >= maxCompare) return prev;
      return [...prev, v];
    });
  };

  const isSelected = (slug: string) => selected.some(v => v.slug === slug);

  // Collect all spec categories across selected vehicles
  const allSpecCategories = useMemo(() => {
    if (selected.length === 0) return [];
    const cats = new Set<string>();
    selected.forEach(v => v.specs.forEach(s => cats.add(s.category)));
    return Array.from(cats);
  }, [selected]);

  // Collect all highlight keys across selected variants
  const allHighlights = useMemo(() => {
    if (selected.length === 0) return [];
    const highlights = new Set<string>();
    selected.forEach(v => v.variants.forEach(vr => vr.highlights.forEach(h => highlights.add(h))));
    return Array.from(highlights);
  }, [selected]);

  const getSpecValue = (vehicle: VehicleData, category: string, label: string): string => {
    const specGroup = vehicle.specs.find(s => s.category === category);
    if (!specGroup) return '-';
    const item = specGroup.items.find(i => i.label === label);
    return item?.value || '-';
  };

  const getAllSpecLabels = (category: string): string[] => {
    const labels = new Set<string>();
    selected.forEach(v => {
      const specGroup = v.specs.find(s => s.category === category);
      if (specGroup) specGroup.items.forEach(i => labels.add(i.label));
    });
    return Array.from(labels);
  };

  const hasHighlight = (vehicle: VehicleData, highlight: string): boolean => {
    return vehicle.variants.some(vr => vr.highlights.includes(highlight));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs">
          <Link href="/" className="text-gray-400 hover:text-mitsu-red transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="font-semibold text-mitsu-red">Bandingkan Kendaraan</span>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-mitsu-red/10 flex items-center justify-center">
              <Shuffle className="w-5 h-5 text-mitsu-red" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-mitsu-dark font-serif">Bandingkan Kendaraan</h1>
          </div>
          <p className="text-gray-500 text-sm max-w-lg">Pilih hingga {maxCompare} kendaraan untuk membandingkan spesifikasi, fitur, dan harga secara langsung.</p>
        </motion.div>

        {/* Selected Vehicles Bar */}
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            {selected.map(v => (
              <div key={v.slug} className="flex items-center gap-2 px-3 py-2 bg-mitsu-red/5 border border-mitsu-red/15 rounded-lg">
                <span className="text-xs font-bold text-mitsu-dark">{v.name}</span>
                <button
                  onClick={() => toggleVehicle(v)}
                  className="w-5 h-5 rounded-full bg-mitsu-red/10 hover:bg-mitsu-red/20 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-3 h-3 text-mitsu-red" />
                </button>
              </div>
            ))}
            {selected.length >= 2 && (
              <button
                onClick={() => setShowSelector(false)}
                className="px-4 py-2 bg-mitsu-red text-white text-xs font-bold rounded-lg hover:bg-mitsu-red/80 transition-colors cursor-pointer"
              >
                Lihat Perbandingan
              </button>
            )}
          </motion.div>
        )}

        {/* Vehicle Selector Grid */}
        {showSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8"
          >
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Pilih Kendaraan</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {allVehicles.map(v => {
                const isCommercial = v.category === 'commercial';
                const selected_ = isSelected(v.slug);
                const isFull = selected.length >= maxCompare && !selected_;
                return (
                  <button
                    key={v.slug}
                    onClick={() => !isFull && toggleVehicle(v)}
                    disabled={isFull}
                    className={`text-left p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                      selected_
                        ? isCommercial
                          ? 'border-mitsu-fuso-yellow/30 bg-mitsu-fuso-yellow/5 shadow-sm'
                          : 'border-mitsu-red/20 bg-mitsu-red/5 shadow-sm'
                        : isFull
                          ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="aspect-[16/10] relative rounded-lg overflow-hidden mb-3 bg-mitsu-light">
                      <Image
                        src={v.image}
                        alt={`Mitsubishi ${v.name}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        unoptimized={v.image.startsWith('/api/') || v.image.includes('vercel-storage.com')}
                      />
                      {selected_ && (
                        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                          isCommercial ? 'bg-mitsu-fuso-yellow' : 'bg-mitsu-red'
                        }`}>
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-mitsu-dark">{v.name}</p>
                    <p className={`text-[10px] font-semibold mt-0.5 ${isCommercial ? 'text-mitsu-fuso-yellow-dark' : 'text-mitsu-red'}`}>
                      {v.basePrice}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {v.specsShort.slice(0, 2).map(s => (
                        <span key={s} className="px-1.5 py-0.5 text-[8px] font-medium rounded bg-mitsu-light text-gray-400">{s}</span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Comparison Table */}
        {selected.length >= 2 && !showSelector && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-mitsu-dark font-serif">Hasil Perbandingan</h2>
              <button
                onClick={() => setShowSelector(true)}
                className="text-xs text-mitsu-red font-semibold hover:underline cursor-pointer"
              >
                + Tambah/Kurangi Kendaraan
              </button>
            </div>

            <div className="overflow-x-auto -mx-4 px-4 pb-4">
              <table className="w-full min-w-[700px] border-collapse">
                {/* Vehicle Headers */}
                <thead>
                  <tr>
                    <th className="p-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-mitsu-light w-[180px]">
                      Fitur
                    </th>
                    {selected.map(v => (
                      <th key={v.slug} className="p-4 text-center min-w-[200px]">
                        <div className="aspect-[16/10] relative rounded-lg overflow-hidden mb-2 bg-mitsu-light">
                          <Image
                            src={v.image}
                            alt={`Mitsubishi ${v.name}`}
                            fill
                            className="object-cover"
                            sizes="200px"
                            unoptimized={v.image.startsWith('/api/') || v.image.includes('vercel-storage.com')}
                          />
                        </div>
                        <p className="text-sm font-bold text-mitsu-dark">{v.name}</p>
                        <p className={`text-xs font-semibold ${v.category === 'commercial' ? 'text-mitsu-fuso-yellow-dark' : 'text-mitsu-red'}`}>
                          {v.basePrice}
                        </p>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {/* Price Row */}
                  <tr className="border-t border-gray-100">
                    <td className="p-3 text-xs text-gray-500 font-medium bg-mitsu-light/50">Harga Mulai</td>
                    {selected.map(v => (
                      <td key={v.slug} className="p-3 text-center">
                        <span className={`text-sm font-bold ${v.category === 'commercial' ? 'text-mitsu-fuso-yellow-dark' : 'text-mitsu-red'}`}>
                          {v.basePrice}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Category */}
                  <tr className="border-t border-gray-50">
                    <td className="p-3 text-xs text-gray-500 font-medium bg-mitsu-light/50">Kategori</td>
                    {selected.map(v => (
                      <td key={v.slug} className="p-3 text-center text-xs font-medium text-mitsu-dark">
                        {v.category === 'commercial' ? 'FUSO Commercial' : 'Passenger'}
                      </td>
                    ))}
                  </tr>

                  {/* Quick Specs */}
                  <tr className="border-t border-gray-50">
                    <td className="p-3 text-xs text-gray-500 font-medium bg-mitsu-light/50">Spesifikasi Utama</td>
                    {selected.map(v => (
                      <td key={v.slug} className="p-3 text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {v.specsShort.map(s => (
                            <span key={s} className="px-2 py-0.5 text-[9px] font-medium rounded bg-mitsu-light text-gray-600">{s}</span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Variants Count */}
                  <tr className="border-t border-gray-50">
                    <td className="p-3 text-xs text-gray-500 font-medium bg-mitsu-light/50">Jumlah Varian</td>
                    {selected.map(v => (
                      <td key={v.slug} className="p-3 text-center text-xs font-bold text-mitsu-dark">
                        {v.variants.length} varian
                      </td>
                    ))}
                  </tr>

                  {/* Colors */}
                  <tr className="border-t border-gray-50">
                    <td className="p-3 text-xs text-gray-500 font-medium bg-mitsu-light/50">Pilihan Warna</td>
                    {selected.map(v => (
                      <td key={v.slug} className="p-3 text-center">
                        <div className="flex justify-center gap-1.5">
                          {v.colors.map(c => (
                            <span
                              key={c.name}
                              className="w-5 h-5 rounded-full border border-gray-200"
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                        </div>
                        <span className="text-[9px] text-gray-400 mt-1 block">{v.colors.length} warna</span>
                      </td>
                    ))}
                  </tr>

                  {/* Highlights */}
                  {allHighlights.length > 0 && (
                    <>
                      <tr className="border-t-2 border-gray-200">
                        <td colSpan={selected.length + 1} className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-mitsu-light/30">
                          Fitur Unggulan
                        </td>
                      </tr>
                      {allHighlights.map(highlight => (
                        <tr key={highlight} className="border-t border-gray-50">
                          <td className="p-3 text-xs text-gray-500">{highlight}</td>
                          {selected.map(v => (
                            <td key={v.slug} className="p-3 text-center">
                              {hasHighlight(v, highlight) ? (
                                <Check className="w-4 h-4 mx-auto text-mitsu-red" />
                              ) : (
                                <span className="text-gray-200">-</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </>
                  )}

                  {/* Spec Categories */}
                  {allSpecCategories.map(category => (
                    <>
                      <tr key={`cat-${category}`} className="border-t-2 border-gray-200">
                        <td colSpan={selected.length + 1} className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-mitsu-light/30">
                          {category}
                        </td>
                      </tr>
                      {getAllSpecLabels(category).map(label => (
                        <tr key={`${category}-${label}`} className="border-t border-gray-50">
                          <td className="p-3 text-xs text-gray-500">{label}</td>
                          {selected.map(v => (
                            <td key={v.slug} className="p-3 text-center text-xs font-medium text-mitsu-dark">
                              {getSpecValue(v, category, label)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CTA per vehicle */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selected.map(v => (
                <div key={v.slug} className={`p-5 rounded-lg border ${
                  v.category === 'commercial' ? 'border-mitsu-fuso-yellow/15 bg-mitsu-fuso-yellow/3' : 'border-mitsu-red/10 bg-mitsu-red/3'
                }`}>
                  <p className="text-sm font-bold text-mitsu-dark mb-1">Mitsubishi {v.name}</p>
                  <p className={`text-xs ${v.category === 'commercial' ? 'text-mitsu-fuso-yellow-dark' : 'text-mitsu-red'} font-semibold`}>
                    {v.basePrice}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/${v.category === 'commercial' ? 'commercial' : 'passenger'}/${v.slug}`}
                      className={`flex-1 text-center px-3 py-2 text-xs font-bold rounded-lg ${
                        v.category === 'commercial'
                          ? 'bg-mitsu-fuso-yellow/10 hover:bg-mitsu-fuso-yellow/20 text-mitsu-fuso-yellow-dark'
                          : 'bg-mitsu-red/10 hover:bg-mitsu-red/15 text-mitsu-red'
                      } transition-colors`}
                    >
                      Lihat Detail
                    </Link>
                    <a
                      href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Andi, saya tertarik dengan Mitsubishi ${v.name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-3 py-2 text-xs font-bold rounded-lg bg-green-600/10 hover:bg-green-600/20 text-green-600 transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {selected.length < 2 && !showSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center py-16"
          >
            <Shuffle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Pilih minimal 2 kendaraan untuk mulai membandingkan</p>
            <button
              onClick={() => setShowSelector(true)}
              className="mt-4 px-6 py-2.5 bg-mitsu-red text-white text-sm font-bold rounded-lg hover:bg-mitsu-red/80 transition-colors cursor-pointer"
            >
              Pilih Kendaraan
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
