import Link from "next/link";
import { MessageSquare, RotateCcw, Package, ChevronRight, CheckCircle, Zap, Star } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Yorum Merkezi",
    description: "AI yorumlarını analiz eder, duygu tespiti yapar ve her yorum için cevap taslağı hazırlar. Acil yorumları anında öne çıkarır.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: RotateCcw,
    title: "İade Analizi",
    description: "Hangi ürün neden iade ediliyor? Tekrar eden kalıpları tespit eder, beden tablosu ve fotoğraf iyileştirme önerileri sunar.",
    color: "bg-red-50 text-red-600",
  },
  {
    icon: Package,
    title: "Ürün Optimizasyonu",
    description: "Her ürünün açıklama ve SEO puanını hesaplar. Düşük puanlı ürünler için AI ile iyileştirilmiş içerik oluşturur.",
    color: "bg-orange-50 text-orange-600",
  },
];

const plans = [
  {
    name: "Temel",
    price: "499",
    desc: "Başlangıç için ideal",
    features: ["1 mağaza", "Yorum merkezi", "İade takibi", "Günlük özet"],
    cta: "Başla",
    highlight: false,
  },
  {
    name: "Profesyonel",
    price: "999",
    desc: "Büyüyen mağazalar için",
    features: ["3 mağazaya kadar", "AI cevap taslakları", "Ürün optimizasyonu", "Öncelikli destek"],
    cta: "En Popüler",
    highlight: true,
  },
  {
    name: "Kurumsal",
    price: "2.499",
    desc: "Profesyonel satıcılar için",
    features: ["Sınırsız mağaza", "Tüm AI özellikler", "Özel raporlar", "7/24 destek"],
    cta: "Başla",
    highlight: false,
  },
];

const testimonials = [
  {
    name: "Ayşe K.",
    shop: "ModaMira Butik",
    text: "İade oranım %22'den %11'e düştü. Beden tablosu önerisini uyguladım, fark inanılmaz.",
    rating: 5,
  },
  {
    name: "Mehmet T.",
    shop: "Trendyol Tekstil",
    text: "Günde 50+ yorum geliyordu, hepsine tek tek cevap vermek zordu. Şimdi AI taslakları 10 dakikada bitiriyorum.",
    rating: 5,
  },
  {
    name: "Selin A.",
    shop: "Sezon Koleksiyonu",
    text: "Ürün açıklama puanım 38'den 74'e çıktı. Organik trafik ciddi arttı.",
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div>
          <span className="font-bold text-gray-900 text-lg">SatıcıPilot</span>
          <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">Erken Erişim</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/giris" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Giriş Yap
          </Link>
          <Link
            href="/kayit"
            className="text-sm bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Ücretsiz Dene
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Zap className="w-4 h-4" />
          İlk 3 ay %50 indirim — sınırlı kontenjan
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          Trendyol mağazanı<br />
          <span className="text-orange-500">AI ile yönet</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Yorumları analiz et, iadelerin nedenini öğren, ürün açıklamalarını optimize et.
          Günde 2 saatini kurtar, satışlarını artır.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/kayit"
            className="bg-orange-500 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-orange-600 transition-colors text-base flex items-center justify-center gap-2"
          >
            14 Gün Ücretsiz Başla <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/giris"
            className="border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition-colors text-base"
          >
            Demo Gör
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">Kredi kartı gerekmez · Kurulum yok · 2 dakikada hazır</p>
      </section>

      {/* Özellikler */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Her şey tek panelde</h2>
            <p className="text-gray-500 mt-3">Trendyol operasyonlarını yönetmek için ihtiyacın olan her şey</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sosyal kanıt */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Satıcılar ne diyor?</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">"{t.text}"</p>
              <div>
                <p className="font-medium text-gray-900 text-sm">{t.name}</p>
                <p className="text-xs text-gray-400">{t.shop}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fiyatlandırma */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Şeffaf fiyatlandırma</h2>
            <p className="text-gray-500 mt-3">
              <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded font-medium text-sm">Erken erişim:</span>
              {" "}İlk 3 ay tüm planlarda %50 indirim
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl border p-6 space-y-6 relative ${
                  p.highlight
                    ? "border-orange-400 bg-white shadow-lg shadow-orange-100"
                    : "border-gray-200 bg-white"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                      En Popüler
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-gray-400 text-sm mt-0.5">{p.desc}</p>
                </div>
                <div>
                  <span className="text-3xl font-bold text-gray-900">₺{p.price}</span>
                  <span className="text-gray-400 text-sm">/ay</span>
                </div>
                <ul className="space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/kayit"
                  className={`block text-center py-2.5 rounded-xl font-medium text-sm transition-colors ${
                    p.highlight
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Başla
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Hemen başla, 14 gün ücretsiz kullan
        </h2>
        <p className="text-gray-500 mb-8">
          Kurulum yok, kredi kartı gerekmez. 2 dakikada hesabını oluştur.
        </p>
        <Link
          href="/kayit"
          className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-xl font-medium hover:bg-orange-600 transition-colors text-base"
        >
          Ücretsiz Hesap Aç <ChevronRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-gray-900">SatıcıPilot</span>
          <p className="text-sm text-gray-400">© 2026 SatıcıPilot. Tüm hakları saklıdır.</p>
          <div className="flex gap-4 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600">Gizlilik</a>
            <a href="#" className="hover:text-gray-600">Kullanım Şartları</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
