import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "N11'de Mağaza Nasıl Açılır? Satıcı Rehberi 2026",
  description:
    "N11'de satıcı olmak için gereken belgeler, başvuru adımları, komisyon oranları ve ürün listeleme ipuçları. 30 milyon üyeye ulaşmak için 2026 güncel rehber.",
  keywords: [
    "n11 mağaza açma",
    "n11 satıcı olma",
    "n11 satış yapma",
    "n11 satıcı kaydı",
  ],
  openGraph: {
    title: "N11'de Mağaza Nasıl Açılır? Satıcı Rehberi 2026",
    description:
      "N11'de satıcı olmak için gereken belgeler, başvuru adımları ve komisyon oranları.",
    type: "article",
    publishedTime: "2026-05-01",
  },
};

const steps = [
  {
    num: "1",
    title: "Şirket veya Şahıs İşletmesi Kur",
    desc: "N11'de satış yapmak için vergi mükellefi olman gerekiyor. Şahıs şirketi en hızlı ve ekonomik seçenek. Vergi dairesine kayıt yaptırarak birkaç gün içinde başlayabilirsin.",
  },
  {
    num: "2",
    title: "N11 Satıcı Portalına Başvur",
    desc: 'N11\'in resmi "Mağaza Aç" sayfasından online başvurunu tamamla. Şirket bilgilerini, iletişim adresini ve banka IBAN\'ını gir.',
  },
  {
    num: "3",
    title: "Gerekli Belgeleri Yükle",
    desc: "Vergi levhası, imza sirküleri (şirket ise) ve banka hesap bilgilerini sisteme yükle. Tüm belgeler dijital ortamda işleniyor.",
  },
  {
    num: "4",
    title: "Sözleşme Onayla ve Komisyon Oranlarını İncele",
    desc: "N11 ile satıcı sözleşmesini dijital olarak imzala. Bu aşamada kategorine özel komisyon oranlarını dikkatlice oku.",
  },
  {
    num: "5",
    title: "Mağaza Adını ve Logonu Belirle",
    desc: "Marka kimliğini oluşturacak mağaza adını seç. Logo ve kapak görseli eklemek müşteri güvenini artırır.",
  },
  {
    num: "6",
    title: "Ürünleri Listele ve Yayına Al",
    desc: "İlk 10-15 ürününü ekle. Başlık, açıklama ve görsel kalitesine özen göster. Doğru kategori seçimi arama görünürlüğünü artırır.",
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
          N11'de Mağaza Nasıl Açılır? Satıcı Rehberi 2026
        </h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
          <span>1 Mayıs 2026</span>
          <span>·</span>
          <span>8 dk okuma</span>
          <span>·</span>
          <span>SatıcıPilot Ekibi</span>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
          <p className="text-lg text-gray-600 font-medium">
            N11, Türkiye'nin en köklü e-ticaret platformlarından biri. 30 milyonun üzerinde kayıtlı
            üyesiyle Türk satıcılar için hâlâ güçlü bir satış kanalı sunuyor. Giyimden elektroniğe,
            ev eşyasından kozmetiğe geniş bir kategori yelpazesinde satış yapabilirsin.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">N11 Hakkında</p>
            <p className="text-sm text-blue-700">
              N11, Samsung ve Doğuş Grubu ortaklığıyla kurulan ve sonradan Türkiye'de yerleşik
              yatırımcılara geçen köklü bir platform. 2013'ten bu yana milyonlarca alışverişe aracılık
              ediyor ve yüksek taksit desteğiyle bilinçli alıcı kitlesine ulaşıyor.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">N11'de Satıcı Olmanın Avantajları</h2>

          <ul className="space-y-3 pl-4 list-disc">
            <li>
              <strong>30 milyon+ üye</strong> — köklü ve sadık bir alıcı kitlesi
            </li>
            <li>
              <strong>Taksit desteği</strong> — 12 aya varan taksit imkânı sepet ortalamasını artırıyor
            </li>
            <li>
              <strong>Kampanya sistemi</strong> — N11 Süper Fırsatlar ve kategori bazlı kampanyalara
              katılabilirsin
            </li>
            <li>
              <strong>Düşük onay eşiği</strong> — başvuru süreci Trendyol'a kıyasla daha az belge
              istiyor
            </li>
            <li>
              <strong>Geniş kategori yelpazesi</strong> — niş ürünlerde rakibin daha az olabiliyor
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Gerekli Belgeler</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Vergi levhası (şahıs/şirket)",
              "İmza sirküleri veya ticaret sicil belgesi",
              "Şirket banka hesabı IBAN bilgisi",
              "Kimlik fotokopisi",
              "İletişim bilgileri (e-posta, telefon)",
              "Mağaza logosu (opsiyonel ama önerilir)",
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
            Başvuru değerlendirme süresi genellikle <strong>3-7 iş günü</strong>. Belgeler eksiksizse
            bu süre kısalabiliyor. Onay durumu e-posta ile bildiriliyor.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Komisyon Oranları</h2>

          <p>
            N11 komisyon oranları kategoriye göre değişiyor. Aşağıda 2026 yılı genel aralıkları
            yer alıyor:
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
                  ["Giyim & Aksesuar", "%17-22"],
                  ["Kozmetik & Kişisel Bakım", "%12-16"],
                  ["Ev & Yaşam", "%13-18"],
                  ["Spor & Outdoor", "%10-14"],
                  ["Oyuncak", "%10-13"],
                  ["Kitap & Hobi", "%8-12"],
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
            * Komisyon oranları değişkendir. Güncel oranlar için N11 Satıcı Portalı'nı kontrol et.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">N11'e Özgü Özellikler</h2>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="font-semibold text-green-900 mb-1">Kampanya Sistemi</p>
              <p className="text-sm text-green-800">
                N11, düzenli "Süper Fırsatlar" ve özel gün kampanyaları düzenliyor. Bu kampanyalara
                ürünlerini dahil etmek görünürlüğünü ve satışını önemli ölçüde artırıyor. Kampanya
                takvimini önceden takip et ve stokunu buna göre hazırla.
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="font-semibold text-blue-900 mb-1">Taksit Desteği</p>
              <p className="text-sm text-blue-800">
                N11'de 12 aya varan taksit seçenekleri sunulabiliyor. Yüksek fiyatlı ürünlerde
                taksit imkânı dönüşüm oranını ciddi ölçüde artırıyor. Taksit seçeneklerini aktif
                etmeyi unutma.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Ürün Listeleme İpuçları</h2>

          <ul className="space-y-3 pl-4 list-disc">
            <li>
              <strong>Başlık formatı:</strong> Marka + Model + Özellik + Beden/Renk (uygulanabilirse)
            </li>
            <li>
              <strong>Açıklamaları zengin tut:</strong> Malzeme, boyut, kullanım talimatları ve
              ürün hikayesi ekle
            </li>
            <li>
              <strong>En az 5 görsel:</strong> ön yüz, arka yüz, detay, kullanım, ambalaj
            </li>
            <li>
              <strong>Fiyatı doğru belirle:</strong> N11 rakip fiyat karşılaştırmasını müşteriye
              gösterir, rekabetçi ol
            </li>
            <li>
              <strong>Kargo bilgisini belirt:</strong> ücretsiz kargo veya tahmini teslimat süresi
              dönüşümü artırır
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Sık Yapılan Hatalar</h2>

          <div className="space-y-3">
            {[
              {
                err: "Yanlış kategori seçimi",
                fix: "Ürünü yanlış kategoriye eklemek hem arama sıralamasını hem de komisyon hesaplamalarını etkiler.",
              },
              {
                err: "Stok takibini ihmal etmek",
                fix: "Tükenen ürünler açık kaldığında iptal oranı artar ve mağaza puanı düşer.",
              },
              {
                err: "Müşteri sorularını yanıtsız bırakmak",
                fix: "N11'de soru-cevap bölümü alıcılar için önemli. 12 saat içinde yanıt hedefle.",
              },
              {
                err: "Kampanyalara katılmamak",
                fix: "N11'de organik görünürlük kampanyaya katılan ürünlere göre çok daha düşük.",
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

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mt-10">
            <h3 className="font-bold text-gray-900 mb-2">N11 Mağazanı SatıcıPilot ile Yönet</h3>
            <p className="text-sm text-gray-600 mb-4">
              SatıcıPilot yakında N11 entegrasyonunu sunacak. Tüm pazaryerlerini tek panelden
              takip et: yorum analizi, fiyat izleme, stok uyarıları ve AI destekli öneriler.
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
              <Link
                href="/blog/hepsiburada-magaza-acma"
                className="block text-orange-600 hover:underline text-sm"
              >
                → Hepsiburada'da Mağaza Açma ve Satıcı Olma Rehberi (2026)
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
