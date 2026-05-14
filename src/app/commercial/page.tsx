import { niagaRinganVehicles, commercialVehicles } from '@/data/vehicles';
import CommercialPageClient from './CommercialPageClient';

export default function CommercialPage() {
  return <CommercialPageClient niagaRingan={niagaRinganVehicles} commercial={commercialVehicles} />;
}
