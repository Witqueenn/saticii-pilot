import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — E-ticaret Satıcıları için Rehberler",
  description: "Trendyol, Hepsiburada ve N11 satıcıları için pratik rehberler. Yorum yönetimi, iade azaltma, ürün optimizasyonu.",
};

const posts = [
  {
    slug: "trendyol-satis-puani-yukseltme",
    title: "Trendyol Satış Puanı Nasıl Yükseltilir? (2026 Rehberi)",
    excerpt: "Trendyol mağaza puanını artırmanın 8 kanıtlanmış yolu. Yorum yönetimi, kargo süresi ve iade oranıyla puanını yükselt.",
    date: "10 Mayıs 2026",
    readTime: "9 dk",
    tag: "Satıcı Rehberi",
    tagColor: "bg-orange-100 text-orange-700",
  },
  {
    slug: "trendyol-magaza-acma-rehberi",
    title: "Trendyol'da Mağaza Nasıl Açılır? Adım Adım Rehber",
    excerpt: "Gerekli belgeler, başvuru süreci, komisyon oranları ve ilk satışa kadar yapman gerekenler. Yeni satıcılar için eksiksiz rehber.",
    date: "5 Mayıs 2026",
    readTime: "10 dk",
    tag: "Başlangıç",
    tagColor: "bg-green-100 text-green-700",
  },
  {
    slug: "trendyol-urun-aciklamasi-seo",
    title: "Trendyol'da Ürün Açıklaması SEO: Arama Sıralamanı Yükselt",
    excerpt: "Trendyol arama algoritmasını anlayarak ürün başlıkları ve açıklamalarını optimize et. Organik görünürlüğünü artır.",
    date: "8 Mayıs 2026",
    readTime: "7 dk",
    tag: "SEO & Optimizasyon",
    tagColor: "bg-purple-100 text-purple-700",
  },
  {
    slug: "trendyol-yorum-yonetimi",
    title: "Trendyol'da Yorum Yönetimi: Satışlarını Artıracak 7 Strateji",
    excerpt: "Olumsuz yorumlar dönüşüm oranını %30'a kadar düşürebilir. Profesyonel yorum yönetimi ile mağaza puanını nasıl yükseltirsin?",
    date: "15 Mayıs 2026",
    readTime: "6 dk",
    tag: "Yorum Yönetimi",
    tagColor: "bg-blue-100 text-blue-700",
  },
  {
    slug: "iade-orani-nasil-dusurulur",
    title: "Pazaryerinde İade Oranını %40 Düşürmenin 5 Yolu",
    excerpt: "Türkiye'de e-ticaret iade oranı ortalama %18. Bu oranı yarıya indirmek için uygulaман gereken 5 somut adım.",
    date: "12 Mayıs 2026",
    readTime: "8 dk",
    tag: "İade Yönetimi",
    tagColor: "bg-red-100 text-red-700",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900">SatıcıPilot</Link>
          <Link href="/kayit" className="text-sm bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium">
            Ücretsiz Dene
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
          <p className="text-gray-500 mt-2">E-ticaret satıcıları için pratik rehberler ve ipuçları</p>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-white rounded-2xl border border-gray-200 p-6 hover:border-orange-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${post.tagColor}`}>
                      {post.tag}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" /> {post.readTime}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed">{post.excerpt}</p>
                  <p className="text-xs text-gray-400">{post.date}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500 transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
