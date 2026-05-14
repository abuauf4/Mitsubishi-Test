import { passengerVehicles } from '@/data/vehicles';
import PassengerPageClient from './PassengerPageClient';

export default function PassengerPage() {
  return <PassengerPageClient vehicles={passengerVehicles} />;
}
