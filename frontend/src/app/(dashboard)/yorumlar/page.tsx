"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, MessageSquare, Clock } from "lucide-react";

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
];

const sentimentLabel: Record<string, { label: string; color: string }> = {
  olumlu: { label: "Olumlu", color: "bg-green-100 text-green-700" },
  notr: { label: "Nötr", color: "bg-gray-100 text-gray-700" },
  olumsuz: { label: "Olumsuz", color: "bg-red-100 text-red-700" },
  acil: { label: "ACİL", color: "bg-red-600 text-white" },
};

export default function YorumlarPage() {
  const [reviews] = useState(MOCK_REVIEWS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Yorum Merkezi</h2>
          <p className="text-gray-500 mt-1">AI ile analiz edilmiş yorumlar ve cevap taslakları</p>
        </div>
        <div className="flex gap-3 text-sm">
          <span className="flex items-center gap-1 text-red-600">
            <AlertTriangle className="w-4 h-4" /> 1 acil
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            <Clock className="w-4 h-4" /> 1 bekliyor
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div
            key={r.id}
            className={`bg-white rounded-xl border p-5 space-y-3 ${
              r.is_urgent ? "border-red-300" : "border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">{r.product_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-yellow-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  {r.sentiment && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sentimentLabel[r.sentiment].color}`}>
                      {sentimentLabel[r.sentiment].label}
                    </span>
                  )}
                  {r.is_replied && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="w-3 h-3" /> Cevaplandı
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{r.comment}</p>

            {r.suggested_reply && !r.is_replied && (
              <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> AI Cevap Taslağı
                </p>
                <p className="text-sm text-blue-900">{r.suggested_reply}</p>
                <button className="mt-2 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                  Cevabı Onayla ve Gönder
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
