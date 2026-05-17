import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trendyol vs Hepsiburada vs N11 vs Amazon TR: Hangi Pazaryeri Doğru? (2026)",
  description:
    "Türkiye'nin 4 büyük pazaryerini komisyon, müşteri kitlesi, onay süresi ve kategori gücüne göre karşılaştırdık. Hangi platformla başlamalısın?",
  keywords: [
    "trendyol hepsiburada karşılaştırma",
    "hangi pazaryeri daha iyi",
    "pazaryeri seçimi türkiye",
    "e-ticaret platform karşılaştırma",
  ],
  openGraph: {
    title: "Trendyol vs Hepsiburada vs N11 vs Amazon TR: Hangi Pazaryeri Doğru? (2026)",
    description:
      "Türkiye'nin 4 büyük pazaryerini karşılaştırdık. Komisyon, müşteri kitlesi, kategori gücü ve zorluk seviyesine göre doğru platformu seç.",
    type: "article",
    publishedTime: "2026-05-14",
  },
};

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
          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
            Karşılaştırma
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
          Trendyol vs Hepsiburada vs N11 vs Amazon TR: Hangi Pazaryeri Doğru? (2026)
        </h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
          <span>14 Mayıs 2026</span>
          <span>·</span>
          <span>12 dk okuma</span>
          <span>·</span>
          <span>SatıcıPilot Ekibi</span>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
          <p className="text-lg text-gray-600 font-medium">
            Türkiye'de e-ticarete başlamak isteyen satıcıların önünde 4 büyük pazaryeri var:
            Trendyol, Hepsiburada, N11 ve Amazon TR. Her biri farklı bir müşteri kitlesine,
            kategori gücüne ve komisyon yapısına sahip. Hangisiyle başlamalısın? İşte veri odaklı
            bir rehber.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">Kısa Yanıt</p>
            <p className="text-sm text-blue-700">
              Moda ve giyim satıyorsan Trendyol, elektronik satıyorsan Hepsiburada veya Amazon TR,
              hediye ve özel gün ürünleri satıyorsan Çiçeksepeti ile başla. Uzun vadede hepsinde
              olman gerekiyor.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Büyük Karşılaştırma Tablosu</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border border-gray-200 font-semibold">Platform</th>
                  <th className="text-left p-3 border border-gray-200 font-semibold">
                    Aylık Ziyaretçi
                  </th>
                  <th className="text-left p-3 border border-gray-200 font-semibold">
                    Komisyon (ort.)
                  </th>
                  <th className="text-left p-3 border border-gray-200 font-semibold">
                    Onay Süresi
                  </th>
                  <th className="text-left p-3 border border-gray-200 font-semibold">
                    Güçlü Kategori
                  </th>
                  <th className="text-left p-3 border border-gray-200 font-semibold">Zorluk</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Trendyol", "250M+", "%5-22", "3-7 gün", "Moda, Giyim", "Orta"],
                  ["Hepsiburada", "80M+", "%5-22", "3-10 gün", "Elektronik, Beyaz Eşya", "Orta"],
                  ["N11", "30M+", "%5-22", "3-7 gün", "Genel, Çok Kategorili", "Kolay"],
                  ["Amazon TR", "50M+", "%8-15", "5-14 gün", "Elektronik, Kitap", "Yüksek"],
                  ["Çiçeksepeti", "20M+", "%8-25", "3-7 gün", "Hediye, Dekorasyon", "Kolay"],
                ].map(([platform, visitors, commission, approval, category, difficulty]) => (
                  <tr key={platform} className="border-b border-gray-200">
                    <td className="p-3 border border-gray-200 font-semibold text-gray-900">
                      {platform}
                    </td>
                    <td className="p-3 border border-gray-200 text-gray-600">{visitors}</td>
                    <td className="p-3 border border-gray-200 font-medium text-orange-600">
                      {commission}
                    </td>
                    <td className="p-3 border border-gray-200 text-gray-600">{approval}</td>
                    <td className="p-3 border border-gray-200 text-gray-600">{category}</td>
                    <td className="p-3 border border-gray-200 text-gray-600">{difficulty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            Trendyol: Hacim ve Hız Platformu
          </h2>

          <p>
            Trendyol, Türkiye'nin açık ara en büyük e-ticaret platformu. Aylık 250 milyonun
            üzerinde ziyaretçisiyle rakipsiz bir trafik kaynağı. Özellikle 18-35 yaş arası, mobil
            alışverişe alışkın kadın alıcı kitlesine hükmediliyor.
          </p>

          <div className="space-y-2 pl-4">
            <p className="text-sm">
              <strong>Güçlü olduğu yer:</strong> Kadın giyim, erkek giyim, ayakkabı, aksesuar,
              spor giyim
            </p>
            <p className="text-sm">
              <strong>Avantaj:</strong> En yüksek trafik, en hızlı satış döngüsü, güçlü kampanya
              takvimi
            </p>
            <p className="text-sm">
              <strong>Dezavantaj:</strong> Moda kategorisinde rekabet çok yüksek, fiyat baskısı
              sürekli
            </p>
            <p className="text-sm">
              <strong>Kim için ideal:</strong> Moda, giyim, aksesuar, kozmetik satıcıları
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            Hepsiburada: Güven ve Elektronik Platformu
          </h2>

          <p>
            Hepsiburada, Türkiye e-ticaretinin köklü ve güvenilir platformu. Özellikle 30-50 yaş
            arası, araştırarak alışveriş yapan, bilinçli tüketicilere ulaşıyor. Elektronik ve
            beyaz eşya kategorilerinde Trendyol'dan daha güçlü.
          </p>

          <div className="space-y-2 pl-4">
            <p className="text-sm">
              <strong>Güçlü olduğu yer:</strong> Elektronik, beyaz eşya, bilişim, ev aletleri
            </p>
            <p className="text-sm">
              <strong>Avantaj:</strong> HepsiJet lojistik altyapısı, köklü marka güveni, yüksek
              sepet ortalaması
            </p>
            <p className="text-sm">
              <strong>Dezavantaj:</strong> Trendyol'a kıyasla daha düşük trafik, onay süreci biraz
              daha uzun
            </p>
            <p className="text-sm">
              <strong>Kim için ideal:</strong> Elektronik, beyaz eşya, teknoloji satıcıları
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">N11: Başlangıç için Erişilebilir Platform</h2>

          <p>
            N11, 30 milyon üyesiyle Türkiye'nin köklü platformlarından biri. Rekabet Trendyol kadar
            yoğun olmadığından başlangıç için daha erişilebilir bir ortam sunuyor. Geniş kategori
            yelpazesi her türlü satıcıya alan açıyor.
          </p>

          <div className="space-y-2 pl-4">
            <p className="text-sm">
              <strong>Güçlü olduğu yer:</strong> Niş ürünler, genel kategori, küçük satıcılar
            </p>
            <p className="text-sm">
              <strong>Avantaj:</strong> Düşük giriş eşiği, taksit desteği, niş ürünlerde az
              rakip
            </p>
            <p className="text-sm">
              <strong>Dezavantaj:</strong> Trendyol ve Hepsiburada'ya kıyasla daha düşük trafik
            </p>
            <p className="text-sm">
              <strong>Kim için ideal:</strong> Niş ürün satıcıları, e-ticarete yeni başlayanlar
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            Amazon TR: Global Altyapı, Yüksek Giriş Eşiği
          </h2>

          <p>
            Amazon Türkiye, global Amazon altyapısının sunduğu avantajlarla öne çıkıyor. FBA
            lojistik sistemi, Prime rozeti ve güçlü reklam araçları ciddi satış potansiyeli
            yaratıyor. Ancak hesap onay süreci ve politika uyumu diğer platformlara göre daha
            titiz.
          </p>

          <div className="space-y-2 pl-4">
            <p className="text-sm">
              <strong>Güçlü olduğu yer:</strong> Elektronik, kitap, oyuncak, ev & mutfak
            </p>
            <p className="text-sm">
              <strong>Avantaj:</strong> FBA, Prime rozeti, küresel marka, güçlü reklam sistemi
            </p>
            <p className="text-sm">
              <strong>Dezavantaj:</strong> En zorlu onay süreci, hesap askıya alınma riski yüksek
            </p>
            <p className="text-sm">
              <strong>Kim için ideal:</strong> Marka sahipleri, elektronik ve kitap satıcıları
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            Hangi Platformla Başlamalıyım?
          </h2>

          <p>
            Cevap ürününe ve hedefine göre değişiyor. Aşağıdaki karar ağacını takip et:
          </p>

          <div className="space-y-3">
            {[
              {
                cond: "Moda, giyim veya aksesuar satıyorsan",
                rec: "Trendyol ile başla",
                note: "En yüksek trafik ve en aktif alıcı kitlesi burada.",
                color: "orange",
              },
              {
                cond: "Elektronik veya beyaz eşya satıyorsan",
                rec: "Hepsiburada veya Amazon TR",
                note: "Bu kategorilerde bilinçli alıcı profili ve yüksek sepet değeri var.",
                color: "blue",
              },
              {
                cond: "Hediye, dekorasyon veya özel gün ürünleri satıyorsan",
                rec: "Çiçeksepeti ile başla",
                note: "Niyet odaklı alışveriş yüksek dönüşüm sağlıyor.",
                color: "green",
              },
              {
                cond: "Niş ürünlerin var ve rekabetten kaçınmak istiyorsan",
                rec: "N11'i düşün",
                note: "Rekabet yoğunluğu diğer platformlara göre daha düşük.",
                color: "gray",
              },
              {
                cond: "Marka sahibi olarak büyümek istiyorsan",
                rec: "Amazon TR + Trendyol kombinasyonu",
                note: "Her ikisi de marka oluşturma için güçlü altyapı sunuyor.",
                color: "blue",
              },
            ].map((item) => (
              <div
                key={item.cond}
                className={`p-4 rounded-xl border ${
                  item.color === "orange"
                    ? "bg-orange-50 border-orange-200"
                    : item.color === "blue"
                    ? "bg-blue-50 border-blue-200"
                    : item.color === "green"
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <p
                  className={`text-sm font-semibold mb-1 ${
                    item.color === "orange"
                      ? "text-orange-900"
                      : item.color === "blue"
                      ? "text-blue-900"
                      : item.color === "green"
                      ? "text-green-900"
                      : "text-gray-900"
                  }`}
                >
                  {item.cond}
                </p>
                <p
                  className={`text-sm font-bold mb-0.5 ${
                    item.color === "orange"
                      ? "text-orange-800"
                      : item.color === "blue"
                      ? "text-blue-800"
                      : item.color === "green"
                      ? "text-green-800"
                      : "text-gray-800"
                  }`}
                >
                  → {item.rec}
                </p>
                <p
                  className={`text-xs ${
                    item.color === "orange"
                      ? "text-orange-700"
                      : item.color === "blue"
                      ? "text-blue-700"
                      : item.color === "green"
                      ? "text-green-700"
                      : "text-gray-600"
                  }`}
                >
                  {item.note}
                </p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Çoklu Platform Stratejisi</h2>

          <p>
            Uzun vadede başarılı satıcılar tek bir platformda kalmıyor. Her platformun farklı
            müşteri kitlesi var ve bu kitlelerin örtüşme oranı düşük. Yani Trendyol'da sattığın
            müşteri büyük ihtimalle Hepsiburada'da alışveriş yapıyor ve seni göremiyor.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-green-800 mb-2">Çoklu Platform Avantajları</p>
            <ul className="space-y-1.5 pl-4 list-disc text-sm text-green-800">
              <li>Tek platform krizine karşı risk dağılımı</li>
              <li>Daha geniş müşteri kitlesine erişim</li>
              <li>Rakip analizi için cross-platform veri</li>
              <li>Daha yüksek toplam ciro potansiyeli</li>
              <li>Platform komisyon değişikliklerinde esneklik</li>
            </ul>
          </div>

          <p>
            Başlangıçta tek platformda ustalaş. Süreçleri, müşteri profilini ve kargo lojistiğini
            öğren. Ardından ikinci platforma geç. İkinci platformu da oturtunca üçüncüye adım at.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border border-gray-200 font-semibold">Aşama</th>
                  <th className="text-left p-3 border border-gray-200 font-semibold">Strateji</th>
                  <th className="text-left p-3 border border-gray-200 font-semibold">Hedef</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["1. Ay - 6. Ay", "Tek platform (kategorine uygun)", "Süreçleri öğren, ilk 100 satış"],
                  ["6. Ay - 12. Ay", "İkinci platforma geç", "Trafik çeşitlendirme, aylık 500+ satış"],
                  ["12. Ay - 24. Ay", "3. ve 4. platform ekleme", "Çoklu kanal yönetimi, marka oluşturma"],
                  ["24. Ay+", "Tüm platformlarda aktif", "Ölçek, otomasyon, yüksek ciro"],
                ].map(([stage, strategy, goal]) => (
                  <tr key={stage} className="border-b border-gray-200">
                    <td className="p-3 border border-gray-200 font-medium text-gray-700">
                      {stage}
                    </td>
                    <td className="p-3 border border-gray-200 text-gray-600">{strategy}</td>
                    <td className="p-3 border border-gray-200 text-gray-600">{goal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            Çoklu Platform Yönetiminde En Büyük Sorun: Zaman
          </h2>

          <p>
            Her platformun kendi paneli, kendi yorum sistemi, kendi sipariş bildirimi var. Sabah
            uyandığında 4 ayrı sekme açmak, 4 ayrı yorum akışını okumak, 4 ayrı stok durumunu
            kontrol etmek zorunda kalıyorsun. Bu tam olarak SatıcıPilot'un çözdüğü sorun.
          </p>

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mt-10">
            <h3 className="font-bold text-gray-900 mb-2">
              Tüm Pazaryerlerini Tek Panelden Yönet
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              SatıcıPilot, şu an Trendyol için aktif. Hepsiburada, N11, Amazon TR ve Çiçeksepeti
              entegrasyonları geliyor. Tüm platformlarını tek panelden izle: yorum analizi, stok
              uyarıları, fiyat takibi ve AI destekli öneriler. Erken erişime kaydolan satıcılar
              ilk entegrasyonları ücretsiz kullanıyor.
            </p>
            <Link
              href="/kayit"
              className="inline-block bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              Ücretsiz Kaydol, Erken Erişim Al →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">İlgili Yazılar</h3>
            <div className="space-y-2">
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
              <Link
                href="/blog/n11-magaza-acma"
                className="block text-orange-600 hover:underline text-sm"
              >
                → N11'de Mağaza Nasıl Açılır? Satıcı Rehberi 2026
              </Link>
              <Link
                href="/blog/amazon-turkiye-satici-olma"
                className="block text-orange-600 hover:underline text-sm"
              >
                → Amazon Türkiye'de Satıcı Olma Rehberi 2026
              </Link>
              <Link
                href="/blog/ciceksepeti-satici-olma"
                className="block text-orange-600 hover:underline text-sm"
              >
                → Çiçeksepeti'nde Satıcı Olma Rehberi 2026
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
