import { fetchVehiclesByCategory } from '@/lib/fetch-vehicle';
import { commercialVehicles } from '@/data/vehicles';
import CommercialPageClient from './CommercialPageClient';

export const dynamic = 'force-dynamic';

export default async function CommercialPage() {
  // Only FUSO commercial vehicles now — Triton, L300, L100EV moved to passenger
  let commercial = await fetchVehiclesByCategory('commercial');
  if (commercial.length === 0) {
    commercial = commercialVehicles;
  }

  return <CommercialPageClient commercial={commercial} />;
}
