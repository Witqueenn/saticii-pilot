import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Pazaryerinde İade Oranını %40 Düşürmenin 5 Yolu",
  description: "Türkiye'de e-ticaret iade oranı ortalama %18. Bu oranı yarıya indirmek için uygulaман gereken 5 somut adım ve AI destekli analiz yöntemleri.",
};

export default function Article() {
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
        <Link href="/blog" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Tüm yazılar
        </Link>

        <div className="mb-3">
          <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">İade Yönetimi</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
          Pazaryerinde İade Oranını %40 Düşürmenin 5 Yolu
        </h1>

        <p className="text-gray-500 text-sm mb-10">12 Mayıs 2026 · 8 dakika okuma</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <p className="text-lg text-gray-600">
            Türkiye'de e-ticaret satıcılarının ortalama iade oranı <strong>%18</strong>.
            Giyim kategorisinde bu oran %30'u aşabiliyor. Her iade; kargo maliyeti,
            işlem süresi ve stok kaybı anlamına geliyor. Peki bu rakamı nasıl yarıya indirirsin?
          </p>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">İadenin maliyeti nedir?</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>→ Ortalama kargo maliyeti: <strong>₺35-50</strong> (gidiş-dönüş)</li>
              <li>→ İşlem süresi: <strong>15-20 dakika</strong> per iade</li>
              <li>→ Ürün değer kaybı: <strong>%5-15</strong> (ambalaj, yıpranma)</li>
            </ul>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-8">1. İade nedenlerini kategorize et</h2>
          <p>
            İadelerin büyük çoğunluğu aynı 3-4 nedenden kaynaklanıyor. Bunları tespit etmeden
            önlem almak mümkün değil. İade formlarındaki müşteri notlarını analiz et ve
            en sık görülen nedeni bul.
          </p>
          <p>
            Türkiye'deki giyim satıcılarında en yaygın iade nedenleri:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li><strong>Beden uyumsuzluğu</strong> — tüm iadelerin %42'si</li>
            <li><strong>Renk farkı</strong> — %23</li>
            <li><strong>Kalite beklentisi</strong> — %18</li>
            <li><strong>Yanlış ürün</strong> — %9</li>
            <li><strong>Diğer</strong> — %8</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">2. Ölçü tablosunu güncelle ve öne çıkar</h2>
          <p>
            İadelerin %42'si beden uyumsuzluğundan kaynaklanıyorsa çözüm açık: ölçü tablosu.
            Ama standart bir tablo yetmez. Şunları yap:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Ürünün gerçek ölçülerini santimetre cinsinden belirt (S = göğüs 88cm, bel 72cm...)</li>
            <li>Model boyunu ve hangi bedeni giydiğini yaz</li>
            <li>"Dar kalıp, bir beden büyük almanızı öneririz" notunu ekle</li>
            <li>Ölçü tablosunu ürün açıklamasının en üstüne koy</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">3. Ürün fotoğraflarını gün ışığında çek</h2>
          <p>
            İadelerin %23'ü "renk farklı geldi" şikayetinden oluşuyor. Bunun sebebi çoğu zaman
            yapay ışık altında çekilen fotoğraflar. Çözüm:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Fotoğrafları sabah 10-14 arası doğal ışıkta çek</li>
            <li>Filtre kullanma, renk düzeltmesini minimumda tut</li>
            <li>Farklı ışık koşullarında en az 2-3 fotoğraf ekle</li>
            <li>Açıklamada "Monitör kalibrasyonuna bağlı olarak renk tonu hafif farklılık gösterebilir" yaz</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">4. Ürün açıklamasında beklentiyi doğru yönet</h2>
          <p>
            "Kalite beklentisi" iadelerin %18'i. Bu, müşterinin fiyata göre daha iyi bir ürün
            beklediği anlamına geliyor. Çözüm fiyatı düşürmek değil, beklentiyi doğru yönetmek:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Kumaş içeriğini net yaz (%100 pamuk, %60 polyester %40 viskoz gibi)</li>
            <li>Bakım talimatlarını belirt</li>
            <li>Ürünün hangi kullanım amacına uygun olduğunu açıkla</li>
            <li>Gerçekçi olmayan vaatlerden kaçın</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">5. Tekrarlayan iadeli ürünleri takip et</h2>
          <p>
            Bazı ürünler sürekli iade ediliyor ama bunu fark etmek zor çünkü veriler dağınık.
            Ürün bazlı iade oranını haftalık takip et. Bir ürünün iade oranı %20'yi geçiyorsa
            ya fiyatı düşür ya açıklamayı güncelle ya da ürünü listeden kaldır.
          </p>

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mt-10">
            <h3 className="font-bold text-gray-900 mb-2">İade kalıplarını AI ile otomatik tespit et</h3>
            <p className="text-sm text-gray-600 mb-4">
              SatıcıPilot tüm iade verilerini analiz eder, hangi ürünün neden iade edildiğini
              kategorize eder ve iyileştirme önerileri sunar. Tekrar eden kalıpları erken
              görüp düzeltmek iade oranını anlamlı ölçüde azaltabilir.
            </p>
            <Link
              href="/kayit"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
            >
              14 Gün Ücretsiz Dene <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
