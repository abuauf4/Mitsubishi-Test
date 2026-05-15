// Comprehensive vehicle data for Mitsubishi Motor Indonesia
// Data sourced from mitsubishi-motors.co.id & ktbfuso.co.id (official)
// Categories match official site: Passenger, Niaga Ringan, FUSO Commercial

export interface VehicleColor {
  name: string;
  hex: string;
  image?: string;
}

export interface VehicleVariant {
  name: string;
  price: string;
  priceNum: number;
  transmission: string;
  drivetrain?: string;
  image?: string;
  highlights: string[];
}

export interface VehicleGallery {
  exterior?: { description: string; image: string }[];
  interior?: { description: string; image: string }[];
  highlights?: { description: string; image: string }[];
  applications?: { name: string; image: string }[];
  global?: { key: string; image: string }[];
}

export interface VehicleSpec {
  category: string;
  items: { label: string; value: string }[];
}

export interface VehicleFeature {
  icon: string;
  title: string;
  description: string;
}

export interface VehicleHighlightBadge {
  icon: string;
  label: string;
  description: string;
}

export interface VehicleDetailItem {
  title: string;
  description: string;
  note?: string;
}

export interface VehicleData {
  slug: string;
  name: string;
  tagline: string;
  category: 'passenger' | 'niaga-ringan' | 'commercial';
  basePrice: string;
  image: string;
  colors: VehicleColor[];
  variants: VehicleVariant[];
  specs: VehicleSpec[];
  features: VehicleFeature[];
  highlightBadges?: VehicleHighlightBadge[];
  detailItems?: VehicleDetailItem[];
  promoText?: string;
  gallery?: VehicleGallery;
  payload?: string;
  specsShort: string[];
}

// ===================== KENDARAAN PENUMPANG (8 models) =====================
// Source: mitsubishi-motors.co.id — Xpander, Xpander Cross, Pajero Sport, Destinator, Xforce, L100 EV, L300, Triton

