'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Truck, FileText, ChevronLeft, ChevronRight, X, Calendar, User, Car } from 'lucide-react';

interface GalleryItem {
  id: string;
  type: 'delivery' | 'article';
  title: string;
  description: string;
  imagePath: string;
  customerName: string;
  vehicleName: string;
  articleContent: string;
  displayOrder: number;
  active: boolean;
  createdAt?: string;
}

export default function GallerySection() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'delivery' | 'article'>('delivery');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch('/api/gallery', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setItems(data);
      } catch {
        // Silent fail
      }
    }
    fetchGallery();
  }, []);

  const deliveries = items.filter(i => i.type === 'delivery');
  const articles = items.filter(i => i.type === 'article');
  const displayItems = activeTab === 'delivery' ? deliveries : articles;

  if (items.length === 0) return null;

  return (
    <section id="gallery" className="relative py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
      {/* Luxury pattern */}
      <div className="absolute inset-0 luxury-pattern-light" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 pointer-events-none">
        <div className="w-24 h-24 border-l border-t border-gray-200" />
      </div>
      <div className="absolute bottom-0 right-0 pointer-events-none">
        <div className="w-24 h-24 border-r border-b border-gray-200" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-10 sm:mb-14"
        >
          <span className="inline-flex items-center gap-3 text-mitsu-red text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase">
            <span className="w-10 h-px bg-mitsu-red/50" />
            Gallery
            <span className="w-10 h-px bg-mitsu-red/50" />
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-mitsu-dark font-serif">
            Momen <span className="text-mitsu-red">Spesial</span> Kami
          </h2>
          <p className="mt-3 text-mitsu-text/70 text-base sm:text-lg max-w-xl">
            Serah terima kendaraan pelanggan dan artikel menarik seputar Mitsubishi.
          </p>

          {/* Ornamental divider */}
          <div className="flex items-center gap-3 mt-5">
            <div className="w-10 h-px bg-mitsu-red/40" />
            <div className="w-1.5 h-1.5 bg-mitsu-red/40 rotate-45" />
          </div>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('delivery')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'delivery'
                ? 'bg-mitsu-red text-white shadow-lg shadow-mitsu-red/25'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            Serah Terima
            {deliveries.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === 'delivery' ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {deliveries.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('article')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'article'
                ? 'bg-mitsu-fuso-yellow text-mitsu-dark shadow-lg shadow-mitsu-fuso-yellow/25'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Artikel
            {articles.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === 'article' ? 'bg-black/10' : 'bg-gray-200'
              }`}>
                {articles.length}
              </span>
            )}
          </button>
        </div>

        {/* Gallery Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`grid gap-4 sm:gap-6 ${
              activeTab === 'delivery'
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {displayItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <div className={`relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 ${
                  activeTab === 'delivery' ? 'aspect-square' : ''
                }`}>
                  {/* Image */}
                  <div className={`relative ${activeTab === 'delivery' ? 'h-full' : 'h-52 sm:h-60'} overflow-hidden`}>
                    {item.imagePath ? (
                      <img
                        src={item.imagePath}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/hero-cinematic.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        {item.type === 'delivery' ? (
                          <Truck className="w-12 h-12 text-gray-300" />
                        ) : (
                          <FileText className="w-12 h-12 text-gray-300" />
                        )}
                      </div>
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Delivery badge */}
                    {item.type === 'delivery' && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-mitsu-red/90 text-white text-[10px] font-bold rounded-lg">
                          <Truck className="w-3 h-3" /> Serah Terima
                        </span>
                      </div>
                    )}
                    {item.type === 'article' && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-mitsu-fuso-yellow/90 text-mitsu-dark text-[10px] font-bold rounded-lg">
                          <FileText className="w-3 h-3" /> Artikel
                        </span>
                      </div>
                    )}

                    {/* Bottom info on hover for delivery */}
                    {item.type === 'delivery' && (
                      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white text-sm font-semibold line-clamp-1">{item.title}</p>
                        {item.customerName && (
                          <p className="text-white/70 text-xs mt-0.5">{item.customerName}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Article card content */}
                  {item.type === 'article' && (
                    <div className="p-4">
                      <h3 className="font-bold text-mitsu-dark line-clamp-2 text-sm sm:text-base">{item.title}</h3>
                      {item.description && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                      )}
                      <span className="inline-flex items-center gap-1 mt-3 text-mitsu-fuso-yellow text-xs font-semibold group-hover:underline">
                        Baca selengkapnya →
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {displayItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">
              {activeTab === 'delivery' ? 'Belum ada foto serah terima' : 'Belum ada artikel'}
            </p>
          </div>
        )}
      </div>

      {/* Lightbox / Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Image */}
              {selectedItem.imagePath && (
                <div className="relative h-64 sm:h-80">
                  <img
                    src={selectedItem.imagePath}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {/* Type badge */}
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                  selectedItem.type === 'delivery'
                    ? 'bg-mitsu-red/10 text-mitsu-red'
                    : 'bg-mitsu-fuso-yellow/10 text-mitsu-fuso-yellow-dark'
                }`}>
                  {selectedItem.type === 'delivery' ? (
                    <><Truck className="w-3 h-3" /> Serah Terima</>
                  ) : (
                    <><FileText className="w-3 h-3" /> Artikel</>
                  )}
                </span>

                <h2 className="text-xl sm:text-2xl font-bold text-mitsu-dark mt-3">{selectedItem.title}</h2>

                {selectedItem.description && (
                  <p className="text-gray-600 mt-2">{selectedItem.description}</p>
                )}

                {/* Delivery meta */}
                {selectedItem.type === 'delivery' && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {selectedItem.customerName && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-gray-700">
                        <User className="w-3.5 h-3.5 text-mitsu-red" /> {selectedItem.customerName}
                      </span>
                    )}
                    {selectedItem.vehicleName && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-gray-700">
                        <Car className="w-3.5 h-3.5 text-mitsu-red" /> {selectedItem.vehicleName}
                      </span>
                    )}
                    {selectedItem.createdAt && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-gray-700">
                        <Calendar className="w-3.5 h-3.5 text-mitsu-red" /> {new Date(selectedItem.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                )}

                {/* Article content */}
                {selectedItem.type === 'article' && selectedItem.articleContent && (
                  <div className="mt-4 prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedItem.articleContent}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
