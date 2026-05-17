'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, ChevronRight, ChevronDown, ArrowLeft,
  Shield, Eye, Zap, Wind, Key, Users, Mountain, Gauge,
  Cog, Sun, Music, Truck, Wrench, DollarSign, Package,
  Check, Star, Info, Car, ChevronLeft, Tag, Sparkles, Calendar
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { VehicleData } from '@/data/vehicles';
import { getArticlesByVehicle } from '@/data/articles';
import CreditSimulation from '@/components/CreditSimulation';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield, Eye, Zap, Wind, Key, Users, Mountain, Gauge,
  Cog, Sun, Music, Truck, Wrench, DollarSign, Package, Car,
};

interface Props {
  vehicle: VehicleData;
}

type DetailSubTab = 'eksterior' | 'interior' | 'keamanan' | 'performa';
type TabId = 'overview' | 'detail' | 'galeri' | 'specs' | 'credit' | 'compare';

export default function VehicleDetailPage({ vehicle }: Props) {
  const isCommercial = vehicle.category === 'commercial';
  const isNiagaRingan = vehicle.category === 'niaga-ringan';
  // niaga-ringan uses RED accent (same as passenger), commercial uses YELLOW accent
  const accentColor = isCommercial ? 'mitsu-fuso-yellow' : 'mitsu-red';
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [expandedSpec, setExpandedSpec] = useState<number>(0);
  const [detailIndex, setDetailIndex] = useState(0);
  const [detailSubTab, setDetailSubTab] = useState<DetailSubTab>('eksterior');

  // Compute visible colors based on selected variant:
  // Show global colors (no variantId) + variant-specific colors (variantId matches selected variant's id)
  // Dedupe by name+hex so same color across multiple variant records doesn't show twice
  const selectedVariantId = vehicle.variants[selectedVariant]?.id;
  const visibleColors = (() => {
    const filtered = vehicle.colors.filter(c => !c.variantId || c.variantId === selectedVariantId);
    const seen = new Set<string>();
    return filtered.filter(c => {
      const key = `${c.name}|${c.hex}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();

  // When variant changes, reset color selection if out of bounds
  const effectiveSelectedColor = selectedColor >= visibleColors.length ? 0 : selectedColor;

  // Swipe state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const waLink = `https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Andi, saya tertarik dengan Mitsubishi ${vehicle.name} varian ${vehicle.variants[selectedVariant]?.name || ''}`)}`;

  const categoryPath = isCommercial ? '/commercial' : isNiagaRingan ? '/commercial' : '/passenger';
  const categoryLabel = isCommercial ? 'FUSO Commercial' : isNiagaRingan ? 'Kendaraan Niaga Ringan' : 'Passenger Cars';

  // Determine which image to show:
  // Priority: 1) Color-specific image → 2) Variant-specific image → 3) Vehicle default image
  const currentColorImage = visibleColors[effectiveSelectedColor]?.image;
  const currentVariantImage = vehicle.variants[selectedVariant]?.image;
  const displayImage = currentColorImage || currentVariantImage || vehicle.image;
  const hasColorImage = !!currentColorImage;
  const hasVariantImage = !!currentVariantImage;

  // Price follows selected variant
  const displayPrice = vehicle.variants[selectedVariant]?.price || vehicle.basePrice;
  const displayPriceNum = vehicle.variants[selectedVariant]?.priceNum || 0;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Ikhtisar' },
    ...(vehicle.detailCategories && vehicle.detailCategories.length > 0 ? [{ id: 'detail' as TabId, label: 'Detail Produk' }] : vehicle.detailItems && vehicle.detailItems.length > 0 ? [{ id: 'detail' as TabId, label: 'Detail Produk' }] : []),
    ...(vehicle.gallery ? [{ id: 'galeri' as TabId, label: 'Galeri' }] : []),
    { id: 'specs', label: 'Spesifikasi' },
    { id: 'credit', label: 'Simulasi Kredit' },
    ...(vehicle.variants.length > 1 ? [{ id: 'compare' as TabId, label: 'Bandingkan' }] : []),
  ];

  // Swipe handler for color change
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    if (visibleColors.length <= 1) return;

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Only trigger if horizontal swipe is dominant and significant
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX > 0) {
        // Swipe right → previous color
        setSelectedColor((prev) => (prev - 1 + visibleColors.length) % visibleColors.length);
      } else {
        // Swipe left → next color
        setSelectedColor((prev) => (prev + 1) % visibleColors.length);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  }, [visibleColors.length]);

  // Mouse drag handler for desktop
  const mouseStartX = useRef<number | null>(null);
  const mouseStartY = useRef<number | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
    mouseStartY.current = e.clientY;
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (mouseStartX.current === null || mouseStartY.current === null) return;
    if (visibleColors.length <= 1) return;

    const deltaX = e.clientX - mouseStartX.current;
    const deltaY = e.clientY - mouseStartY.current;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX > 0) {
        setSelectedColor((prev) => (prev - 1 + visibleColors.length) % visibleColors.length);
      } else {
        setSelectedColor((prev) => (prev + 1) % visibleColors.length);
      }
    }

    mouseStartX.current = null;
    mouseStartY.current = null;
  }, [visibleColors.length]);

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
        <div className="absolute top-0 left-0 w-full h-px bg-gray-200" />

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

              {/* Main Image Container — swipeable */}
              <div
                ref={imageContainerRef}
                className={`relative aspect-[16/10] rounded-lg overflow-hidden border ${isCommercial ? 'vehicle-image-bg-light-yellow border-gray-200/60' : 'vehicle-image-bg-light border-gray-200/60'} ${visibleColors.length > 1 ? 'cursor-grab active:cursor-grabbing select-none' : ''}`}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
              >
                {/* Stacked images for seamless crossfade — NO flash, NO pause */}
                {/* All color images are preloaded and stacked. Only the selected one is visible. */}
                {visibleColors.map((color, i) => {
                  const colorImage = color.image;
                  const variantImage = vehicle.variants[selectedVariant]?.image;
                  const imgSrc = colorImage || variantImage || vehicle.image;
                  return (
                    <div
                      key={color.name + (color.variantId || '')}
                      className="absolute inset-0 transition-opacity duration-300 ease-in-out"
                      style={{ opacity: effectiveSelectedColor === i ? 1 : 0 }}
                    >
                      <Image
                        src={imgSrc}
                        alt={`Mitsubishi ${vehicle.name} ${color.name}`}
                        fill
                        className="object-contain relative z-[1]"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority={i === 0}
                        unoptimized={imgSrc.startsWith('/api/') || imgSrc.includes('vercel-storage.com')}
                        draggable={false}
                      />
                    </div>
                  );
                })}

                {/* Swipe hint — only show when multiple colors */}
                {visibleColors.length > 1 && (
                  <div className="absolute top-4 right-4 z-[3] sm:hidden">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/70 backdrop-blur-sm rounded text-[9px] text-gray-500 font-medium border border-gray-200/50">
                      ← Geser ganti warna →
                    </span>
                  </div>
                )}

                {/* Image source indicator */}
                {(hasVariantImage || hasColorImage) && (
                  <div className="absolute bottom-4 right-4 z-[2] hidden sm:block">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/70 backdrop-blur-sm rounded text-[9px] text-gray-600 font-medium border border-gray-200/50">
                      {hasVariantImage && hasColorImage ? '📷 Varian + Warna' : hasVariantImage ? '📷 Varian' : '📷 Warna'}
                    </span>
                  </div>
                )}
                {/* Price badge */}
                <div className="absolute top-4 left-4 z-[2]">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${isCommercial ? 'bg-mitsu-fuso-yellow text-mitsu-dark' : 'bg-mitsu-red text-white'} text-xs font-bold rounded-lg shadow-lg`}>
                    {displayPrice}
                  </span>
                </div>
                {/* Payload badge */}
                {vehicle.payload && (
                  <div className="absolute top-4 right-4 z-[2]">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-mitsu-dark/90 text-white text-[10px] font-bold rounded-lg backdrop-blur-sm">
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
                      style={{ backgroundColor: visibleColors[effectiveSelectedColor]?.hex }}
                    />
                    {visibleColors[effectiveSelectedColor]?.name}
                  </span>
                </div>
              </div>

              {/* Color Selector */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Warna:</span>
                <div className="flex items-center gap-2">
                  {visibleColors.map((color, i) => (
                    <button
                      key={color.name + (color.variantId || '')}
                      onClick={() => setSelectedColor(i)}
                      className={`relative w-8 h-8 rounded-full transition-all duration-300 cursor-pointer ${
                        effectiveSelectedColor === i
                          ? 'scale-110 ring-2 ring-offset-2 ' + (isCommercial ? 'ring-mitsu-fuso-yellow' : 'ring-mitsu-red')
                          : 'hover:scale-105 ring-1 ring-gray-200'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={`${color.name}${color.image ? ' (has image)' : ''}`}
                      aria-label={`Pilih warna ${color.name}`}
                    >
                      {effectiveSelectedColor === i && (
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
                {/* Desktop swipe hint */}
                {visibleColors.length > 1 && (
                  <span className="hidden sm:inline text-[10px] text-gray-300 ml-auto">← Drag gambar ganti warna →</span>
                )}
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
                <span className={isCommercial ? 'text-mitsu-fuso-yellow-dark italic' : 'text-mitsu-red'}>
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

              {/* Highlight Badges — fitur utama dari website resmi */}
              {vehicle.highlightBadges && vehicle.highlightBadges.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  {vehicle.highlightBadges.map((badge, i) => {
                    const IconComponent = iconMap[badge.icon] || Star;
                    return (
                      <motion.div
                        key={badge.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                        className={`group p-3 rounded-lg border transition-all duration-300 cursor-default ${
                          isCommercial
                            ? 'border-mitsu-fuso-yellow/15 bg-mitsu-fuso-yellow/3 hover:border-mitsu-fuso-yellow/30 hover:bg-mitsu-fuso-yellow/5'
                            : 'border-mitsu-red/10 bg-mitsu-red/3 hover:border-mitsu-red/20 hover:bg-mitsu-red/5'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isCommercial ? 'bg-mitsu-fuso-yellow/10' : 'bg-mitsu-red/8'
                          }`}>
                            <IconComponent className={`w-4 h-4 ${isCommercial ? 'text-mitsu-fuso-yellow-dark' : 'text-mitsu-red'}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-mitsu-dark leading-tight">{badge.label}</p>
                            <p className="text-[9px] text-gray-400 mt-0.5 leading-snug line-clamp-2">{badge.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Promo Badge */}
              {vehicle.promoText && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="mt-4 p-3 rounded-lg border border-green-200 bg-green-50/80"
                >
                  <div className="flex items-start gap-2.5">
                    <Tag className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Promo Bulan Ini</p>
                      <p className="text-[11px] text-green-600 mt-0.5 leading-relaxed">{vehicle.promoText}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Variant Selector */}
              <div className="mt-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Pilih Varian</p>
                <div className="space-y-2">
                  {vehicle.variants.map((variant, i) => (
                    <button
                      key={variant.name}
                      onClick={() => { setSelectedVariant(i); setSelectedColor(0); }}
                      className={`w-full text-left p-3.5 rounded-lg border transition-all duration-300 cursor-pointer ${
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
                <div className="mt-4 p-4 rounded-lg bg-mitsu-light border border-gray-100">
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

              {/* Inline Credit Calculator — directly below variants, connected to variant price */}
              {displayPriceNum > 0 && (
                <div className="mt-4">
                  <CreditSimulation
                    defaultPrice={displayPriceNum}
                    vehicleName={vehicle.name}
                    accentTheme={isCommercial ? 'yellow' : 'red'}
                  />
                </div>
              )}

              {/* CTA Buttons */}
              <div className="mt-6 flex items-center gap-3">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all duration-300 text-sm tracking-wide hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
                <Link
                  href="/#test-drive"
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 ${isCommercial ? 'btn-fuso-yellow' : 'btn-mitsu-red'} rounded-lg transition-all duration-300 text-sm tracking-wide hover:scale-[1.02] active:scale-[0.98] min-h-[44px] font-bold`}
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
                          className={`group p-5 rounded-lg border transition-all duration-400 ${
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
                      <div key={item.label} className="p-3.5 rounded-lg bg-mitsu-light border border-gray-100">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{item.label}</p>
                        <p className="text-sm font-bold text-mitsu-dark mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mitsubishi Connect */}
                {vehicle.mitsubishiConnect?.available && (
                  <div className="mt-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-1 h-6 rounded-full ${isCommercial ? 'bg-mitsu-fuso-yellow' : 'bg-mitsu-red'}`} />
                      <h2 className="text-xl sm:text-2xl font-bold text-mitsu-dark font-serif">Mitsubishi Connect</h2>
                    </div>
                    <div className={`p-6 rounded-lg border ${
                      isCommercial ? 'border-mitsu-fuso-yellow/15 bg-gradient-to-br from-mitsu-fuso-yellow/5 to-transparent' : 'border-mitsu-red/10 bg-gradient-to-br from-mitsu-red/5 to-transparent'
                    }`}>
                      <p className="text-sm text-gray-500 leading-relaxed mb-4">{vehicle.mitsubishiConnect.description}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {vehicle.mitsubishiConnect.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/80 border border-gray-100">
                            <Check className={`w-3.5 h-3.5 flex-shrink-0 ${isCommercial ? 'text-mitsu-fuso-yellow-dark' : 'text-mitsu-red'}`} />
                            <span className="text-xs text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 360° Preview Placeholder */}
                <div className="mt-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-1 h-6 rounded-full ${isCommercial ? 'bg-mitsu-fuso-yellow' : 'bg-mitsu-red'}`} />
                    <h2 className="text-xl sm:text-2xl font-bold text-mitsu-dark font-serif">Tampilan 360°</h2>
                  </div>
                  <div className={`relative aspect-[16/7] rounded-lg overflow-hidden border-2 border-dashed ${
                    isCommercial ? 'border-mitsu-fuso-yellow/20' : 'border-mitsu-red/20'
                  } bg-gradient-to-br ${isCommercial ? 'from-mitsu-fuso-yellow/5 to-mitsu-light' : 'from-mitsu-red/5 to-mitsu-light'}`}>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isCommercial ? 'bg-mitsu-fuso-yellow/10' : 'bg-mitsu-red/10'}`}>
                        <Eye className={`w-7 h-7 ${isCommercial ? 'text-mitsu-fuso-yellow-dark' : 'text-mitsu-red'}`} />
                      </div>
                      <p className="text-sm font-bold text-mitsu-dark">Tampilan 360° Segera Hadir</p>
                      <p className="text-xs text-gray-400 max-w-xs text-center">Nantikan fitur interaktif untuk melihat kendaraan dari segala sudut pandang.</p>
                    </div>
                  </div>
                </div>

                {/* Berita & Artikel */}
                {(() => {
                  const relatedArticles = getArticlesByVehicle(vehicle.slug);
                  return relatedArticles.length > 0 && (
                    <div className="mt-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`w-1 h-6 rounded-full ${isCommercial ? 'bg-mitsu-fuso-yellow' : 'bg-mitsu-red'}`} />
                        <h2 className="text-xl sm:text-2xl font-bold text-mitsu-dark font-serif">Berita & Artikel</h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {relatedArticles.map((article, i) => (
                          <motion.div
                            key={article.slug}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08, duration: 0.4 }}
                            className={`group p-4 rounded-lg border transition-all duration-300 cursor-default ${
                              isCommercial
                                ? 'border-mitsu-fuso-yellow/15 bg-white hover:border-mitsu-fuso-yellow/30 hover:shadow-sm'
                                : 'border-mitsu-red/10 bg-white hover:border-mitsu-red/20 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 text-[8px] font-bold rounded uppercase tracking-wider ${
                                article.category === 'promo' ? 'bg-green-50 text-green-600'
                                  : article.category === 'launch' ? 'bg-blue-50 text-blue-600'
                                  : article.category === 'tips' ? 'bg-amber-50 text-amber-600'
                                  : 'bg-gray-50 text-gray-500'
                              }`}>
                                {article.category === 'promo' ? 'Promo' : article.category === 'launch' ? 'Launch' : article.category === 'tips' ? 'Tips' : 'Berita'}
                              </span>
                              <span className="text-[9px] text-gray-300 flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5" />
                                {new Date(article.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-mitsu-dark leading-snug mb-1.5 line-clamp-2">{article.title}</h4>
                            <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">{article.excerpt}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {activeTab === 'detail' && (vehicle.detailItems || vehicle.detailCategories) && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className={`w-1 h-6 rounded-full ${isCommercial ? 'bg-mitsu-fuso-yellow' : 'bg-mitsu-red'}`} />
                  <h2 className="text-xl sm:text-2xl font-bold text-mitsu-dark font-serif">Kenali {vehicle.name} Lebih Dekat</h2>
                </div>

                {/* Categorized Detail View (detailCategories) */}
                {vehicle.detailCategories && vehicle.detailCategories.length > 0 ? (
                  <>
                    {/* Detail Sub-Tabs */}
                    <div className="flex items-center gap-1 mb-8 overflow-x-auto hide-scrollbar">
                      {vehicle.detailCategories.map((cat) => (
                        <button
                          key={cat.category}
                          onClick={() => setDetailSubTab(cat.category)}
                          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                            detailSubTab === cat.category
                              ? isCommercial
                                ? 'bg-mitsu-fuso-yellow/10 text-mitsu-fuso-yellow-dark border border-mitsu-fuso-yellow/20'
                                : 'bg-mitsu-red/10 text-mitsu-red border border-mitsu-red/20'
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          {cat.category === 'eksterior' ? 'Eksterior' : cat.category === 'interior' ? 'Interior' : cat.category === 'keamanan' ? 'Keamanan' : 'Performa'}
                          <span className="ml-1.5 text-[9px] opacity-50">({cat.items.length})</span>
                        </button>
                      ))}
                    </div>

                    {/* Categorized Detail Items Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {vehicle.detailCategories
                        .find(c => c.category === detailSubTab)
                        ?.items.map((item, i) => (
                          <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06, duration: 0.4 }}
                            className={`p-4 rounded-lg border transition-all duration-300 ${
                              isCommercial
                                ? 'border-mitsu-fuso-yellow/15 bg-gradient-to-br from-mitsu-fuso-yellow/3 to-transparent hover:border-mitsu-fuso-yellow/25'
                                : 'border-mitsu-red/10 bg-gradient-to-br from-mitsu-red/3 to-transparent hover:border-mitsu-red/20'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                                isCommercial ? 'bg-mitsu-fuso-yellow/10 text-mitsu-fuso-yellow-dark' : 'bg-mitsu-red/8 text-mitsu-red'
                              }`}>
                                {i + 1}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-mitsu-dark">{item.title}</h4>
                                {item.note && (
                                  <span className={`inline-block mt-0.5 px-1.5 py-0.5 text-[8px] font-bold rounded ${
                                    isCommercial ? 'bg-mitsu-fuso-yellow/10 text-mitsu-fuso-yellow-dark' : 'bg-mitsu-red/10 text-mitsu-red'
                                  }`}>
                                    {item.note}
                                  </span>
                                )}
                                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{item.description}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </>
                ) : vehicle.detailItems && vehicle.detailItems.length > 0 ? (
                  <>
                    {/* Detail Carousel (fallback for detailItems) */}
                    <div className="relative">
                      {/* Navigation Arrows */}
                      {vehicle.detailItems.length > 1 && (
                        <>
                          <button
                            onClick={() => setDetailIndex(prev => prev === 0 ? vehicle.detailItems!.length - 1 : prev - 1)}
                            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                              isCommercial
                                ? 'bg-mitsu-fuso-yellow/10 hover:bg-mitsu-fuso-yellow/20 text-mitsu-fuso-yellow-dark'
                                : 'bg-mitsu-red/10 hover:bg-mitsu-red/15 text-mitsu-red'
                            } shadow-lg backdrop-blur-sm border border-white/50`}
                            aria-label="Sebelumnya"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setDetailIndex(prev => (prev + 1) % vehicle.detailItems!.length)}
                            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                              isCommercial
                                ? 'bg-mitsu-fuso-yellow/10 hover:bg-mitsu-fuso-yellow/20 text-mitsu-fuso-yellow-dark'
                                : 'bg-mitsu-red/10 hover:bg-mitsu-red/15 text-mitsu-red'
                            } shadow-lg backdrop-blur-sm border border-white/50`}
                            aria-label="Selanjutnya"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {/* Current Detail Card */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={detailIndex}
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -30 }}
                          transition={{ duration: 0.3 }}
                          className="mx-8 sm:mx-12"
                        >
                          <div className={`p-6 sm:p-8 rounded-lg border ${
                            isCommercial
                              ? 'border-mitsu-fuso-yellow/15 bg-gradient-to-br from-mitsu-fuso-yellow/5 to-transparent'
                              : 'border-mitsu-red/10 bg-gradient-to-br from-mitsu-red/5 to-transparent'
                          }`}>
                            <div className="flex items-start gap-4">
                              <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                                isCommercial ? 'bg-mitsu-fuso-yellow/10' : 'bg-mitsu-red/8'
                              }`}>
                                <Sparkles className={`w-6 h-6 ${isCommercial ? 'text-mitsu-fuso-yellow-dark' : 'text-mitsu-red'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg sm:text-xl font-bold text-mitsu-dark font-serif">{vehicle.detailItems[detailIndex].title}</h3>
                                  {vehicle.detailItems[detailIndex].note && (
                                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded whitespace-nowrap ${
                                      isCommercial
                                        ? 'bg-mitsu-fuso-yellow/10 text-mitsu-fuso-yellow-dark'
                                        : 'bg-mitsu-red/10 text-mitsu-red'
                                    }`}>
                                      {vehicle.detailItems[detailIndex].note}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed">{vehicle.detailItems[detailIndex].description}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>

                      {/* Pagination Dots */}
                      {vehicle.detailItems.length > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                          {vehicle.detailItems.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setDetailIndex(i)}
                              className={`transition-all duration-300 cursor-pointer ${
                                i === detailIndex
                                  ? isCommercial
                                    ? 'w-6 h-2 rounded-full bg-mitsu-fuso-yellow'
                                    : 'w-6 h-2 rounded-full bg-mitsu-red'
                                  : 'w-2 h-2 rounded-full bg-gray-200 hover:bg-gray-300'
                              }`}
                              aria-label={`Detail item ${i + 1}`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Counter */}
                      <p className="text-center text-[10px] text-gray-300 mt-2 tracking-wider">
                        {detailIndex + 1} / {vehicle.detailItems.length}
                      </p>
                    </div>

                    {/* All Details Grid (mobile-friendly list) */}
                    <div className="mt-10">
                      <div className="flex items-center gap-3 mb-5">
                        <div className={`w-1 h-6 rounded-full ${isCommercial ? 'bg-mitsu-fuso-yellow/30' : 'bg-mitsu-red/30'}`} />
                        <h3 className="text-base font-bold text-mitsu-dark">Semua Fitur Detail</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {vehicle.detailItems.map((item, i) => (
                          <button
                            key={item.title}
                            onClick={() => setDetailIndex(i)}
                            className={`text-left p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                              detailIndex === i
                                ? isCommercial
                                  ? 'border-mitsu-fuso-yellow/30 bg-mitsu-fuso-yellow/5 shadow-sm'
                                  : 'border-mitsu-red/20 bg-mitsu-red/5 shadow-sm'
                                : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <span className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                                detailIndex === i
                                  ? isCommercial ? 'bg-mitsu-fuso-yellow text-mitsu-dark' : 'bg-mitsu-red text-white'
                                  : 'bg-mitsu-light text-gray-400'
                              }`}>
                                {i + 1}
                              </span>
                              <div className="min-w-0">
                                <p className={`text-xs font-bold ${detailIndex === i ? 'text-mitsu-dark' : 'text-gray-600'}`}>{item.title}</p>
                                {item.note && (
                                  <span className="text-[9px] text-gray-300 mt-0.5">{item.note}</span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}
              </motion.div>
            )}

            {activeTab === 'galeri' && vehicle.gallery && (
              <motion.div
                key="galeri"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className={`w-1 h-6 rounded-full ${isCommercial ? 'bg-mitsu-fuso-yellow' : 'bg-mitsu-red'}`} />
                  <h2 className="text-xl sm:text-2xl font-bold text-mitsu-dark font-serif">Galeri {vehicle.name}</h2>
                </div>

                {/* Exterior Gallery */}
                {vehicle.gallery.exterior && vehicle.gallery.exterior.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-sm font-bold text-mitsu-dark mb-4 flex items-center gap-2">
                      <div className={`w-1 h-4 rounded-full ${isCommercial ? 'bg-mitsu-fuso-yellow' : 'bg-mitsu-red'}`} />
                      Eksterior
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {vehicle.gallery.exterior.map((img, i) => (
                        <motion.div
                          key={`ext-${i}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05, duration: 0.4 }}
                          className="relative aspect-[4/3] rounded-lg overflow-hidden group"
                        >
                          <Image
                            src={img.image}
                            alt={img.description || `${vehicle.name} eksterior ${i + 1}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, 33vw"
                            unoptimized={img.image.startsWith('/api/') || img.image.includes('vercel-storage.com')}
                          />
                          {img.description && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                              <p className="text-[11px] text-white font-medium line-clamp-2">{img.description}</p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interior Gallery */}
                {vehicle.gallery.interior && vehicle.gallery.interior.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-sm font-bold text-mitsu-dark mb-4 flex items-center gap-2">
                      <div className={`w-1 h-4 rounded-full ${isCommercial ? 'bg-mitsu-fuso-yellow' : 'bg-mitsu-red'}`} />
                      Interior
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {vehicle.gallery.interior.map((img, i) => (
                        <motion.div
                          key={`int-${i}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05, duration: 0.4 }}
                          className="relative aspect-[4/3] rounded-lg overflow-hidden group"
                        >
                          <Image
                            src={img.image}
                            alt={img.description || `${vehicle.name} interior ${i + 1}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, 33vw"
                            unoptimized={img.image.startsWith('/api/') || img.image.includes('vercel-storage.com')}
                          />
                          {img.description && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                              <p className="text-[11px] text-white font-medium line-clamp-2">{img.description}</p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Highlights Gallery */}
                {vehicle.gallery.highlights && vehicle.gallery.highlights.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-sm font-bold text-mitsu-dark mb-4 flex items-center gap-2">
                      <div className={`w-1 h-4 rounded-full ${isCommercial ? 'bg-mitsu-fuso-yellow' : 'bg-mitsu-red'}`} />
                      Highlights
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {vehicle.gallery.highlights.map((img, i) => (
                        <motion.div
                          key={`hl-${i}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05, duration: 0.4 }}
                          className="relative aspect-[4/3] rounded-lg overflow-hidden group"
                        >
                          <Image
                            src={img.image}
                            alt={img.description || `${vehicle.name} highlight ${i + 1}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, 33vw"
                            unoptimized={img.image.startsWith('/api/') || img.image.includes('vercel-storage.com')}
                          />
                          {img.description && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                              <p className="text-[11px] text-white font-medium line-clamp-2">{img.description}</p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Applications Gallery */}
                {vehicle.gallery.applications && vehicle.gallery.applications.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-sm font-bold text-mitsu-dark mb-4 flex items-center gap-2">
                      <div className={`w-1 h-4 rounded-full ${isCommercial ? 'bg-mitsu-fuso-yellow' : 'bg-mitsu-red'}`} />
                      Aplikasi
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {vehicle.gallery.applications.map((img, i) => (
                        <motion.div
                          key={`app-${i}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05, duration: 0.4 }}
                          className="relative aspect-[4/3] rounded-lg overflow-hidden group"
                        >
                          <Image
                            src={img.image}
                            alt={img.name || `${vehicle.name} aplikasi ${i + 1}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, 33vw"
                            unoptimized={img.image.startsWith('/api/') || img.image.includes('vercel-storage.com')}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                            <p className="text-[11px] text-white font-medium line-clamp-2">{img.name}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
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
                    <div key={specGroup.category} className={`rounded-lg border overflow-hidden transition-all duration-300 ${
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

            {activeTab === 'credit' && (
              <motion.div
                key="credit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <CreditSimulation
                  defaultPrice={displayPriceNum}
                  vehicleName={vehicle.name}
                  accentTheme={isCommercial ? 'yellow' : 'red'}
                />
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
                      <tr className="border-t border-gray-50">
                        <td className="p-3 text-xs text-gray-500">Transmisi</td>
                        {vehicle.variants.map((v) => (
                          <td key={v.name} className="p-3 text-xs text-center font-medium text-mitsu-dark">{v.transmission}</td>
                        ))}
                      </tr>
                      {vehicle.variants.some((v) => v.drivetrain) && (
                        <tr className="border-t border-gray-50">
                          <td className="p-3 text-xs text-gray-500">Drivetrain</td>
                          {vehicle.variants.map((v) => (
                            <td key={v.name} className="p-3 text-xs text-center font-medium text-mitsu-dark">{v.drivetrain || '-'}</td>
                          ))}
                        </tr>
                      )}
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
                    <div key={v.name} className={`p-4 rounded-lg border transition-all duration-300 ${
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
        <div className={`absolute inset-0 ${isCommercial ? 'bg-mitsu-fuso-yellow/5' : 'bg-mitsu-light'}`} />
        <div className="absolute inset-0 luxury-pattern-light" />
        <div className="absolute top-0 left-0 w-full h-px bg-gray-200" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-mitsu-dark font-serif">
              Tertarik dengan Mitsubishi{' '}
              <span className={isCommercial ? 'text-mitsu-fuso-yellow-dark italic' : 'text-mitsu-red'}>
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
                className="flex items-center gap-2.5 px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all text-sm tracking-wide hover:scale-105 active:scale-95 min-h-[44px]"
              >
                <MessageCircle className="w-5 h-5" />
                Hubungi via WhatsApp
              </a>
              <Link
                href="/#test-drive"
                className={`flex items-center gap-2 px-8 py-3.5 ${isCommercial ? 'btn-fuso-yellow' : 'btn-mitsu-red'} rounded-lg transition-all text-sm tracking-wide hover:scale-105 active:scale-95 min-h-[44px] font-bold`}
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
