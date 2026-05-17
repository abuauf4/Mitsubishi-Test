import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ClientProviders from "@/components/ClientProviders";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased bg-white text-mitsu-dark pb-14 sm:pb-0 font-sans`}
      >
        <ClientProviders>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
