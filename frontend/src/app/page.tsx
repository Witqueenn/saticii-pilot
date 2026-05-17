import Link from "next/link";
import {
  MessageSquare, RotateCcw, Package, ChevronRight,
  CheckCircle, Zap, Star, TrendingUp, Clock, Shield,
  X, Sparkles,
} from "lucide-react";
import WaitlistSection from "@/components/WaitlistSection";

const features = [
  {
    icon: MessageSquare,
    title: "Yorum Merkezi",
    description: "AI yorumlarını analiz eder, duygu tespiti yapar ve her yorum için kişiselleştirilmiş cevap taslağı hazırlar. Acil yorumları anında öne çıkarır.",
    color: "bg-blue-50 text-blue-600",
    stat: "3dk",
    statLabel: "ortalama yanıt süresi",
  },
  {
    icon: RotateCcw,
    title: "İade Analizi",
    description: "Hangi ürün neden iade ediliyor? Tekrar eden kalıpları tespit eder, beden tablosu ve fotoğraf iyileştirme önerileri sunar.",
    color: "bg-red-50 text-red-600",
    stat: "%34'e kadar",
    statLabel: "iade azalması",
  },
  {
    icon: Package,
    title: "Ürün Optimizasyonu",
    description: "Her ürünün açıklama ve SEO puanını hesaplar. Düşük puanlı ürünler için AI ile iyileştirilmiş içerik oluşturur.",
    color: "bg-orange-50 text-orange-600",
    stat: "2x'e kadar",
    statLabel: "daha fazla organik trafik",
  },
];

const steps = [
  {
    num: "01",
    title: "Hesabını oluştur",
    desc: "2 dakikada ücretsiz kayıt ol, kredi kartı gerekmez.",
  },
  {
    num: "02",
    title: "Pazaryerini bağla",
    desc: "Trendyol Partner Panel'den API bilgilerini al, buraya gir. Ortalama kurulum 2 dakika.",
  },
  {
    num: "03",
    title: "İlk aksiyon listen hazır",
    desc: "SatıcıPilot yorumları, iadeleri ve ürünleri analiz eder. Yanıt bekleyen yorumları, riskli ürünleri ve iade kalıplarını tek panelde gösterir.",
  },
];

const plans = [
  {
    name: "Temel",
    price: "499",
    originalPrice: "998",
    desc: "Küçük mağazalar için",
    features: [
      "1 mağaza bağlantısı",
      "Yorum merkezi",
      "İade takibi",
      "Günlük özet",
    ],
    highlight: false,
  },
  {
    name: "Profesyonel",
    price: "999",
    originalPrice: "1.998",
    desc: "Büyüyen satıcılar için",
    features: [
      "3 mağazaya kadar",
      "AI cevap taslakları",
      "Ürün SEO optimizasyonu",
      "Haftalık performans raporu",
      "Öncelikli destek",
    ],
    highlight: true,
  },
  {
    name: "Kurumsal",
    price: "2.499",
    originalPrice: "4.998",
    desc: "Çok mağazalı operasyonlar için",
    features: [
      "Sınırsız mağaza",
      "Tüm AI özellikler",
      "Özel raporlar",
      "Özel entegrasyon desteği",
      "7/24 öncelikli destek",
    ],
    highlight: false,
  },
];

