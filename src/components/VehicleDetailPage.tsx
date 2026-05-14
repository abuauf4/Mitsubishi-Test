'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, ChevronRight, ChevronDown, ArrowLeft,
  Shield, Eye, Zap, Wind, Key, Users, Mountain, Gauge,
  Cog, Sun, Music, Truck, Wrench, DollarSign, Package,
  Check, Star, Info, Car
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { VehicleData } from '@/data/vehicles';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield, Eye, Zap, Wind, Key, Users, Mountain, Gauge,
  Cog, Sun, Music, Truck, Wrench, DollarSign, Package, Car,
};

interface Props {
  vehicle: VehicleData;
}

type TabId = 'overview' | 'specs' | 'compare';

export default function VehicleDetailPage({ vehicle }: Props) {
  const isCommercial = vehicle.category === 'commercial';
  const isNiagaRingan = vehicle.category === 'niaga-ringan';
  // niaga-ringan uses RED accent (same as passenger), commercial uses YELLOW accent
  const accentColor = isCommercial ? 'mitsu-fuso-yellow' : 'mitsu-red';
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [expandedSpec, setExpandedSpec] = useState<number>(0);

  const waLink = `https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Andi, saya tertarik dengan Mitsubishi ${vehicle.name} varian ${vehicle.variants[selectedVariant]?.name || ''}`)}`;

  const categoryPath = isCommercial ? '/commercial' : isNiagaRingan ? '/commercial' : '/passenger';
  const categoryLabel = isCommercial ? 'FUSO Commercial' : isNiagaRingan ? 'Kendaraan Niaga Ringan' : 'Passenger Cars';

  // Determine which image to show:
  // Priority: 1) Color-specific image → 2) Variant-specific image → 3) Vehicle default image
  const currentColorImage = vehicle.colors[selectedColor]?.image;
  const currentVariantImage = vehicle.variants[selectedVariant]?.image;
  const displayImage = currentColorImage || currentVariantImage || vehicle.image;
  const hasColorImage = !!currentColorImage;
  const hasVariantImage = !!currentVariantImage;

  // Price follows selected variant
  const displayPrice = vehicle.variants[selectedVariant]?.price || vehicle.basePrice;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Ikhtisar' },
    { id: 'specs', label: 'Spesifikasi' },
    ...(vehicle.variants.length > 1 ? [{ id: 'compare' as TabId, label: 'Bandingkan' }] : []),
  ];

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs overflow-x-auto">
          <Link href="/" className="text-gray-400 hover:text-mitsu-red transition-colors flex-shrink-0">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
          <Link href={categoryPath} className="text-gray-400 hover:text-mitsu-red transition-colors flex-shrink-0">{categoryLabel}</Link>
          <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
          <span className={`font-semibold ${isCommercial ? 'text-mitsu-fuso-yellow-dark' : 'text-mitsu-red'} flex-shrink-0`}>{vehicle.name}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        {/* Luxury pattern */}
        <div className="absolute inset-0 luxury-pattern-light" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left: Vehicle Image with Color Selector */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Back button */}
              <Link
                href={categoryPath}
                className="inline-flex items-center gap-1.5 text-gray-400 hover:text-mitsu-dark text-xs font-medium mb-4 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke {categoryLabel}
              </Link>

              {/* Main Image Container */}
              <div className={`relative aspect-[16/10] rounded-2xl overflow-hidden border ${isCommercial ? 'vehicle-image-bg-yellow border-white/10' : 'vehicle-image-bg border-gray-800'}`}>
                <Image
                  key={displayImage}
                  src={displayImage}
                  alt={`Mitsubishi ${vehicle.name} ${vehicle.colors[selectedColor]?.name || ''}`}
                  fill
                  className="object-cover relative z-[1]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  unoptimized={displayImage.startsWith('/api/')}
                />
                {/* Image source indicator */}
                {(hasVariantImage || hasColorImage) && (
                  <div className="absolute bottom-4 right-4 z-[2]">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-[9px] text-white font-medium">
                      {hasVariantImage && hasColorImage ? '📷 Varian + Warna' : hasVariantImage ? '📷 Varian' : '📷 Warna'}
                    </span>
                  </div>
                )}
                {/* Price badge */}
                <div className="absolute top-4 left-4 z-[2]">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${isCommercial ? 'from-mitsu-fuso-yellow to-mitsu-fuso-yellow-dark text-mitsu-dark' : 'from-mitsu-red to-red-700 text-white'} text-xs font-bold rounded-lg shadow-lg`}>
                    {displayPrice}
                  </span>
                </div>
                {/* Payload badge */}
                {vehicle.payload && (
                  <div className="absolute top-4 right-4 z-[2]">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-mitsu-dark/80 text-white text-[10px] font-bold rounded-lg backdrop-blur-sm">
                      <Truck className="w-3 h-3" />
                      {vehicle.payload}
                    </span>
                  </div>
                )}
                {/* Color name label */}
                <div className="absolute bottom-4 left-4 z-[2]">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-[11px] font-semibold text-mitsu-dark border border-gray-100 shadow-sm">
                    <span
                      className="w-3 h-3 rounded-full border border-gray-200 shadow-inner"
                      style={{ backgroundColor: vehicle.colors[selectedColor]?.hex }}
                    />
                    {vehicle.colors[selectedColor]?.name}
                  </span>
                </div>
              </div>

              {/* Color Selector */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Warna:</span>
                <div className="flex items-center gap-2">
                  {vehicle.colors.map((color, i) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(i)}
                      className={`relative w-8 h-8 rounded-full transition-all duration-300 cursor-pointer ${
                        selectedColor === i
                          ? 'scale-110 ring-2 ring-offset-2 ' + (isCommercial ? 'ring-mitsu-fuso-yellow' : 'ring-mitsu-red')
                          : 'hover:scale-105 ring-1 ring-gray-200'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={`${color.name}${color.image ? ' (has image)' : ''}`}
                      aria-label={`Pilih warna ${color.name}`}
                    >
                      {selectedColor === i && (
                        <motion.div
                          layoutId="color-check"
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <Check className={`w-3.5 h-3.5 ${color.hex === '#1A1A1A' || color.hex === '#2E5090' ? 'text-white' : 'text-mitsu-dark'}`} strokeWidth={3} />
                        </motion.div>
                      )}
                      {color.image && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right: Vehicle Info + Variant Selector */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Category Badge */}
              <span className={`inline-flex items-center gap-2 px-3 py-1 ${isCommercial ? 'badge-yellow-light' : 'badge-red-light'} text-[10px] font-bold rounded-lg tracking-wider uppercase mb-3`}>
                <Car className="w-3 h-3" />
                {isCommercial ? 'FUSO Commercial' : isNiagaRingan ? 'Kendaraan Niaga Ringan' : 'Passenger Car'}
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-mitsu-dark font-serif leading-tight">
                Mitsubishi{' '}
                <span className={isCommercial ? 'text-mitsu-fuso-yellow-dark italic' : 'text-red-shimmer italic'}>
                  {vehicle.name}
                </span>
              </h1>
              <p className="mt-2 text-gray-500 text-sm sm:text-base">{vehicle.tagline}</p>

              {/* Quick Specs */}
              <div className="mt-5 flex flex-wrap gap-2">
                {vehicle.specsShort.map((spec) => (
                  <span key={spec} className="px-3 py-1.5 text-[11px] font-medium rounded-lg bg-mitsu-light text-gray-600 border border-gray-100">
                    {spec}
                  </span>
                ))}
              </div>

              {/* Variant Selector */}
              <div className="mt-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Pilih Varian</p>
                <div className="space-y-2">
                  {vehicle.variants.map((variant, i) => (
                    <button
                      key={variant.name}
                      onClick={() => setSelectedVariant(i)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                        selectedVariant === i
                          ? isCommercial
                            ? 'border-mitsu-fuso-yellow/40 bg-mitsu-fuso-yellow/5 shadow-sm'
                            : 'border-mitsu-red/30 bg-mitsu-red/5 shadow-sm'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className={`text-sm font-bold ${selectedVariant === i ? 'text-mitsu-dark' : 'text-gray-600'}`}>
                              {variant.name}
                              {variant.image && <span className="ml-1.5 text-[9px] text-green-600 font-normal">📷</span>}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {variant.highlights.slice(0, 3).map((h) => (
                                <span key={h} className="text-[10px] text-gray-400">{h}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className={`text-sm font-bold ${isCommercial ? 'text-mitsu-fuso-yellow-dark' : 'text-mitsu-red'}`}>
                            {variant.price}
                          </p>
                          <p className="text-[10px] text-gray-400">{variant.transmission}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Variant Highlights */}
              {vehicle.variants[selectedVariant] && (
                <div className="mt-4 p-4 rounded-xl bg-mitsu-light border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Highlight {vehicle.variants[selectedVariant].name}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {vehicle.variants[selectedVariant].highlights.map((h) => (
                      <div key={h} className="flex items-center gap-1.5">
                        <Check className={`w-3 h-3 flex-shrink-0 ${isCommercial ? 'text-mitsu-fuso-yellow-dark' : 'text-mitsu-red'}`} />
                        <span className="text-xs text-gray-600">{h}</span>
                      </div>
                    ))}
                  </div>
                  {vehicle.variants[selectedVariant].drivetrain && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-gray-400" />
                      <span className="text-[11px] text-gray-500">Drivetrain: {vehicle.variants[selectedVariant].drivetrain}</span>
                    </div>
                  )}
                </div>
              )}

              {/* CTA Buttons */}
              <div className="mt-6 flex items-center gap-3">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-300 text-sm tracking-wide glow-green hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
                <Link
                  href="/#test-drive"
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 ${isCommercial ? 'btn-fuso-yellow' : 'btn-mitsu-red'} rounded-xl transition-all duration-300 text-sm tracking-wide hover:scale-[1.02] active:scale-[0.98] min-h-[44px] font-bold`}
                >
                  Test Drive
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky top-[60px] sm:top-[64px] z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-0 overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 sm:px-8 py-3.5 text-xs sm:text-sm font-semibold tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? isCommercial ? 'text-mitsu-fuso-yellow-dark' : 'text-mitsu-red'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className={`absolute bottom-0 left-0 right-0 h-[2px] ${isCommercial ? 'bg-mitsu-fuso-yellow' : 'bg-mitsu-red'}`}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 luxury-pattern-light" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Features Grid */}
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-8">
                    <div className={`w-1 h-6 rounded-full ${isCommercial ? 'bg-mitsu-fuso-yellow' : 'bg-mitsu-red'}`} />
                    <h2 className="text-xl sm:text-2xl font-bold text-mitsu-dark font-serif">Keunggulan {vehicle.name}</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {vehicle.features.map((feature, i) => {
                      const IconComponent = iconMap[feature.icon] || Star;
                      return (
                        <motion.div
                          key={feature.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08, duration: 0.5 }}
                          className={`group p-5 rounded-xl border transition-all duration-400 ${
                            isCommercial
                              ? 'card-light-yellow hover-yellow-border-light'
                              : 'card-light-red hover-red-border-light'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                            isCommercial ? 'bg-mitsu-fuso-yellow/10' : 'bg-mitsu-red/8'
                          }`}>
                            <IconComponent className={`w-5 h-5 ${isCommercial ? 'text-mitsu-fuso-yellow-dark' : 'text-mitsu-red'}`} />
                          </div>
                          <h3 className="text-sm font-bold text-mitsu-dark mb-1.5">{feature.title}</h3>
                          <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Specs Summary */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-1 h-6 rounded-full ${isCommercial ? 'bg-mitsu-fuso-yellow' : 'bg-mitsu-red'}`} />
                    <h2 className="text-xl sm:text-2xl font-bold text-mitsu-dark font-serif">Ringkasan Spesifikasi</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {vehicle.specs.slice(0, 2).flatMap((s) => s.items).slice(0, 8).map((item) => (
                      <div key={item.label} className="p-3.5 rounded-xl bg-mitsu-light border border-gray-100">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{item.label}</p>
                        <p className="text-sm font-bold text-mitsu-dark mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'specs' && (
              <motion.div
                key="specs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className={`w-1 h-6 rounded-full ${isCommercial ? 'bg-mitsu-fuso-yellow' : 'bg-mitsu-red'}`} />
                  <h2 className="text-xl sm:text-2xl font-bold text-mitsu-dark font-serif">Spesifikasi Teknis</h2>
                </div>
                <div className="space-y-3">
                  {vehicle.specs.map((specGroup, i) => (
                    <div key={specGroup.category} className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                      expandedSpec === i ? 'border-gray-200 shadow-sm' : 'border-gray-100'
                    }`}>
                      <button
                        onClick={() => setExpandedSpec(expandedSpec === i ? -1 : i)}
                        className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-mitsu-light/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCommercial ? 'bg-mitsu-fuso-yellow/10' : 'bg-mitsu-red/8'}`}>
                            <Info className={`w-4 h-4 ${isCommercial ? 'text-mitsu-fuso-yellow-dark' : 'text-mitsu-red'}`} />
                          </div>
                          <span className="text-sm font-bold text-mitsu-dark">{specGroup.category}</span>
                          <span className="text-[10px] text-gray-400">{specGroup.items.length} item</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expandedSpec === i ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {expandedSpec === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4">
                              <div className="border-t border-gray-100 pt-3 space-y-0">
                                {specGroup.items.map((item) => (
                                  <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                                    <span className="text-xs text-gray-500">{item.label}</span>
                                    <span className="text-xs font-semibold text-mitsu-dark">{item.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'compare' && (
              <motion.div
                key="compare"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className={`w-1 h-6 rounded-full ${isCommercial ? 'bg-mitsu-fuso-yellow' : 'bg-mitsu-red'}`} />
                  <h2 className="text-xl sm:text-2xl font-bold text-mitsu-dark font-serif">Perbandingan Varian</h2>
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto -mx-4 px-4 pb-4">
                  <table className="w-full min-w-[600px] border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-mitsu-light rounded-tl-xl">
                          Fitur
                        </th>
                        {vehicle.variants.map((v, i) => (
                          <th key={v.name} className={`p-3 text-center text-xs font-bold min-w-[140px] ${
                            i === vehicle.variants.length - 1
                              ? isCommercial ? 'bg-mitsu-fuso-yellow/10 text-mitsu-fuso-yellow-dark' : 'bg-mitsu-red/5 text-mitsu-red'
                              : 'bg-mitsu-light text-mitsu-dark'
                          } ${i === vehicle.variants.length - 1 ? 'rounded-tr-xl' : ''}`}>
                            {v.name}
                            <div className={`text-[10px] font-semibold mt-0.5 ${isCommercial ? 'text-mitsu-fuso-yellow-dark/70' : 'text-mitsu-red/70'}`}>
                              {v.price}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Transmission */}
                      <tr className="border-t border-gray-50">
                        <td className="p-3 text-xs text-gray-500">Transmisi</td>
                        {vehicle.variants.map((v) => (
                          <td key={v.name} className="p-3 text-xs text-center font-medium text-mitsu-dark">{v.transmission}</td>
                        ))}
                      </tr>
                      {/* Drivetrain */}
                      {vehicle.variants.some((v) => v.drivetrain) && (
                        <tr className="border-t border-gray-50">
                          <td className="p-3 text-xs text-gray-500">Drivetrain</td>
                          {vehicle.variants.map((v) => (
                            <td key={v.name} className="p-3 text-xs text-center font-medium text-mitsu-dark">{v.drivetrain || '-'}</td>
                          ))}
                        </tr>
                      )}
                      {/* Highlights */}
                      {(() => {
                        const allHighlights = [...new Set(vehicle.variants.flatMap((v) => v.highlights))];
                        return allHighlights.map((highlight) => (
                          <tr key={highlight} className="border-t border-gray-50">
                            <td className="p-3 text-xs text-gray-500">{highlight}</td>
                            {vehicle.variants.map((v) => (
                              <td key={v.name} className="p-3 text-center">
                                {v.highlights.includes(highlight) ? (
                                  <Check className={`w-4 h-4 mx-auto ${isCommercial ? 'text-mitsu-fuso-yellow-dark' : 'text-mitsu-red'}`} />
                                ) : (
                                  <span className="text-gray-200">-</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Price Summary */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {vehicle.variants.map((v, i) => (
                    <div key={v.name} className={`p-4 rounded-xl border transition-all duration-300 ${
                      i === vehicle.variants.length - 1
                        ? isCommercial ? 'border-mitsu-fuso-yellow/30 bg-mitsu-fuso-yellow/5' : 'border-mitsu-red/20 bg-mitsu-red/5'
                        : 'border-gray-100 bg-white'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-mitsu-dark">{v.name}</p>
                        {i === vehicle.variants.length - 1 && (
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${isCommercial ? 'bg-mitsu-fuso-yellow/10 text-mitsu-fuso-yellow-dark' : 'bg-mitsu-red/10 text-mitsu-red'}`}>
                            TOP
                          </span>
                        )}
                      </div>
                      <p className={`text-lg font-bold ${isCommercial ? 'text-mitsu-fuso-yellow-dark' : 'text-mitsu-red'}`}>{v.price}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{v.transmission}</p>
                      <a
                        href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Andi, saya tertarik dengan Mitsubishi ${vehicle.name} varian ${v.name}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-3 w-full flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                          isCommercial
                            ? 'bg-mitsu-fuso-yellow/10 hover:bg-mitsu-fuso-yellow/20 text-mitsu-fuso-yellow-dark'
                            : 'bg-mitsu-red/10 hover:bg-mitsu-red/15 text-mitsu-red'
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Tanya Varian Ini
                      </a>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom CTA */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className={`absolute inset-0 ${isCommercial ? 'bg-gradient-to-r from-mitsu-fuso-yellow/5 via-mitsu-fuso-yellow/10 to-mitsu-fuso-yellow/5' : 'bg-mitsu-light'}`} />
        <div className="absolute inset-0 luxury-pattern-light" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-mitsu-dark font-serif">
              Tertarik dengan Mitsubishi{' '}
              <span className={isCommercial ? 'text-mitsu-fuso-yellow-dark italic' : 'text-red-shimmer italic'}>
                {vehicle.name}
              </span>?
            </h2>
            <p className="mt-3 text-gray-500 text-sm sm:text-base max-w-lg mx-auto">
              Konsultasi gratis dengan sales consultant kami untuk penawaran harga terbaik dan jadwalkan test drive.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all text-sm tracking-wide glow-green hover:scale-105 active:scale-95 min-h-[44px]"
              >
                <MessageCircle className="w-5 h-5" />
                Hubungi via WhatsApp
              </a>
              <Link
                href="/#test-drive"
                className={`flex items-center gap-2 px-8 py-3.5 ${isCommercial ? 'btn-fuso-yellow' : 'btn-mitsu-red'} rounded-xl transition-all text-sm tracking-wide hover:scale-105 active:scale-95 min-h-[44px] font-bold`}
              >
                Jadwalkan Test Drive
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
