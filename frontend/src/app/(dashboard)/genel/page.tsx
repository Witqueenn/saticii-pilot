import { MessageSquare, AlertTriangle, Package, RotateCcw } from "lucide-react";

const stats = [
  { label: "Bekleyen Yorum", value: "—", sub: "0 acil", icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Düşük Puanlı Ürün", value: "—", sub: "açıklama güncelle", icon: Package, color: "text-orange-600", bg: "bg-orange-50" },
  { label: "Bu Haftaki İade", value: "—", sub: "kalıp analizi hazır", icon: RotateCcw, color: "text-red-600", bg: "bg-red-50" },
  { label: "Acil Bildirim", value: "—", sub: "hemen incele", icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Günlük Özet</h2>
        <p className="text-gray-500 mt-1">AI içgörülerin seni bekliyor.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-4">
            <div className={`${s.bg} ${s.color} p-3 rounded-lg`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
        <h3 className="font-semibold text-orange-900">Mağazanı Bağla</h3>
        <p className="text-sm text-orange-700 mt-2">
          Trendyol API bilgilerini girerek analizleri başlat. İlk verilerin işlenmesi 15 dakika sürer.
        </p>
        <button className="mt-4 bg-orange-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
          Mağaza Bağla →
        </button>
      </div>
    </div>
  );
}
