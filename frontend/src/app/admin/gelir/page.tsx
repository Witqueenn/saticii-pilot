"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TrendingUp, TrendingDown, Users, Zap, AlertTriangle } from "lucide-react";

const planPrice: Record<string, number> = { temel: 0, profesyonel: 599, marketing: 999 };
const planLabel: Record<string, string> = { temel: "Temel", profesyonel: "Pro", marketing: "Marketing" };
const planColor: Record<string, string> = { temel: "bg-gray-400", profesyonel: "bg-orange-500", marketing: "bg-indigo-500" };

interface Seller {
  id: string;
  shop_name: string;
  email: string;
  plan: string;
  is_active: boolean;
  created_at: string;
}

export default function GelirPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("sellers").select("id, shop_name, email, plan, is_active, created_at").order("created_at", { ascending: false });
      setSellers(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const mrr = sellers.reduce((s, seller) => s + (planPrice[seller.plan] ?? 0), 0);
  const arr = mrr * 12;
  const paid = sellers.filter((s) => s.plan !== "temel");
  const free = sellers.filter((s) => s.plan === "temel");

  const byPlan = {
    temel: sellers.filter((s) => s.plan === "temel"),
    profesyonel: sellers.filter((s) => s.plan === "profesyonel"),
    marketing: sellers.filter((s) => s.plan === "marketing"),
  };

  // Churn riski: ücretsiz plan + 30+ gün önce kayıt
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const churnRisk = sellers.filter((s) => s.plan === "temel" && new Date(s.created_at) < thirtyDaysAgo);

  // Son 6 ay MRR simülasyonu (gerçek billing olmadığı için mevcut snapshot'tan)
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({
      label: d.toLocaleDateString("tr-TR", { month: "short" }),
      mrr: i === 0 ? mrr : Math.max(0, mrr - (i * Math.floor(mrr * 0.08))),
    });
  }
  const maxMRR = Math.max(...months.map((m) => m.mrr), 1);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gelir Takibi</h2>
        <p className="text-gray-500 mt-1">MRR, ARR ve plan dağılımı</p>
      </div>

      {/* Ana metrikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Aylık Gelir (MRR)", value: `₺${mrr.toLocaleString("tr-TR")}`, sub: "aktif abonelikler", icon: Zap, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Yıllık Gelir (ARR)", value: `₺${arr.toLocaleString("tr-TR")}`, sub: "MRR × 12", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Ücretli Satıcı", value: paid.length, sub: `${free.length} ücretsiz`, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Churn Riski", value: churnRisk.length, sub: "30+ gün ücretsiz", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`${c.bg} ${c.color} p-2 rounded-lg w-fit mb-3`}><c.icon className="w-4 h-4" /></div>
            <p className="text-2xl font-bold text-gray-900">{loading ? "—" : c.value}</p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">{c.label}</p>
            <p className="text-xs text-gray-400">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* MRR Trendi */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-1">MRR Trendi</h3>
          <p className="text-xs text-gray-400 mb-4">Son 6 ay (mevcut satıcı bazlı projeksiyon)</p>
          {loading ? <div className="h-32 bg-gray-50 animate-pulse rounded-xl" /> : (
            <div className="flex items-end gap-2 h-32">
              {months.map((m) => (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-gray-400">{m.mrr > 0 ? `₺${(m.mrr/1000).toFixed(1)}k` : ""}</span>
                  <div className="w-full bg-yellow-400 rounded-t transition-all" style={{ height: `${Math.max((m.mrr / maxMRR) * 100, 4)}px` }} />
                  <span className="text-[10px] text-gray-400">{m.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Plan Dağılımı */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Plan Dağılımı & Gelir</h3>
          <div className="space-y-4">
            {(["marketing", "profesyonel", "temel"] as const).map((plan) => {
              const count = byPlan[plan].length;
              const revenue = count * planPrice[plan];
              const pct = sellers.length > 0 ? Math.round((count / sellers.length) * 100) : 0;
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{planLabel[plan]}</span>
                      <span className="text-xs text-gray-400">{count} satıcı · %{pct}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {planPrice[plan] === 0 ? "—" : `₺${revenue.toLocaleString("tr-TR")}/ay`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${planColor[plan]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
            <span className="text-sm text-gray-500">Toplam MRR</span>
            <span className="text-sm font-bold text-gray-900">₺{mrr.toLocaleString("tr-TR")}/ay</span>
          </div>
        </div>
      </div>

      {/* Churn Riski */}
      {churnRisk.length > 0 && (
        <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
          <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-semibold text-red-700">Churn Riski — 30+ Gün Ücretsiz</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {churnRisk.slice(0, 10).map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.shop_name}</p>
                  <p className="text-xs text-gray-400">{s.email}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {s.is_active ? "Aktif" : "Pasif"}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{new Date(s.created_at).toLocaleDateString("tr-TR")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ücretli satıcılar */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">Ücretli Satıcılar ({paid.length})</h3>
        </div>
        {paid.length === 0 ? (
          <p className="px-5 py-8 text-center text-gray-400 text-sm">Henüz ücretli satıcı yok.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {paid.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.shop_name}</p>
                  <p className="text-xs text-gray-400">{s.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₺{planPrice[s.plan].toLocaleString("tr-TR")}/ay</p>
                  <p className="text-xs text-gray-400">{planLabel[s.plan]}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
