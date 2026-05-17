import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ClientProviders from "@/components/ClientProviders";
import { SiteConfigProvider } from "@/lib/site-config-context";
import { getDb } from "@/lib/db";
import { getStaticSiteConfig } from "@/lib/static-data";
import { proxyBlobUrl } from "@/lib/image-utils";
import type { SiteConfigItem } from "@/lib/site-config-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: "Mitsubishi Motor Indonesia | Drive Your Ambition",
  description:
    "Website resmi Mitsubishi Motor Indonesia. Temukan kendaraan passenger & commercial terbaik. Konsultasi dengan sales consultant kami untuk penawaran spesial.",
  keywords: [
    "Mitsubishi",
    "Mitsubishi Indonesia",
    "Mitsubishi Motors",
    "Xpander",
    "Pajero Sport",
    "Xforce",
    "Triton",
    "L300",
    "Canter",
    "FUSO",
    "mobil Mitsubishi",
    "truk Mitsubishi",
    "MPV",
    "SUV",
    "double cabin",
    "commercial vehicle",
    "kredit Mitsubishi",
    "promo Mitsubishi",
  ],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Mitsubishi Motor Indonesia | Drive Your Ambition",
    description: "Solusi kendaraan terpercaya untuk hidup & bisnis Anda. Konsultasi dengan sales consultant kami.",
    type: "website",
  },
};

/**
 * Fetch site config server-side so logo URLs are available
 * during SSR — no flash/flicker on refresh!
 */
async function getSiteConfigItems(): Promise<SiteConfigItem[]> {
  const db = getDb();
  if (!db) {
    return getStaticSiteConfig() as SiteConfigItem[];
  }
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM SiteConfig ORDER BY key ASC',
      args: [],
    });
    return result.rows as unknown as SiteConfigItem[];
  } catch (error) {
    console.error('Error fetching site configs in layout:', error);
    return getStaticSiteConfig() as SiteConfigItem[];
  }
}

// Force dynamic so site config is always fresh
export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteConfigItems = await getSiteConfigItems();

  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased bg-white text-mitsu-dark pb-14 sm:pb-0 font-sans`}
      >
        <SiteConfigProvider items={siteConfigItems}>
          <ClientProviders>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </ClientProviders>
        </SiteConfigProvider>
      </body>
    </html>
  );
}
