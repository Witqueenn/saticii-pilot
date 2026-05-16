import { MessageSquare, AlertTriangle, Package, RotateCcw, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import Link from "next/link";

const stats = [
  {
    label: "Bekleyen Yorum",
    value: "3",
    sub: "2 acil",
    icon: MessageSquare,
    color: "text-blue-600",
    bg: "bg-blue-50",
    trend: "+3 bugün",
    trendUp: true,
    href: "/yorumlar",
  },
  {
    label: "Düşük Puanlı Ürün",
    value: "1",
    sub: "açıklama güncelle",
    icon: Package,
    color: "text-orange-600",
    bg: "bg-orange-50",
    trend: "Puan < 60",
    trendUp: false,
    href: "/urunler",
  },
  {
    label: "Bu Haftaki İade",
    value: "11",
    sub: "kalıp analizi hazır",
    icon: RotateCcw,
    color: "text-red-600",
    bg: "bg-red-50",
    trend: "↑ %22 artış",
    trendUp: false,
    href: "/iadeler",
  },
  {
    label: "AI Önerisi",
    value: "5",
    sub: "aksiyon bekliyor",
    icon: AlertTriangle,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    trend: "Hemen incele",
    trendUp: true,
    href: "/yorumlar",
  },
];

const actionItems = [
  {
    priority: "yüksek",
    text: "\"Yazlık Keten Bluz\" için 2 acil yorum var — beden tablosu şikayeti tekrar ediyor.",
    href: "/yorumlar",
    color: "border-red-200 bg-red-50",
    dot: "bg-red-500",
  },
  {
    priority: "orta",
    text: "\"Yazlık Keten Bluz\" iade oranı bu hafta %22 arttı. İade kalıp analizi hazır.",
    href: "/iadeler",
    color: "border-orange-200 bg-orange-50",
    dot: "bg-orange-500",
  },
  {
    priority: "normal",
    text: "1 ürünün açıklama puanı 42/100 — AI iyileştirme önerisi hazır.",
    href: "/urunler",
    color: "border-yellow-200 bg-yellow-50",
    dot: "bg-yellow-500",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Başlık */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Günlük Özet</h2>
        <p className="text-gray-500 mt-1">Bugün için 5 aksiyon bekliyor.</p>
      </div>

      {/* Stat kartları */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 hover:border-orange-200 hover:shadow-sm transition-all group"
          >
            <div className={`${s.bg} ${s.color} p-3 rounded-lg flex-shrink-0`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-400">{s.sub}</p>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${s.trendUp ? "text-green-600" : "text-red-500"}`}>
                  {s.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {s.trend}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* AI Günlük Aksiyon Listesi */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">AI Aksiyon Listesi</h3>
          <span className="text-xs text-gray-400">Bugün güncellendi</span>
        </div>
        <div className="divide-y divide-gray-100">
          {actionItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors group`}
            >
              <span className={`w-2 h-2 rounded-full ${item.dot} mt-1.5 flex-shrink-0`} />
              <p className="text-sm text-gray-700 flex-1">{item.text}</p>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 flex-shrink-0 mt-0.5 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Mağaza bağlama */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Trendyol Mağazanı Bağla</h3>
            <p className="text-orange-100 text-sm mt-1">
              API bilgilerini girerek gerçek veri analizini başlat. 15 dakikada hazır.
            </p>
          </div>
          <button className="bg-white text-orange-600 font-medium text-sm px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors flex-shrink-0 ml-4">
            Bağla →
          </button>
        </div>
      </div>
    </div>
  );
}