const testimonials = [
  {
    name: "Ayşe K.",
    shop: "ModaMira Butik",
    category: "Kadın giyim · Trendyol",
    duration: "3 aydır kullanıyor",
    text: "Beden tablosu önerisini uyguladım, fark inanılmaz. Artık yorumlara da çok hızlı yanıt veriyorum.",
    before: "İade: %22",
    after: "İade: %11",
    rating: 5,
  },
  {
    name: "Mehmet T.",
    shop: "Trendyol Tekstil",
    category: "Erkek giyim · Trendyol",
    duration: "5 aydır kullanıyor",
    text: "Günde 50+ yorum geliyordu, hepsine tek tek cevap vermek zordu. Şimdi AI taslakları 10 dakikada bitiriyorum.",
    before: "Yanıt: 2 saat",
    after: "Yanıt: 12 dk",
    rating: 5,
  },
  {
    name: "Selin A.",
    shop: "Sezon Koleksiyonu",
    category: "Aksesuar · Hepsiburada",
    duration: "2 aydır kullanıyor",
    text: "Ürün açıklama puanım 38'den 74'e çıktı. Organik trafik ciddi arttı.",
    before: "SEO: 38/100",
    after: "SEO: 74/100",
    rating: 5,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://saticii-pilot.vercel.app/#organization",
      "name": "SatıcıPilot",
      "url": "https://saticii-pilot.vercel.app",
      "description": "Trendyol ve pazaryeri satıcıları için AI destekli operasyon asistanı",
      "foundingDate": "2026",
      "areaServed": "TR",
    },
    {
      "@type": "SoftwareApplication",
      "name": "SatıcıPilot",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "description": "Trendyol satıcıları için yorum yönetimi, iade takibi ve ürün optimizasyonu platformu",
      "offers": [
        { "@type": "Offer", "name": "Temel", "price": "499", "priceCurrency": "TRY", "billingDuration": "P1M" },
        { "@type": "Offer", "name": "Profesyonel", "price": "999", "priceCurrency": "TRY", "billingDuration": "P1M" },
        { "@type": "Offer", "name": "Kurumsal", "price": "2499", "priceCurrency": "TRY", "billingDuration": "P1M" },
      ],
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "SatıcıPilot hangi platformları destekliyor?",
          "acceptedAnswer": { "@type": "Answer", "text": "Şu an Trendyol aktif olarak destekleniyor. Hepsiburada, N11, Amazon TR ve Çiçeksepeti yakında eklenecek." },
        },
        {
          "@type": "Question",
          "name": "Ücretsiz deneme var mı?",
          "acceptedAnswer": { "@type": "Answer", "text": "Evet, 14 gün ücretsiz deneme sunuyoruz. Kredi kartı gerekmez." },
        },
        {
          "@type": "Question",
          "name": "SatıcıPilot nasıl iade oranını düşürüyor?",
          "acceptedAnswer": { "@type": "Answer", "text": "İade nedenlerini analiz ederek beden tablosu hataları, fotoğraf uyumsuzlukları ve ürün açıklama eksiklerini tespit eder. Bu sorunları gidermek iade oranını %34'e kadar düşürebilir." },
        },
      ],
    },
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-lg">SatıcıPilot</span>
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">Erken Erişim</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/giris" className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
              Giriş Yap
            </Link>
            <Link
              href="/kayit"
              className="text-sm bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Ücretsiz Dene
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-white pointer-events-none" />
        <div className="relative px-6 py-20 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Sol: Metin */}
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-8">
                <Zap className="w-4 h-4" />
                İlk 3 ay %50 indirim — sınırlı kontenjan
              </div>
              <h1 className="text-5xl font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight">
                Trendyol satıcıları için<br />
                <span className="text-orange-500">AI operasyon paneli</span>
              </h1>
              <p className="text-xl text-gray-500 mb-8 leading-relaxed">
                Yorumları yanıtla, iade nedenlerini yakala, ürün açıklamalarını iyileştir.
                <strong className="text-gray-700"> SatıcıPilot her gün sana yapılacaklar listesi çıkarır.</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link
                  href="/kayit"
                  className="bg-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-orange-600 transition-all text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
                >
                  14 Gün Ücretsiz Başla <ChevronRight className="w-5 h-5" />
                </Link>
                <a
                  href="#ozellikler"
                  className="border border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-medium hover:bg-gray-50 transition-colors text-base text-center"
                >
                  Nasıl Çalışır?
                </a>
              </div>
              <p className="text-sm text-gray-400">Kredi kartı gerekmez · Kurulum yok · 2 dakikada hazır</p>

              {/* Platform rozetleri */}
              <div className="mt-10 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-gray-400 font-medium">Aktif:</span>
                  <span className="text-sm text-white bg-orange-500 px-3 py-1 rounded-full font-medium">Trendyol</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-gray-400 font-medium">Yakında:</span>
                  {["Hepsiburada", "N11", "Amazon TR", "Çiçeksepeti"].map((p) => (
                    <span key={p} className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">{p}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sağ: Demo AI Kutusu */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-black">S</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">SatıcıPilot</span>
                  </div>
                  <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">● Canlı</span>
                </div>

                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bugünkü Aksiyonlar</div>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5 bg-red-50 rounded-xl p-3">
                    <span className="w-2 h-2 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                    <p className="text-xs text-red-700">3 acil yorum yanıt bekliyor — müşteri memnuniyeti riski</p>
                  </div>
                  <div className="flex items-start gap-2.5 bg-orange-50 rounded-xl p-3">
                    <span className="w-2 h-2 rounded-full bg-orange-500 mt-1 flex-shrink-0" />
                    <p className="text-xs text-orange-700">2 ürünün açıklama puanı düşük — AI önerisi hazır</p>
                  </div>
                  <div className="flex items-start gap-2.5 bg-yellow-50 rounded-xl p-3">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 mt-1 flex-shrink-0" />
                    <p className="text-xs text-yellow-700">Bu hafta 5 iade — 4'ü beden uyumsuzluğu</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-[11px] font-semibold text-gray-600">AI Önerisi</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    "Oversize Pamuk T-Shirt" ürününe santimetre bazlı ölçü tablosu ekle.
                    Benzer ürünlerde bu değişiklik iadeyi <strong>%34'e kadar</strong> düşürüyor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-3 gap-6 text-center">
          {[
            { icon: TrendingUp, value: "%34'e kadar", label: "iade azalması" },
            { icon: Clock, value: "2 saate kadar", label: "günlük tasarruf" },
            { icon: Shield, value: "500+", label: "erken erişim başvurusu" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-gray-400 pb-4">* Pilot kullanıcı verilerine göre ortalama sonuçlar. Mağaza hacmine göre değişebilir.</p>
      </section>

      {/* Özellikler */}
      <section id="ozellikler" className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900">Her şey tek panelde</h2>
          <p className="text-gray-500 mt-3 text-lg">Tüm pazaryeri operasyonlarını yönetmek için ihtiyacın olan her şey</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 hover:border-orange-200 hover:shadow-md transition-all">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.color}`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              <div className="pt-2 border-t border-gray-100">
                <span className="text-xl font-bold text-gray-900">{f.stat}</span>
                <span className="text-sm text-gray-400 ml-2">{f.statLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Güven Bloğu */}
      <section className="px-6 py-14 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Verileriniz güvende</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                API bağlantısı isteyen bir ürün olarak güvenliği en üst öncelik olarak tutuyoruz.
                Mağaza verilerinize yalnızca analiz için erişiriz.
              </p>
            </div>
            <div className="space-y-3">
              {[
                "API bilgilerin şifreli saklanır",
                "Sipariş işlemi yapılmaz — yalnızca okuma yetkisi",
                "Veriler yalnızca analiz için kullanılır, satılmaz",
                "Bağlantıyı istediğin zaman tek tıkla kaldırabilirsin",
                "KVKK uyumlu altyapı",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Manuel vs SatıcıPilot */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Manuel yönetim vs SatıcıPilot</h2>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
            <div className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">İşlem</div>
            <div className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide border-l border-gray-200 text-center">Manuel</div>
            <div className="px-5 py-3 text-xs font-semibold text-orange-600 uppercase tracking-wide border-l border-gray-200 text-center">SatıcıPilot</div>
          </div>
          {[
            { task: "Yorum yanıtları", manual: "Saatler sürer", ai: "AI taslak hazırlar" },
            { task: "İade analizi", manual: "Excel takibi gerekir", ai: "Kalıpları otomatik bulur" },
            { task: "Ürün optimizasyonu", manual: "Tek tek kontrol gerekir", ai: "Düşük puanlıları listeler" },
            { task: "Günlük öncelikler", manual: "Siz belirlersiniz", ai: "Otomatik aksiyon listesi" },
            { task: "Platform takibi", manual: "Birden fazla panel", ai: "Tek panelde hepsi" },
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-3 border-t border-gray-100">
              <div className="px-5 py-3.5 text-sm font-medium text-gray-700">{row.task}</div>
              <div className="px-5 py-3.5 border-l border-gray-200 text-center">
                <span className="flex items-center justify-center gap-1.5 text-sm text-gray-400">
                  <X className="w-3.5 h-3.5 text-red-400" /> {row.manual}
                </span>
              </div>
              <div className="px-5 py-3.5 border-l border-gray-200 bg-orange-50/50 text-center">
                <span className="flex items-center justify-center gap-1.5 text-sm text-orange-700 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" /> {row.ai}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">3 adımda başla</h2>
          </div>
          <div className="space-y-6">
            {steps.map((s) => (
              <div key={s.num} className="flex items-start gap-6 bg-white rounded-2xl border border-gray-200 p-6">
                <span className="text-3xl font-black text-orange-200 flex-shrink-0">{s.num}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{s.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
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

              {/* Önce / Sonra */}
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-lg">{t.before}</span>
                <span className="text-gray-300">→</span>
                <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-lg">{t.after}</span>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                <p className="text-xs text-gray-400">{t.shop}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.category} · {t.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fiyatlandırma */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-gray-900">Şeffaf fiyatlandırma</h2>
          </div>
          <p className="text-center text-gray-500 mb-12">
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-medium text-sm">
              Erken erişim: İlk 3 ay tüm planlarda %50 indirim
            </span>
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl border p-6 space-y-6 relative ${
                  p.highlight
                    ? "border-orange-400 bg-white shadow-xl shadow-orange-100"
                    : "border-gray-200 bg-white"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-orange-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                      En Popüler
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-900 text-lg">{p.name}</p>
                  <p className="text-gray-400 text-sm mt-0.5">{p.desc}</p>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-gray-900">₺{p.price}</span>
                    <span className="text-gray-400 text-sm">/ay</span>
                  </div>
                  <p className="text-xs text-gray-400 line-through mt-0.5">Normal fiyat: ₺{p.originalPrice}</p>
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
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    p.highlight
                      ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200"
                      : "border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  14 Gün Ücretsiz Başla
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist — erken erişim indirimi */}
      <WaitlistSection />

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Hemen başla, 14 gün ücretsiz kullan
          </h2>
          <p className="text-gray-500 mb-10 text-lg">
            Kurulum yok, kredi kartı gerekmez. 2 dakikada hesabını oluştur.
          </p>
          <Link
            href="/kayit"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-10 py-4 rounded-xl font-semibold hover:bg-orange-600 transition-all text-lg shadow-lg shadow-orange-200"
          >
            14 Gün Ücretsiz Başla <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* SSS */}
      <section className="px-6 py-20 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Sık Sorulan Sorular</h2>
        <div className="space-y-4">
          {[
            {
              q: "Hangi pazaryerlerini destekliyorsunuz?",
              a: "Şu an Trendyol entegrasyonu aktif. Hepsiburada, N11, Amazon TR ve Çiçeksepeti entegrasyonları geliştirme aşamasında, yakında erişime açılacak.",
            },
            {
              q: "Şu an kaydolabilir miyim, yoksa listeye mi giriyorum?",
              a: "Erken erişim kapsamında hemen kaydolup ürünü kullanmaya başlayabilirsin. 14 gün boyunca ücretsiz, kredi kartı gerekmez. Erken erişim indirimi için e-posta listesine de katılabilirsin.",
            },
            {
              q: "Verilerim güvende mi?",
              a: "Tüm API bilgilerin şifreli olarak saklanır. Mağazana yalnızca okuma yetkisiyle erişilir, hiçbir işlem yapılmaz. Bağlantını istediğin zaman tek tıkla kaldırabilirsin.",
            },
            {
              q: "Kredi kartı bilgisi vermem gerekiyor mu?",
              a: "14 günlük deneme sürecinde kredi kartı gerekmez. Deneme süresi sonunda istersen ücretli plana geçebilirsin.",
            },
            {
              q: "Mevcut planımı değiştirebilir miyim?",
              a: "İstediğin zaman planını yükseltebilir veya düşürebilirsin. Değişiklikler anında geçerli olur.",
            },
            {
              q: "Teknik destek var mı?",
              a: "Profesyonel ve Kurumsal plan kullanıcılarına öncelikli e-posta desteği sunuyoruz. Temel planda topluluk desteği mevcut.",
            },
          ].map((item) => (
            <div key={item.q} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="font-semibold text-gray-900 mb-2">{item.q}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-gray-900">SatıcıPilot</span>
          <p className="text-sm text-gray-400">© 2026 SatıcıPilot. Tüm hakları saklıdır.</p>
          <div className="flex gap-4 text-sm text-gray-400">
            <Link href="/blog" className="hover:text-gray-600 transition-colors">Blog</Link>
            <a href="#" className="hover:text-gray-600 transition-colors">Gizlilik</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Kullanım Şartları</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
