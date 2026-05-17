import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Çiçeksepeti'nde Satıcı Olma Rehberi 2026",
  description:
    "Çiçeksepeti'nde mağaza açmak için gereken belgeler, başvuru adımları, komisyon oranları ve özel gün kampanyaları. Hızlı büyüyen platformda yerinizi alın.",
  keywords: [
    "çiçeksepeti satıcı olma",
    "çiçeksepeti mağaza açma",
    "çiçeksepeti satış yapma",
    "çiçeksepeti satıcı başvurusu",
  ],
  openGraph: {
    title: "Çiçeksepeti'nde Satıcı Olma Rehberi 2026",
    description:
      "Çiçeksepeti'nde mağaza açmak için gereken belgeler, başvuru adımları ve komisyon oranları.",
    type: "article",
    publishedTime: "2026-04-25",
  },
};

const steps = [
  {
    num: "1",
    title: "Şirket veya Şahıs İşletmesi Kur",
    desc: "Çiçeksepeti'nde satış yapmak için aktif vergi mükellefi olman gerekiyor. Şahıs şirketi, limited veya anonim şirketle başvurabilirsin.",
  },
  {
    num: "2",
    title: "Çiçeksepeti Satıcı Başvurusunu Tamamla",
    desc: 'Çiçeksepeti\'nin resmi "Satıcı Ol" sayfasında formu doldur. Satmak istediğin kategorileri, iletişim bilgilerini ve banka hesabını gir.',
  },
  {
    num: "3",
    title: "Gerekli Belgeleri Yükle",
    desc: "Vergi levhası, imza sirküleri (şirket ise) ve banka hesap bilgilerini sisteme yükle. Belgeler dijital olarak inceleniyor.",
  },
  {
    num: "4",
    title: "Kategori Onayı Al",
    desc: "Çiçeksepeti bazı kategoriler için ek onay talep edebiliyor. Özellikle canlı çiçek ve gıda kategorilerinde ek belgeler gerekebilir.",
  },
  {
    num: "5",
    title: "Mağaza Profilini Oluştur",
    desc: "Mağaza adı, logo ve tanıtım görseli ekle. Hediye & özel gün temalı bir profil, platform kitlesine uyum sağlar.",
  },
  {
    num: "6",
    title: "İlk Ürünleri Ekle",
    desc: "Özel gün temalı ürünlerinle başla. Anneler Günü, Sevgililer Günü, doğum günü gibi hediye paketi seçeneklerini öne çıkar.",
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
          Çiçeksepeti'nde Satıcı Olma Rehberi 2026
        </h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
          <span>25 Nisan 2026</span>
          <span>·</span>
          <span>8 dk okuma</span>
          <span>·</span>
          <span>SatıcıPilot Ekibi</span>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
          <p className="text-lg text-gray-600 font-medium">
            Çiçeksepeti, başlangıçta bir çiçek platformu olarak kurulan ancak bugün çok daha geniş
            bir kategori yelpazesiyle Türkiye'nin en hızlı büyüyen e-ticaret platformlarından biri
            hâline gelen bir pazaryeri. Hediye ekonomisi ve özel gün alışverişlerinde rakipsiz bir
            konuma sahip.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">Neden Çiçeksepeti?</p>
            <p className="text-sm text-blue-700">
              Çiçeksepeti kullanıcıları genellikle belirli bir amaçla alışveriş yapıyor: bir hediye
              almak, özel bir gün kutlamak, sevdiklerini mutlu etmek. Bu niyet odaklı alışveriş,
              dönüşüm oranlarını diğer platformların üzerine çıkarıyor.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            Çiçeksepeti'nin Büyüme Hikayesi
          </h2>

          <p>
            2011 yılında kurulan Çiçeksepeti, başta çiçek teslimatı platformuyken bugün milyonlarca
            SKU ile tam bir pazaryerine dönüştü. 2020 sonrasında kozmetik, ev dekorasyon, kişisel
            bakım ve elektronik kategorilerine de açılan platform, genç ve satın alma gücü yüksek
            bir kitleye ulaşıyor. Özel günlerde (Anneler Günü, Sevgililer Günü, 8 Mart) yaşanan
            trafik patlamaları satıcılar için büyük fırsatlar yaratıyor.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Hangi Ürünler Satar?</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { cat: "Çiçek & Bitki", note: "Platform'un çekirdeği, yüksek hacim" },
              { cat: "Hediyelik Eşya", note: "Kişiselleştirilebilir ürünler öne çıkıyor" },
              { cat: "Ev Dekorasyon", note: "Bohem, minimalist tasarımlar popüler" },
              { cat: "Kişisel Bakım", note: "Doğal ve organik ürünler yükseliyor" },
              { cat: "Çikolata & Lezzet", note: "Özel gün sepetlerinde vazgeçilmez" },
              { cat: "Elektronik Aksesuarlar", note: "Niş ve hediyeye uygun ürünler" },
            ].map((item) => (
              <div
                key={item.cat}
                className="p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <p className="text-sm font-semibold text-gray-800">{item.cat}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Gerekli Belgeler</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Vergi levhası (şahıs/şirket)",
              "İmza sirküleri veya ticaret sicil belgesi",
              "Banka hesabı IBAN bilgisi",
              "Kimlik fotokopisi",
              "İletişim bilgileri (e-posta, telefon)",
              "Ürün kategorisine göre ek belge (gıda vb.)",
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
            Başvuru değerlendirme süresi genellikle <strong>3-7 iş günü</strong>. Kategori bazlı
            ek onay gereken durumlarda bu süre uzayabiliyor.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Komisyon Oranları</h2>

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
                  ["Çiçek & Bitki", "%20-25"],
                  ["Hediyelik Eşya", "%15-20"],
                  ["Ev Dekorasyon", "%14-18"],
                  ["Kişisel Bakım", "%12-16"],
                  ["Çikolata & Gıda", "%15-18"],
                  ["Elektronik Aksesuarlar", "%8-12"],
                  ["Oyuncak & Bebek", "%12-15"],
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
            * Komisyon oranları periyodik olarak güncellenir. Güncel oranlar için Çiçeksepeti
            Satıcı Portalı'nı kontrol et.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            Çiçeksepeti'ne Özgü İpuçları
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="font-semibold text-green-900 mb-2">Özel Gün Kampanyaları</p>
              <p className="text-sm text-green-800">
                Çiçeksepeti'nde takvim senin en güçlü silahın. Anneler Günü, Sevgililer Günü,
                8 Mart Kadınlar Günü, Öğretmenler Günü gibi özel günlerde trafik 5-10x artıyor.
                Bu günlere özel ürün paketleri ve kampanyalar hazırlamak çok yüksek dönüşüm
                sağlıyor. Kampanyalara en az 2 hafta öncesinden hazırlan.
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="font-semibold text-blue-900 mb-2">Gifting Economy'ye Uyan Ürünler</p>
              <p className="text-sm text-blue-800">
                Çiçeksepeti alıcısı genellikle kendisi için değil, başkası için alıyor. Ürün
                başlığında ve açıklamada "hediye", "sürpriz", "sevgiliye hediye", "annene hediye"
                gibi ifadeler kullan. Hediye paketi seçeneği sunmak dönüşümü ciddi ölçüde artırıyor.
              </p>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <p className="font-semibold text-orange-900 mb-2">Hız Önemli</p>
              <p className="text-sm text-orange-800">
                Özellikle çiçek ve hediyelik kategorisinde alıcılar genellikle son dakikaya
                bırakıyor. Aynı gün veya ertesi gün teslimat seçeneği sunmak büyük avantaj.
                Kargo süresini ürün sayfasında açıkça belirt.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Dikkat Edilmesi Gerekenler</h2>

          <div className="space-y-3">
            {[
              {
                err: "Özel gün stokunu hazırlamamak",
                fix: "Anneler Günü gibi yoğun dönemlerde stok tükenirse çok ciddi satış kaybı yaşanır. Talep tahmini çok kritik.",
              },
              {
                err: "Düşük kaliteli ürün görseli",
                fix: "Çiçeksepeti alıcısı duygusal bir satın alım yapıyor. Görseller duygusal ve yüksek kaliteli olmalı.",
              },
              {
                err: "Yorumları ihmal etmek",
                fix: "Hediye satan bir platformda yorum puanı satın alma kararında çok belirleyici. Her yoruma yanıt ver.",
              },
              {
                err: "Teslimat süresini yanlış belirtmek",
                fix: "Hediye alan kişi genellikle tarihe bağlı alıyor. Yanlış teslimat süresi hem iade hem olumsuz yorum demek.",
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
              Çiçeksepeti Mağazanı SatıcıPilot ile Yönet
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              SatıcıPilot yakında Çiçeksepeti entegrasyonunu sunacak. Özel gün takibi, stok
              uyarıları, yorum analizi ve tüm pazaryerlerini tek panelden yönet.
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
                href="/blog/n11-magaza-acma"
                className="block text-orange-600 hover:underline text-sm"
              >
                → N11'de Mağaza Nasıl Açılır? Satıcı Rehberi 2026
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
