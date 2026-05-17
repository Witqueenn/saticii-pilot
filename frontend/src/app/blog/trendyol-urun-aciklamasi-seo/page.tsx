import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trendyol'da Ürün Açıklaması Nasıl Yazılır? SEO Rehberi 2026",
  description: "Trendyol arama sıralamasını yükseltecek ürün açıklaması yazma teknikleri. Doğru anahtar kelimeler, başlık optimizasyonu ve dönüşüm artıran içerik ipuçları.",
  keywords: ["trendyol ürün açıklaması", "trendyol seo", "trendyol arama sıralaması", "ürün başlığı optimizasyonu trendyol"],
  openGraph: {
    title: "Trendyol'da Ürün Açıklaması Nasıl Yazılır? SEO Rehberi 2026",
    description: "Trendyol arama sıralamasını yükseltecek ürün açıklaması yazma teknikleri.",
    type: "article",
    publishedTime: "2026-05-08",
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900">SatıcıPilot</Link>
          <Link href="/kayit" className="text-sm bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium">
            Ücretsiz Dene
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <Link href="/blog" className="text-sm text-orange-600 hover:underline">← Blog</Link>
        </div>

        <div className="mb-3">
          <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">SEO & Optimizasyon</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
          Trendyol'da Ürün Açıklaması Nasıl Yazılır? SEO ile Arama Sıralamanı Yükselt
        </h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
          <span>8 Mayıs 2026</span>
          <span>·</span>
          <span>7 dk okuma</span>
          <span>·</span>
          <span>SatıcıPilot Ekibi</span>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <p className="text-lg text-gray-600 font-medium">
            Trendyol'da binlerce benzer ürün arasından öne çıkmak için doğru yazılmış bir ürün açıklaması, reklam harcamadan organik görünürlük sağlar. İşte bunu yapmanın yolu.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Trendyol SEO Nasıl Çalışır?</h2>

          <p>
            Trendyol'un arama algoritması ürünleri sıralarken şu faktörlere bakar:
          </p>

          <ul className="space-y-2 pl-4 list-disc">
            <li>Ürün başlığındaki anahtar kelimeler</li>
            <li>Ürün açıklamasının kalitesi ve uzunluğu</li>
            <li>Kategori ve filtre etiketlerinin doğruluğu</li>
            <li>Satış hacmi ve dönüşüm oranı</li>
            <li>Yorum sayısı ve ortalama puan</li>
          </ul>

          <p>
            İyi bir ürün açıklaması hem algoritmayı hem müşteriyi ikna etmeli. Bu ikisi birbiriyle çelişmez — doğru yazılmış içerik her ikisine de hitap eder.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">1. Ürün Başlığını Doğru Yaz</h2>

          <p>Trendyol ürün başlığı için altın kural: <strong>[Marka] + [Ürün Tipi] + [En Önemli Özellik] + [Hedef Kitle/Kullanım]</strong></p>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-red-700 mb-1">❌ Kötü Başlık</p>
            <p className="text-sm text-red-800">"Yazlık Bluz"</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-green-700 mb-1">✅ İyi Başlık</p>
            <p className="text-sm text-green-800">"Kadın Yazlık Keten Bluz — V Yaka Oversize Gömlek Tunik"</p>
          </div>

          <p>
            Başlık maksimum <strong>100 karakter</strong> olmalı. En önemli kelimeler başa gelmeli, çünkü mobilde başlığın tamamı görünmeyebilir.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">2. Anahtar Kelime Araştırması Yap</h2>

          <p>
            Ürününü Trendyol arama kutusuna yaz ve otomatik tamamlama önerilerini not et. Bunlar gerçek kullanıcıların aradığı kelimeler:
          </p>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <p className="text-sm text-gray-500 mb-3 font-medium">Örnek: "bluz" yazınca çıkan öneriler</p>
            <div className="flex flex-wrap gap-2">
              {["kadın bluz", "bluz yazlık", "bluz oversize", "bluz keten", "bluz v yaka", "bluz kolsuz"].map(k => (
                <span key={k} className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-full text-gray-700">{k}</span>
              ))}
            </div>
          </div>

          <p>Bu kelimeleri başlık ve açıklamana doğal biçimde yerleştir. Anahtar kelime doldurmaktan kaçın — algoritma bunu anlar ve cezalandırır.</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">3. Ürün Açıklaması Yapısı</h2>

          <p>İyi bir Trendyol ürün açıklaması şu bölümlerden oluşmalı:</p>

          <div className="space-y-3">
            {[
              { num: "1", title: "Giriş cümlesi (1-2 cümle)", desc: "Ürünün ana özelliğini ve kullanım amacını özetle." },
              { num: "2", title: "Temel özellikler (madde madde)", desc: "Kumaş içeriği, ağırlık, kalıp bilgisi, renk seçenekleri." },
              { num: "3", title: "Beden bilgisi", desc: "Modelin boyu ve hangi bedeni giydiği. Ölçü tablosu linki." },
              { num: "4", title: "Bakım talimatları", desc: "Yıkama derecesi, ütüleme, kuru temizleme." },
              { num: "5", title: "Kullanım önerileri", desc: "Hangi kıyafetle kombinlenebileceği, hangi ortam için uygun." },
            ].map(item => (
              <div key={item.num} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{item.num}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">4. Kategori ve Filtreleri Doğru Seç</h2>

          <p>
            Yanlış kategori seçimi, doğru müşteriye ulaşmanı engeller. Ürünün birden fazla kategoriye uyuyorsa en spesifik olanı seç. Filtre etiketlerini (beden, renk, materyal) eksiksiz doldur — eksik filtreler arama dışı kalmanı sağlar.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">5. Görselleri SEO'ya Uygun Ekle</h2>

          <p>
            Trendyol, ürün görsel sırasına göre öncelik verir. İlk görsel (kapak) en belirleyici olandır:
          </p>

          <ul className="space-y-2 pl-4 list-disc">
            <li>Minimum 1000x1000 piksel, kare format</li>
            <li>Beyaz veya açık gri arka plan (Trendyol standartı)</li>
            <li>Ürünün %80+ görsel alanı kaplaması</li>
            <li>Varyantlar için ayrı görseller ekle (renk, beden farklılıkları)</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Bir Haftada Ölçülebilir Sonuç</h2>

          <p>
            Bu adımları uygulayan satıcılar genellikle <strong>1-2 hafta içinde</strong> organik arama görünürlüklerinin arttığını görüyor. Trendyol'un algoritmasi yeni içerikleri hızla tarar.
          </p>

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mt-10">
            <h3 className="font-bold text-gray-900 mb-2">Tüm Ürünlerinin SEO Skorunu Otomatik Hesapla</h3>
            <p className="text-sm text-gray-600 mb-4">
              SatıcıPilot, her ürününe 0-100 arası SEO ve açıklama puanı verir. Düşük puanlı ürünler için AI ile iyileştirilmiş içerik önerisi sunar.
            </p>
            <Link
              href="/kayit"
              className="inline-block bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              14 Gün Ücretsiz Dene →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">İlgili Yazılar</h3>
            <div className="space-y-2">
              <Link href="/blog/trendyol-satis-puani-yukseltme" className="block text-orange-600 hover:underline text-sm">→ Trendyol Satış Puanı Nasıl Yükseltilir?</Link>
              <Link href="/blog/trendyol-yorum-yonetimi" className="block text-orange-600 hover:underline text-sm">→ Trendyol'da Yorum Yönetimi: 7 Strateji</Link>
              <Link href="/blog/iade-orani-nasil-dusurulur" className="block text-orange-600 hover:underline text-sm">→ İade Oranını %40 Düşürmenin 5 Yolu</Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
