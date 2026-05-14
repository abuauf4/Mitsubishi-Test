/**
 * Static data fallback for when Turso is not configured.
 * This ensures the admin panel and public pages always show data
 * even without a database connection.
 */

import { passengerVehicles, niagaRinganVehicles, commercialVehicles } from '@/data/vehicles';

function generateId(): string {
  return crypto.randomUUID();
}

/** Get all vehicles in the format the admin panel expects */
export function getStaticVehicles() {
  const allVehicles = [...passengerVehicles, ...niagaRinganVehicles, ...commercialVehicles];
  return allVehicles.map((v, index) => ({
    id: `static-${v.slug}`,
    slug: v.slug,
    name: v.name,
    tagline: v.tagline,
    category: v.category,
    basePrice: v.basePrice,
    imagePath: v.image,
    payload: v.payload || null,
    specsShort: JSON.stringify(v.specsShort),
    displayOrder: index,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: v.variants.map((vr, j) => ({
      id: `static-${v.slug}-variant-${j}`,
      vehicleId: `static-${v.slug}`,
      name: vr.name,
      price: vr.price,
      priceNum: vr.priceNum,
      transmission: vr.transmission,
      drivetrain: vr.drivetrain || null,
      highlights: JSON.stringify(vr.highlights),
      displayOrder: j,
    })),
    colors: v.colors.map((c, j) => ({
      id: `static-${v.slug}-color-${j}`,
      vehicleId: `static-${v.slug}`,
      name: c.name,
      hex: c.hex,
      imagePath: c.image || null,
      displayOrder: j,
    })),
    specs: v.specs.map((s, j) => ({
      id: `static-${v.slug}-spec-${j}`,
      vehicleId: `static-${v.slug}`,
      category: s.category,
      items: JSON.stringify(s.items),
      displayOrder: j,
    })),
    features: v.features.map((f, j) => ({
      id: `static-${v.slug}-feature-${j}`,
      vehicleId: `static-${v.slug}`,
      icon: f.icon,
      title: f.title,
      description: f.description,
      displayOrder: j,
    })),
    _count: {
      variants: v.variants.length,
      colors: v.colors.length,
      specs: v.specs.length,
      features: v.features.length,
    },
  }));
}

/** Get a single vehicle by slug (static fallback) */
export function getStaticVehicleBySlug(slug: string) {
  const vehicles = getStaticVehicles();
  return vehicles.find(v => v.slug === slug) || null;
}

/** Get vehicles for the admin list view (with _count) */
export function getStaticVehiclesList() {
  return getStaticVehicles().map(v => ({
    id: v.id,
    slug: v.slug,
    name: v.name,
    tagline: v.tagline,
    category: v.category,
    basePrice: v.basePrice,
    imagePath: v.imagePath,
    active: v.active,
    displayOrder: v.displayOrder,
    _count: v._count,
  }));
}

/** Get static hero data */
export function getStaticHero() {
  return {
    id: 'static-hero',
    title: 'Drive Your Ambition',
    subtitle: 'Temukan kendaraan Mitsubishi terbaik untuk hidup dan bisnis Anda',
    imagePath: '/images/hero-cinematic.png',
    ctaText: 'Selengkapnya',
    ctaLink: '#audience-gateway',
    active: true,
  };
}

/** Get static sales consultant data */
export function getStaticSales() {
  return [{
    id: 'static-sales-1',
    name: 'Andi Pratama',
    phone: '0812-3456-7890',
    whatsapp: '081234567890',
    email: 'andi.pratama@mitsubishi.co.id',
    title: 'Sales Consultant',
    description: 'Saya adalah Sales Consultant resmi Mitsubishi dengan pengalaman lebih dari 10 tahun. Siap membantu Anda menemukan kendaraan yang tepat — mulai dari konsultasi, test drive, simulasi kredit, hingga proses pengiriman kendaraan.',
    imagePath: '/images/andi-profile.png',
    active: true,
  }];
}

/** Get static testimonials */
export function getStaticTestimonials() {
  return [
    {
      id: 'static-testimonial-1',
      customerName: 'Budi Santoso',
      customerRole: 'Pemilik Xpander Ultimate',
      content: 'Xpander sangat nyaman untuk keluarga saya. After sales Mitsubishi juga luar biasa, bengkel resmi tersebar di mana-mana.',
      rating: 5,
      imagePath: '',
      displayOrder: 0,
      active: true,
    },
    {
      id: 'static-testimonial-2',
      customerName: 'Siti Rahayu',
      customerRole: 'Pemilik Pajero Sport Dakar',
      content: 'Pajero Sport tangguh banget untuk segala medan. Super Select 4WD-nya bikin percaya diri di jalan off-road sekalipun.',
      rating: 5,
      imagePath: '',
      displayOrder: 1,
      active: true,
    },
    {
      id: 'static-testimonial-3',
      customerName: 'Ahmad Hidayat',
      customerRole: 'Pemilik FUSO Canter FE 74',
      content: 'Canter FE 74 jadi andalan untuk distribusi harian. Mesin tahan lama dan biaya perawatan sangat terjangkau.',
      rating: 4,
      imagePath: '',
      displayOrder: 2,
      active: true,
    },
  ];
}

/** Get static audience categories */
export function getStaticCategories() {
  return [
    {
      id: 'static-cat-1',
      title: 'Passenger Cars',
      description: 'MPV keluarga, SUV tangguh, hingga kendaraan listrik',
      imagePath: '/images/xpander.png',
      linkHref: '/passenger',
      displayOrder: 0,
      active: true,
    },
    {
      id: 'static-cat-2',
      title: 'Commercial Vehicles',
      description: 'Niaga ringan hingga heavy duty untuk bisnis Anda',
      imagePath: '/images/l300.png',
      linkHref: '/commercial',
      displayOrder: 1,
      active: true,
    },
  ];
}

/** Get static dealer locations */
export function getStaticDealers() {
  return [
    {
      id: 'static-dealer-1',
      name: 'PT. Mitsubishi Motors Jakarta Pusat',
      address: 'Jl. Jend. Sudirman No. 123, Jakarta Pusat 10220',
      phone: '(021) 555-1234',
      latitude: -6.2088,
      longitude: 106.8456,
      embeddingUrl: '',
      active: true,
    },
  ];
}

/** Get static site config */
export function getStaticSiteConfig() {
  return [
    { id: 'static-config-1', key: 'site_logo', value: '/mitsubishi-logo.png', type: 'image', page: 'global' },
    { id: 'static-config-2', key: 'brand_name', value: 'Mitsubishi Motor Indonesia', type: 'text', page: 'global' },
    { id: 'static-config-3', key: 'phone', value: '0812-3456-7890', type: 'text', page: 'global' },
  ];
}
