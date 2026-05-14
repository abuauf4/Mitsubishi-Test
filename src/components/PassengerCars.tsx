'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

interface VehicleCard {
  name: string;
  tagline: string;
  price: string;
  image: string;
  specs: string[];
  slug?: string;
  category?: string;
}

const fallbackVehicles: VehicleCard[] = [
  {
    name: 'New Xpander',
    tagline: 'MPV Keluarga 7-Seater Raja Segmen',
    price: 'Mulai Rp 271 Juta',
    image: '/api/image?url=https%3A%2F%2Fucdtyehtmprstsit.private.blob.vercel-storage.com%2Fmitsubishi%2F1778709761819-passenger_new-xpander_main_hvh87j5kea2g6c7zt01855a3sxsgzp0d2w89jz3p-optimized.webp',
    specs: ['7 Penumpang', '1.5L MIVEC 1.499cc', 'CVT / Manual'],
    slug: 'new-xpander',
    category: 'passenger',
  },
  {
    name: 'Xpander Cross',
    tagline: 'Step Up Your Adventure',
    price: 'Mulai Rp 345 Juta',
    image: '/api/image?url=https%3A%2F%2Fucdtyehtmprstsit.private.blob.vercel-storage.com%2Fmitsubishi%2F1778709818799-passenger_new-xpander-cross_main_3haf1ahqup2jxahic1lny1ya9um0jz1xcfdx4zb4-optimized.webp',
    specs: ['7 Penumpang', 'GC 225mm', 'Overfender + Roof Rail'],
    slug: 'xpander-cross',
    category: 'passenger',
  },
  {
    name: 'Pajero Sport',
    tagline: 'SUV Ladder Frame Tangguh Segala Medan',
    price: 'Mulai Rp 586 Juta',
    image: '/api/image?url=https%3A%2F%2Fucdtyehtmprstsit.private.blob.vercel-storage.com%2Fmitsubishi%2F1778708599624-passenger_new-pajero-sport_main_jqfrr7i2mxmkrdrognu59bbjqwummi133orl4xew-optimized.webp',
    specs: ['4x2 & SS4-II', '2.4L DI-D MIVEC', '8-Speed AT'],
    slug: 'pajero-sport',
    category: 'passenger',
  },
  {
    name: 'Destinator',
    tagline: 'Premium Family SUV — Model Global Terbaru',
    price: 'Mulai Rp 397 Juta',
    image: '/api/image?url=https%3A%2F%2Fucdtyehtmprstsit.private.blob.vercel-storage.com%2Fmitsubishi%2F1778708556639-passenger_destinator_main_26my-dst-idn-p1-mc10-front-right-w81.jpg',
    specs: ['7 Penumpang', '1.5L MIVEC Turbo', 'Diamond Sense ADAS'],
    slug: 'destinator',
    category: 'passenger',
  },
  {
    name: 'Xforce',
    tagline: 'SUV Stylish untuk Gaya Hidup Urban',
    price: 'Mulai Rp 390 Juta',
    image: '/api/image?url=https%3A%2F%2Fucdtyehtmprstsit.private.blob.vercel-storage.com%2Fmitsubishi%2F1778709855129-passenger_xforce_main_qsqbufibgo8j8qbulzogzb9lhv7cx2rseg0lh2qu-optimized.webp',
    specs: ['5 Penumpang', '1.5L MIVEC 1.499cc', 'Diamond Sense ADAS'],
    slug: 'xforce',
    category: 'passenger',
  },
  {
    name: 'L100 EV',
    tagline: 'EV Pertama Mitsubishi Buatan Indonesia',
    price: 'Mulai Rp 323 Juta',
    image: '/images/l300-van.png',
    specs: ['Electric Motor 41 HP', '180 km Range', 'DC Fast Charging 42 min'],
    slug: 'l100-ev',
    category: 'passenger',
  },
  {
    name: 'L300',
    tagline: 'Tangguh di Tanjakan, Hebat di Segala Medan',
    price: 'Mulai Rp 240 Juta',
    image: '/images/l300.png',
    specs: ['2.2L DOHC Turbo Diesel', 'Payload 1.015 Kg', 'Euro 4'],
    slug: 'l300',
    category: 'passenger',
  },
];

export default function PassengerCars() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [vehicles, setVehicles] = useState<VehicleCard[]>(fallbackVehicles);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const res = await fetch('/api/vehicles?category=passenger');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: VehicleCard[] = data.map((v: any) => ({
            name: v.name || '',
            tagline: v.tagline || '',
            price: v.basePrice || '',
            image: v.imagePath || v.image || '/images/canter.png',
            specs: Array.isArray(v.specsShort) ? v.specsShort : [],
            slug: v.slug || '',
            category: v.category || 'passenger',
          }));
          setVehicles(mapped);
        }
      } catch {
        // Keep fallback data
      }
    }
    fetchVehicles();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 380;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  // Build link for each vehicle card
  const getVehicleLink = (vehicle: VehicleCard) => {
    if (vehicle.slug) {
      return `/passenger/${vehicle.slug}`;
    }
    return `/passenger/${vehicle.name.toLowerCase().replace(/\s+/g, '-')}`;
  };

  return (
    <section id="passenger" className="relative py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-10 sm:mb-14"
        >
          <span className="text-mitsu-red text-xs sm:text-sm font-semibold tracking-widest uppercase">
            Passenger Cars
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold text-mitsu-dark">
            Untuk Setiap Perjalanan
          </h2>
          <p className="mt-3 text-mitsu-text/70 text-base sm:text-lg max-w-xl">
            Dari mobilitas keluarga hingga petualangan ekstrem, Mitsubishi punya jawabannya.
          </p>
        </motion.div>

        {/* Scroll Controls */}
        <div className="hidden sm:flex items-center gap-2 mb-6">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full border border-gray-300 hover:border-mitsu-red hover:text-mitsu-red transition-colors"
            aria-label="Scroll ke kiri"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full border border-gray-300 hover:border-mitsu-red hover:text-mitsu-red transition-colors"
            aria-label="Scroll ke kanan"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Vehicle Cards - Horizontal Scroll */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-[300px] sm:w-[340px] lg:w-[380px] group"
            >
              <a href={getVehicleLink(vehicle)} className="block">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
                  {/* Vehicle Image */}
                  <div className="relative h-[320px] sm:h-[360px] vehicle-image-bg overflow-hidden">
                    <img
                      src={vehicle.image}
                      alt={`Mitsubishi ${vehicle.name}`}
                      className="w-full h-full object-cover relative z-[1] transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 z-[2]">
                      <span className="inline-block px-3 py-1 bg-mitsu-red text-white text-xs font-semibold rounded-full">
                        {vehicle.price}
                      </span>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-mitsu-dark">
                      Mitsubishi {vehicle.name}
                    </h3>
                    <p className="mt-1 text-mitsu-text/60 text-sm">{vehicle.tagline}</p>

                    {/* Specs */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {vehicle.specs.map((spec) => (
                        <span
                          key={spec}
                          className="px-3 py-1 bg-gray-100 text-mitsu-text/70 text-xs font-medium rounded-full"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-mitsu-dark group-hover:bg-mitsu-red text-white font-semibold rounded-lg transition-all duration-300 min-h-[44px] text-sm tracking-wide">
                      Lihat Detail
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
