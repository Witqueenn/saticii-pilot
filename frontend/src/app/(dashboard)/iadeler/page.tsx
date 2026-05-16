"use client";

const MOCK_PATTERNS = [
  {
    product_name: "Yazlık Keten Bluz - Beyaz",
    total_returns: 8,
    dominant_reason: "beden_uyumsuzlugu",
    recommendation: "Ürünün ölçü tablosunu güncelleyin ve beden karşılaştırma rehberi ekleyin.",
    urgency: "yuksek",
  },
  {
    product_name: "Çiçek Desenli Elbise - Pembe",
    total_returns: 3,
    dominant_reason: "renk_farki",
    recommendation: "Ürün fotoğraflarını gün ışığında yeniden çekin.",
    urgency: "orta",
  },
];

const urgencyStyle: Record<string, string> = {
  yuksek: "bg-red-100 text-red-700",
  orta: "bg-yellow-100 text-yellow-700",
  dusuk: "bg-green-100 text-green-700",
};

const reasonLabel: Record<string, string> = {
  beden_uyumsuzlugu: "Beden Uyumsuzluğu",
  renk_farki: "Renk Farkı",
  kalite_sorunu: "Kalite Sorunu",
  yanlis_urun: "Yanlış Ürün",
  hasarli: "Hasarlı Geldi",
  diger: "Diğer",
};

export default function IadelerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">İade Kalıp Analizi</h2>
        <p className="text-gray-500 mt-1">Tekrar eden iade sebepleri ve AI önerileri</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm font-medium text-gray-700 mb-1">Bu Ay Toplam İade</p>
        <p className="text-3xl font-bold text-gray-900">11</p>
        <p className="text-sm text-red-600 mt-1">↑ Geçen aya göre %22 artış</p>
      </div>

      <div className="space-y-4">
        {MOCK_PATTERNS.map((p) => (
          <div key={p.product_name} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">{p.product_name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{p.total_returns} iade · Başlıca neden: <strong>{reasonLabel[p.dominant_reason]}</strong></p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${urgencyStyle[p.urgency]}`}>
                {p.urgency === "yuksek" ? "Yüksek Öncelik" : p.urgency === "orta" ? "Orta Öncelik" : "Düşük Öncelik"}
              </span>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs text-orange-700 font-medium mb-1">AI Önerisi</p>
              <p className="text-sm text-orange-900">{p.recommendation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
