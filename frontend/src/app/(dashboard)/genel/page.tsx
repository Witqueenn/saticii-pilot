"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, AlertTriangle, Package, RotateCcw, TrendingDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { CardSkeleton } from "@/components/Skeleton";

interface Summary {
  totalReviews: number;
  urgentReviews: number;
  pendingReviews: number;
  lowScoreProducts: number;
  weekReturns: number;
  totalProducts: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setShopName(user.user_metadata?.shop_name ?? "Mağazam");

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [
        { data: reviews },
        { data: products },
        { data: returns },
      ] = await Promise.all([
        supabase.from("reviews").select("is_urgent, is_replied").eq("seller_id", user.id),
        supabase.from("products").select("description_score, seo_score").eq("seller_id", user.id),
        supabase.from("returns").select("returned_at").eq("seller_id", user.id).gte("returned_at", weekAgo.toISOString()),
      ]);

      setSummary({
        totalReviews: reviews?.length ?? 0,
        urgentReviews: reviews?.filter((r) => r.is_urgent).length ?? 0,
        pendingReviews: reviews?.filter((r) => !r.is_replied).length ?? 0,
        lowScoreProducts: products?.filter((p) => (p.description_score ?? 100) < 60).length ?? 0,
        weekReturns: returns?.length ?? 0,
        totalProducts: products?.length ?? 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  const stats = [
    {
      label: "Bekleyen Yorum",
      value: summary?.pendingReviews ?? 0,
      sub: summary?.urgentReviews ? `${summary.urgentReviews} acil` : "yorum yok",
      icon: MessageSquare,
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: summary?.urgentReviews ? `${summary.urgentReviews} acil` : null,
      trendUp: false,
      href: "/yorumlar",
    },
    {
      label: "Düşük Puanlı Ürün",
      value: summary?.lowScoreProducts ?? 0,
      sub: "açıklama güncelle",
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-50",
      trend: summary?.lowScoreProducts ? "Puan < 60" : null,
      trendUp: false,
      href: "/urunler",
    },
    {
      label: "Bu Haftaki İade",
      value: summary?.weekReturns ?? 0,
      sub: "kalıp analizi",
      icon: RotateCcw,
      color: "text-red-600",
      bg: "bg-red-50",
      trend: null,
      trendUp: false,
      href: "/iadeler",
    },
    {
      label: "Toplam Ürün",
      value: summary?.totalProducts ?? 0,
      sub: "aktif listeleme",
      icon: AlertTriangle,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      trend: null,
      trendUp: true,
      href: "/urunler",
    },
  ];

  const hasData = summary && (summary.urgentReviews > 0 || summary.lowScoreProducts > 0 || summary.weekReturns > 0);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Günlük Özet</h2>
        <p className="text-gray-500 mt-1">Hoş geldin, {shopName}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {loading ? (
          <>
            <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
          </>
        ) : stats.map((s) => (
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
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {loading ? "—" : s.value}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-400">{s.sub}</p>
                {s.trend && (
                  <span className={`flex items-center gap-0.5 text-xs font-medium ${s.trendUp ? "text-green-600" : "text-red-500"}`}>
                    {s.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {s.trend}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Aksiyon listesi */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Öncelikli Aksiyonlar</h3>
          <span className="text-xs text-gray-400">Gerçek zamanlı</span>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-10 animate-pulse bg-gray-100 rounded-lg" />)}
            </div>
          ) : !hasData ? (
            <p className="p-6 text-sm text-gray-400 text-center">Şu an bekleyen aksiyon yok.</p>
          ) : (
            <>
              {(summary?.urgentReviews ?? 0) > 0 && (
                <Link href="/yorumlar" className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors group">
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 flex-1">
                    {summary!.urgentReviews} acil yorum cevap bekliyor.
                  </p>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 flex-shrink-0 mt-0.5 transition-colors" />
                </Link>
              )}
              {(summary?.lowScoreProducts ?? 0) > 0 && (
                <Link href="/urunler" className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors group">
                  <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 flex-1">
                    {summary!.lowScoreProducts} ürünün açıklama puanı 60'ın altında — iyileştirme önerisi hazır.
                  </p>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 flex-shrink-0 mt-0.5 transition-colors" />
                </Link>
              )}
              {(summary?.weekReturns ?? 0) > 0 && (
                <Link href="/iadeler" className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors group">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 flex-1">
                    Bu hafta {summary!.weekReturns} iade geldi — kalıp analizi için incele.
                  </p>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 flex-shrink-0 mt-0.5 transition-colors" />
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Pazaryerini Bağla</h3>
            <p className="text-orange-100 text-sm mt-1">
              Trendyol, Hepsiburada, N11 ve daha fazlası. API bilgilerini girerek gerçek veri analizini başlat.
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
