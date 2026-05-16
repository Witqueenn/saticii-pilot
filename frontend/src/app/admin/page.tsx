"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, TrendingUp, MessageSquare, RotateCcw, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalSellers: number;
  activeSellers: number;
  totalReviews: number;
  totalReturns: number;
  temel: number;
  profesyonel: number;
  kurumsal: number;
}

const planColor: Record<string, string> = {
  temel: "bg-gray-100 text-gray-600",
  profesyonel: "bg-orange-100 text-orange-700",
  kurumsal: "bg-purple-100 text-purple-700",
};

const planLabel: Record<string, string> = {
  temel: "Temel",
  profesyonel: "Profesyonel",
  kurumsal: "Kurumsal",
};

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentSellers, setRecentSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: sellers } = await supabase
        .from("sellers")
        .select("id, shop_name, email, plan, is_active, created_at")
        .order("created_at", { ascending: false });

      const { count: reviewCount } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true });

      const { count: returnCount } = await supabase
        .from("returns")
        .select("*", { count: "exact", head: true });

      if (sellers) {
        setStats({
          totalSellers: sellers.length,
          activeSellers: sellers.filter((s) => s.is_active).length,
          totalReviews: reviewCount ?? 0,
          totalReturns: returnCount ?? 0,
          temel: sellers.filter((s) => s.plan === "temel").length,
          profesyonel: sellers.filter((s) => s.plan === "profesyonel").length,
          kurumsal: sellers.filter((s) => s.plan === "kurumsal").length,
        });
        setRecentSellers(sellers.slice(0, 5));
      }
      setLoading(false);
    }
    load();
  }, []);

  const kpiCards = [
    {
      label: "Toplam Satıcı",
      value: stats?.totalSellers ?? "—",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: null,
    },
    {
      label: "Aktif Satıcı",
      value: stats?.activeSellers ?? "—",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
      trend: stats ? Math.round((stats.activeSellers / Math.max(stats.totalSellers, 1)) * 100) + "% aktif" : null,
      trendUp: true,
    },
    {
      label: "Toplam Yorum",
      value: stats?.totalReviews ?? "—",
      icon: MessageSquare,
      color: "text-orange-600",
      bg: "bg-orange-50",
      trend: null,
    },
    {
      label: "Toplam İade",
      value: stats?.totalReturns ?? "—",
      icon: RotateCcw,
      color: "text-red-600",
      bg: "bg-red-50",
      trend: null,
    },
  ];

  const planTotal = (stats?.temel ?? 0) + (stats?.profesyonel ?? 0) + (stats?.kurumsal ?? 0);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Genel Bakış</h2>
        <p className="text-gray-500 mt-1">Platform geneli özet</p>
      </div>

      {/* KPI Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`${c.bg} ${c.color} p-2 rounded-lg`}>
                <c.icon className="w-4 h-4" />
              </div>
              {c.trend && (
                <span className={`text-xs font-medium flex items-center gap-0.5 ${c.trendUp ? "text-green-600" : "text-red-500"}`}>
                  {c.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {c.trend}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? "—" : c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Plan Dağılımı */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Plan Dağılımı</h3>
          {loading ? (
            <p className="text-sm text-gray-400">Yükleniyor...</p>
          ) : (
            <div className="space-y-3">
              {(["temel", "profesyonel", "kurumsal"] as const).map((plan) => {
                const count = stats?.[plan] ?? 0;
                const pct = planTotal > 0 ? Math.round((count / planTotal) * 100) : 0;
                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planColor[plan]}`}>
                        {planLabel[plan]}
                      </span>
                      <span className="text-xs text-gray-500">{count} satıcı · %{pct}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          plan === "temel" ? "bg-gray-400" :
                          plan === "profesyonel" ? "bg-orange-500" : "bg-purple-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Son Kayıtlar */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Son Kayıtlar</h3>
            <Link href="/admin/saticilar" className="text-xs text-orange-600 hover:underline">
              Tümünü Gör →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <p className="p-5 text-sm text-gray-400 text-center">Yükleniyor...</p>
            ) : recentSellers.length === 0 ? (
              <p className="p-5 text-sm text-gray-400 text-center">Henüz satıcı yok.</p>
            ) : (
              recentSellers.map((s) => (
                <Link
                  key={s.id}
                  href={`/admin/saticilar/${s.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {s.shop_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.shop_name}</p>
                      <p className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString("tr-TR")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planColor[s.plan]}`}>
                      {planLabel[s.plan]}
                    </span>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.is_active ? "bg-green-500" : "bg-gray-300"}`} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
