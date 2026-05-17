import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://saticii-pilot.vercel.app"),
  title: {
    default: "SatıcıPilot — Pazaryeri Satıcıları için AI Asistan",
    template: "%s | SatıcıPilot",
  },
  description:
    "Trendyol, Hepsiburada, N11 satıcıları için AI destekli yorum analizi, iade takibi ve ürün optimizasyonu. İade oranını %34 düşür, günde 2 saat kazan.",
  keywords: [
    "trendyol yorum yönetimi",
    "pazaryeri satıcı asistanı",
    "e-ticaret iade analizi",
    "trendyol satıcı paneli",
    "hepsiburada yorum cevaplama",
    "ürün açıklama optimizasyonu",
    "AI e-ticaret",
    "satıcı pilot",
  ],
  authors: [{ name: "SatıcıPilot" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://saticii-pilot.vercel.app",
    siteName: "SatıcıPilot",
    title: "SatıcıPilot — Pazaryeri Satıcıları için AI Asistan",
    description:
      "Trendyol, Hepsiburada, N11 satıcıları için AI destekli yorum analizi, iade takibi ve ürün optimizasyonu.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SatıcıPilot — Pazaryeri Satıcıları için AI Asistan",
    description:
      "Trendyol, Hepsiburada, N11 satıcıları için AI destekli yorum analizi, iade takibi ve ürün optimizasyonu.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: "6aMHXA09MNg6gAbHsTVWmZLBD7A9_hAIXINNOCr4yfM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  );
}
