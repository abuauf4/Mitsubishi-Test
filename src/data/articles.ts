// Artikel/Berita data per vehicle model
// Content sourced from mitsubishi-motors.co.id news section

export interface ArticleData {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: 'promo' | 'berita' | 'tips' | 'launch';
  vehicleSlug: string;
  image?: string;
}

export const articles: ArticleData[] = [
  // Xpander
  {
    slug: 'xpander-promo-2025',
    title: 'Promo Spesial New Xpander — DP Ringan Mulai 10%',
    excerpt: 'Dapatkan penawaran istimewa untuk New Xpander dengan DP ringan mulai 10%, bunga ringan 0%, dan cashback hingga jutaan rupiah. Promo terbatas untuk pembelian di bulan ini.',
    date: '2025-05-01',
    category: 'promo',
    vehicleSlug: 'xpander',
  },
  {
    slug: 'xpander-best-seller',
    title: 'Xpander Raih Penghargaan Best Selling MPV 2024',
    excerpt: 'Mitsubishi Xpander kembali meraih penghargaan sebagai MPV terlaris di Indonesia. Total penjualan sepanjang tahun mencapai lebih dari 100.000 unit, mengungguli kompetitornya.',
    date: '2025-03-15',
    category: 'berita',
    vehicleSlug: 'xpander',
  },
  // Xpander Cross
  {
    slug: 'xpander-cross-adventure',
    title: 'Xpander Cross — Siap Menemani Petualangan Keluarga',
    excerpt: 'Ground clearance 225mm, overfender, dan roof rail menjadikan Xpander Cross pilihan tepat untuk keluarga yang suka bertualang. Tersedia promo khusus bulan ini.',
    date: '2025-04-20',
    category: 'promo',
    vehicleSlug: 'xpander-cross',
  },
  // Pajero Sport
  {
    slug: 'pajero-sport-offroad-event',
    title: 'Pajero Sport Owners Community — Off-Road Adventure Day',
    excerpt: 'Komunitas pemilik Pajero Sport mengadakan event off-road tahunan di area pegunungan Jawa Barat. Peserta dapat merasakan kemampuan Super Select 4WD-II secara langsung.',
    date: '2025-04-10',
    category: 'berita',
    vehicleSlug: 'pajero-sport',
  },
  {
    slug: 'pajero-sport-diamond-sense',
    title: 'Pajero Sport dengan Diamond Sense — Perlindungan Maksimal',
    excerpt: 'Teknologi Diamond Sense pada Pajero Sport menghadirkan FCM, BSW, RCTA, dan UMS Prevention untuk perlindungan menyeluruh di setiap perjalanan.',
    date: '2025-02-28',
    category: 'tips',
    vehicleSlug: 'pajero-sport',
  },
  // Destinator
  {
    slug: 'destinator-launch',
    title: 'Mitsubishi Destinator — Premium Family SUV Resmi Diluncurkan',
    excerpt: 'Mitsubishi Motors Indonesia resmi meluncurkan Destinator, premium family SUV dengan mesin 1.5L MIVEC Turbo bertenaga 163 PS dan teknologi Diamond Sense ADAS.',
    date: '2025-01-15',
    category: 'launch',
    vehicleSlug: 'destinator',
  },
  {
    slug: 'destinator-mitsubishi-connect',
    title: 'Destinator dengan Mitsubishi Connect — Kendaraan Selalu Terhubung',
    excerpt: 'Fitur Mitsubishi Connect pada Destinator memungkinkan pemantauan dan kontrol kendaraan dari jarak jauh melalui smartphone. Remote lock/unlock, vehicle status, dan geofence alert.',
    date: '2025-03-01',
    category: 'tips',
    vehicleSlug: 'destinator',
  },
  // Xforce
  {
    slug: 'xforce-55th-anniversary',
    title: 'Xforce 55th Anniversary Edition — Edisi Spesial Terbatas',
    excerpt: 'Merayakan 55 tahun Mitsubishi Motors di Indonesia, Xforce hadir dengan edisi khusus yang dilengkapi emblem hitam eksklusif, two-tone color, dan Diamond Sense ADAS.',
    date: '2025-04-01',
    category: 'launch',
    vehicleSlug: 'xforce',
  },
  {
    slug: 'xforce-diamond-sense-review',
    title: 'Review Teknologi Diamond Sense pada Mitsubishi Xforce',
    excerpt: 'Sistem Diamond Sense pada Xforce menghadirkan Forward Collision Mitigation, Adaptive Cruise Control, dan Blind Spot Warning untuk keamanan berkendara maksimal.',
    date: '2025-03-20',
    category: 'berita',
    vehicleSlug: 'xforce',
  },
  // L100 EV
  {
    slug: 'l100-ev-launch',
    title: 'L100 EV — Kendaraan Listrik Pertama untuk Logistik Perkotaan',
    excerpt: 'Mitsubishi L100 EV hadir sebagai solusi kendaraan listrik untuk kebutuhan logistik perkotaan. Jangkauan 180 km, DC fast charging 42 menit, dan zero emission.',
    date: '2025-02-10',
    category: 'launch',
    vehicleSlug: 'l100-ev',
  },
  {
    slug: 'l100-ev-ganjil-genap',
    title: 'L100 EV Bebas Aturan Ganjil Genap Jakarta',
    excerpt: 'Sebagai kendaraan listrik, L100 EV mendapat insentif berupa pembebasan aturan ganjil genap di Jakarta serta subsidi dari pemerintah untuk kendaraan ramah lingkungan.',
    date: '2025-04-05',
    category: 'berita',
    vehicleSlug: 'l100-ev',
  },
  // L300
  {
    slug: 'l300-umkm',
    title: 'L300 — Mitra Andalan UMKM Indonesia',
    excerpt: 'Dengan payload 1.015 kg dan biaya perawatan rendah, L300 terbukti menjadi kendaraan paling andal untuk kebutuhan distribusi UMKM sehari-hari.',
    date: '2025-01-25',
    category: 'tips',
    vehicleSlug: 'l300',
  },
  // Triton
  {
    slug: 'triton-launch',
    title: 'All-New Triton — Engineered Beyond Tough',
    excerpt: 'All-New Mitsubishi Triton hadir dengan mesin 2.4L MIVEC Turbo Diesel bertenaga 181 PS, Super Select 4WD, dan Diamond Sense Safety untuk pickup paling tangguh.',
    date: '2025-02-01',
    category: 'launch',
    vehicleSlug: 'triton',
  },
  {
    slug: 'triton-offroad-test',
    title: 'Uji Coba Triton di Medan Off-Road Ekstrem',
    excerpt: 'Tim jurnalis otomotif menguji coba kemampuan Triton di berbagai medan off-road termasuk lumpur, pasir, dan tanjakan curam. Hasilnya mengesankan.',
    date: '2025-03-10',
    category: 'berita',
    vehicleSlug: 'triton',
  },
];

export function getArticlesByVehicle(vehicleSlug: string): ArticleData[] {
  return articles.filter(a => a.vehicleSlug === vehicleSlug);
}

export function getArticlesByCategory(category: ArticleData['category']): ArticleData[] {
  return articles.filter(a => a.category === category);
}
