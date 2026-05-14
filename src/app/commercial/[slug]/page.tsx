import { notFound } from 'next/navigation';
import { getCommercialVehicle, getNiagaRinganVehicle } from '@/data/vehicles';
import VehicleDetailPage from '@/components/VehicleDetailPage';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CommercialVehiclePage({ params }: PageProps) {
  const { slug } = await params;
  const vehicle = getCommercialVehicle(slug) || getNiagaRinganVehicle(slug);

  if (!vehicle) {
    notFound();
  }

  return <VehicleDetailPage vehicle={vehicle} />;
}
