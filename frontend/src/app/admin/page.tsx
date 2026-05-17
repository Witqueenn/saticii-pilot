"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Users, TrendingUp, MessageSquare, RotateCcw,
  Link2, AlertTriangle, CheckCircle2, Clock,
  Mail, Zap, CircleDot,
} from "lucide-react";
import Link from "next/link";

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
const planMRR: Record<string, number> = {
  temel: 499,
  profesyonel: 999,
  kurumsal: 2499,
};

interface Stats {
  totalSellers: number;
  activeSellers: number;
  connectedSellers: number;
  newThisWeek: number;
  totalReviews: number;
  totalReturns: number;
  waitlistCount: number;
  waitlistThisWeek: number;
  temel: number;
  profesyonel: number;
  kurumsal: number;
  mrr: number;
}

interface Alert {
  type: "warning" | "info";
  message: string;
  href?: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentSellers, setRecentSellers] = useState<any[]>([]);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [alerts, setAlerts] = useState<Alert[]>([]);
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
        { data: credentials },
        { data: waitlist },
        { data: waitlistWeek },
      ] = await Promise.all([
        supabase.from("sellers").select("id, shop_name, email, plan, is_active, created_at, onboarding_done").order("created_at", { ascending: false }),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
        supabase.from("returns").select("*", { count: "exact", head: true }),
        supabase.from("marketplace_credentials").select("seller_id"),
        supabase.from("waitlist").select("id", { count: "exact", head: false }),
        supabase.from("waitlist").select("id").gte("created_at", weekAgo.toISOString()),
      ]);

      const connSet = new Set((credentials ?? []).map((c: any) => c.seller_id));
      setConnectedIds(connSet);

      if (sellers) {
        const newThisWeek = sellers.filter(
          (s) => new Date(s.created_at) >= weekAgo
        ).length;

        const mrr = sellers.reduce((sum, s) => sum + (planMRR[s.plan] ?? 0), 0);

        setStats({
          totalSellers: sellers.length,
          activeSellers: sellers.filter((s) => s.is_active).length,
          connectedSellers: sellers.filter((s) => connSet.has(s.id)).length,
          newThisWeek,
          totalReviews: reviewCount ?? 0,
          totalReturns: returnCount ?? 0,
          waitlistCount: waitlist?.length ?? 0,
          waitlistThisWeek: waitlistWeek?.length ?? 0,
          temel: sellers.filter((s) => s.plan === "temel").length,
          profesyonel: sellers.filter((s) => s.plan === "profesyonel").length,
          kurumsal: sellers.filter((s) => s.plan === "kurumsal").length,
          mrr,
        });

        // Uyarılar
        const newAlerts: Alert[] = [];
        const notConnected = sellers.filter((s) => s.is_active && !connSet.has(s.id));
        if (notConnected.length > 0) {
          newAlerts.push({
            type: "warning",
            message: `${notConnected.length} aktif satıcı henüz mağaza bağlantısı kurmadı.`,
            href: "/admin/saticilar",
          });
        }
        const notOnboarded = sellers.filter((s) => s.is_active && !s.onboarding_done);
        if (notOnboarded.length > 0) {
          newAlerts.push({
            type: "warning",
            message: `${notOnboarded.length} satıcının kurulumu tamamlanmamış.`,
            href: "/admin/saticilar",
          });
        }
        const inactive = sellers.filter((s) => !s.is_active);
        if (inactive.length > 0) {
          newAlerts.push({
            type: "info",
            message: `${inactive.length} satıcı hesabı pasif durumda.`,
            href: "/admin/saticilar",
          });
        }
        setAlerts(newAlerts);
        setRecentSellers(sellers.slice(0, 5));
      }

      setLoading(false);
    }
    load();
  }, []);

  const kpiCards = [
    {
      label: "Toplam Satıcı",
      value: stats?.totalSellers,
      sub: stats?.newThisWeek ? `+${stats.newThisWeek} bu hafta` : "bu hafta yeni yok",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Mağaza Bağlantısı",
      value: stats?.connectedSellers,
      sub: stats ? `${stats.totalSellers - stats.connectedSellers} bağlı değil` : "—",
      icon: Link2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Aktif Satıcı",
      value: stats?.activeSellers,
      sub: stats ? `%${Math.round((stats.activeSellers / Math.max(stats.totalSellers, 1)) * 100)} oranında aktif` : "—",
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Waitlist",
      value: stats?.waitlistCount,
      sub: stats?.waitlistThisWeek ? `+${stats.waitlistThisWeek} bu hafta` : "bu hafta başvuru yok",
      icon: Mail,
      color: "text-purple-600",
      bg: "bg-purple-50",
      href: "/admin/waitlist",
    },
    {
      label: "Tahmini MRR",
      value: stats ? `₺${stats.mrr.toLocaleString("tr-TR")}` : "—",
      sub: `${(stats?.temel ?? 0) + (stats?.profesyonel ?? 0) + (stats?.kurumsal ?? 0)} ücretli satıcı`,
      icon: Zap,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
  ];

  const planTotal = (stats?.temel ?? 0) + (stats?.profesyonel ?? 0) + (stats?.kurumsal ?? 0);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Genel Bakış</h2>
        <p className="text-gray-500 mt-1">Platform geneli özet</p>
      </div>

      {/* KPI Kartları — 5 sütun */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpiCards.map((c) => (
          <div
            key={c.label}
            className={`bg-white rounded-xl border border-gray-200 p-4 ${c.href ? "hover:border-orange-200 cursor-pointer" : ""}`}
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

      {/* Dikkat Gerekenler */}
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
                {a.href && (
                  <Link href={a.href} className="text-xs text-orange-600 hover:underline flex-shrink-0 ml-4">
                    İncele →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Plan & Gelir */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Plan & Gelir Dağılımı</h3>
            {stats && (
              <span className="text-xs text-gray-400">
                MRR: <span className="font-semibold text-gray-700">₺{stats.mrr.toLocaleString("tr-TR")}</span>
              </span>
            )}
          </div>
          {loading ? (
            <p className="text-sm text-gray-400">Yükleniyor...</p>
          ) : (
            <div className="space-y-3">
              {(["temel", "profesyonel", "kurumsal"] as const).map((plan) => {
                const count = stats?.[plan] ?? 0;
                const pct = planTotal > 0 ? Math.round((count / planTotal) * 100) : 0;
                const revenue = count * planMRR[plan];
                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planColor[plan]}`}>
                          {planLabel[plan]}
                        </span>
                        <span className="text-xs text-gray-400">{count} satıcı · %{pct}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-600">₺{revenue.toLocaleString("tr-TR")}/ay</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${plan === "temel" ? "bg-gray-400" : plan === "profesyonel" ? "bg-orange-500" : "bg-purple-500"}`}
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
              { label: "Trendyol API", ok: true },
              { label: "AI Analiz Servisi", ok: true },
              { label: "Supabase DB", ok: true },
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
              recentSellers.map((s) => {
                const isConn = connectedIds.has(s.id);
                return (
                  <Link
                    key={s.id}
                    href={`/admin/saticilar/${s.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {s.shop_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{s.shop_name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${planColor[s.plan]}`}>
                            {planLabel[s.plan]}
                          </span>
                          <span className={`flex items-center gap-0.5 text-[10px] font-medium ${isConn ? "text-green-600" : "text-gray-400"}`}>
                            {isConn
                              ? <><CheckCircle2 className="w-2.5 h-2.5" /> Bağlı</>
                              : <><Clock className="w-2.5 h-2.5" /> Bağlantı yok</>}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className={`w-2 h-2 rounded-full ${s.is_active ? "bg-green-500" : "bg-gray-300"}`} />
                      <span className="text-[10px] text-gray-400">
                        {new Date(s.created_at).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Aktif satıcı tanımı notu */}
      <p className="text-xs text-gray-400">
        * Aktif satıcı: <code className="bg-gray-100 px-1 rounded">is_active = true</code> olan hesaplar.
        Mağaza bağlantısı kurmuş satıcılar ayrıca "Bağlı Mağaza" metriğinde sayılır.
      </p>
    </div>
  );
}
