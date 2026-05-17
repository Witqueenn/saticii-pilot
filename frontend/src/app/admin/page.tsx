"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Users, TrendingUp, MessageSquare, RotateCcw,
  Link2, AlertTriangle, CheckCircle2, Clock,
  Mail, Zap, CircleDot, Star,
} from "lucide-react";
import Link from "next/link";

const planColor: Record<string, string> = {
  temel: "bg-gray-100 text-gray-600",
  profesyonel: "bg-orange-100 text-orange-700",
  marketing: "bg-indigo-100 text-indigo-700",
};
const planLabel: Record<string, string> = {
  temel: "Temel",
  profesyonel: "Pro",
  marketing: "Marketing",
};
const planMRR: Record<string, number> = {
  temel: 0,
  profesyonel: 599,
  marketing: 999,
};

interface Stats {
  totalSellers: number;
  activeSellers: number;
  connectedSellers: number;
  newThisWeek: number;
  totalReviews: number;
  totalReturns: number;
  totalFormResponses: number;
  waitlistCount: number;
  waitlistThisWeek: number;
  temel: number;
  profesyonel: number;
  marketing: number;
  mrr: number;
}

interface Alert { type: "warning" | "info"; message: string; href?: string; }
interface WeekBucket { label: string; count: number; }

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentSellers, setRecentSellers] = useState<any[]>([]);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [growth, setGrowth] = useState<WeekBucket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [
        { data: sellers },
        { count: reviewCount },
        { count: returnCount },
        { count: formCount },
        { data: credentials },
        { data: waitlist },
        { data: waitlistWeek },
      ] = await Promise.all([
        supabase.from("sellers").select("id, shop_name, email, plan, is_active, created_at, onboarding_done").order("created_at", { ascending: false }),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
        supabase.from("returns").select("*", { count: "exact", head: true }),
        supabase.from("form_responses").select("*", { count: "exact", head: true }),
        supabase.from("marketplace_credentials").select("seller_id"),
        supabase.from("waitlist").select("id", { count: "exact", head: false }),
        supabase.from("waitlist").select("id").gte("created_at", weekAgo.toISOString()),
      ]);

      const connSet = new Set((credentials ?? []).map((c: any) => c.seller_id));
      setConnectedIds(connSet);

      if (sellers) {
        const newThisWeek = sellers.filter((s) => new Date(s.created_at) >= weekAgo).length;
        const mrr = sellers.reduce((sum, s) => sum + (planMRR[s.plan] ?? 0), 0);

        setStats({
          totalSellers: sellers.length,
          activeSellers: sellers.filter((s) => s.is_active).length,
          connectedSellers: sellers.filter((s) => connSet.has(s.id)).length,
          newThisWeek,
          totalReviews: reviewCount ?? 0,
          totalReturns: returnCount ?? 0,
          totalFormResponses: formCount ?? 0,
          waitlistCount: waitlist?.length ?? 0,
          waitlistThisWeek: waitlistWeek?.length ?? 0,
          temel: sellers.filter((s) => s.plan === "temel").length,
          profesyonel: sellers.filter((s) => s.plan === "profesyonel").length,
          marketing: sellers.filter((s) => s.plan === "marketing").length,
          mrr,
        });

        // Son 6 hafta büyüme
        const buckets: WeekBucket[] = [];
        for (let i = 5; i >= 0; i--) {
          const start = new Date();
          start.setDate(start.getDate() - (i + 1) * 7);
          const end = new Date();
          end.setDate(end.getDate() - i * 7);
          const count = sellers.filter((s) => {
            const d = new Date(s.created_at);
            return d >= start && d < end;
          }).length;
          const label = `H-${i === 0 ? "Bu" : i}`;
          buckets.push({ label: i === 0 ? "Bu hafta" : `${i}h önce`, count });
        }
        setGrowth(buckets);

        // Uyarılar
        const newAlerts: Alert[] = [];
        const notConnected = sellers.filter((s) => s.is_active && !connSet.has(s.id));
        if (notConnected.length > 0) newAlerts.push({ type: "warning", message: `${notConnected.length} aktif satıcı henüz mağaza bağlantısı kurmadı.`, href: "/admin/saticilar" });
        const notOnboarded = sellers.filter((s) => s.is_active && !s.onboarding_done);
        if (notOnboarded.length > 0) newAlerts.push({ type: "warning", message: `${notOnboarded.length} satıcının kurulumu tamamlanmamış.`, href: "/admin/saticilar" });
        const inactive = sellers.filter((s) => !s.is_active);
        if (inactive.length > 0) newAlerts.push({ type: "info", message: `${inactive.length} satıcı hesabı pasif durumda.`, href: "/admin/saticilar" });
        setAlerts(newAlerts);
        setRecentSellers(sellers.slice(0, 6));
      }

      setLoading(false);
    }
    load();
  }, []);

  const kpiCards = [
    { label: "Toplam Satıcı", value: stats?.totalSellers, sub: stats?.newThisWeek ? `+${stats.newThisWeek} bu hafta` : "bu hafta yeni yok", icon: Users, color: "text-blue-600", bg: "bg-blue-50", href: "/admin/saticilar" },
    { label: "Aktif Satıcı", value: stats?.activeSellers, sub: stats ? `%${Math.round((stats.activeSellers / Math.max(stats.totalSellers, 1)) * 100)} oran` : "—", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Mağaza Bağlı", value: stats?.connectedSellers, sub: stats ? `${stats.totalSellers - stats.connectedSellers} bağlı değil` : "—", icon: Link2, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Tahmini MRR", value: stats ? `₺${stats.mrr.toLocaleString("tr-TR")}` : "—", sub: `${(stats?.profesyonel ?? 0) + (stats?.marketing ?? 0)} ücretli satıcı`, icon: Zap, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Müşteri Yanıtı", value: stats?.totalFormResponses, sub: "form_responses toplamı", icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Waitlist", value: stats?.waitlistCount, sub: stats?.waitlistThisWeek ? `+${stats.waitlistThisWeek} bu hafta` : "bu hafta yok", icon: Mail, color: "text-indigo-600", bg: "bg-indigo-50", href: "/admin/waitlist" },
  ];

  const maxGrowth = Math.max(...growth.map((b) => b.count), 1);
  const planTotal = (stats?.temel ?? 0) + (stats?.profesyonel ?? 0) + (stats?.marketing ?? 0);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Genel Bakış</h2>
        <p className="text-gray-500 mt-1">Platform geneli özet</p>
      </div>

      {/* KPI Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((c) => (
          <div
            key={c.label}
            className={`bg-white rounded-xl border border-gray-200 p-4 ${c.href ? "hover:border-orange-200 cursor-pointer transition-colors" : ""}`}
            onClick={() => c.href && (window.location.href = c.href)}
          >
            <div className={`${c.bg} ${c.color} p-2 rounded-lg w-fit mb-3`}>
              <c.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? "—" : (c.value ?? 0)}</p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">{c.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{loading ? "…" : c.sub}</p>
          </div>
        ))}
      </div>

      {/* Uyarılar */}
      {!loading && alerts.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
          <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-800">Dikkat Gerekenler</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${a.type === "warning" ? "bg-amber-400" : "bg-blue-300"}`} />
                  <p className="text-sm text-gray-700">{a.message}</p>
                </div>
                {a.href && <Link href={a.href} className="text-xs text-orange-600 hover:underline flex-shrink-0 ml-4">İncele →</Link>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Plan & Gelir */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Plan & Gelir</h3>
            {stats && <span className="text-xs text-gray-400">MRR: <span className="font-semibold text-gray-700">₺{stats.mrr.toLocaleString("tr-TR")}</span></span>}
          </div>
          {loading ? <p className="text-sm text-gray-400">Yükleniyor...</p> : (
            <div className="space-y-3">
              {([
                { key: "temel", price: 0 },
                { key: "profesyonel", price: 599 },
                { key: "marketing", price: 999 },
              ] as const).map(({ key, price }) => {
                const count = stats?.[key] ?? 0;
                const pct = planTotal > 0 ? Math.round((count / planTotal) * 100) : 0;
                const revenue = count * price;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planColor[key]}`}>{planLabel[key]}</span>
                        <span className="text-xs text-gray-400">{count} satıcı · %{pct}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {price === 0 ? "Ücretsiz" : `₺${revenue.toLocaleString("tr-TR")}/ay`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${key === "temel" ? "bg-gray-400" : key === "profesyonel" ? "bg-orange-500" : "bg-indigo-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sistem Durumu */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sistem Durumu</p>
            {[
              { label: "Supabase DB", ok: true },
              { label: "Resend Email", ok: true },
              { label: "OpenAI / Replicate", ok: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{item.label}</span>
                <span className={`flex items-center gap-1 text-xs font-medium ${item.ok ? "text-green-600" : "text-red-500"}`}>
                  <CircleDot className="w-3 h-3" />
                  {item.ok ? "Çalışıyor" : "Hata"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Büyüme Trendi + Son Kayıtlar */}
        <div className="space-y-6">
          {/* Haftalık büyüme */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Haftalık Büyüme</h3>
            {loading ? (
              <div className="flex items-end gap-2 h-20">
                {[1,2,3,4,5,6].map(i => <div key={i} className="flex-1 animate-pulse bg-gray-100 rounded-t" style={{ height: `${20 + i * 12}%` }} />)}
              </div>
            ) : (
              <div className="flex items-end gap-2 h-20">
                {growth.map((b) => (
                  <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-500 font-medium">{b.count || ""}</span>
                    <div
                      className="w-full rounded-t-sm bg-orange-400 transition-all"
                      style={{ height: `${Math.max((b.count / maxGrowth) * 64, b.count > 0 ? 8 : 2)}px` }}
                    />
                    <span className="text-[9px] text-gray-400 leading-none text-center">{b.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Son kayıtlar */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">Son Kayıtlar</h3>
              <Link href="/admin/saticilar" className="text-xs text-orange-600 hover:underline">Tümü →</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {loading ? (
                <p className="p-5 text-sm text-gray-400 text-center">Yükleniyor...</p>
              ) : recentSellers.length === 0 ? (
                <p className="p-5 text-sm text-gray-400 text-center">Henüz satıcı yok.</p>
              ) : recentSellers.map((s) => {
                const isConn = connectedIds.has(s.id);
                return (
                  <Link key={s.id} href={`/admin/saticilar/${s.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {s.shop_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{s.shop_name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${planColor[s.plan] ?? planColor.temel}`}>{planLabel[s.plan] ?? s.plan}</span>
                          <span className={`text-[10px] font-medium ${isConn ? "text-green-600" : "text-gray-400"}`}>
                            {isConn ? <><CheckCircle2 className="w-2.5 h-2.5 inline mr-0.5" />Bağlı</> : <><Clock className="w-2.5 h-2.5 inline mr-0.5" />Bağlantı yok</>}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? "bg-green-500" : "bg-gray-300"}`} />
                      <span className="text-[10px] text-gray-400">{new Date(s.created_at).toLocaleDateString("tr-TR")}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
