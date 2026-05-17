import { fetchVehiclesByCategory } from '@/lib/fetch-vehicle';
import { passengerVehicles } from '@/data/vehicles';
import PassengerPageClient from './PassengerPageClient';

export const dynamic = 'force-dynamic';

export default async function PassengerPage() {
  let vehicles = await fetchVehiclesByCategory('passenger');
  if (vehicles.length === 0) {
    vehicles = passengerVehicles;
  }

  return <PassengerPageClient vehicles={vehicles} />;
}
