import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/genel", "/yorumlar", "/urunler", "/iadeler", "/ayarlar", "/baglanti"] },
    sitemap: "https://saticii-pilot.vercel.app/sitemap.xml",
  };
}
