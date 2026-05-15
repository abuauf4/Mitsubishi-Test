'use client';

const announcements = [
  'Test Drive Gratis — Jadwalkan Sekarang!',
  'Promo Xpander Cashback Rp 15 Juta',
  'L100 EV — Kendaraan Listrik Pertama Mitsubishi Indonesia',
  'Hubungi Andi: 0812-3456-7890',
  'Garansi Resmi 5 Tahun untuk Semua Kendaraan',
];

export default function AnnouncementBar() {
  const separator = '  \u2022  ';
  const marqueeText = announcements.join(separator);

  return (
    <div className="bg-mitsu-red relative">
      <div className="relative overflow-hidden h-8 sm:h-9 flex items-center">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-10 bg-mitsu-red z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-6 sm:w-10 bg-mitsu-red z-10 pointer-events-none" />

        <div className="whitespace-nowrap animate-marquee">
          <span className="text-white text-[11px] sm:text-xs font-semibold tracking-wide">
            {marqueeText}{separator}{marqueeText}{separator}{marqueeText}
          </span>
        </div>
      </div>
    </div>
  );
}
