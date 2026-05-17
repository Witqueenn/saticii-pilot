"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

interface Return {
  id: string;
  product_name: string;
  reason: string;
  customer_comment: string | null;
  returned_at: string;
}

interface Pattern {
  product_name: string;
  total: number;
  reasons: Record<string, number>;
  topReason: string;
  recommendation: string;
}

const reasonLabel: Record<string, string> = {
  beden_uyumsuzlugu: "Beden Uyumsuzluğu",
  renk_farki: "Renk Farkı",
  kalite_sorunu: "Kalite Sorunu",
  yanlis_urun: "Yanlış Ürün",
  hasarli: "Hasarlı Geldi",
  diger: "Diğer",
};

const reasonRecommendation: Record<string, string> = {
  beden_uyumsuzlugu: "Ürün sayfasına ölçü tablosu ve beden karşılaştırma rehberi ekleyin.",
  renk_farki: "Ürün fotoğraflarını farklı ışık koşullarında çekerek güncelleyin.",
  kalite_sorunu: "Ürün açıklamasında kumaş içeriğini ve bakım talimatlarını belirtin.",
  yanlis_urun: "Ürün başlığını ve kategori etiketlerini kontrol edin.",
  hasarli: "Paketleme yönteminizi gözden geçirin.",
  diger: "Müşteri yorumlarını inceleyin.",
};

function buildPatterns(returns: Return[]): Pattern[] {
  const map: Record<string, { total: number; reasons: Record<string, number> }> = {};

  returns.forEach((r) => {
    if (!map[r.product_name]) map[r.product_name] = { total: 0, reasons: {} };
    map[r.product_name].total++;
    map[r.product_name].reasons[r.reason] = (map[r.product_name].reasons[r.reason] ?? 0) + 1;
  });

  return Object.entries(map)
    .map(([product_name, data]) => {
      const topReason = Object.entries(data.reasons).sort((a, b) => b[1] - a[1])[0][0];
      return {
        product_name,
        total: data.total,
        reasons: data.reasons,
        topReason,
        recommendation: reasonRecommendation[topReason] ?? "Müşteri yorumlarını inceleyin.",
      };
    })
    .sort((a, b) => b.total - a.total);
}

export default function IadelerPage() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("returns")
        .select("*")
        .eq("seller_id", user.id)
        .order("returned_at", { ascending: false });

      setReturns(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekReturns = returns.filter((r) => new Date(r.returned_at) >= weekAgo).length;

  const patterns = buildPatterns(returns);

  return (
    <div className="space-y-6 max-w-3xl w-full">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">İade Analizi</h2>
        <p className="text-gray-500 mt-1">Tekrar eden iade sebepleri ve AI önerileri</p>
      </div>

      {/* Özet */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Toplam İade</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{loading ? "—" : returns.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Bu Hafta</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{loading ? "—" : weekReturns}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ))}
        </div>
      ) : patterns.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <RotateCcw className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Henüz iade kaydı yok.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Ürün Bazlı Kalıp Analizi</h3>
          {patterns.map((p) => (
            <div key={p.product_name} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{p.product_name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {p.total} iade · Başlıca: <strong>{reasonLabel[p.topReason]}</strong>
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2 ${
                  p.total >= 5 ? "bg-red-100 text-red-700" :
                  p.total >= 3 ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {p.total >= 5 ? "Yüksek Öncelik" : p.total >= 3 ? "Orta Öncelik" : "Düşük Öncelik"}
                </span>
              </div>

              {/* Sebep dağılımı */}
              <div className="space-y-1.5">
                {Object.entries(p.reasons)
                  .sort((a, b) => b[1] - a[1])
                  .map(([reason, count]) => (
                    <div key={reason} className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-orange-400 h-1.5 rounded-full"
                          style={{ width: `${(count / p.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-36 flex-shrink-0">
                        {reasonLabel[reason]} ({count})
                      </span>
                    </div>
                  ))}
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs text-orange-700 font-medium mb-1">AI Önerisi</p>
                <p className="text-sm text-orange-900">{p.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
