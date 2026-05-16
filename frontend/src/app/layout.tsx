import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SatıcıPilot — AI Operasyon Asistanı",
  description: "KOBİ e-ticaret satıcıları için AI destekli operasyon aracı",
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
