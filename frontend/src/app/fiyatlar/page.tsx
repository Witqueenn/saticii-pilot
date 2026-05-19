import { CheckCircle, Zap, Star, Building2, ArrowRight, HelpCircle } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    id: "temel",
    name: "Temel",
    price: 0,
    period: "sonsuza kadar ücretsiz",
    badge: null,
    description: "Küçük satıcılar için başlangıç paketi",
    cta: "Ücretsiz Başla",
    ctaHref: "/kayit",
    highlight: false,
    features: [
      "Trendyol bağlantısı",
      "Yorum merkezi (50 yorum/ay)",
      "İade takibi",
      "Temel ürün yönetimi",
      "Mobil uygulama",
      "E-posta desteği",
    ],
    missing: [
      "AI yorum yanıtlama",
      "Rakip analizi",
      "Haftalık rapor",
      "Kampanya planlayıcı",
    ],
  },
  {
    id: "profesyonel",
    name: "Pro",
    price: 799,
    period: "ay",
    badge: "En Popüler",
    description: "Büyüyen satıcılar için tam paket",
    cta: "14 Gün Ücretsiz Dene",
    ctaHref: "/auth/kayit?plan=profesyonel",
    highlight: true,
    features: [
      "Temel planın her şeyi",
      "Sınırsız yorum yönetimi",
      "AI yorum yanıtlama",
      "Rakip fiyat & yorum analizi",
      "Haftalık e-posta raporu",
      "Müşteri takibi & QR form",
      "Tüm pazaryeri bağlantıları",
      "Öncelikli destek",
    ],
    missing: [
      "Kampanya planlayıcı",
      "E-posta & SMS kampanyası",
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    price: 1999,
    period: "ay",
    badge: "Tam Güç",
    description: "Büyük satıcılar ve ajanslar için",
    cta: "Satış Ekibiyle Görüş",
    ctaHref: "mailto:satis@saticipilot.com?subject=Marketing Plan",
    highlight: false,
    features: [
      "Pro planın her şeyi",
      "Kampanya planlayıcı",
      "E-posta & SMS kampanyası",
      "Otomasyon & AI içerik üretimi",
      "Çoklu mağaza yönetimi",
      "API erişimi",
      "Özel onboarding",
      "Dedike hesap yöneticisi",
    ],
    missing: [],
  },
];

const faqs = [
  {
    q: "Kredi kartı olmadan deneyebilir miyim?",
    a: "Evet. Temel plan sonsuza kadar ücretsiz, kredi kartı gerekmez. Pro plan için 14 günlük ücretsiz deneme başlatmak için kart bilgisi istiyoruz ama deneme süresinde ücret alınmaz.",
  },
  {
    q: "Dilediğim zaman iptal edebilir miyim?",
    a: "Evet, istediğin zaman iptal edebilirsin. İptal ettiğinde mevcut dönemin sonuna kadar erişimin devam eder.",
  },
  {
    q: "Trendyol dışında pazaryerleri destekleniyor mu?",
    a: "Pro ve Marketing planlarda Hepsiburada, N11, Amazon TR, Pazarama, Etsy ve kendi web sitesi bağlantısı desteklenmektedir.",
  },
  {
    q: "Verilerim güvende mi?",
    a: "Tüm veriler Türkiye lokasyonlu sunucularda saklanır. SSL şifreleme, Supabase RLS politikaları ve düzenli yedekleme ile korunur.",
  },
  {
    q: "Fatura kesiliyor mu?",
    a: "Evet. Her ay ödeme sonrası e-fatura otomatik olarak gönderilir.",
  },
];

export default function FiyatlarPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">SatıcıPilot</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/auth/giris" className="text-sm text-gray-600 hover:text-gray-900">Giriş Yap</Link>
          <Link href="/auth/kayit" className="bg-orange-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
            Ücretsiz Başla
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Star className="w-4 h-4" />
            14 gün ücretsiz deneme · Kredi kartı opsiyonel
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Mağazana uygun planı seç
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Trendyol satıcılarının %73'ü SatıcıPilot ile ilk ay içinde yanıt süresini yarıya indirdi.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-8 flex flex-col ${
                plan.highlight
                  ? "border-orange-500 shadow-xl shadow-orange-100"
                  : "border-gray-200 shadow-sm"
              }`}
            >
              {plan.badge && (
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-bold ${
                  plan.highlight ? "bg-orange-500 text-white" : "bg-gray-900 text-white"
                }`}>
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h2>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </div>

              <div className="mb-8">
                {plan.price === 0 ? (
                  <div>
                    <span className="text-4xl font-extrabold text-gray-900">Ücretsiz</span>
                    <p className="text-sm text-gray-400 mt-1">{plan.period}</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-4xl font-extrabold text-gray-900">₺{plan.price.toLocaleString("tr-TR")}</span>
                    <span className="text-gray-400 text-sm ml-1">/{plan.period}</span>
                    <p className="text-sm text-gray-400 mt-1">+ KDV</p>
                  </div>
                )}
              </div>

              <Link
                href={plan.ctaHref}
                className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm mb-8 transition-colors ${
                  plan.highlight
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>

              <ul className="space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
                {plan.missing.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-400 line-through">
                    <CheckCircle className="w-4 h-4 text-gray-200 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Enterprise */}
        <div className="bg-gray-900 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 mb-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Kurumsal / Ajans</h3>
              <p className="text-gray-400 text-sm mt-0.5">10+ mağaza, özel SLA, beyaz etiket seçeneği</p>
            </div>
          </div>
          <a
            href="mailto:satis@saticipilot.com?subject=Kurumsal Plan"
            className="flex-shrink-0 flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors"
          >
            Teklif Al
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Comparison table */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Plan Karşılaştırması</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 pr-6 font-semibold text-gray-500 w-1/2">Özellik</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-700">Temel</th>
                  <th className="text-center py-4 px-4 font-semibold text-orange-600">Pro</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-700">Marketing</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Pazaryeri bağlantısı", "Trendyol", "Tümü", "Tümü"],
                  ["Aylık yorum yönetimi", "50", "Sınırsız", "Sınırsız"],
                  ["AI yorum yanıtlama", "—", "✓", "✓"],
                  ["Rakip analizi", "—", "✓", "✓"],
                  ["Haftalık rapor", "—", "✓", "✓"],
                  ["Kampanya planlayıcı", "—", "—", "✓"],
                  ["E-posta & SMS", "—", "—", "✓"],
                  ["API erişimi", "—", "—", "✓"],
                  ["Çoklu mağaza", "—", "—", "✓"],
                  ["Destek", "E-posta", "Öncelikli", "Dedike"],
                ].map(([feature, ...vals]) => (
                  <tr key={feature} className="border-b border-gray-100">
                    <td className="py-3.5 pr-6 text-gray-700">{feature}</td>
                    {vals.map((v, i) => (
                      <td key={i} className={`py-3.5 px-4 text-center font-medium ${v === "—" ? "text-gray-300" : i === 1 ? "text-orange-600" : "text-gray-700"}`}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Sık Sorulan Sorular</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA bottom */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Hala kararsız mısın?</h2>
          <p className="text-gray-500 mb-6">14 gün boyunca Pro planı ücretsiz kullan, beğenmezsen ücret ödemezsin.</p>
          <Link
            href="/auth/kayit?plan=profesyonel"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-orange-600 transition-colors"
          >
            14 Gün Ücretsiz Başla
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