export const passengerVehicles: VehicleData[] = [
  {
    slug: 'xpander',
    name: 'New Xpander',
    tagline: 'Take Control, Stay Ahead',
    category: 'passenger',
    basePrice: 'Mulai Rp 271 Juta',
    promoText: 'DP ringan mulai 10%, bunga ringan 0%, dan cashback hingga jutaan rupiah.',
    image: '/api/image?url=https%3A%2F%2Fucdtyehtmprstsit.private.blob.vercel-storage.com%2Fmitsubishi%2F1778709761819-passenger_new-xpander_main_hvh87j5kea2g6c7zt01855a3sxsgzp0d2w89jz3p-optimized.webp',
    colors: [
      { name: 'Quartz White Pearl', hex: '#F5F5F0' },
      { name: 'Jet Black Mica', hex: '#1A1A1A' },
      { name: 'Blade Silver Metallic', hex: '#B8B8B8' },
      { name: 'Red Metallic', hex: '#C41E3A' },
      { name: 'Graphite Grey Metallic', hex: '#7A7A7A' },
    ],
    variants: [
      { name: 'GLS MT', price: 'Rp 271.500.000', priceNum: 271, transmission: '5-Speed Manual', highlights: ['1.5L MIVEC', '7 Penumpang', 'AC Single', '2 Airbag'] },
      { name: 'GLS CVT', price: 'Rp 286.500.000', priceNum: 286, transmission: 'CVT', highlights: ['1.5L MIVEC', '7 Penumpang', 'AC Single', '2 Airbag'] },
      { name: 'Exceed Tourer MT', price: 'Rp 306.500.000', priceNum: 306, transmission: '5-Speed Manual', highlights: ['1.5L MIVEC', '7 Penumpang', 'AC Dual Zone', 'Keyless Entry'] },
      { name: 'Exceed Tourer CVT', price: 'Rp 321.500.000', priceNum: 321, transmission: 'CVT', highlights: ['1.5L MIVEC', '7 Penumpang', 'AC Dual Zone', 'Cruise Control'] },
      { name: 'Ultimate MT', price: 'Rp 346.500.000', priceNum: 346, transmission: '5-Speed Manual', highlights: ['1.5L MIVEC', '7 Penumpang', 'LED Headlamp', 'Push Start'] },
      { name: 'Ultimate CVT', price: 'Rp 345.000.000', priceNum: 345, transmission: 'CVT', highlights: ['1.5L MIVEC', '7 Penumpang', '360° Camera', 'Cruise Control'] },
    ],
    specs: [
      { category: 'Mesin', items: [{ label: 'Tipe Mesin', value: '4A91 1.5L DOHC MIVEC 16-Valve' }, { label: 'Kapasitas', value: '1.499 cc' }, { label: 'Tenaga Maks', value: '105 PS / 6.000 rpm' }, { label: 'Torsi Maks', value: '141 Nm / 4.000 rpm' }, { label: 'Bahan Bakar', value: 'Bensin' }] },
      { category: 'Dimensi', items: [{ label: 'Panjang', value: '4.595 mm' }, { label: 'Lebar', value: '1.750 mm' }, { label: 'Tinggi', value: '1.730 mm (GLS) / 1.750 mm' }, { label: 'Wheelbase', value: '2.775 mm' }, { label: 'Ground Clearance', value: '220 mm (GLS) / 225 mm' }] },
      { category: 'Keselamatan', items: [{ label: 'Airbag', value: '2 / 7 (varian)' }, { label: 'Rem ABS+EBD', value: 'Standar' }, { label: 'ASC', value: 'Standar' }, { label: 'Hill Start Assist', value: 'Standar' }, { label: 'Isofix', value: 'Standar' }] },
      { category: 'Kenyamanan', items: [{ label: 'AC', value: 'Single / Dual Zone' }, { label: 'Head Unit', value: 'Touchscreen Display Audio' }, { label: 'Kursi', value: '7 Penumpang (2-3-2)' }, { label: 'Power Outlet', value: 'Semua Baris' }] },
    ],
    highlightBadges: [
      { icon: 'Shield', label: 'Sistem Keamanan', description: 'Fitur keselamatan unggulan memberikan perlindungan maksimal di setiap perjalanan.' },
      { icon: 'Car', label: 'Tampilan Elegan', description: 'Desain eksterior modern dan dinamis untuk setiap perjalanan keluarga.' },
      { icon: 'Users', label: 'Interior Favorit Keluarga', description: 'Kabin luas dan nyaman untuk seluruh anggota keluarga.' },
      { icon: 'Zap', label: 'Inovasi Teknologi', description: 'Teknologi berkendara canggih untuk pengalaman yang lebih percaya diri.' },
    ],
    detailItems: [
      { title: 'Desain Tampilan Depan Terbaru', description: 'Desain depan terbaru yang memberikan aksen tangguh dan sporty dengan kombinasi warna chrome dan hitam.' },
      { title: 'Lampu Depan Bentuk T-Shape', description: 'Bentuk lampu depan T-Shape baru dengan warna smoke chrome untuk visibilitas maksimal.' },
      { title: 'Alloy Wheel 17 Inci Desain Terbaru', description: 'Alloy wheel 17 inci terbaru dengan desain dua warna memberikan sentuhan estetika modern.', note: 'Ultimate & Exceed Tourer' },
      { title: 'Desain Bumper Belakang Terbaru', description: 'Garis dinamis dan aksen reflektor menyatu, desain bumper belakang kini lebih kokoh.' },
      { title: 'LED Fog Light Terbaru', description: 'Didesain untuk kondisi ekstrem, LED fog light memberikan penerangan maksimal.', note: 'Ultimate' },
      { title: 'Lampu Belakang Bentuk T-Shape', description: 'Meningkatkan visibilitas di bagian belakang kendaraan pada saat malam hari.' },
      { title: 'Bagasi Luas', description: 'Bagasi yang lapang, menawarkan kapasitas penyimpanan yang optimal.' },
      { title: 'Pilihan Interior Beragam', description: 'Setiap varian dirancang dengan sentuhan berbeda yang mencerminkan karakter dan kenyamanan.' },
      { title: 'Desain Eksterior Belakang', description: 'Desain bodi mobil bagian belakang yang lebar memberikan sentuhan tampilan kokoh dan stabil.' },
    ],
    features: [
      { icon: 'Shield', title: 'Active Stability Control', description: 'Sistem kontrol stabilitas aktif yang menjaga kendaraan tetap stabil di berbagai kondisi jalan' },
      { icon: 'Eye', title: '360° Camera', description: 'Kamera surround view untuk kemudahan parkir dan manuver di area sempit (Ultimate)' },
      { icon: 'Zap', title: 'MIVEC Engine', description: 'Teknologi mesin Mitsubishi 4A91 yang menghasilkan tenaga optimal dengan konsumsi BBM efisien' },
      { icon: 'Wind', title: 'Dual Zone AC', description: 'Pengaturan suhu kabin terpisah untuk pengemudi dan penumpang depan (Exceed Tourer ke atas)' },
      { icon: 'Key', title: 'Keyless Operation', description: 'Buka pintu dan start engine tanpa kunci, cukup dengan smart key di saku Anda (Ultimate)' },
      { icon: 'Users', title: '7-Seater Flexible', description: 'Kursi baris kedua dan ketiga bisa dilipat untuk kapasitas bagasi maksimal' },
    ],
    specsShort: ['1.5L MIVEC', 'CVT / Manual', '7 Penumpang'],
  },
  {
    slug: 'xpander-cross',
    name: 'Xpander Cross',
    tagline: 'Step Up Your Adventure Level',
    category: 'passenger',
    basePrice: 'Mulai Rp 345 Juta',
    image: '/api/image?url=https%3A%2F%2Fucdtyehtmprstsit.private.blob.vercel-storage.com%2Fmitsubishi%2F1778709818799-passenger_new-xpander-cross_main_3haf1ahqup2jxahic1lny1ya9um0jz1xcfdx4zb4-optimized.webp',
    colors: [
      { name: 'Quartz White Pearl', hex: '#F5F5F0' },
      { name: 'Jet Black Mica', hex: '#1A1A1A' },
      { name: 'Blade Silver Metallic', hex: '#B8B8B8' },
      { name: 'Graphite Grey Metallic', hex: '#7A7A7A' },
      { name: 'Green Bronze Metallic', hex: '#6B7B5E' },
    ],
    variants: [
      { name: 'Cross MT', price: 'Rp 345.000.000', priceNum: 345, transmission: '5-Speed Manual', highlights: ['1.5L MIVEC', 'GC 225mm', 'Overfender', 'Roof Rail'] },
      { name: 'Premium CVT', price: 'Rp 374.000.000', priceNum: 374, transmission: 'CVT', highlights: ['1.5L MIVEC', 'GC 225mm', 'LED Headlamp', '360° Camera'] },
    ],
    specs: [
      { category: 'Mesin', items: [{ label: 'Tipe Mesin', value: '4A91 1.5L DOHC MIVEC 16-Valve' }, { label: 'Kapasitas', value: '1.499 cc' }, { label: 'Tenaga Maks', value: '105 PS / 6.000 rpm' }, { label: 'Torsi Maks', value: '141 Nm / 4.000 rpm' }, { label: 'Bahan Bakar', value: 'Bensin' }] },
      { category: 'Dimensi', items: [{ label: 'Panjang', value: '4.595 mm' }, { label: 'Lebar', value: '1.750 mm' }, { label: 'Tinggi', value: '1.750 mm' }, { label: 'Wheelbase', value: '2.775 mm' }, { label: 'Ground Clearance', value: '225 mm' }] },
      { category: 'Keselamatan', items: [{ label: 'Airbag', value: '2 / 7 (varian)' }, { label: 'Rem ABS+EBD', value: 'Standar' }, { label: 'ASC', value: 'Standar' }, { label: 'Hill Start Assist', value: 'Standar' }] },
    ],
    promoText: 'DP ringan mulai 10%, bunga ringan 0%, dan cashback hingga jutaan rupiah.',
    highlightBadges: [
      { icon: 'Mountain', label: 'Tampilan Gagah', description: 'Hadir dengan tampilan eksterior baru, berikan kesan lebih tangguh.' },
      { icon: 'Users', label: 'Kabin Super Luas', description: 'Dilengkapi fitur canggih pada digital display pengemudi yang lebih lengkap.' },
      { icon: 'Zap', label: 'Mesin Irit & Responsif', description: 'Mesin bertenaga dan efisien untuk perjalanan jauh maupun kota.' },
      { icon: 'Shield', label: 'Tangguh di Berbagai Medan', description: 'Fitur keselamatan canggih untuk pengalaman berkendara aman dan nyaman.' },
    ],
    detailItems: [
      { title: 'Bumper & Grille Depan Baru', description: 'Tampilan depan dengan grille tebal dan garis tegas membuat kendaraan terlihat gagah di segala medan.' },
      { title: 'Alloy Wheel 17 Inci Desain Terbaru', description: 'Alloy wheel berukuran 17 inci dengan desain sporty dan tangguh, memberikan stabilitas dan kenyamanan.' },
      { title: 'Desain Bumper Belakang yang Gagah', description: 'Desain bumper belakang tampil lebih tegas dan elegan, dilengkapi detail aksen yang memperkuat karakter SUV.' },
      { title: 'Lampu Depan Berbentuk T-Shape', description: 'Lampu depan berbentuk T-shape melengkapi kesan gagah dan meningkatkan visibilitas.' },
      { title: 'Lampu Belakang Berbentuk T-Shape', description: 'Meningkatkan visibilitas pada malam hari, memperkuat desain modern.' },
      { title: 'LED Foglamp', description: 'LED Foglamp yang menyediakan visibilitas terbaik dalam kondisi hujan dan berkabut.' },
    ],
    features: [
      { icon: 'Mountain', title: 'Adventure Ready', description: 'Ground clearance 225mm dengan overfender dan roof rail untuk jelajah segala medan' },
      { icon: 'Shield', title: 'Active Stability Control', description: 'Sistem stabilitas aktif untuk kendali optimal di segala kondisi jalan' },
      { icon: 'Zap', title: 'MIVEC Engine', description: 'Mesin bertenaga dan efisien untuk perjalanan jauh maupun kota' },
      { icon: 'Eye', title: 'LED T-Shape Headlamp', description: 'Lampu depan LED signature T-shape untuk visibilitas maksimal di malam hari' },
      { icon: 'Users', title: '7-Seater Flexible', description: 'Kabin luas 7 penumpang dengan kursi yang bisa dilipat' },
      { icon: 'Sun', title: 'Roof Rail Standard', description: 'Roof rail standar untuk membawa barang tambahan saat liburan bersama keluarga' },
    ],
    specsShort: ['1.5L MIVEC', 'CVT / Manual', 'Ground Clearance 225mm'],
  },
  {
    slug: 'pajero-sport',
    name: 'Pajero Sport',
    tagline: 'Jelajahi Petualangan Tanpa Batas',
    category: 'passenger',
    basePrice: 'Mulai Rp 586 Juta',
    image: '/api/image?url=https%3A%2F%2Fucdtyehtmprstsit.private.blob.vercel-storage.com%2Fmitsubishi%2F1778708599624-passenger_new-pajero-sport_main_jqfrr7i2mxmkrdrognu59bbjqwummi133orl4xew-optimized.webp',
    colors: [
      { name: 'Quartz White Pearl', hex: '#F5F5F0' },
      { name: 'Sterling Silver Metallic', hex: '#C0C0C0' },
      { name: 'Jet Black Mica', hex: '#1A1A1A' },
      { name: 'Graphite Grey', hex: '#7A7A7A' },
    ],
    variants: [
      { name: 'GLX 4x4 MT', price: 'Rp 586.000.000', priceNum: 586, transmission: '5-Speed Manual', drivetrain: '4x4 Super Select', highlights: ['2.5L DI-D Turbo', '4WD', '16" Steel Wheel', '2 Airbag'] },
      { name: 'Exceed 4x2 MT', price: 'Rp 612.000.000', priceNum: 612, transmission: '5-Speed Manual', drivetrain: '4x2 RWD', highlights: ['2.5L DI-D Turbo', 'RWD', '18" Alloy', '2DIN Audio'] },
      { name: 'Exceed 4x2 AT', price: 'Rp 645.000.000', priceNum: 645, transmission: '5-Speed Automatic', drivetrain: '4x2 RWD', highlights: ['2.5L DI-D Turbo', '5AT', '18" Alloy', 'Touchscreen'] },
      { name: 'Dakar 4x2 AT', price: 'Rp 686.000.000', priceNum: 686, transmission: '8-Speed AT', drivetrain: '4x2 RWD', highlights: ['2.4L DI-D MIVEC', '8AT', 'LED Headlamp', 'Leather Interior'] },
      { name: 'Dakar Ultimate 4x2 AT', price: 'Rp 738.000.000', priceNum: 738, transmission: '8-Speed AT', drivetrain: '4x2 RWD', highlights: ['2.4L DI-D MIVEC', '8AT', 'FCM + BSW', 'Power Back Door'] },
      { name: 'Dakar Ultimate 4x4 AT', price: 'Rp 805.000.000', priceNum: 805, transmission: '8-Speed AT', drivetrain: '4x4 Super Select-II', highlights: ['2.4L DI-D MIVEC', 'SS4-II', 'Sunroof', 'Multi Around View'] },
    ],
    specs: [
      { category: 'Mesin', items: [{ label: 'Tipe Mesin', value: '4N15 2.4L DI-D MIVEC Turbo Diesel' }, { label: 'Kapasitas', value: '2.442 cc' }, { label: 'Tenaga Maks', value: '181 PS / 3.500 rpm' }, { label: 'Torsi Maks', value: '430 Nm / 2.500 rpm' }, { label: 'Bahan Bakar', value: 'Diesel' }] },
      { category: 'Dimensi', items: [{ label: 'Panjang', value: '4.840 mm' }, { label: 'Lebar', value: '1.835 mm' }, { label: 'Tinggi', value: '1.835 mm' }, { label: 'Wheelbase', value: '2.800 mm' }, { label: 'Ground Clearance', value: '218 mm' }] },
      { category: 'Keselamatan', items: [{ label: 'Airbag', value: '2 / 7 (varian)' }, { label: 'Rem ABS+EBD', value: 'Standar' }, { label: 'ASTC', value: 'Standar' }, { label: 'FCM', value: 'Dakar Ultimate' }, { label: 'BSW + RCTA', value: 'Dakar Ultimate' }] },
      { category: 'Transmisi & Drivetrain', items: [{ label: 'Transmisi', value: '5MT / 5AT / 8AT' }, { label: 'Drivetrain', value: '4x2 / SS4-II' }, { label: 'Off-road Mode', value: 'Gravel/Snow/Mud/Sand' }, { label: 'Rear Diff Lock', value: 'Varian 4x4' }] },
    ],
    promoText: 'DP ringan mulai 15%, bunga ringan 0%, dan cashback hingga jutaan rupiah.',
    highlightBadges: [
      { icon: 'Shield', label: 'Diamond Sense', description: 'Dengan teknologi Diamond Sense, New Pajero Sport hadir melindungi setiap langkah petualangan Anda.' },
      { icon: 'Gauge', label: 'Mesin Tangguh & Bertenaga', description: 'Ditenagai oleh inovasi mesin yang tangguh namun ramah lingkungan.' },
      { icon: 'Mountain', label: 'Performa Mengemudi Gagah', description: 'Dirancang untuk menghadapi tantangan terberat, performa yang kuat dan gagah.' },
      { icon: 'Sun', label: 'Fitur Mewah Kendaraan', description: 'Menggabungkan desain elegan dengan teknologi untuk pengalaman berkendara lebih nyaman.' },
    ],
    detailItems: [
      { title: 'New Front Grille & Under Garnish', description: 'Warna putih pada grille memberikan kesan elegan, menciptakan tampilan yang berkelas dan tangguh.' },
      { title: 'Alloy Wheel Ukuran 18 Inci', description: 'Desain velg dual-tone baru membuat kendaraan Anda tampil lebih modern dan sporty.', note: 'Semua varian Dakar' },
      { title: 'Garnish Belakang Bawah Baru', description: 'Desain modern dan dinamis meningkatkan tampilan eksterior sekaligus memberikan perlindungan tambahan.' },
    ],
    features: [
      { icon: 'Mountain', title: 'Super Select 4WD-II', description: 'Sistem penggerak 4 roda canggih dengan 4 mode berkendara untuk segala medan' },
      { icon: 'Shield', title: '7 Airbag & Diamond Sense', description: 'Sistem keselamatan komprehensif dengan FCM, BSW, RCTA, dan UMS Prevention' },
      { icon: 'Gauge', title: '2.4L DI-D MIVEC Turbo', description: 'Mesin diesel turbo bertenaga 181 PS dan torsi 430 Nm untuk petualangan tanpa batas' },
      { icon: 'Cog', title: '8-Speed AT', description: 'Transmisi otomatis 8 percepatan dengan paddle shift untuk respons berkendara presisi' },
      { icon: 'Eye', title: 'UMS Prevention', description: 'Sistem pencegahan akselerasi tidak disengaja saat parkir untuk keselamatan tambahan' },
      { icon: 'Wind', title: 'Jet Fighter Grille', description: 'Desain grille ikonik terinspirasi jet fighter untuk tampilan gagah dan sporty' },
    ],
    specsShort: ['2.4L DI-D MIVEC', '8-Speed AT', 'Super Select 4WD-II'],
  },
  {
    slug: 'destinator',
    name: 'Destinator',
    tagline: 'Premium Family SUV — Confidence Booster for Energetic Family',
    category: 'passenger',
    basePrice: 'Mulai Rp 397 Juta',
    image: '/api/image?url=https%3A%2F%2Fucdtyehtmprstsit.private.blob.vercel-storage.com%2Fmitsubishi%2F1778708556639-passenger_destinator_main_26my-dst-idn-p1-mc10-front-right-w81.jpg',
    colors: [
      { name: 'Quartz White Pearl', hex: '#F5F5F0' },
      { name: 'Jet Black Mica', hex: '#1A1A1A' },
      { name: 'Blade Silver Metallic', hex: '#B8B8B8' },
      { name: 'Graphite Grey Metallic', hex: '#7A7A7A' },
      { name: 'Red Metallic', hex: '#C41E3A' },
    ],
    variants: [
      { name: 'GLS CVT', price: 'Rp 397.000.000', priceNum: 397, transmission: 'CVT', highlights: ['1.5L MIVEC Turbo', '7 Penumpang', 'LED Headlamp', 'Keyless Entry'] },
      { name: 'Exceed CVT', price: 'Rp 420.000.000', priceNum: 420, transmission: 'CVT', highlights: ['1.5L MIVEC Turbo', '7 Penumpang', 'Dual Zone AC', '12.3" Touchscreen'] },
      { name: 'Ultimate CVT', price: 'Rp 480.000.000', priceNum: 480, transmission: 'CVT', highlights: ['1.5L MIVEC Turbo', '7 Penumpang', 'Diamond Sense ADAS', 'Panoramic Sunroof'] },
      { name: 'Ultimate Premium CVT', price: 'Rp 510.000.000', priceNum: 510, transmission: 'CVT', highlights: ['1.5L MIVEC Turbo', '7 Penumpang', 'Full ADAS', '64-Color Ambient'] },
    ],
    specs: [
      { category: 'Mesin', items: [{ label: 'Tipe Mesin', value: '4B40 1.5L DOHC MIVEC Turbo 16-Valve' }, { label: 'Kapasitas', value: '1.499 cc' }, { label: 'Tenaga Maks', value: '163 PS / 5.000 rpm' }, { label: 'Torsi Maks', value: '250 Nm / 2.500-4.000 rpm' }, { label: 'Bahan Bakar', value: 'Bensin' }] },
      { category: 'Dimensi', items: [{ label: 'Panjang', value: '4.680 mm' }, { label: 'Lebar', value: '1.840 mm' }, { label: 'Tinggi', value: '1.780 mm' }, { label: 'Wheelbase', value: '2.815 mm' }, { label: 'Ground Clearance', value: '244 mm' }] },
      { category: 'Keselamatan', items: [{ label: 'Airbag', value: '2 / 4 (varian)' }, { label: 'Rem ABS+EBD', value: 'Standar' }, { label: 'ASC', value: 'Standar' }, { label: 'FCM', value: 'Ultimate ke atas' }, { label: 'BSW + RCTA', value: 'Ultimate ke atas' }] },
      { category: 'Kenyamanan', items: [{ label: 'AC', value: 'Auto Climate / Dual Zone' }, { label: 'Head Unit', value: '12.3" Touchscreen' }, { label: 'Audio', value: 'Yamaha Premium (Ultimate+)' }, { label: 'Drive Mode', value: 'Normal/Wet/Tarmac/Gravel/Mud' }] },
    ],
    promoText: 'Program Trade-In dan pembiayaan melalui PT. Dipo Star Finance tersedia.',
    highlightBadges: [
      { icon: 'Cog', label: '5 Mode Berkendara', description: '5 mode berkendara yang mendukung performa maksimal untuk berbagai kondisi jalan.' },
      { icon: 'Shield', label: 'Diamond Sense Technology', description: 'Fitur keselamatan terbaik dari Mitsubishi Motors memberikan perlindungan maksimal.' },
      { icon: 'Zap', label: 'Mitsubishi Connect', description: 'Selalu terhubung dengan Mitsubishi Destinator melalui genggaman smartphone.' },
    ],
    detailItems: [
      { title: 'Two-Tone & Black Engine Hood Emblem', description: 'Perpaduan warna two-tone yang ikonik dengan emblem hitam eksklusif memberikan kesan elegan.', note: '55th Anniversary Edition' },
      { title: 'Black Tailgate Pet Name Emblem', description: 'Emblem hitam eksklusif di bagian belakang membuat tampilan mobil lebih gagah.', note: '55th Anniversary Edition' },
      { title: 'Dynamic Shield & Grille Transparan', description: 'Desain dynamic shield khas Mitsubishi Motors dipadukan dengan akrilik transparan pada grille.' },
      { title: 'Lampu Depan Berbentuk T-Shape', description: 'Desain lampu depan berbentuk T mempertegas tampilan elegan kendaraan.' },
      { title: 'Lampu Belakang Berbentuk T-Shape', description: 'Lampu bagian belakang memberi kesan estetika kuat pada mobil.' },
      { title: 'Roof Rail Desain Pillar Iconic', description: 'Melambangkan kekuatan dan ketangguhan, memadukan kesan mewah khas SUV.' },
      { title: 'Tampilan Belakang yang Gagah', description: 'Desain belakang memberikan kesan futuristik dan premium, memperkuat karakter kendaraan.' },
    ],
    features: [
      { icon: 'Zap', title: '1.5L MIVEC Turbo', description: 'Mesin 4B40 turbo bertenaga 163 PS dan torsi 250 Nm — SUV paling bertenaga di kelasnya' },
      { icon: 'Shield', title: 'Diamond Sense ADAS', description: 'Sistem keselamatan canggih: FCM, ACC, BSW, RCTA, AHB, dan Multi Around Monitor (Ultimate+)' },
      { icon: 'Sun', title: 'Panoramic Sunroof', description: 'Atap panoramic sunroof untuk suasana kabin yang lebih terang dan terbuka (Ultimate ke atas)' },
      { icon: 'Music', title: 'Yamaha Premium Audio', description: 'Sistem audio premium 8 speaker Yamaha Dynamic Sound untuk pengalaman berkendara mewah (Ultimate+)' },
      { icon: 'Eye', title: 'Multi Around Monitor', description: 'Kamera 360 derajat untuk kemudahan parkir dan manuver di area sempit (Ultimate ke atas)' },
      { icon: 'Key', title: 'Mitsubishi Connect', description: 'Konektivitas smartphone untuk remote access dan monitoring kendaraan dari jarak jauh' },
    ],
    specsShort: ['1.5L MIVEC Turbo', 'CVT', '7 Penumpang'],
  },
  {
    slug: 'xforce',
    name: 'Xforce',
    tagline: 'Keamanan Dalam Setiap Aksi',
    category: 'passenger',
    basePrice: 'Mulai Rp 390 Juta',
    image: '/api/image?url=https%3A%2F%2Fucdtyehtmprstsit.private.blob.vercel-storage.com%2Fmitsubishi%2F1778709855129-passenger_xforce_main_qsqbufibgo8j8qbulzogzb9lhv7cx2rseg0lh2qu-optimized.webp',
    colors: [
      { name: 'Quartz White Pearl', hex: '#F5F5F0' },
      { name: 'Jet Black Mica', hex: '#1A1A1A' },
      { name: 'Blade Silver Metallic', hex: '#B8B8B8' },
      { name: 'Graphite Grey Metallic', hex: '#7A7A7A' },
      { name: 'Red Metallic', hex: '#C41E3A' },
      { name: 'Energetic Yellow Metallic', hex: '#E8C51A' },
    ],
    variants: [
      { name: 'Exceed CVT', price: 'Rp 390.000.000', priceNum: 390, transmission: 'CVT', highlights: ['1.5L MIVEC', '5 Penumpang', '8" Touchscreen', 'Keyless Entry'] },
      { name: 'Ultimate CVT', price: 'Rp 423.500.000', priceNum: 423, transmission: 'CVT', highlights: ['1.5L MIVEC', '5 Penumpang', '12.3" Touchscreen', 'Yamaha Audio', 'BSW+RCTA'] },
      { name: 'Ultimate DS CVT', price: 'Rp 432.000.000', priceNum: 432, transmission: 'CVT', highlights: ['1.5L MIVEC', '5 Penumpang', 'Diamond Sense', 'FCM', 'ACC'] },
      { name: '55th Anniversary Edition', price: 'Rp 434.000.000', priceNum: 434, transmission: 'CVT', highlights: ['1.5L MIVEC', '5 Penumpang', 'Special Edition', 'Diamond Sense'] },
    ],
    specs: [
      { category: 'Mesin', items: [{ label: 'Tipe Mesin', value: '4A91 1.5L DOHC MIVEC 16-Valve' }, { label: 'Kapasitas', value: '1.499 cc' }, { label: 'Tenaga Maks', value: '104 PS / 6.000 rpm' }, { label: 'Torsi Maks', value: '141 Nm / 4.000 rpm' }, { label: 'Bahan Bakar', value: 'Bensin' }] },
      { category: 'Dimensi', items: [{ label: 'Panjang', value: '4.390 mm' }, { label: 'Lebar', value: '1.810 mm' }, { label: 'Tinggi', value: '1.660 mm' }, { label: 'Wheelbase', value: '2.650 mm' }, { label: 'Ground Clearance', value: '222 mm' }] },
      { category: 'Keselamatan', items: [{ label: 'Airbag', value: '4 / 7 (varian)' }, { label: 'Rem ABS+EBD', value: 'Standar' }, { label: 'ASC', value: 'Standar' }, { label: 'FCM', value: 'Ultimate DS' }, { label: 'BSW + RCTA', value: 'Ultimate ke atas' }] },
      { category: 'Kenyamanan', items: [{ label: 'AC', value: 'Auto Climate / Dual Zone' }, { label: 'Head Unit', value: '8" / 12.3" Touchscreen' }, { label: 'Audio', value: '6SP / Yamaha 8SP' }, { label: 'Drive Mode', value: 'Normal/Wet/Gravel/Mud' }] },
    ],
    promoText: 'DP ringan mulai 10%, bunga ringan 0%, dan cashback hingga jutaan rupiah.',
    highlightBadges: [
      { icon: 'Shield', label: 'Teknologi Diamond Sense', description: 'Mitsubishi Xforce dengan Diamond Sense menghadirkan fitur keselamatan canggih.' },
      { icon: 'Cog', label: '4 Mode Berkendara', description: 'Apapun tantangannya, Xforce siap memberikan performa terbaik dengan kenyamanan dan kontrol penuh.' },
      { icon: 'Car', label: 'Desain Sporty & Elegan', description: 'Kesan stylish membuat setiap pengendara tampil lebih percaya diri di jalan.' },
      { icon: 'Users', label: 'Spacious & Comfort', description: 'Ciptakan momen seru dengan kabin lebih lega di kelasnya.' },
    ],
    detailItems: [
      { title: 'Black Engine Hood Emblem', description: 'Perpaduan warna two-tone yang ikonik dengan emblem hitam eksklusif.', note: '55th Anniversary Edition' },
      { title: 'Desain Two-Tone yang Elegan', description: 'Atap hitam yang kontras dengan bodi berwarna, memberikan kesan sporty dan elegan.', note: 'Ultimate with Diamond Sense' },
      { title: 'Roof Rail Baru', description: 'Dilengkapi roof rail baru dengan desain dinamis yang memperkuat tampilan sporty.', note: 'Ultimate with Diamond Sense' },
      { title: 'Generasi Terbaru Dynamic Shield', description: 'Desain ikonik Mitsubishi Motors kini tampil lebih modern, menegaskan kesan kokoh dan performa tinggi.' },
      { title: 'Lampu Depan T-Shape yang Ikonik', description: 'T-shape LED headlight membantu jarak pandang yang lebih luas di malam hari.' },
      { title: 'All LED Rear Combination Light', description: 'Menarik secara visual dan mudah terlihat oleh pengendara lain dan pejalan kaki.' },
      { title: 'Desain Roda yang Khas', description: 'Ban besar 225/50R18 membuat Anda semakin percaya diri melintasi segala medan.' },
      { title: 'Hands-Free Power Liftgate', description: 'Memudahkan membuka bagasi dengan Kick Sensor atau Kunci Remote.' },
      { title: 'Garnish Belakang Bawah Baru', description: 'Desain modern dan dinamis menegaskan karakter tangguh dan mewah.' },
      { title: 'Spoiler Baru', description: 'Tampil lebih agresif dan stylish dengan spoiler baru yang elegan.', note: 'Ultimate with Diamond Sense' },
      { title: 'Desain Futuristik', description: 'Menggabungkan kesan canggih dan kokoh khas SUV lewat lekukan bodi yang tegas.' },
    ],
    features: [
      { icon: 'Music', title: 'Yamaha Premium Audio', description: 'Sistem audio premium 8 speaker Yamaha dengan 4 preset EQ untuk pengalaman suara terbaik (Ultimate)' },
      { icon: 'Shield', title: 'Diamond Sense ADAS', description: 'Forward Collision Mitigation, Adaptive Cruise Control, BSW, RCTA, Auto High Beam (Ultimate DS)' },
      { icon: 'Zap', title: 'MIVEC Efficient', description: 'Mesin 4A91 bertenaga namun hemat bahan bakar untuk perjalanan urban sehari-hari' },
      { icon: 'Wind', title: 'Nanoe-X Air Purifier', description: 'Sistem purifikasi udara Panasonic Nanoe-X untuk kabin yang bersih dan segar (Ultimate ke atas)' },
    ],
    specsShort: ['1.5L MIVEC', 'CVT', '5 Penumpang'],
  },
  {
    slug: 'l100-ev',
    name: 'L100 EV',
    tagline: 'Solusi Efisiensi Bisnis Anda',
    category: 'passenger',
    basePrice: 'Mulai Rp 323 Juta',
    image: '/images/l300-van.png',
    payload: '425 Kg',
    colors: [
      { name: 'White Solid', hex: '#F5F5F0' },
    ],
    variants: [
      { name: 'Two-Seaters Blind Van', price: 'Rp 323.300.000', priceNum: 323, transmission: 'Automatic (Single-Speed)', highlights: ['Electric Motor 41 HP', '195 Nm Instan', '180 km Range', 'DC Fast Charging 42 min'] },
    ],
    specs: [
      { category: 'Motor Listrik', items: [{ label: 'Tipe Motor', value: 'Electric Motor (Single-Speed Reduction)' }, { label: 'Tenaga Maks', value: '41 HP' }, { label: 'Torsi Maks', value: '195 Nm (instan)' }, { label: 'Baterai', value: 'Lithium-ion 20.1 kWh' }, { label: 'Jangkauan (WLTC)', value: '180 km' }] },
      { category: 'Pengisian', items: [{ label: 'AC Charging (0-100%)', value: '~7.5 jam (AC 200V, 15A)' }, { label: 'DC Fast Charging (0-80%)', value: '~42 menit' }, { label: 'Emisi', value: '0 g/km (Zero Emission)' }, { label: 'Garansi Baterai', value: '8 tahun / 160.000 km' }, { label: 'Garansi Kendaraan', value: '5 tahun / 100.000 km' }] },
      { category: 'Dimensi', items: [{ label: 'Panjang', value: '3.395 mm' }, { label: 'Lebar', value: '1.475 mm' }, { label: 'Tinggi', value: '1.915 mm' }, { label: 'Wheelbase', value: '2.390 mm' }, { label: 'Ground Clearance', value: '165 mm' }] },
      { category: 'Muatan', items: [{ label: 'Payload', value: '425 Kg' }, { label: 'Area Kargo', value: '1.830 x 1.370 x 1.230 mm' }, { label: 'Berat Kosong', value: '1.125 Kg' }, { label: 'Kursi', value: '2 Penumpang' }, { label: 'Radius Putar', value: '4.3 m' }] },
    ],
    promoText: 'Kendaraan listrik tanpa emisi, bebas ganjil genap Jakarta.',
    highlightBadges: [
      { icon: 'Zap', label: 'Zero Emission', description: 'Kendaraan listrik tanpa emisi untuk logistik kota yang ramah lingkungan.' },
      { icon: 'Gauge', label: '180 km Range', description: 'Jangkauan 180 km per pengisian penuh untuk rute distribusi harian.' },
      { icon: 'DollarSign', label: 'Biaya Operasional Rendah', description: 'Tanpa bahan bakar, tanpa oli mesin, perawatan minimal.' },
    ],
    detailItems: [
      { title: 'Desain Kompak & Modern', description: 'Bodi kompak untuk mobilitas lincah di jalanan perkotaan yang sempit.' },
      { title: 'DC Fast Charging', description: 'Pengisian cepat 0-80% hanya 42 menit untuk minimalkan downtime.' },
      { title: 'Area Kargo Luas', description: 'Area kargo 1.830 x 1.370 x 1.230 mm untuk kebutuhan distribusi harian.' },
    ],
    features: [
      { icon: 'Zap', title: 'Zero Emission', description: 'Kendaraan listrik tanpa emisi — bebas ganjil genap Jakarta dan ramah lingkungan untuk logistik kota' },
      { icon: 'Gauge', title: '180 km Range', description: 'Jangkauan 180 km per pengisian penuh, cukup untuk rute distribusi harian di perkotaan' },
      { icon: 'Zap', title: 'DC Fast Charging', description: 'Pengisian cepat 0-80% hanya 42 menit untuk minimalkan downtime operasional' },
      { icon: 'DollarSign', title: 'Biaya Operasional Rendah', description: 'Tanpa bahan bakar, tanpa oli mesin, perawatan minimal — penghematan besar jangka panjang' },
    ],
    specsShort: ['Electric Motor', '180 km Range', '425 Kg Payload'],
  },
  {
    slug: 'l300',
    name: 'L300',
    tagline: 'Tangguh di Tanjakan, Hebat di Segala Medan',
    category: 'passenger',
    basePrice: 'Mulai Rp 240 Juta',
    image: '/images/l300.png',
    payload: '1.015 Kg',
    colors: [
      { name: 'Hitam', hex: '#1A1A1A' },
    ],
    variants: [
      { name: 'Pick-Up Flat Deck', price: 'Rp 243.000.000', priceNum: 243, transmission: '5-Speed Manual', highlights: ['2.2L DOHC Turbo Diesel', '1.015 Kg Payload', 'Flat Deck', 'Euro 4'] },
      { name: 'Cab Chassis', price: 'Rp 240.500.000', priceNum: 240, transmission: '5-Speed Manual', highlights: ['2.2L DOHC Turbo Diesel', 'Cab Chassis', 'Custom Body Ready', 'Euro 4'] },
    ],
    specs: [
      { category: 'Mesin', items: [{ label: 'Tipe Mesin', value: '4N14 2.2L DOHC 4-Cyl Turbo Diesel' }, { label: 'Kapasitas', value: '2.268 cc' }, { label: 'Tenaga Maks', value: '98 PS / 3.500 rpm' }, { label: 'Torsi Maks', value: '200 Nm / 1.500-2.500 rpm' }, { label: 'Bahan Bakar', value: 'Diesel Euro 4' }] },
      { category: 'Dimensi', items: [{ label: 'Panjang', value: '4.315 mm (Flat Deck) / 4.165 mm (CC)' }, { label: 'Lebar', value: '1.695 mm' }, { label: 'Tinggi', value: '1.845 mm' }, { label: 'Wheelbase', value: '2.435 mm (FD) / 2.200 mm (CC)' }, { label: 'Ground Clearance', value: '200 mm' }] },
      { category: 'Suspensi & Rem', items: [{ label: 'Depan', value: 'Double Wishbone + Coil Spring' }, { label: 'Belakang', value: 'Semi Elliptic Leaf Spring' }, { label: 'Rem Depan', value: 'Disc' }, { label: 'Rem Belakang', value: 'Drum' }, { label: 'Tangki BBM', value: '47 L' }] },
    ],
    promoText: 'DP ringan mulai 10%, bunga ringan 0%, dan program pilihan cashback.',
    highlightBadges: [
      { icon: 'Mountain', label: 'Tangguh di Tanjakan', description: 'Menggunakan mesin yang terbukti memiliki tenaga terbesar di kelasnya.' },
      { icon: 'Shield', label: 'Hebat di Segala Medan', description: 'Tangguh menghadapi segala jenis medan hingga cocok untuk berbagai kebutuhan.' },
      { icon: 'DollarSign', label: 'Hemat Biaya Perawatan', description: 'Kendaraan tangguh dengan perawatan mudah dan efisien.' },
      { icon: 'Wrench', label: 'Suku Cadang Mudah Dicari', description: 'Jaringan suku cadang dan bengkel yang luas, tersedia di seluruh Indonesia.' },
    ],
    detailItems: [
      { title: 'Desain Grille Baru', description: 'Dengan aksen chrome, desain grille terbaru mempertegas karakter kendaraan menjadi tangguh dan kokoh.' },
      { title: 'Desain Bumper Baru', description: 'Bumper kendaraan terbaru dengan desain hitam memberikan tampilan maskulin dan berani.' },
    ],
    features: [
      { icon: 'Truck', title: 'Payload 1.015 Kg', description: 'Kapasitas muat terbesar di kelasnya untuk kebutuhan distribusi UMKM sehari-hari' },
      { icon: 'Wrench', title: 'Euro 4 Compliant', description: 'Mesin 4N14 sudah memenuhi standar emisi Euro 4, legal beroperasi di seluruh Indonesia' },
      { icon: 'DollarSign', title: 'Biaya Perawatan Rendah', description: 'Suku cadang mudah dicari dan harga terjangkau, biaya operasional paling hemat di kelasnya' },
      { icon: 'Users', title: 'Power Steering', description: 'Kemudi ringan power steering untuk kenyamanan berkendara seharian di segala medan' },
    ],
    specsShort: ['2.2L DOHC Turbo Diesel', 'Manual', 'Euro 4'],
  },
  {
    slug: 'triton',
    name: 'Triton',
    tagline: 'Engineered Beyond Tough',
    category: 'passenger',
    basePrice: 'Mulai Rp 325 Juta',
    image: '/images/l200.png',
    colors: [
      { name: 'White Diamond', hex: '#F5F5F0' },
      { name: 'Jet Black Mica', hex: '#1A1A1A' },
      { name: 'Graphite Grey Metallic', hex: '#7A7A7A' },
      { name: 'Blade Silver Metallic', hex: '#B8B8B8' },
    ],
    variants: [
      { name: 'GLX MT Single Cab 2WD', price: 'Rp 325.000.000', priceNum: 325, transmission: '5-Speed Manual', drivetrain: '4x2 RWD', highlights: ['2.4L DI-D Turbo', 'Single Cab', '2WD', 'Steel Wheel'] },
      { name: 'HDX MT Single Cab 4WD', price: 'Rp 398.000.000', priceNum: 398, transmission: '5-Speed Manual', drivetrain: '4x4 Super Select', highlights: ['2.4L DI-D Turbo', 'Single Cab', '4WD', 'Steel Wheel'] },
      { name: 'HDX MT Double Cab 4WD', price: 'Rp 454.000.000', priceNum: 454, transmission: '5-Speed Manual', drivetrain: '4x4 Super Select', highlights: ['2.4L DI-D Turbo', 'Double Cab', '4WD', 'AC'] },
      { name: 'GLS MT Double Cab 4WD', price: 'Rp 498.000.000', priceNum: 498, transmission: '5-Speed Manual', drivetrain: '4x4 Super Select', highlights: ['2.4L DI-D Turbo', 'Double Cab', 'SS4', 'Touchscreen'] },
      { name: 'Exceed MT Double Cab 4WD', price: 'Rp 564.000.000', priceNum: 564, transmission: '5-Speed Manual', drivetrain: '4x4 Super Select', highlights: ['2.4L DI-D Turbo', 'Double Cab', 'LED Foglamp', 'Off-road Mode'] },
      { name: 'Ultimate AT Double Cab 4WD', price: 'Rp 658.000.000', priceNum: 658, transmission: '6-Speed AT', drivetrain: '4x4 Super Select', highlights: ['2.4L DI-D MIVEC', '181 PS', 'Jet Fighter Grille', '7 Airbag'] },
    ],
    specs: [
      { category: 'Mesin', items: [{ label: 'Tipe Mesin', value: '4N16 2.4L MIVEC Turbo Diesel VGT' }, { label: 'Kapasitas', value: '2.442 cc' }, { label: 'Tenaga Maks', value: '181 PS / 3.500 rpm (Ultimate)' }, { label: 'Torsi Maks', value: '430 Nm / 1.500-2.500 rpm' }, { label: 'Bahan Bakar', value: 'Diesel Euro 4' }] },
      { category: 'Dimensi', items: [{ label: 'Panjang', value: '5.265 mm (DC) / 5.305 mm (SC)' }, { label: 'Lebar', value: '1.865 mm' }, { label: 'Tinggi', value: '1.795 mm (DC) / 1.780 mm (SC)' }, { label: 'Wheelbase', value: '3.130 mm' }, { label: 'Ground Clearance', value: '203 mm' }] },
      { category: 'Keselamatan', items: [{ label: 'Airbag', value: '2 / 7 (varian)' }, { label: 'Rem ABS+EBD', value: 'Standar' }, { label: 'HSA', value: 'Standar' }, { label: 'FCM', value: 'Ultimate' }, { label: 'TSA', value: 'Varian 4x4' }] },
    ],
    promoText: 'DP ringan mulai 15%, bunga ringan 0%, dan cashback hingga jutaan rupiah.',
    highlightBadges: [
      { icon: 'Mountain', label: 'Super Select 4WD', description: 'Sistem penggerak 4 roda canggih dengan Off-road Mode dan Hill Descent Control.' },
      { icon: 'Gauge', label: '2.4L MIVEC Turbo Diesel', description: 'Mesin 4N16 diesel turbo bertenaga 181 PS dan torsi 430 Nm.' },
      { icon: 'Shield', label: 'Diamond Sense Safety', description: 'FCM, 7 Airbag, dan BSW untuk perlindungan menyeluruh.' },
      { icon: 'Truck', label: 'Spacious Cargo Bed', description: 'Bak muat luas dengan rangka ladder frame yang kokoh dan tangguh.' },
    ],
    detailItems: [
      { title: 'Jet Fighter Grille', description: 'Desain grille ikonik terinspirasi jet fighter untuk tampilan gagah dan sporty.' },
      { title: 'Double Cab Spacious', description: 'Kabin double cab yang luas untuk kenyamanan pengemudi dan penumpang.' },
      { title: 'Off-road Mode', description: 'Gravel/Snow/Mud/Sand mode untuk segala kondisi medan.' },
      { title: 'Hill Descent Control', description: 'Kontrol turun bukit otomatis untuk keselamatan di medan menurun.' },
    ],
    features: [
      { icon: 'Mountain', title: 'Super Select 4WD', description: 'Sistem penggerak 4 roda canggih dengan Off-road Mode dan Hill Descent Control' },
      { icon: 'Gauge', title: '2.4L MIVEC Turbo Diesel', description: 'Mesin 4N16 diesel turbo bertenaga 181 PS dan torsi 430 Nm untuk beban berat' },
      { icon: 'Shield', title: 'Diamond Sense Safety', description: 'FCM, 7 Airbag, dan BSW untuk perlindungan menyeluruh pengemudi dan penumpang (Ultimate)' },
      { icon: 'Truck', title: 'Spacious Cargo Bed', description: 'Bak muat luas dengan rangka ladder frame yang kokoh dan tangguh untuk segala kebutuhan' },
    ],
    specsShort: ['2.4L MIVEC Turbo', 'Manual / 6AT', 'Super Select 4WD'],
  },
];

