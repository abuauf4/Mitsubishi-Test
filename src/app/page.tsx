import HeroSection from '@/components/HeroSection';
import DriveYourAmbition from '@/components/DriveYourAmbition';
import AudienceGateway from '@/components/AudienceGateway';
import WhyMitsubishi from '@/components/WhyMitsubishi';
import GallerySection from '@/components/GallerySection';
import TestimonialSection from '@/components/TestimonialSection';
import SalesConsultant from '@/components/SalesConsultant';
import PromoSection from '@/components/PromoSection';
import TestDriveCTA from '@/components/TestDriveCTA';
import { fetchHeroData } from '@/lib/fetch-hero';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const heroData = await fetchHeroData('home');

  return (
    <>
      <HeroSection initialData={heroData} />
      <DriveYourAmbition />
      <AudienceGateway />
      <WhyMitsubishi />
      <GallerySection />
      <TestimonialSection />
      <SalesConsultant />
      <PromoSection />
      <TestDriveCTA />
    </>
  );
}
