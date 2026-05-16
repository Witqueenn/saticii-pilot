"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, CheckCircle, MessageSquare, Clock, Filter } from "lucide-react";
import { clsx } from "clsx";
import { ReviewSkeleton } from "@/components/Skeleton";

interface Review {
  id: string;
  product_name: string;
  rating: number;
  comment: string;
  customer_name: string | null;
  sentiment: string | null;
  is_urgent: boolean;
  is_replied: boolean;
  suggested_reply: string | null;
  reviewed_at: string;
}

const sentimentLabel: Record<string, { label: string; color: string }> = {
  olumlu: { label: "Olumlu", color: "bg-green-100 text-green-700" },
  notr: { label: "Nötr", color: "bg-gray-100 text-gray-600" },
  olumsuz: { label: "Olumsuz", color: "bg-red-100 text-red-700" },
  acil: { label: "ACİL", color: "bg-red-600 text-white" },
};

type FilterType = "tumu" | "acil" | "bekleyen" | "cevaplandi";

const filters: { key: FilterType; label: string }[] = [
  { key: "tumu", label: "Tümü" },
  { key: "acil", label: "Acil" },
  { key: "bekleyen", label: "Bekleyen" },
  { key: "cevaplandi", label: "Cevaplandı" },
];

export default function YorumlarPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("tumu");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("seller_id", user.id)
        .order("reviewed_at", { ascending: false });

      setReviews(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function markReplied(id: string) {
    const supabase = createClient();
    await supabase.from("reviews").update({ is_replied: true }).eq("id", id);
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, is_replied: true } : r));
  }

  const filtered = reviews.filter((r) => {
    if (activeFilter === "acil") return r.is_urgent && !r.is_replied;
    if (activeFilter === "bekleyen") return !r.is_replied;
    if (activeFilter === "cevaplandi") return r.is_replied;
    return true;
  });

  const counts = {
    tumu: reviews.length,
    acil: reviews.filter((r) => r.is_urgent && !r.is_replied).length,
    bekleyen: reviews.filter((r) => !r.is_replied).length,
    cevaplandi: reviews.filter((r) => r.is_replied).length,
  };

  return (
    <div className="space-y-6 max-w-3xl">
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

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={clsx(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
              activeFilter === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
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

      {loading ? (
        <div className="space-y-4">
          <ReviewSkeleton /><ReviewSkeleton /><ReviewSkeleton />
        </div>
      ) : filtered.length === 0 ? (
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
                  {r.customer_name && (
                    <p className="text-xs text-gray-400 mt-0.5">{r.customer_name}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-yellow-400 text-sm">
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </span>
                    {r.sentiment && sentimentLabel[r.sentiment] && (
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
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {new Date(r.reviewed_at).toLocaleDateString("tr-TR")}
                </span>
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

              {!r.suggested_reply && !r.is_replied && (
                <button className="text-xs text-orange-600 hover:text-orange-700 font-medium">
                  AI ile cevap taslağı oluştur →
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
