"use client";

const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Yazlık Keten Bluz - Beyaz",
    category: "Kadın > Bluz",
    description_score: 42,
    seo_score: 38,
    ai_suggestions: [
      "Ölçü tablosu eksik — eklenirse iade oranı düşer",
      "Kumaş içeriği belirtilmemiş",
      "SEO için 'keten bluz', 'yazlık bluz' anahtar kelimelerini ekle",
    ],
  },
  {
    id: "2",
    name: "Çiçek Desenli Elbise - Pembe",
    category: "Kadın > Elbise",
    description_score: 78,
    seo_score: 71,
    ai_suggestions: ["Bakım talimatları eklenebilir"],
  },
];

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-medium text-gray-700 w-8">{score}</span>
    </div>
  );
}

export default function UrunlerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ürün Açıklama Analizi</h2>
        <p className="text-gray-500 mt-1">AI ile tespit edilen zayıf açıklamalar ve iyileştirme önerileri</p>
      </div>

      <div className="space-y-4">
        {MOCK_PRODUCTS.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div>
              <p className="font-medium text-gray-900">{p.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{p.category}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">İçerik Puanı</p>
                <ScoreBar score={p.description_score} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">SEO Puanı</p>
                <ScoreBar score={p.seo_score} />
              </div>
            </div>

            {p.ai_suggestions && p.ai_suggestions.length > 0 && (
              <ul className="space-y-1">
                {p.ai_suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">→</span> {s}
                  </li>
                ))}
              </ul>
            )}

            <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
              AI ile iyileştirilmiş açıklama oluştur →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
