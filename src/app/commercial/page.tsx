import { fetchVehiclesByCategory } from '@/lib/fetch-vehicle';
import { commercialVehicles } from '@/data/vehicles';
import CommercialPageClient from './CommercialPageClient';

export const dynamic = 'force-dynamic';

export default async function CommercialPage() {
  let commercial = await fetchVehiclesByCategory('commercial');
  if (commercial.length === 0) {
    commercial = commercialVehicles;
  }

  return <CommercialPageClient commercial={commercial} />;
}
