import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://saticii-pilot.vercel.app";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    // Trendyol
    { url: `${base}/blog/trendyol-magaza-acma-rehberi`, lastModified: new Date("2026-05-05"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/blog/trendyol-satis-puani-yukseltme`, lastModified: new Date("2026-05-10"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog/trendyol-urun-aciklamasi-seo`, lastModified: new Date("2026-05-08"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog/trendyol-yorum-yonetimi`, lastModified: new Date("2026-05-15"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/iade-orani-nasil-dusurulur`, lastModified: new Date("2026-05-12"), changeFrequency: "monthly", priority: 0.7 },
    // Diğer platformlar
    { url: `${base}/blog/hepsiburada-magaza-acma`, lastModified: new Date("2026-05-03"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog/n11-magaza-acma`, lastModified: new Date("2026-05-01"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog/amazon-turkiye-satici-olma`, lastModified: new Date("2026-04-28"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog/ciceksepeti-satici-olma`, lastModified: new Date("2026-04-25"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/pazaryeri-karsilastirma`, lastModified: new Date("2026-05-14"), changeFrequency: "monthly", priority: 0.9 },
    // Auth
    { url: `${base}/giris`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/kayit`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
  ];
}
