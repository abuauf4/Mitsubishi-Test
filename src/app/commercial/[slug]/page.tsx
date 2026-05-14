import { notFound } from 'next/navigation';
import { getCommercialVehicle, getNiagaRinganVehicle } from '@/data/vehicles';
import { fetchVehicleBySlug } from '@/lib/fetch-vehicle';
import VehicleDetailPage from '@/components/VehicleDetailPage';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CommercialVehiclePage({ params }: PageProps) {
  const { slug } = await params;

  // Try database first, fall back to static data
  const vehicle = await fetchVehicleBySlug(slug) || getCommercialVehicle(slug) || getNiagaRinganVehicle(slug);

  if (!vehicle) {
    notFound();
  }

  return <VehicleDetailPage vehicle={vehicle} />;
}
