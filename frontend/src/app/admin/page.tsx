"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, TrendingUp, MessageSquare, RotateCcw } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalSellers: number;
  activeSellers: number;
  totalReviews: number;
  totalReturns: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentSellers, setRecentSellers] = useState<any[]>([]);

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
        });
        setRecentSellers(sellers.slice(0, 5));
      }
    }
    load();
  }, []);

  const cards = [
    { label: "Toplam Satıcı", value: stats?.totalSellers ?? "—", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Aktif Satıcı", value: stats?.activeSellers ?? "—", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Toplam Yorum", value: stats?.totalReviews ?? "—", icon: MessageSquare, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Toplam İade", value: stats?.totalReturns ?? "—", icon: RotateCcw, color: "text-red-600", bg: "bg-red-50" },
  ];

  const planLabel: Record<string, string> = {
    temel: "Temel",
    profesyonel: "Profesyonel",
    kurumsal: "Kurumsal",
  };

  const planColor: Record<string, string> = {
    temel: "bg-gray-100 text-gray-600",
    profesyonel: "bg-orange-100 text-orange-700",
    kurumsal: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Genel Bakış</h2>
        <p className="text-gray-500 mt-1">Tüm satıcıların özet istatistikleri</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-3">
            <div className={`${c.bg} ${c.color} p-2.5 rounded-lg`}>
              <c.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Son Kayıt Olan Satıcılar</h3>
          <Link href="/admin/saticilar" className="text-xs text-orange-600 hover:underline">
            Tümünü Gör →
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentSellers.length === 0 ? (
            <p className="p-6 text-sm text-gray-400 text-center">Henüz satıcı yok.</p>
          ) : (
            recentSellers.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.shop_name}</p>
                  <p className="text-xs text-gray-400">{s.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planColor[s.plan]}`}>
                    {planLabel[s.plan]}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${s.is_active ? "bg-green-500" : "bg-gray-300"}`} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
