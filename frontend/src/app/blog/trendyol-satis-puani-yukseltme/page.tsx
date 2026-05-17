import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trendyol Satış Puanı Nasıl Yükseltilir? 2026 Rehberi",
  description: "Trendyol mağaza ve ürün puanını artırmanın 8 kanıtlanmış yolu. Yorum yönetimi, kargo süresi, iade oranı ve müşteri memnuniyetiyle puanını yükselt.",
  keywords: ["trendyol satış puanı", "trendyol mağaza puanı yükseltme", "trendyol puan artırma", "trendyol satıcı puanı"],
  openGraph: {
    title: "Trendyol Satış Puanı Nasıl Yükseltilir? 2026 Rehberi",
    description: "Trendyol mağaza ve ürün puanını artırmanın 8 kanıtlanmış yolu.",
    type: "article",
    publishedTime: "2026-05-10",
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
          <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">Satıcı Rehberi</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
          Trendyol Satış Puanı Nasıl Yükseltilir? (2026 Güncel Rehber)
        </h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
          <span>10 Mayıs 2026</span>
          <span>·</span>
          <span>9 dk okuma</span>
          <span>·</span>
          <span>SatıcıPilot Ekibi</span>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <p className="text-lg text-gray-600 font-medium">
            Trendyol'da satış puanı, mağazanın arama sonuçlarındaki yerini doğrudan etkileyen en kritik metrik. Puan ne kadar yüksekse, ürünlerin o kadar üst sıralarda görünür ve satışlar artar.
          </p>

          <p>
            Bu rehberde Trendyol satış puanını etkileyen faktörleri ve her birini nasıl iyileştirebileceğini adım adım anlatıyoruz.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Trendyol Puanını Etkileyen Faktörler</h2>

          <p>Trendyol, satıcı puanını birkaç ana başlık altında hesaplar:</p>

          <ul className="space-y-2 pl-4">
            <li className="flex gap-2"><span className="text-orange-500 font-bold">1.</span> <span><strong>Müşteri yorumları ve derecelendirmeler</strong> — En ağır faktör (%40+)</span></li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">2.</span> <span><strong>Kargo süresi ve zamanında teslimat</strong> — Kritik öneme sahip</span></li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">3.</span> <span><strong>İade oranı</strong> — Düşük iade = yüksek puan</span></li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">4.</span> <span><strong>Yorum yanıt süresi</strong> — 24 saat içinde yanıt vermek kritik</span></li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">5.</span> <span><strong>Sipariş iptal oranı</strong> — Stok takibi yapmayanları cezalandırır</span></li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">1. Olumsuz Yorumlara 24 Saat İçinde Yanıt Ver</h2>

          <p>
            Trendyol algoritması, yorumlara yanıt verme hızını puanlama sistemine dahil eder. Araştırmalar gösteriyor ki 24 saat içinde yanıtlanan olumsuz yorumlar, müşteri memnuniyetini %60 oranında artırıyor.
          </p>

          <p>
            Olumsuz yoruma doğru yanıt vermek için şu şablonu kullanabilirsin:
          </p>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <p className="text-sm text-gray-500 mb-2 font-medium">Örnek Yanıt Şablonu</p>
            <p className="text-sm text-gray-700 italic">
              "Değerli müşterimiz, yaşadığınız sorun için özür dileriz. Ürünümüzle ilgili deneyiminizi öğrenmek istiyoruz. Müşteri hizmetlerimizle iletişime geçerseniz sorununuzu en kısa sürede çözüme kavuşturacağız. Tekrar alışveriş yapma fırsatı vermek isteriz."
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">2. İade Oranını Düşür</h2>

          <p>
            Türkiye e-ticaret pazarında ortalama iade oranı <strong>%18</strong>. Bu oranın üzerindeysen puana olumsuz yansıyor. İade oranını düşürmenin en etkili 3 yolu:
          </p>

          <ul className="space-y-3 pl-4">
            <li><strong>Beden tablosunu güncelle:</strong> İadelerin %45'i beden uyumsuzluğundan kaynaklanıyor. Her ürün için detaylı, gerçek ölçüler ekle.</li>
            <li><strong>Yüksek kaliteli fotoğraf kullan:</strong> Renk farklılığından kaynaklanan iadeleri azaltmak için doğal ışıkta çekilmiş, rengi doğru yansıtan görseller kullan.</li>
            <li><strong>Ürün açıklamasını detaylandır:</strong> Kumaş içeriği, yıkama talimatları ve kullanım önerileri ekle.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">3. Kargo Hızını Optimize Et</h2>

          <p>
            Trendyol, siparişlerin <strong>aynı gün veya ertesi gün</strong> kargoya verilmesini tercih ediyor. Geç kargo süreleri hem puanı düşürüyor hem de müşteri memnuniyetini azaltıyor.
          </p>

          <p>İpucu: Pazartesi-Cuma arası sabah 10:00'a kadar gelen siparişleri aynı gün kargolayabilirsen puanın hızla artar.</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">4. Stok Yönetimine Dikkat Et</h2>

          <p>
            Stok tükenmesine rağmen satışa açık ürünler sipariş iptali yaratır. İptal oranı yükseldikçe puan düşer. <strong>Her hafta stok güncellemesi</strong> yapma alışkanlığı edinin.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">5. Mağaza İçi Arama Optimizasyonu</h2>

          <p>
            Ürün başlıklarına ve açıklamalarına müşterilerin aradığı kelimeleri ekle. Örneğin "bluz" yerine "yazlık keten bluz kadın" daha spesifik arama sorgularında üst sıralara çıkar.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">6. Kampanyalara Katıl</h2>

          <p>
            Trendyol'un düzenlediği indirim kampanyalarına katılan mağazalar, algoritma tarafından öne çıkarılır. Bu, organik görünürlüğü artırır ve puanı olumlu etkiler.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">7. Ürün Görseli Kalitesini Artır</h2>

          <p>
            Trendyol, yüksek kaliteli görsellere sahip ürünleri arama sonuçlarında öne çıkarır. Minimum <strong>1000x1000 piksel</strong>, beyaz veya açık arka planlı, net odaklı görseller kullan.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">8. Müşteri Sorularını Hızla Yanıtla</h2>

          <p>
            Ürün sayfasındaki soruları yanıtsız bırakma. Her yanıtlanmış soru, hem potansiyel müşteriyi ikna eder hem de Trendyol'un güven skoru hesabına olumlu katkı sağlar.
          </p>

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mt-10">
            <h3 className="font-bold text-gray-900 mb-2">SatıcıPilot ile Puanını Otomatik Yönet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Tüm bu adımları manuel takip etmek zaman alır. SatıcıPilot, acil yorumları anında tespit eder, iade nedenlerini analiz eder ve puan düşüşlerini önceden uyarır.
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
              <Link href="/blog/trendyol-yorum-yonetimi" className="block text-orange-600 hover:underline text-sm">→ Trendyol'da Yorum Yönetimi: Satışlarını Artıracak 7 Strateji</Link>
              <Link href="/blog/iade-orani-nasil-dusurulur" className="block text-orange-600 hover:underline text-sm">→ Pazaryerinde İade Oranını %40 Düşürmenin 5 Yolu</Link>
              <Link href="/blog/trendyol-urun-aciklamasi-seo" className="block text-orange-600 hover:underline text-sm">→ Trendyol'da Ürün Açıklaması SEO Rehberi</Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
