import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hepsiburada'da Mağaza Açma ve Satıcı Olma Rehberi (2026)",
  description:
    "Hepsiburada'da satıcı olmak için gereken belgeler, başvuru adımları ve komisyon oranları. 2026 güncel rehber ile ilk satışına hızlıca ulaş.",
  keywords: [
    "hepsiburada mağaza açma",
    "hepsiburada satıcı olma",
    "hepsiburada satıcı başvurusu",
    "hepsiburada komisyon oranları",
  ],
  openGraph: {
    title: "Hepsiburada'da Mağaza Açma ve Satıcı Olma Rehberi (2026)",
    description:
      "Hepsiburada'da satıcı olmak için gereken belgeler, başvuru adımları ve komisyon oranları.",
    type: "article",
    publishedTime: "2026-05-03",
  },
};

const steps = [
  {
    num: "1",
    title: "Vergi Mükellefi Ol",
    desc: "Hepsiburada'da satış yapabilmek için şahıs şirketi veya limited/anonim şirket sahibi olman gerekiyor. Bireysel satıcı başvurusu kabul edilmiyor.",
  },
  {
    num: "2",
    title: "Hepsiburada Satıcı Portalına Başvur",
    desc: 'Hepsiburada\'nun resmi "Satıcı Ol" sayfasından online başvuru formunu doldur. Şirket bilgilerini, kategorini ve banka IBAN\'ını gir.',
  },
  {
    num: "3",
    title: "Belgeleri Dijital Olarak Yükle",
    desc: "Vergi levhası, imza sirküleri ve banka hesap bilgilerini portal üzerinden yükle. Belgeler eksiksiz olursa süreç hızlanır.",
  },
  {
    num: "4",
    title: "Sözleşmeyi Dijital İmzala",
    desc: "Başvurun onaylandıktan sonra Hepsiburada ile dijital satıcı sözleşmesi imzalamalısın. Bu adımda komisyon oranlarını ve ödeme koşullarını da onaylarsın.",
  },
  {
    num: "5",
    title: "Mağaza Profilini Tamamla",
    desc: "Mağaza adı, logo ve kategorini belirle. Eksiksiz bir profil, onay sürecini kısaltır ve müşteri güvenini artırır.",
  },
  {
    num: "6",
    title: "İlk Ürünleri Ekle ve Yayınla",
    desc: "En az 5-10 ürünle başla. Yüksek kaliteli görseller, doğru kategori eşlemesi ve rekabetçi fiyatlarla listele.",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900">
            SatıcıPilot
          </Link>
          <Link
            href="/kayit"
            className="text-sm bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Ücretsiz Dene
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <Link href="/blog" className="text-sm text-orange-600 hover:underline">
            ← Blog
          </Link>
        </div>

        <div className="mb-3">
          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
            Başlangıç Rehberi
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
          Hepsiburada'da Mağaza Açma ve Satıcı Olma Rehberi (2026)
        </h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
          <span>3 Mayıs 2026</span>
          <span>·</span>
          <span>9 dk okuma</span>
          <span>·</span>
          <span>SatıcıPilot Ekibi</span>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
          <p className="text-lg text-gray-600 font-medium">
            Hepsiburada, Türkiye'nin en köklü e-ticaret platformlarından biri. 50 milyonun üzerinde
            kayıtlı üyesiyle satıcılar için ciddi bir satış kanalı sunuyor. Bu rehberde mağaza açma
            sürecinden komisyon oranlarına kadar bilmen gereken her şeyi bulacaksın.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">Bilmen Gereken</p>
            <p className="text-sm text-blue-700">
              Hepsiburada yalnızca kurumsal satıcıları kabul ediyor. Başvuru için aktif bir şirket
              veya şahıs işletmesi şart.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            Hepsiburada'da Satıcı Olmanın Avantajları
          </h2>

          <ul className="space-y-3 pl-4 list-disc">
            <li>
              <strong>Köklü marka güveni</strong> — 25 yılı aşkın geçmişiyle tüketiciler arasında
              yüksek güven algısı
            </li>
            <li>
              <strong>50M+ kayıtlı üye</strong> — geniş ve satın alma gücü yüksek müşteri kitlesi
            </li>
            <li>
              <strong>HepsiJet lojistik altyapısı</strong> — kendi kargo ağıyla hızlı teslimat
              imkânı
            </li>
            <li>
              <strong>Kredi kartı taksit desteği</strong> — müşterilerin sepeti terk oranını azaltır
            </li>
            <li>
              <strong>Elektronik ve beyaz eşya dominasyonu</strong> — bu kategorilerde pazar lideri
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Gerekli Belgeler</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Vergi levhası (şahıs/şirket)",
              "İmza sirküleri veya ticaret sicil belgesi",
              "IBAN bilgisi (şirket hesabı)",
              "Kimlik fotokopisi (yetkiliye ait)",
              "İletişim bilgileri (e-posta, telefon)",
              "Mağaza logosu (opsiyonel)",
            ].map((doc) => (
              <div
                key={doc}
                className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 border border-gray-100"
              >
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

          <p>
            Başvuru sonucu genellikle <strong>3-10 iş günü</strong> içinde e-posta ile bildiriliyor.
            Belgeler eksiksiz ve doğruysa süreç 2-3 güne kadar kısalabiliyor.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Komisyon Oranları</h2>

          <p>
            Hepsiburada komisyonları kategoriye göre farklılaşıyor. Aşağıdaki tablo 2026 yılı
            güncel aralıklarını gösteriyor:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border border-gray-200 font-semibold">Kategori</th>
                  <th className="text-left p-3 border border-gray-200 font-semibold">
                    Komisyon Aralığı
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Elektronik", "%5-8"],
                  ["Giyim", "%18-22"],
                  ["Kozmetik", "%12-16"],
                  ["Ev & Yaşam", "%14-18"],
                  ["Spor", "%10-14"],
                  ["Oyuncak", "%10-14"],
                  ["Kitap", "%12-15"],
                ].map(([cat, rate]) => (
                  <tr key={cat} className="border-b border-gray-200">
                    <td className="p-3 border border-gray-200 text-gray-700">{cat}</td>
                    <td className="p-3 border border-gray-200 font-medium text-orange-600">
                      {rate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-gray-500">
            * Komisyon oranları periyodik olarak güncellenir. Güncel oranlar için Hepsiburada Satıcı
            Portalı'nı kontrol et.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            Hepsiburada vs Trendyol: Temel Farklar
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border border-gray-200 font-semibold">Özellik</th>
                  <th className="text-left p-3 border border-gray-200 font-semibold">
                    Hepsiburada
                  </th>
                  <th className="text-left p-3 border border-gray-200 font-semibold">Trendyol</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Güçlü olduğu kategori", "Elektronik, Beyaz Eşya", "Moda, Giyim"],
                  ["Müşteri profili", "30-50 yaş, bilinçli alıcı", "18-35 yaş, hızlı alıcı"],
                  ["Komisyon (giyim)", "%18-22", "%18-22"],
                  ["Onay süresi", "3-10 iş günü", "3-7 iş günü"],
                  ["Kargo altyapısı", "HepsiJet", "Trendyol Express"],
                  ["Kampanya sistemi", "Orta yoğunlukta", "Çok yoğun"],
                ].map(([feature, hepsi, trend]) => (
                  <tr key={feature} className="border-b border-gray-200">
                    <td className="p-3 border border-gray-200 font-medium text-gray-700">
                      {feature}
                    </td>
                    <td className="p-3 border border-gray-200 text-gray-600">{hepsi}</td>
                    <td className="p-3 border border-gray-200 text-gray-600">{trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            İlk Satışa Kadar Yapman Gerekenler
          </h2>

          <ul className="space-y-3 pl-4 list-disc">
            <li>
              <strong>En az 10 ürün listele</strong> — az ürünlü mağazalar algoritma tarafından
              öne çıkarılmıyor
            </li>
            <li>
              <strong>Rakip fiyatlarını analiz et</strong> — Hepsiburada'da fiyat rekabeti çok
              keskin, başlangıçta piyasanın altında kalma
            </li>
            <li>
              <strong>HepsiJet anlaşmasını tamamla</strong> — kendi kargo ağı ile teslimat süresi
              kısalır, müşteri memnuniyeti artar
            </li>
            <li>
              <strong>Ürün başlıklarını optimize et</strong> — marka + model + özellik formatını
              kullan
            </li>
            <li>
              <strong>Kampanya dönemlerini takip et</strong> — Büyük İndirim Günleri, Efsane Cuma
              gibi kampanyalara katıl
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Sık Yapılan Hatalar</h2>

          <div className="space-y-3">
            {[
              {
                err: "Stok bilgisini güncellememek",
                fix: "Tükenmiş ürün açık kalırsa iptal oranı artar, mağaza puanı düşer. Stok yönetimini otomatize et.",
              },
              {
                err: "Yanlış kategoriye listelemek",
                fix: "Hatalı kategori eşlemesi hem görünürlüğü hem komisyon hesaplamalarını olumsuz etkiler.",
              },
              {
                err: "Fotoğraf kalitesini ihmal etmek",
                fix: "Hepsiburada alıcısı ürünü çok detaylı inceler. En az 4 yüksek çözünürlüklü fotoğraf ekle.",
              },
              {
                err: "Yorumlara geç yanıt vermek",
                fix: "24 saat içinde yanıt vermek mağaza skorunu doğrudan etkiler. Bildirim kurulumunu yap.",
              },
            ].map((item) => (
              <div
                key={item.err}
                className="flex gap-3 p-4 bg-red-50 rounded-xl border border-red-100"
              >
                <span className="text-red-500 font-bold text-lg flex-shrink-0">✕</span>
                <div>
                  <p className="text-sm font-semibold text-red-800">{item.err}</p>
                  <p className="text-sm text-red-700 mt-0.5">{item.fix}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6">
            <p className="text-sm font-semibold text-green-800 mb-1">Profesyonel İpucu</p>
            <p className="text-sm text-green-700">
              Hepsiburada'da Elektronik ve Beyaz Eşya kategorileri en yüksek ciroyu üretiyor. Bu
              kategorilerde satış yapıyorsan Hepsiburada'yı öncelikli platform olarak değerlendir.
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mt-10">
            <h3 className="font-bold text-gray-900 mb-2">
              Hepsiburada Mağazanı SatıcıPilot ile Yönet
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              SatıcıPilot yakında Hepsiburada entegrasyonunu sunacak. Tüm pazaryerlerini tek
              panelden yönet: yorumlar, stok, fiyat takibi ve AI analizleri.
            </p>
            <Link
              href="/kayit"
              className="inline-block bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              Erken Erişime Kaydol →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">İlgili Yazılar</h3>
            <div className="space-y-2">
              <Link
                href="/blog/trendyol-yorum-yonetimi"
                className="block text-orange-600 hover:underline text-sm"
              >
                → Trendyol'da Yorum Yönetimi: Satışlarını Artıracak 7 Strateji
              </Link>
              <Link
                href="/blog/pazaryeri-karsilastirma"
                className="block text-orange-600 hover:underline text-sm"
              >
                → Trendyol vs Hepsiburada vs N11 vs Amazon TR: Hangi Pazaryeri Doğru?
              </Link>
              <Link
                href="/blog/trendyol-magaza-acma-rehberi"
                className="block text-orange-600 hover:underline text-sm"
              >
                → Trendyol'da Mağaza Nasıl Açılır? 2026 Adım Adım Rehber
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
