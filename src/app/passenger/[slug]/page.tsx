import { notFound } from 'next/navigation';
import { getPassengerVehicle, getAllVehicles } from '@/data/vehicles';
import VehicleDetailPage from '@/components/VehicleDetailPage';

export function generateStaticParams() {
  const vehicles = getAllVehicles();
  return vehicles.map((v) => ({ slug: v.slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PassengerVehiclePage({ params }: PageProps) {
  const { slug } = await params;
  const vehicle = getPassengerVehicle(slug);

  if (!vehicle) {
    notFound();
  }

  return <VehicleDetailPage vehicle={vehicle} />;
}