// ===================== KENDARAAN NIAGA RINGAN (0 models) =====================
// Note: Triton, L300 & L100 EV moved to Passenger section per user request
// Niaga Ringan section is now empty — all vehicles are in Passenger

export const niagaRinganVehicles: VehicleData[] = [];

// ===================== FUSO COMMERCIAL VEHICLES (6 models) =====================
// Source: ktbfuso.co.id — eCanter, Canter, Fighter X, Heavy Duty

export const commercialVehicles: VehicleData[] = [
  {
    slug: 'ecanter',
    name: 'FUSO eCanter',
    tagline: 'Solusi Bisnis Dengan Transportasi Ramah Lingkungan',
    category: 'commercial',
    basePrice: 'Hubungi Dealer',
    image: '/images/l300.png',
    payload: '3.0 Ton',
    colors: [
      { name: 'Putih', hex: '#F5F5F0' },
    ],
    variants: [
      { name: 'eCanter Standard', price: 'Hubungi Dealer', priceNum: 0, transmission: 'Single-Speed Reduction', highlights: ['Electric Motor', 'Zero Emission', 'Light Duty', 'GVW 7.500 Kg'] },
    ],
    specs: [
      { category: 'Motor Listrik', items: [{ label: 'Tipe Motor', value: 'Electric Motor (Single-Speed Reduction)' }, { label: 'Tenaga Maks', value: '150 kW (204 PS)' }, { label: 'Torsi Maks', value: '380 Nm (instan)' }, { label: 'Baterai', value: 'Lithium-ion' }, { label: 'Jangkauan', value: '100 km (est.)' }] },
      { category: 'Dimensi', items: [{ label: 'GVW', value: '7.500 Kg' }, { label: 'Kategori', value: 'Light Duty Truck' }, { label: 'Emisi', value: '0 g/km (Zero Emission)' }, { label: 'Charging', value: 'DC Fast Charging' }, { label: 'Garansi', value: '5 tahun' }] },
    ],
    promoText: 'Kendaraan listrik tanpa emisi untuk distribusi perkotaan.',
    features: [
      { icon: 'Zap', title: 'Zero Emission', description: 'Truk listrik tanpa emisi — solusi ramah lingkungan untuk distribusi perkotaan' },
      { icon: 'Gauge', title: 'Electric Motor 150 kW', description: 'Motor listrik bertenaga dengan torsi instan 380 Nm untuk akselerasi responsif' },
      { icon: 'DollarSign', title: 'Biaya Operasional Rendah', description: 'Tanpa bahan bakar diesel, biaya operasional jauh lebih rendah dari truk konvensional' },
      { icon: 'Shield', title: 'Telematics Ready', description: 'Terintegrasi dengan MyFUSO Telematics untuk monitoring armada real-time' },
    ],
    specsShort: ['Electric Motor', 'Zero Emission', 'Light Duty'],
  },
  {
    slug: 'canter-fe-71',
    name: 'Canter FE 71',
    tagline: 'Light Duty Truck Andalan UMKM — 110 PS',
    category: 'commercial',
    basePrice: 'Mulai Rp 468 Juta',
    image: '/api/image?url=https%3A%2F%2Fucdtyehtmprstsit.private.blob.vercel-storage.com%2Fmitsubishi%2F1778708367639-commercial_canter-fe-71_main_fe-71-a.webp',
    payload: '3.4 Ton',
    colors: [
      { name: 'Putih', hex: '#F5F5F0' },
    ],
    variants: [
      { name: 'FE 71 Standard', price: 'Rp 468.000.000', priceNum: 468, transmission: '5-Speed Manual', highlights: ['3.9L Turbo Intercooler', '110 PS', 'Engkel 4-Wheeler', 'GVW 3.500 Kg'] },
      { name: 'FE 71 PS', price: 'Rp 488.000.000', priceNum: 488, transmission: '5-Speed Manual', highlights: ['3.9L Turbo Intercooler', '110 PS', 'Engkel Medium WB', 'GVW 3.500 Kg'] },
      { name: 'FE 71 Long', price: 'Rp 508.000.000', priceNum: 508, transmission: '5-Speed Manual', highlights: ['3.9L Turbo Intercooler', '110 PS', 'Engkel Long WB', 'GVW 3.500 Kg'] },
    ],
    specs: [
      { category: 'Mesin', items: [{ label: 'Tipe Mesin', value: '4D34-2AT5 Turbo Intercooler Diesel' }, { label: 'Kapasitas', value: '3.908 cc' }, { label: 'Tenaga Maks', value: '110 PS / 2.900 rpm' }, { label: 'Torsi Maks', value: '275 Nm / 1.600 rpm' }, { label: 'Bahan Bakar', value: 'Diesel Euro 2' }] },
      { category: 'Dimensi', items: [{ label: 'Panjang Chassis', value: '4.735 mm' }, { label: 'Lebar Chassis', value: '1.750 mm' }, { label: 'Tinggi Chassis', value: '2.055 mm' }, { label: 'Lebar Kabin', value: '1.695 mm' }, { label: 'Tangki BBM', value: '70 L' }] },
      { category: 'Suspensi & Rem', items: [{ label: 'Suspensi Depan', value: 'Semi Elliptic Leaf Spring' }, { label: 'Suspensi Belakang', value: 'Semi Elliptic Leaf Spring' }, { label: 'Rem', value: 'Hydraulic Dual Circuit' }, { label: 'Kemudi', value: 'Recirculating Ball' }, { label: 'GVW', value: '3.500 Kg' }] },
    ],
    promoText: 'DP ringan dan program pembiayaan menarik tersedia.',
    features: [
      { icon: 'Truck', title: 'Payload 3.4 Ton', description: 'Kapasitas muat ideal untuk distribusi menengah dan kebutuhan logistik UMKM' },
      { icon: 'Shield', title: 'Tilting Cabin', description: 'Kabin bisa dimiringkan untuk akses mesin yang mudah saat perawatan berkala' },
      { icon: 'Zap', title: '3.9L Turbo Intercooler', description: 'Mesin 4D34-2AT5 bertenaga 110 PS yang tangguh dan efisien untuk operasional harian' },
      { icon: 'Users', title: 'Narrow Cab Agil', description: 'Kabin 1.695 mm lebar untuk mobilitas lincah di jalanan perkotaan yang sempit' },
    ],
    specsShort: ['3.9L Turbo Intercooler', '110 PS', 'Engkel 4-Wheeler'],
  },
  {
    slug: 'canter-fe-74',
    name: 'Canter FE 74',
    tagline: 'Medium Duty Truck untuk Bisnis Berkembang — 125 PS',
    category: 'commercial',
    basePrice: 'Mulai Rp 532 Juta',
    image: '/api/image?url=https%3A%2F%2Fucdtyehtmprstsit.private.blob.vercel-storage.com%2Fmitsubishi%2F1778708377768-commercial_canter-fe-74_main_CANTER-FE-74.webp',
    payload: '5.2 Ton',
    colors: [
      { name: 'Putih', hex: '#F5F5F0' },
    ],
    variants: [
      { name: 'FE 74 Standard', price: 'Rp 532.000.000', priceNum: 532, transmission: '5-Speed Manual', highlights: ['3.9L Turbo Intercooler', '125 PS', '6-Wheeler', 'GVW 6.000 Kg'] },
      { name: 'FE 74 HD', price: 'Rp 558.000.000', priceNum: 558, transmission: '5-Speed Manual', highlights: ['3.9L Turbo Intercooler', '125 PS', '6-Wheeler HD', 'GVW 6.500 Kg'] },
      { name: 'FE 74L Long', price: 'Rp 572.000.000', priceNum: 572, transmission: '5-Speed Manual', highlights: ['3.9L Turbo Intercooler', '125 PS', '6-Wheeler Long', 'GVW 6.000 Kg'] },
    ],
    specs: [
      { category: 'Mesin', items: [{ label: 'Tipe Mesin', value: '4D34-2AT8 Turbo Intercooler Diesel' }, { label: 'Kapasitas', value: '3.908 cc' }, { label: 'Tenaga Maks', value: '125 PS / 2.900 rpm' }, { label: 'Torsi Maks', value: '324 Nm / 1.600 rpm' }, { label: 'Bahan Bakar', value: 'Diesel Euro 2' }] },
      { category: 'Dimensi', items: [{ label: 'GVW', value: '6.000 - 6.500 Kg' }, { label: 'Tangki BBM', value: '100 L' }, { label: 'Konfigurasi', value: '6-Wheeler (Roda Ganda Belakang)' }, { label: 'Transmisi', value: '5-Speed Manual' }, { label: 'Kabin', value: 'Tilting Cabin' }] },
    ],
    promoText: 'DP ringan dan program pembiayaan menarik tersedia.',
    features: [
      { icon: 'Truck', title: 'Payload hingga 5.8 Ton', description: 'Kapasitas muat lebih besar untuk bisnis distribusi yang sedang berkembang' },
      { icon: 'Users', title: 'Crew Cab', description: 'Kabin untuk 3 orang termasuk pengemudi, cocok untuk tim distribusi' },
      { icon: 'Shield', title: 'Euro 2 Compliant', description: 'Mesin ramah lingkungan dengan standar emisi Euro 2 untuk operasi di perkotaan' },
      { icon: 'Wrench', title: 'Easy Maintenance', description: 'Tilting cabin dan inspection lid untuk perawatan mudah dan uptime maksimal' },
    ],
    specsShort: ['3.9L Turbo Intercooler', '125 PS', '6-Wheeler'],
  },
  {
    slug: 'canter-fe-84g',
    name: 'Canter FE 84G',
    tagline: 'Medium Duty Truck Kapasitas Besar — 136 PS',
    category: 'commercial',
    basePrice: 'Mulai Rp 558 Juta',
    image: '/api/image?url=https%3A%2F%2Fucdtyehtmprstsit.private.blob.vercel-storage.com%2Fmitsubishi%2F1778708386401-commercial_canter-fe-84g_main_CANTER-FE-84G-1.webp',
    payload: '6.2 Ton',
    colors: [
      { name: 'Putih', hex: '#F5F5F0' },
    ],
    variants: [
      { name: 'FE 84G', price: 'Rp 558.000.000', priceNum: 558, transmission: '5-Speed Manual', highlights: ['3.9L Turbo Intercooler', '136 PS', '6-Wheeler', 'GVW 8.500 Kg'] },
      { name: 'FE 84 SHDX', price: 'Rp 598.000.000', priceNum: 598, transmission: '6-Speed Manual', highlights: ['3.9L Turbo Intercooler', '136 PS', '6-Wheeler Super HD', 'GVW 8.500 Kg'] },
      { name: 'FE 84GS', price: 'Rp 612.000.000', priceNum: 612, transmission: '6-Speed Manual', highlights: ['3.9L Turbo Intercooler', '136 PS', '6-Wheeler Special', 'Power Steering'] },
    ],
    specs: [
      { category: 'Mesin', items: [{ label: 'Tipe Mesin', value: '4D34-2AT7 Turbo Intercooler Diesel' }, { label: 'Kapasitas', value: '3.908 cc' }, { label: 'Tenaga Maks', value: '136 PS / 2.500 rpm' }, { label: 'Torsi Maks', value: '373 Nm / 1.600 rpm' }, { label: 'Bahan Bakar', value: 'Diesel Euro 2 / Euro 4' }] },
      { category: 'Dimensi', items: [{ label: 'GVW', value: '8.500 Kg' }, { label: 'Tangki BBM', value: '100 L' }, { label: 'Transmisi', value: '5-Speed / 6-Speed Manual' }, { label: 'Kabin', value: 'Tilting Cabin' }, { label: 'Kemudi', value: 'Power Steering (SHDX/GS)' }] },
    ],
    promoText: 'DP ringan dan program pembiayaan menarik tersedia.',
    features: [
      { icon: 'Truck', title: 'Payload hingga 6.2 Ton', description: 'Kapasitas muat besar untuk distribusi skala menengah hingga berat' },
      { icon: 'Gauge', title: '3.9L 136 PS', description: 'Mesin 4D34-2AT7 bertenaga 136 PS dan torsi 373 Nm untuk beban berat' },
      { icon: 'Cog', title: '6-Speed Option', description: 'Pilihan transmisi 6 percepatan untuk distribusi daya yang optimal di segala kondisi (SHDX/GS)' },
      { icon: 'Shield', title: 'B30 Compatible', description: 'Kompatibel dengan Bio Solar B30 untuk biaya operasional lebih hemat (136 PS models)' },
    ],
    specsShort: ['3.9L Turbo Intercooler', '136 PS', '6-Wheeler'],
  },
  {
    slug: 'fighter-x-fm65',
    name: 'FUSO Fighter X',
    tagline: 'Andalan Bisnis Sejati',
    category: 'commercial',
    basePrice: 'Mulai Rp 970 Juta',
    image: '/api/image?url=https%3A%2F%2Fucdtyehtmprstsit.private.blob.vercel-storage.com%2Fmitsubishi%2F1778708418762-commercial_fighter-x-fm65-th_main_th-home-img.webp',
    payload: '8 - 16 Ton',
    colors: [
      { name: 'Putih', hex: '#F5F5F0' },
    ],
    variants: [
      { name: 'FM65FS Hi-Gear 4x2', price: 'Rp 970.000.000', priceNum: 970, transmission: 'Eaton 9-Speed', highlights: ['7.5L 6M60 VGT', '240 PS', '4x2', 'Medium WB'] },
      { name: 'FM65FM Hi-Gear 4x2', price: 'Rp 1.050.000.000', priceNum: 1050, transmission: 'Eaton 9-Speed', highlights: ['7.5L 6M60 VGT', '240 PS', '4x2', 'Long WB'] },
      { name: 'FN61F HD 6x2', price: 'Rp 1.180.000.000', priceNum: 1180, transmission: 'Eaton 9-Speed', highlights: ['7.5L 6M60 VGT', '270 PS', '6x2', 'Heavy Duty'] },
      { name: 'FN62F HD 6x4', price: 'Rp 1.280.000.000', priceNum: 1280, transmission: 'Eaton 9-Speed', highlights: ['7.5L 6M60 VGT', '270 PS', '6x4', 'Heavy Duty'] },
    ],
    specs: [
      { category: 'Mesin', items: [{ label: 'Tipe Mesin', value: '6M60 7.5L 6-Cyl Turbo Diesel VGT Euro 4' }, { label: 'Kapasitas', value: '7.545 cc' }, { label: 'Tenaga Maks', value: '240 PS (4x2) / 270 PS (6x2/6x4)' }, { label: 'Torsi Maks', value: '785 Nm (4x2) / 880 Nm (6x2/6x4)' }, { label: 'Bahan Bakar', value: 'Diesel Euro 4' }] },
      { category: 'Dimensi', items: [{ label: 'GVW', value: '13.000 - 24.000 Kg' }, { label: 'Wheelbase', value: '3.680 - 5.680 mm' }, { label: 'Transmisi', value: 'Eaton 9-Speed' }, { label: 'Kabin', value: 'Tilting Cabin' }, { label: 'Rem', value: 'Full Air Brake + ABS' }] },
    ],
    promoText: 'Program pembiayaan fleet tersedia untuk bisnis Anda.',
    features: [
      { icon: 'Truck', title: 'Payload hingga 16 Ton', description: 'Kapasitas muat besar untuk operasi logistik dan konstruksi skala besar' },
      { icon: 'Gauge', title: '7.5L VGT Euro 4', description: 'Mesin 6M60 dengan Variable Geometry Turbo, bertenaga 270 PS dan torsi 880 Nm' },
      { icon: 'Wrench', title: 'Tilting Cabin', description: 'Kabin bisa dimiringkan untuk akses mesin yang mudah saat perawatan' },
      { icon: 'Shield', title: 'Full Air Brake + ABS', description: 'Sistem rem udara dengan ABS untuk pengereman yang kuat dan aman dengan beban penuh' },
    ],
    specsShort: ['7.5L 6M60 VGT', 'Eaton 9-Speed', 'Euro 4'],
  },
  {
    slug: 'fz-heavy-duty',
    name: 'FUSO Heavy Duty',
    tagline: 'Truk Terbaik di Indonesia',
    category: 'commercial',
    basePrice: 'Mulai Rp 1.350 Juta',
    image: '/api/image?url=https%3A%2F%2Fucdtyehtmprstsit.private.blob.vercel-storage.com%2Fmitsubishi%2F1778708486155-commercial_fz-heavy-duty_main_FZ.jpg',
    payload: '16 - 44 Ton GCW',
    colors: [
      { name: 'Putih', hex: '#F5F5F0' },
    ],
    variants: [
      { name: 'FM65F Tractor Head 4x2', price: 'Rp 1.350.000.000', priceNum: 1350, transmission: 'Eaton 9-Speed', highlights: ['7.5L 6M60 VGT', '270 PS', '4x2 Tractor', 'Euro 4'] },
      { name: 'FN62F Tractor Head 6x4', price: 'Rp 1.580.000.000', priceNum: 1580, transmission: 'Eaton 9-Speed', highlights: ['7.5L 6M60 VGT', '270 PS', '6x4 Tractor', 'Euro 4'] },
    ],
    specs: [
      { category: 'Mesin', items: [{ label: 'Tipe Mesin', value: '6M60 7.5L 6-Cyl Turbo Diesel VGT Euro 4' }, { label: 'Kapasitas', value: '7.545 cc' }, { label: 'Tenaga Maks', value: '270 PS / 2.400 rpm' }, { label: 'Torsi Maks', value: '880 Nm / 1.200-2.000 rpm' }, { label: 'Bahan Bakar', value: 'Diesel Euro 4' }] },
      { category: 'Dimensi', items: [{ label: 'GVW / GCW', value: '20.000 - 44.000 Kg' }, { label: 'Wheelbase', value: '3.680 mm (4x2) / lebih (6x4)' }, { label: 'Panjang', value: '5.925 mm (FM65F TH)' }, { label: 'Lebar', value: '2.470 mm' }, { label: 'Tinggi', value: '2.860 mm' }] },
    ],
    promoText: 'Program pembiayaan fleet tersedia untuk bisnis Anda.',
    features: [
      { icon: 'Truck', title: 'GCW hingga 44 Ton', description: 'Kapasitas gabangan raksasa untuk operasi pertambangan, konstruksi, dan logistik besar' },
      { icon: 'Gauge', title: '7.5L VGT Euro 4', description: 'Mesin 6M60 diesel VGT bertenaga 270 PS dan torsi 880 Nm untuk medan berat jarak jauh' },
      { icon: 'Cog', title: 'Eaton 9-Speed', description: 'Transmisi Eaton 9 percepatan untuk distribusi daya optimal di segala medan dan beban' },
      { icon: 'Shield', title: 'Full Air Brake System', description: 'Sistem rem udara penuh dengan ABS untuk pengereman aman bahkan dengan beban maksimal' },
    ],
    specsShort: ['7.5L 6M60 VGT', 'Eaton 9-Speed', 'Euro 4'],
  },
];

// Helper functions
export function getPassengerVehicle(slug: string): VehicleData | undefined {
  return passengerVehicles.find((v) => v.slug === slug);
}

export function getNiagaRinganVehicle(slug: string): VehicleData | undefined {
  return niagaRinganVehicles.find((v) => v.slug === slug);
}

export function getCommercialVehicle(slug: string): VehicleData | undefined {
  return commercialVehicles.find((v) => v.slug === slug);
}

export function getAllVehicles(): VehicleData[] {
  return [...passengerVehicles, ...niagaRinganVehicles, ...commercialVehicles];
}
