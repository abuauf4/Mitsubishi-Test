import { fetchVehiclesByCategory } from '@/lib/fetch-vehicle';
import { commercialVehicles } from '@/data/vehicles';
import { fetchHeroData } from '@/lib/fetch-hero';
import CommercialPageClient from './CommercialPageClient';

export const dynamic = 'force-dynamic';

export default async function CommercialPage() {
  // Only FUSO commercial vehicles now — Triton, L300, L100EV moved to passenger
  let commercial = await fetchVehiclesByCategory('commercial');
  if (commercial.length === 0) {
    commercial = commercialVehicles;
  }

  const heroData = await fetchHeroData('commercial');

  return <CommercialPageClient commercial={commercial} initialHeroData={heroData} />;
}
