import { notFound } from 'next/navigation';
import { getPassengerVehicle, getAllVehicles } from '@/data/vehicles';
import { fetchVehicleBySlug } from '@/lib/fetch-vehicle';
import VehicleDetailPage from '@/components/VehicleDetailPage';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  const vehicles = getAllVehicles();
  return vehicles.map((v) => ({ slug: v.slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PassengerVehiclePage({ params }: PageProps) {
  const { slug } = await params;

  // Try database first, fall back to static data
  const vehicle = await fetchVehicleBySlug(slug) || getPassengerVehicle(slug);

  if (!vehicle) {
    notFound();
  }

  return <VehicleDetailPage vehicle={vehicle} />;
}
