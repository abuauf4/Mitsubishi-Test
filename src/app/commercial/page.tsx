import { fetchVehiclesByCategory } from '@/lib/fetch-vehicle';
import { niagaRinganVehicles, commercialVehicles } from '@/data/vehicles';
import CommercialPageClient from './CommercialPageClient';

export const dynamic = 'force-dynamic';

export default async function CommercialPage() {
  // Try fetching from database first, fall back to static data
  let niagaRingan = await fetchVehiclesByCategory('niaga-ringan');
  if (niagaRingan.length === 0) {
    niagaRingan = niagaRinganVehicles;
  }

  let commercial = await fetchVehiclesByCategory('commercial');
  if (commercial.length === 0) {
    commercial = commercialVehicles;
  }

  return <CommercialPageClient niagaRingan={niagaRingan} commercial={commercial} />;
}
