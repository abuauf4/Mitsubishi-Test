'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Client-only components - loaded dynamically with ssr: false
// This prevents hydration mismatches and .map() errors on Vercel
const FloatingWhatsApp = dynamic(() => import('./FloatingWhatsApp'), { ssr: false });
const ScrollProgressBar = dynamic(() => import('./ScrollProgressBar'), { ssr: false });
const Toaster = dynamic(
  () => import('./ui/toaster').then(mod => ({ default: mod.Toaster })),
  { ssr: false }
);

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <ScrollProgressBar />
      {children}
      <FloatingWhatsApp />
      <Toaster />
    </>
  );
}
