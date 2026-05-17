import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trendyol'da Mağaza Nasıl Açılır? 2026 Adım Adım Rehber",
  description: "Trendyol'da satıcı olmak için gereken belgeler, başvuru süreci ve ilk satışa kadar yapman gerekenler. Yeni satıcıların en çok sorduğu sorular.",
  keywords: ["trendyol mağaza açma", "trendyol satıcı olma", "trendyol başvuru", "trendyol satıcı kaydı 2026"],
  openGraph: {
    title: "Trendyol'da Mağaza Nasıl Açılır? 2026 Adım Adım Rehber",
    description: "Trendyol'da satıcı olmak için gereken belgeler ve başvuru süreci.",
    type: "article",
    publishedTime: "2026-05-05",
  },
};

const steps = [
  {
    num: "1",
    title: "Şirket Kur veya Şahıs İşletmesi Aç",
    desc: "Trendyol'da satış yapabilmek için vergi mükellefi olman gerekiyor. Şahıs şirketi veya limited şirket ile başvurabilirsin. Şahıs şirketi daha hızlı ve ucuz kurulur.",
  },
  {
    num: "2",
    title: "Trendyol Partner Başvurusu Yap",
    desc: 'Trendyol\'un "Partner Başvurusu" sayfasından başvuru formunu doldur. Vergi numaranı, IBAN\'ını ve iletişim bilgilerini girmen gerekiyor.',
  },
  {
    num: "3",
    title: "Gerekli Belgeleri Yükle",
    desc: "İmza sirküleri veya şahıs işletmesi vergi levhası, banka hesap bilgileri ve kimlik fotokopisi isteniyor. Belgelerin tamamı dijital olarak yükleniyor.",
  },
  {
    num: "4",
    title: "Mağaza Adını ve Kategorini Belirle",
    desc: "Mağaza adı marka imajını belirler. Kısa, akılda kalıcı ve sattığın ürünle uyumlu bir isim seç. Kategorini doğru belirlemek arama görünürlüğünü etkiler.",
  },
  {
    num: "5",
    title: "İlk Ürünleri Ekle",
    desc: "Onay aldıktan sonra ürün yükleme paneline erişirsin. İlk 10 ürün için yüksek kaliteli görseller, detaylı açıklamalar ve rekabetçi fiyatlar belirle.",
  },
  {
    num: "6",
    title: "Kargo Anlaşması Yap",
    desc: "Trendyol Hızlı Teslimat (THY) anlaşması yapman bekleniyor. Trendyol anlaşmalı kargo firmaları (Yurtiçi, MNG, Aras, PTT) ile özel fiyat avantajı sunuyor.",
  },
];

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
          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">Başlangıç Rehberi</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
          Trendyol'da Mağaza Nasıl Açılır? (2026 Güncel Adım Adım Rehber)
        </h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
          <span>5 Mayıs 2026</span>
          <span>·</span>
          <span>10 dk okuma</span>
          <span>·</span>
          <span>SatıcıPilot Ekibi</span>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <p className="text-lg text-gray-600 font-medium">
            Trendyol, Türkiye'nin en büyük e-ticaret platformu. Günde milyonlarca sipariş işleniyor ve yeni satıcılar için ciddi bir fırsat sunuyor. İşte mağaza açmadan ilk satışa kadar bilmen gereken her şey.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">📌 Başlamadan önce</p>
            <p className="text-sm text-blue-700">Trendyol'da satış yapmak için aktif bir vergi mükellefi olman şart. Bireysel satış yapılamıyor.</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Gerekli Belgeler</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Vergi levhası (şahıs/şirket)",
              "İmza sirküleri veya ticaret sicil belgesi",
              "IBAN bilgisi (şirket hesabı)",
              "Kimlik fotokopisi",
              "İletişim bilgileri",
              "Mağaza logosu (varsa)",
            ].map((doc) => (
              <div key={doc} className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <span className="text-green-500 font-bold text-sm">✓</span>
                <span className="text-sm text-gray-700">{doc}</span>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Adım Adım Başvuru Süreci</h2>

          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.num} className="flex gap-4 p-4 border border-gray-200 rounded-xl">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {step.num}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{step.title}</p>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Onay Süreci Ne Kadar Sürer?</h2>

          <p>
            Trendyol başvuruları genellikle <strong>3-7 iş günü</strong> içinde sonuçlanıyor. Belgeler eksiksizse bu süre 1-2 güne kadar düşebiliyor. Başvuru sonucu e-posta ile bildiriliyor.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Komisyon Oranları Ne Kadar?</h2>

          <p>Trendyol komisyon oranları kategoriye göre değişiyor:</p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border border-gray-200 font-semibold">Kategori</th>
                  <th className="text-left p-3 border border-gray-200 font-semibold">Komisyon</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Kadın Giyim", "%18-22"],
                  ["Erkek Giyim", "%16-20"],
                  ["Ayakkabı", "%18-22"],
                  ["Elektronik", "%5-8"],
                  ["Kozmetik", "%12-18"],
                  ["Ev & Yaşam", "%14-18"],
                ].map(([cat, rate]) => (
                  <tr key={cat} className="border-b border-gray-200">
                    <td className="p-3 border border-gray-200 text-gray-700">{cat}</td>
                    <td className="p-3 border border-gray-200 font-medium text-orange-600">{rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-gray-500">* Komisyon oranları değişkendir. Güncel oranlar için Trendyol Partner panelini kontrol et.</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">İlk Satışa Kadar Yapman Gerekenler</h2>

          <ul className="space-y-3 pl-4 list-disc">
            <li><strong>En az 10 ürün ekle</strong> — Az ürünlü mağazalar algoritma tarafından öne çıkarılmıyor</li>
            <li><strong>Fiyat araştırması yap</strong> — Rakiplerine bak, rekabetçi bir fiyat belirle</li>
            <li><strong>Kargo fiyatını sıfırla</strong> — Ücretsiz kargo dönüşüm oranını %30 artırıyor</li>
            <li><strong>Mağaza profilini tamamla</strong> — Logo, kapak fotoğrafı ve mağaza açıklaması ekle</li>
            <li><strong>Trendyol kampanyalarını takip et</strong> — Sezon kampanyalarına katılmak görünürlüğü artırır</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Sık Yapılan Hatalar</h2>

          <div className="space-y-3">
            {[
              { err: "Stok güncellememeye", fix: "Tükenen ürünü açık bırakmak iptal oranını artırır ve puan düşürür." },
              { err: "Tek fotoğrafla listelemek", fix: "Minimum 4-5 görsel ekle: ön, arka, detay, ölçü görseli." },
              { err: "Yorumları yanıtsız bırakmak", fix: "Her yoruma 24 saat içinde yanıt vermek Trendyol sıralamasını doğrudan etkiler." },
            ].map((item) => (
              <div key={item.err} className="flex gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                <span className="text-red-500 font-bold text-lg flex-shrink-0">✕</span>
                <div>
                  <p className="text-sm font-semibold text-red-800">{item.err}</p>
                  <p className="text-sm text-red-700 mt-0.5">{item.fix}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mt-10">
            <h3 className="font-bold text-gray-900 mb-2">Mağazanı Açtıktan Sonra SatıcıPilot'u Dene</h3>
            <p className="text-sm text-gray-600 mb-4">
              Yorumlarını takip et, iade nedenlerini analiz et, rakip fiyatlarını izle. Trendyol mağazanı büyütmek için ihtiyacın olan her şey tek panelde.
            </p>
            <Link
              href="/kayit"
              className="inline-block bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              14 Gün Ücretsiz Başla →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">İlgili Yazılar</h3>
            <div className="space-y-2">
              <Link href="/blog/trendyol-satis-puani-yukseltme" className="block text-orange-600 hover:underline text-sm">→ Trendyol Satış Puanı Nasıl Yükseltilir?</Link>
              <Link href="/blog/trendyol-urun-aciklamasi-seo" className="block text-orange-600 hover:underline text-sm">→ Trendyol Ürün Açıklaması SEO Rehberi</Link>
              <Link href="/blog/iade-orani-nasil-dusurulur" className="block text-orange-600 hover:underline text-sm">→ İade Oranını %40 Düşürmenin 5 Yolu</Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
