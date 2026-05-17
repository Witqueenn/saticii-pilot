import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Trendyol'da Yorum Yönetimi: Satışlarını Artıracak 7 Strateji",
  description: "Olumsuz yorumlar dönüşüm oranını %30'a kadar düşürebilir. Trendyol'da profesyonel yorum yönetimi ile mağaza puanını nasıl yükseltirsin?",
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
          <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">Yorum Yönetimi</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
          Trendyol'da Yorum Yönetimi: Satışlarını Artıracak 7 Strateji
        </h1>

        <p className="text-gray-500 text-sm mb-10">15 Mayıs 2026 · 6 dakika okuma</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <p className="text-lg text-gray-600">
            Trendyol'da bir ürünün yorum puanı 4.5'ın altına düştüğünde dönüşüm oranı ortalama <strong>%28 azalıyor</strong>.
            Peki satıcıların büyük çoğunluğu yorumlara neden geç yanıt veriyor ya da hiç vermiyor?
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">1. Her yoruma 24 saat içinde yanıt ver</h2>
          <p>
            Trendyol algoritması, yorumlara verilen yanıt süresini mağaza puanlamasında dikkate alıyor.
            24 saat içinde yanıt veren mağazalar, vermeyenlere göre arama sonuçlarında <strong>%15 daha üst</strong> sıralarda görünüyor.
            Olumsuz bir yoruma bile hızlı yanıt vermek, potansiyel müşterilere profesyonelliğini gösterir.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">2. Şikayet kategorilerini tespit et</h2>
          <p>
            Yorumları tek tek okumak yerine kategorilere ayır. En sık görülen şikayet türleri şunlar:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li><strong>Beden uyumsuzluğu</strong> — özellikle giyim kategorisinde ilk sırada</li>
            <li><strong>Renk farkı</strong> — fotoğraf ile gerçek ürün arasındaki fark</li>
            <li><strong>Kargo gecikmesi</strong> — satıcıdan çok kargo firmasına bağlı ama tepkiler sana geliyor</li>
            <li><strong>Kalite beklentisi</strong> — fiyat/performans uyumsuzluğu</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">3. Şablon yanıt kullanma, kişiselleştir</h2>
          <p>
            "Değerli müşterimiz, yaşadığınız sorun için özür dileriz" şablonu artık kimseyi etkilemiyor.
            Müşteri şikayetini oku, tam olarak ne dediğini yanıtında tekrar et. Bu hem müşteriye
            değer verdiğini gösterir hem de potansiyel alıcıların gözünde güvenilirliğini artırır.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">4. Acil yorumları anında yakala</h2>
          <p>
            1-2 yıldızlı yorumlar bekletilmemeli. Bu yorumlar hem mağaza puanını hem de algoritma
            sıralamasını etkiliyor. Günde en az bir kez yorum panelini kontrol etmek yerine,
            acil yorumlar için bildirim sistemi kur.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">5. Tekrarlayan şikayetleri ürün sayfasına yansıt</h2>
          <p>
            Aynı ürüne "beden büyük geliyor" yorumu 5 kereden fazla geldiyse bu bir sinyal.
            Ürün açıklamasına <strong>"Ölçü tablosuna bakarak beden seçmenizi öneririz"</strong> notunu ekle
            ve bir beden küçük almanızı tavsiye et. Bu hem iadeleri hem de olumsuz yorumları azaltır.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">6. Olumlu yorumları artırmak için paket içi not kullan</h2>
          <p>
            Ürünle birlikte küçük bir teşekkür kartı gönder: "Memnun kaldıysanız yorum bırakırsanız
            çok seviniriz." Bu basit adım, mağaza puanını haftalar içinde gözle görülür biçimde artırıyor.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">7. Yanıt kalitesini ölç</h2>
          <p>
            Hangi yanıt şablonları müşteriyi tatmin ediyor? Yanıt verdikten sonra müşterinin
            yorumu değiştirip değiştirmediğini takip et. Başarılı yanıt kalıplarını not al ve tekrar kullan.
          </p>

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mt-10">
            <h3 className="font-bold text-gray-900 mb-2">SatıcıPilot ile yorum yönetimini otomatikleştir</h3>
            <p className="text-sm text-gray-600 mb-4">
              AI tüm yorumlarını analiz eder, acil olanları öne çıkarır ve her yorum için
              kişiselleştirilmiş cevap taslağı hazırlar. Günde 2 saat kazan.
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
