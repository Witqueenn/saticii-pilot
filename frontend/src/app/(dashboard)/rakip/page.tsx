"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TrendingDown, TrendingUp, Minus, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { clsx } from "clsx";
import ProGate from "@/components/ProGate";

interface CompetitorRow {
  id: string;
  our_product_id: string;
  our_product_name: string;
  our_price: number;
  competitor_name: string;
  competitor_product_name: string | null;
  competitor_price: number;
  category: string | null;
  checked_at: string;
}

interface ProductSummary {
  productId: string;
  productName: string;
  ourPrice: number;
  category: string | null;
  minCompPrice: number;
  maxCompPrice: number;
  competitors: CompetitorRow[];
  status: "pahali" | "uygun" | "ucuz";
  diffPct: number;
  lastChecked: string;
}

function getStatus(our: number, min: number): "pahali" | "uygun" | "ucuz" {
  const ratio = our / min;
  if (ratio > 1.05) return "pahali";
  if (ratio < 0.95) return "ucuz";
  return "uygun";
}

function timeAgo(iso: string) {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hours < 1) return "az önce";
  if (hours < 24) return `${hours} saat önce`;
  return `${Math.floor(hours / 24)} gün önce`;
}

function fmt(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STATUS_CONFIG = {
  pahali: {
    label: "Pahalı",
    bg: "bg-red-50",
    text: "text-red-600",
    badge: "bg-red-100 text-red-700",
    icon: TrendingUp,
    cardBg: "bg-red-50",
    cardText: "text-red-700",
    cardBorder: "border-red-100",
  },
  uygun: {
    label: "Uygun",
    bg: "bg-green-50",
    text: "text-green-600",
    badge: "bg-green-100 text-green-700",
    icon: Minus,
    cardBg: "bg-green-50",
    cardText: "text-green-700",
    cardBorder: "border-green-100",
  },
  ucuz: {
    label: "Ucuz",
    bg: "bg-blue-50",
    text: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
    icon: TrendingDown,
    cardBg: "bg-blue-50",
    cardText: "text-blue-700",
    cardBorder: "border-blue-100",
  },
};

export default function RakipPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [filter, setFilter] = useState<"tumu" | "pahali" | "uygun" | "ucuz">("tumu");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: adminData }, { data: seller }] = await Promise.all([
        supabase.from("admin_users").select("id").eq("id", user.id).single(),
        supabase.from("sellers").select("plan").eq("id", user.id).single(),
      ]);
      setPlan(adminData ? "profesyonel" : (seller?.plan ?? "temel"));

      const { data } = await supabase
        .from("competitor_prices")
        .select("*")
        .eq("seller_id", user.id)
        .order("checked_at", { ascending: false });

      if (!data || data.length === 0) { setLoading(false); return; }

      const grouped: Record<string, CompetitorRow[]> = {};
      for (const row of data) {
        if (!grouped[row.our_product_id]) grouped[row.our_product_id] = [];
        grouped[row.our_product_id].push(row);
      }

      const summaries: ProductSummary[] = Object.entries(grouped).map(([pid, rows]) => {
        const first = rows[0];
        const prices = rows.map((r) => r.competitor_price);
        const minCompPrice = Math.min(...prices);
        const maxCompPrice = Math.max(...prices);
        const status = getStatus(first.our_price, minCompPrice);
        const diffPct = Math.round(((first.our_price - minCompPrice) / minCompPrice) * 100);
        return {
          productId: pid,
          productName: first.our_product_name,
          ourPrice: first.our_price,
          category: first.category,
          minCompPrice,
          maxCompPrice,
          competitors: rows.sort((a, b) => a.competitor_price - b.competitor_price),
          status,
          diffPct,
          lastChecked: rows[0].checked_at,
        };
      });

      summaries.sort((a, b) => b.diffPct - a.diffPct);
      setProducts(summaries);
      setLastChecked(data[0].checked_at);
      setLoading(false);
    }
    load();
  }, []);

  const counts = {
    pahali: products.filter((p) => p.status === "pahali").length,
    uygun: products.filter((p) => p.status === "uygun").length,
    ucuz: products.filter((p) => p.status === "ucuz").length,
  };

  const filtered = filter === "tumu" ? products : products.filter((p) => p.status === filter);

  if (loading || plan === null) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Yükleniyor...</div>
  );

  if (plan !== "profesyonel") return <ProGate feature="Rakip Fiyat Analizi" />;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rakip Fiyat Analizi</h2>
          <p className="text-gray-500 mt-1 text-sm">Ürünlerinin Trendyol'daki fiyat rekabeti</p>
        </div>
        {lastChecked && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
            <RefreshCw className="w-3 h-3" />
            {timeAgo(lastChecked)}
          </div>
        )}
      </div>

      {/* Summary cards */}
      {products.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {(["pahali", "uygun", "ucuz"] as const).map((s) => {
            const cfg = STATUS_CONFIG[s];
            const Icon = cfg.icon;
            const descs = {
              pahali: "En ucuz rakipten %5+ pahalı",
              uygun: "Rakiplerle ±%5 içinde",
              ucuz: "En ucuz rakipten %5+ ucuz",
            };
            return (
              <button
                key={s}
                onClick={() => setFilter(filter === s ? "tumu" : s)}
                className={clsx(
                  "rounded-xl border p-4 text-left transition-all",
                  filter === s ? cfg.cardBg + " " + cfg.cardBorder + " border-2" : "bg-white border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={clsx("w-4 h-4", cfg.text)} />
                  <span className={clsx("text-2xl font-bold", cfg.text)}>{counts[s]}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{cfg.label} Ürün</p>
                <p className="text-xs text-gray-400 mt-0.5">{descs[s]}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Filter tabs */}
      {products.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "tumu", label: `Tümü (${products.length})` },
            { key: "pahali", label: `Pahalı (${counts.pahali})` },
            { key: "uygun", label: `Uygun (${counts.uygun})` },
            { key: "ucuz", label: `Ucuz (${counts.ucuz})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filter === key
                  ? "bg-orange-500 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Product list */}
      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <RefreshCw className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">Henüz rakip fiyat verisi yok.</p>
          <p className="text-gray-400 text-xs mt-1">Mağaza bağlantısı kurulunca otomatik taranır.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const cfg = STATUS_CONFIG[p.status];
            const isOpen = expanded === p.productId;
            const diff = p.ourPrice - p.minCompPrice;

            return (
              <div key={p.productId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : p.productId)}
                >
                  {/* Status indicator */}
                  <div className={clsx("w-2 h-8 rounded-full flex-shrink-0", {
                    "bg-red-400": p.status === "pahali",
                    "bg-green-400": p.status === "uygun",
                    "bg-blue-400": p.status === "ucuz",
                  })} />

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-gray-900 text-sm truncate">{p.productName}</p>
                      {p.category && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                          {p.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{p.competitors.length} rakip · {timeAgo(p.lastChecked)}</p>
                  </div>

                  {/* Prices */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 text-sm">₺{fmt(p.ourPrice)}</p>
                    <p className="text-xs text-gray-400">En ucuz rakip: ₺{fmt(p.minCompPrice)}</p>
                  </div>

                  {/* Diff badge */}
                  <div className={clsx("flex-shrink-0 px-3 py-1.5 rounded-lg text-center min-w-[72px]", cfg.badge)}>
                    <p className="text-xs font-bold">
                      {p.diffPct > 0 ? "+" : ""}{p.diffPct}%
                    </p>
                    <p className="text-[10px] font-medium">{cfg.label}</p>
                  </div>

                  {/* Expand chevron */}
                  <div className="flex-shrink-0 text-gray-400">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Expanded: competitor breakdown */}
                {isOpen && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Rakipler</p>
                    <div className="space-y-2">
                      {p.competitors.map((c) => {
                        const cDiff = p.ourPrice - c.competitor_price;
                        const cPct = Math.round((cDiff / c.competitor_price) * 100);
                        return (
                          <div key={c.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-gray-100">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{c.competitor_name}</p>
                              {c.competitor_product_name && (
                                <p className="text-xs text-gray-400">{c.competitor_product_name}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">₺{fmt(c.competitor_price)}</p>
                              <p className={clsx("text-xs font-medium", cPct > 0 ? "text-red-500" : cPct < 0 ? "text-blue-500" : "text-gray-400")}>
                                {cPct > 0 ? `Bizden ₺${fmt(cDiff)} ucuz` : cPct < 0 ? `Bizden ₺${fmt(-cDiff)} pahalı` : "Aynı fiyat"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Price suggestion */}
                    {p.status === "pahali" && (
                      <div className="mt-3 bg-orange-50 border border-orange-100 rounded-lg px-4 py-3">
                        <p className="text-xs font-semibold text-orange-700 mb-0.5">Fiyat Önerisi</p>
                        <p className="text-xs text-orange-600">
                          Rekabetçi olmak için ₺{fmt(Math.round(p.minCompPrice * 1.03 * 10) / 10)} – ₺{fmt(Math.round(p.minCompPrice * 1.05 * 10) / 10)} aralığını dene.
                          Şu an en ucuz rakibin ₺{fmt(Math.abs(p.ourPrice - p.minCompPrice))} altında.
                        </p>
                      </div>
                    )}
                    {p.status === "ucuz" && (
                      <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                        <p className="text-xs font-semibold text-blue-700 mb-0.5">Fiyat Önerisi</p>
                        <p className="text-xs text-blue-600">
                          Rakiplerden %{Math.abs(p.diffPct)} daha ucuzsun. Marjini korumak için ₺{fmt(Math.round(p.minCompPrice * 0.97 * 10) / 10)}'a çıkarmayı düşün.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
