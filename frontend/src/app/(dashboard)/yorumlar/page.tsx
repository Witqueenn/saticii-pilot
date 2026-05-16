"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, MessageSquare, Clock, Filter } from "lucide-react";
import { clsx } from "clsx";

const MOCK_REVIEWS = [
  {
    id: "1",
    product_name: "Yazlık Keten Bluz - Beyaz",
    rating: 2,
    comment: "Beden çok küçük geldi, beden tablosuna bakıp L aldım ama M gibi. İade edeceğim.",
    sentiment: "olumsuz",
    is_urgent: true,
    is_replied: false,
    suggested_reply: "Merhaba, yaşadığınız beden sorununu özür dileriz. İade talebinizi hemen işleme alıyoruz. Bir sonraki alışverişinizde size özel %10 indirim sunacağız.",
  },
  {
    id: "2",
    product_name: "Çiçek Desenli Elbise - Pembe",
    rating: 5,
    comment: "Çok güzel bir ürün, tam beden. Hızlı kargo geldi, teşekkürler!",
    sentiment: "olumlu",
    is_urgent: false,
    is_replied: true,
    suggested_reply: null,
  },
  {
    id: "3",
    product_name: "Yazlık Keten Bluz - Beyaz",
    rating: 1,
    comment: "Ürün fotoğraftakiyle hiç benzemiyor, renk tamamen farklı. Çok hayal kırıklığı.",
    sentiment: "acil",
    is_urgent: true,
    is_replied: false,
    suggested_reply: "Merhaba, yaşadığınız hayal kırıklığı için çok özür dileriz. Ürün fotoğraflarımızı güncelliyoruz. Ücretsiz iade için hemen müşteri hizmetlerimizi arayabilirsiniz.",
  },
  {
    id: "4",
    product_name: "Çizgili Yazlık Elbise - Lacivert",
    rating: 4,
    comment: "Güzel ürün ama kargo biraz geç geldi.",
    sentiment: "notr",
    is_urgent: false,
    is_replied: false,
    suggested_reply: "Merhaba, geç kargo için özür dileriz. Kargonuzun gecikmesinden dolayı üzgünüz, bir sonraki siparişinizde öncelikli kargo sağlayacağız.",
  },
];

const sentimentLabel: Record<string, { label: string; color: string }> = {
  olumlu: { label: "Olumlu", color: "bg-green-100 text-green-700" },
  notr: { label: "Nötr", color: "bg-gray-100 text-gray-600" },
  olumsuz: { label: "Olumsuz", color: "bg-red-100 text-red-700" },
  acil: { label: "ACİL", color: "bg-red-600 text-white" },
};

type FilterType = "tumü" | "acil" | "bekleyen" | "cevaplandi";

const filters: { key: FilterType; label: string }[] = [
  { key: "tumü", label: "Tümü" },
  { key: "acil", label: "Acil" },
  { key: "bekleyen", label: "Bekleyen" },
  { key: "cevaplandi", label: "Cevaplandı" },
];

export default function YorumlarPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("tumü");
  const [reviews, setReviews] = useState(MOCK_REVIEWS);

  const filtered = reviews.filter((r) => {
    if (activeFilter === "acil") return r.is_urgent;
    if (activeFilter === "bekleyen") return !r.is_replied;
    if (activeFilter === "cevaplandi") return r.is_replied;
    return true;
  });

  const counts = {
    tumü: reviews.length,
    acil: reviews.filter((r) => r.is_urgent).length,
    bekleyen: reviews.filter((r) => !r.is_replied).length,
    cevaplandi: reviews.filter((r) => r.is_replied).length,
  };

  const markReplied = (id: string) =>
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, is_replied: true } : r)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Yorum Merkezi</h2>
          <p className="text-gray-500 mt-1">AI ile analiz edilmiş yorumlar ve cevap taslakları</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {counts.acil > 0 && (
            <span className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-medium">
              <AlertTriangle className="w-4 h-4" /> {counts.acil} acil
            </span>
          )}
          <span className="flex items-center gap-1 text-gray-500">
            <Clock className="w-4 h-4" /> {counts.bekleyen} bekliyor
          </span>
        </div>
      </div>

      {/* Filtre tabları */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={clsx(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
              activeFilter === key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {label}
            <span className={clsx(
              "ml-1.5 text-xs px-1.5 py-0.5 rounded-full",
              activeFilter === key ? "bg-orange-100 text-orange-600" : "bg-gray-200 text-gray-500"
            )}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Yorum listesi */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Filter className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Bu filtrede yorum yok.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className={clsx(
                "bg-white rounded-xl border p-5 space-y-3 transition-all",
                r.is_urgent && !r.is_replied ? "border-red-200 shadow-sm shadow-red-50" : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{r.product_name}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-yellow-400 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    {r.sentiment && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sentimentLabel[r.sentiment].color}`}>
                        {sentimentLabel[r.sentiment].label}
                      </span>
                    )}
                    {r.is_replied && (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Cevaplandı
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 leading-relaxed">{r.comment}</p>

              {r.suggested_reply && !r.is_replied && (
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-2">
                  <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> AI Cevap Taslağı
                  </p>
                  <p className="text-sm text-blue-900 leading-relaxed">{r.suggested_reply}</p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => markReplied(r.id)}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Onayla ve Cevapla
                    </button>
                    <button className="text-xs text-blue-600 border border-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                      Düzenle
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
