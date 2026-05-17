import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Amazon Türkiye'de Satıcı Olma Rehberi 2026",
  description:
    "Amazon TR'de satıcı hesabı açma, FBA kullanımı, komisyon oranları ve Trendyol ile farkları. Türkiye'nin en hızlı büyüyen pazaryerinde yerinizi alın.",
  keywords: [
    "amazon türkiye satıcı olma",
    "amazon tr mağaza açma",
    "amazon satıcı hesabı türkiye",
    "amazon fba türkiye",
  ],
  openGraph: {
    title: "Amazon Türkiye'de Satıcı Olma Rehberi 2026",
    description:
      "Amazon TR'de satıcı hesabı açma, FBA kullanımı ve komisyon oranları.",
    type: "article",
    publishedTime: "2026-04-28",
  },
};

const steps = [
  {
    num: "1",
    title: "Amazon Seller Central'a Git",
    desc: 'Amazon TR\'nin "Satıcı Ol" sayfasına git. Bireysel veya Profesyonel hesap tipini seç. Profesyonel hesap aylık sabit ücret alır ama sınırsız ürün listeleme sunar.',
  },
  {
    num: "2",
    title: "Hesap Bilgilerini Gir",
    desc: "E-posta, şirket adı, iletişim bilgileri ve kredi kartı bilgilerini sisteme gir. Amazon kimlik doğrulama için ek belgeler isteyebilir.",
  },
  {
    num: "3",
    title: "Kimlik ve Şirket Doğrulamasını Tamamla",
    desc: "Amazon, kimlik belgesi ve vergi numarasını doğrulamak için video görüşmesi veya belge yükleme talep edebilir. Bu adım diğer platformlara göre daha kapsamlı.",
  },
  {
    num: "4",
    title: "Banka Hesabını Tanımla",
    desc: "Ödeme almak için Türk bankasındaki şirket hesabını Amazon sistemine ekle. IBAN doğrulaması yapılacak.",
  },
  {
    num: "5",
    title: "İlk Ürünleri Listele",
    desc: "Seller Central üzerinden ürünlerini ekle. Yeni ürün mü yoksa mevcut ASIN'e mi ekliyorsun, buna göre süreç farklılaşıyor.",
  },
  {
    num: "6",
    title: "FBA veya FBM Seç",
    desc: "Ürünleri Amazon deposuna gönderip FBA ile sat ya da kendi depondan gönder (FBM). FBA Prime rozeti kazandırır ve satışları artırır.",
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
          Amazon Türkiye'de Satıcı Olma Rehberi 2026
        </h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
          <span>28 Nisan 2026</span>
          <span>·</span>
          <span>10 dk okuma</span>
          <span>·</span>
          <span>SatıcıPilot Ekibi</span>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
          <p className="text-lg text-gray-600 font-medium">
            Amazon Türkiye, 2018'de açıldığından bu yana hızla büyüyor. Global Amazon altyapısının
            getirdiği güven, Prime üyelik sistemi ve FBA lojistiği ile Türk satıcılara güçlü fırsatlar
            sunuyor. İşte Amazon TR'de satıcı olmak için bilmen gereken her şey.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">Amazon TR'nin Avantajı</p>
            <p className="text-sm text-blue-700">
              Amazon Türkiye'de satış yapmak, ileride global Amazon pazarlarına (Avrupa, ABD) açılmak
              için de bir köprü sunuyor. Aynı Seller Central altyapısını kullanıyorsun.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Amazon TR'nin Avantajları</h2>

          <ul className="space-y-3 pl-4 list-disc">
            <li>
              <strong>Global marka güveni</strong> — tüketicilerin Amazon'a duyduğu güven satın alma
              kararını kolaylaştırır
            </li>
            <li>
              <strong>FBA lojistik altyapısı</strong> — Amazon deposuna gönder, kargo ve iadeyi
              Amazon yönetir
            </li>
            <li>
              <strong>Prime rozeti</strong> — FBA kullanan satıcılar Prime rozeti alır, dönüşüm
              oranı yükselir
            </li>
            <li>
              <strong>Reklam araçları</strong> — Sponsored Products, Sponsored Brands ile hedefli
              reklam verebilirsin
            </li>
            <li>
              <strong>Yorum sistemi</strong> — Amazon'un güçlü yorum ekosistemi güvenilir satış
              ortamı yaratıyor
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            Bireysel vs Profesyonel Hesap
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border border-gray-200 font-semibold">Özellik</th>
                  <th className="text-left p-3 border border-gray-200 font-semibold">Bireysel</th>
                  <th className="text-left p-3 border border-gray-200 font-semibold">
                    Profesyonel
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Aylık ücret", "Yok", "~₺500/ay"],
                  ["Ürün başına ek ücret", "₺1 / satış", "Yok"],
                  ["Ürün limiti", "40/ay", "Sınırsız"],
                  ["Toplu yükleme", "Hayır", "Evet"],
                  ["Reklam araçları", "Kısıtlı", "Tam erişim"],
                  ["Buy Box rekabeti", "Düşük öncelik", "Öncelikli"],
                ].map(([feature, individual, professional]) => (
                  <tr key={feature} className="border-b border-gray-200">
                    <td className="p-3 border border-gray-200 font-medium text-gray-700">
                      {feature}
                    </td>
                    <td className="p-3 border border-gray-200 text-gray-600">{individual}</td>
                    <td className="p-3 border border-gray-200 text-gray-600">{professional}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-green-800 mb-1">Öneri</p>
            <p className="text-sm text-green-800">
              Ayda 40'tan fazla satış hedefliyorsan Profesyonel hesap daha avantajlı. Başlangıçta
              Bireysel ile deneyip büyüdükten sonra geçebilirsin.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Gerekli Belgeler</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Kimlik belgesi veya pasaport",
              "Şirket vergi numarası",
              "Şirket adres belgesi",
              "Banka hesap bilgisi (IBAN)",
              "Kredi kartı bilgisi",
              "Telefon numarası (doğrulama için)",
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
            Amazon'un doğrulama süreci diğer platformlara kıyasla daha uzun sürebiliyor:{" "}
            <strong>5-14 iş günü</strong>. Kimlik doğrulama aşamasında hazırlıklı ol.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            Komisyon Oranları (Referral Fee)
          </h2>

          <p>
            Amazon, "Referral Fee" adını verdiği satış komisyonu alıyor. Aşağıda Amazon TR için
            2026 yılı genel kategori oranları:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border border-gray-200 font-semibold">Kategori</th>
                  <th className="text-left p-3 border border-gray-200 font-semibold">
                    Referral Fee
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Giyim & Aksesuar", "%15"],
                  ["Elektronik", "%8"],
                  ["Kitap", "%15"],
                  ["Oyuncak & Oyun", "%15"],
                  ["Güzellik & Kişisel Bakım", "%15"],
                  ["Ev & Mutfak", "%15"],
                  ["Spor & Outdoor", "%15"],
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
            * FBA kullanıyorsan depolama ve gönderim ücretleri ayrıca ekleniyor. Güncel FBA tarife
            tablosu için Seller Central'ı kontrol et.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">FBA Nedir ve Nasıl Çalışır?</h2>

          <p>
            FBA (Fulfillment by Amazon), ürünlerini Amazon'un Türkiye deposuna gönderdiğinde
            depolama, paketleme, kargo ve iade yönetiminin Amazon tarafından üstlenildiği hizmet.
          </p>

          <div className="space-y-3">
            {[
              {
                title: "Prime Rozeti Kazan",
                desc: "FBA kullanan satıcılar otomatik olarak Prime rozeti alır. Prime üyeleri önce Prime ürünleri görür.",
              },
              {
                title: "Kargo Derdi Biter",
                desc: "Paketleme, etiketleme, kargo takibi ve iade süreçleri tamamen Amazon tarafından yönetilir.",
              },
              {
                title: "Buy Box Avantajı",
                desc: "FBA kullanan satıcılar Buy Box rekabetinde öne geçer. Bu da organik satışları artırır.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-4 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <p className="font-semibold text-gray-900 text-sm mb-1">{item.title}</p>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            Amazon TR vs Trendyol: Temel Farklar
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border border-gray-200 font-semibold">Özellik</th>
                  <th className="text-left p-3 border border-gray-200 font-semibold">Amazon TR</th>
                  <th className="text-left p-3 border border-gray-200 font-semibold">Trendyol</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Müşteri kitlesi", "Bilinçli alıcı", "Genç, hızlı alıcı"],
                  ["Onay süresi", "5-14 iş günü", "3-7 iş günü"],
                  ["Lojistik seçeneği", "FBA / FBM", "Trendyol Express"],
                  ["Komisyon (giyim)", "%15", "%18-22"],
                  ["Reklam altyapısı", "Çok gelişmiş", "Gelişmekte"],
                  ["Global erişim", "Evet (ilerleyen adımlar)", "Hayır"],
                ].map(([feature, amazon, trendyol]) => (
                  <tr key={feature} className="border-b border-gray-200">
                    <td className="p-3 border border-gray-200 font-medium text-gray-700">
                      {feature}
                    </td>
                    <td className="p-3 border border-gray-200 text-gray-600">{amazon}</td>
                    <td className="p-3 border border-gray-200 text-gray-600">{trendyol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Dikkat Edilmesi Gerekenler</h2>

          <div className="space-y-3">
            {[
              {
                err: "Hesap askıya alınma riski",
                fix: "Amazon politika ihlallerinde hesabı askıya alır. Satıcı politikalarını baştan iyi oku, iade oranını düşük tut.",
              },
              {
                err: "FBA depolama maliyetleri",
                fix: "Çok fazla stok Amazon deposunda beklerse depolama ücretleri birikir. Talep tahminine dikkat et.",
              },
              {
                err: "Yorum manipülasyonu",
                fix: "Amazon sahte yorum tespitinde çok katı. Misafir yorumu veya satın alınmış yorum hesap kapatılmasına yol açar.",
              },
              {
                err: "Ürün kısıtlamaları",
                fix: "Bazı kategoriler (sağlık, elektrik) için önceden Amazon onayı gerekiyor. Satmadan önce kontrol et.",
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
            <h3 className="font-bold text-gray-900 mb-2">
              Amazon TR Mağazanı SatıcıPilot ile Yönet
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              SatıcıPilot yakında Amazon Türkiye entegrasyonunu sunacak. Tüm pazaryerlerini tek
              panelden izle: yorum takibi, fiyat analizi, stok uyarıları ve AI destekli öneriler.
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
