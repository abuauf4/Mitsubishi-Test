'use client';

const announcements = [
  'Test Drive Gratis — Jadwalkan Sekarang!',
  'Promo Xpander Cashback Rp 15 Juta',
  'L100 EV — Kendaraan Listrik Pertama Mitsubishi Indonesia',
  'Hubungi Andi: 0812-3456-7890',
  'Garansi Resmi 5 Tahun untuk Semua Kendaraan',
];

interface AnnouncementBarProps {
  variant?: 'default' | 'commercial';
}

export default function AnnouncementBar({ variant = 'default' }: AnnouncementBarProps) {
  const isCommercial = variant === 'commercial';
  const separator = '  \u2022  ';
  const marqueeText = announcements.join(separator);

  const bgColor = isCommercial ? 'bg-mitsu-fuso-yellow' : 'bg-mitsu-red';
  const textColor = isCommercial ? 'text-mitsu-obsidian' : 'text-white';

  return (
    <div className={`${bgColor} relative`}>
      <div className="relative overflow-hidden h-8 sm:h-9 flex items-center">
        {/* Left fade */}
        <div className={`absolute left-0 top-0 bottom-0 w-6 sm:w-10 ${bgColor} z-10 pointer-events-none`} />
        {/* Right fade */}
        <div className={`absolute right-0 top-0 bottom-0 w-6 sm:w-10 ${bgColor} z-10 pointer-events-none`} />

        <div className="whitespace-nowrap animate-marquee">
          <span className={`${textColor} text-[11px] sm:text-xs font-semibold tracking-wide`}>
            {marqueeText}{separator}{marqueeText}{separator}{marqueeText}
          </span>
        </div>
      </div>
    </div>
  );
}
