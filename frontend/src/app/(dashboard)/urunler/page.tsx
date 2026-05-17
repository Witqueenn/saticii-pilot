"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Package } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number | null;
  stock: number | null;
  return_rate: number | null;
  description_score: number | null;
  seo_score: number | null;
  ai_suggestions: string[] | null;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-semibold w-8 ${score >= 70 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600"}`}>
        {score}
      </span>
    </div>
  );
}

export default function UrunlerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"tumu" | "dusuk">("tumu");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("products")
        .select("id, name, category, price, stock, return_rate, description_score, seo_score, ai_suggestions")
        .eq("seller_id", user.id)
        .order("description_score", { ascending: true });

      setProducts(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = products.filter((p) => {
    if (filter === "dusuk") return (p.description_score ?? 100) < 60;
    return true;
  });

  const lowCount = products.filter((p) => (p.description_score ?? 100) < 60).length;

  return (
    <div className="space-y-6 max-w-3xl w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ürün Analizi</h2>
          <p className="text-gray-500 mt-1">Açıklama ve SEO puanları, AI iyileştirme önerileri</p>
        </div>
        {lowCount > 0 && (
          <span className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-medium">
            {lowCount} ürün dikkat gerektiriyor
          </span>
        )}
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: "tumu" as const, label: `Tümü (${products.length})` },
          { key: "dusuk" as const, label: `Düşük Puan (${lowCount})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              filter === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {filter === "dusuk" ? "Düşük puanlı ürün yok." : "Henüz ürün yok."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{p.category}</p>
                </div>
                <div className="flex items-center gap-2 text-right flex-shrink-0">
                  {p.price && (
                    <span className="text-sm font-semibold text-gray-700">
                      {p.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </span>
                  )}
                  {p.return_rate !== null && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.return_rate > 20 ? "bg-red-100 text-red-700" :
                      p.return_rate > 10 ? "bg-yellow-100 text-yellow-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      %{p.return_rate} iade
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">İçerik Puanı</p>
                  <ScoreBar score={p.description_score ?? 0} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">SEO Puanı</p>
                  <ScoreBar score={p.seo_score ?? 0} />
                </div>
              </div>

              {p.ai_suggestions && p.ai_suggestions.length > 0 && (
                <div className="bg-orange-50 rounded-lg p-3 space-y-1.5">
                  <p className="text-xs text-orange-600 font-medium">AI Önerileri</p>
                  <ul className="space-y-1">
                    {p.ai_suggestions.map((s, i) => (
                      <li key={i} className="text-sm text-orange-900 flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5 flex-shrink-0">→</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors">
                AI ile iyileştirilmiş açıklama oluştur →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
