"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShoppingBag, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Copy, CheckCircle, Link2, Package, Truck } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

interface LineItem {
  product_id: string;
  product_name: string;
  barcode: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  marketplace_order_id: string;
  status: string;
  total_price: number | null;
  line_items: LineItem[] | null;
  ordered_at: string;
}

interface DailyStat {
  date: string;
  count: number;
  revenue: number;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  created:    { label: "Yeni", color: "bg-blue-100 text-blue-700" },
  picking:    { label: "Hazırlanıyor", color: "bg-yellow-100 text-yellow-700" },
  invoiced:   { label: "Faturalandı", color: "bg-purple-100 text-purple-700" },
  shipped:    { label: "Kargoda", color: "bg-orange-100 text-orange-700" },
  delivered:  { label: "Teslim Edildi", color: "bg-green-100 text-green-700" },
  cancelled:  { label: "İptal", color: "bg-red-100 text-red-700" },
  returned:   { label: "İade", color: "bg-gray-100 text-gray-700" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABEL[status] ?? { label: status, color: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>
      {s.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "flat";
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && (
        <div className="flex items-center gap-1 mt-1">
          {trend === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
          {trend === "down" && <TrendingDown className="w-3 h-3 text-red-500" />}
          {trend === "flat" && <Minus className="w-3 h-3 text-gray-400" />}
          <p className="text-xs text-gray-400">{sub}</p>
        </div>
      )}
    </div>
  );
}

export default function SiparislerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("tumu");
  const [formSlug, setFormSlug] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const BASE_URL = "https://saticipilot.com";

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: ordersData }, { data: formData }] = await Promise.all([
        supabase
          .from("orders")
          .select("id, marketplace_order_id, status, total_price, line_items, ordered_at")
          .eq("seller_id", user.id)
          .order("ordered_at", { ascending: false })
          .limit(500),
        supabase
          .from("customer_forms")
          .select("slug")
          .eq("seller_id", user.id)
          .single(),
      ]);

      setOrders(ordersData ?? []);
      if (formData?.slug) setFormSlug(formData.slug);
      setLoading(false);
    }
    load();
  }, []);

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdatingStatus(orderId);
    const supabase = createClient();
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    setUpdatingStatus(null);
  }

  function buildFormLink(orderId: string, productName: string) {
    if (!formSlug) return null;
    const urun = encodeURIComponent(productName.slice(0, 40));
    const siparis = encodeURIComponent(orderId);
    return `${BASE_URL}/f/${formSlug}?siparis=${siparis}&urun=${urun}`;
  }

  function copyFormLink(link: string, id: string) {
    navigator.clipboard.writeText(link);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  }

  // Hesaplamalar
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

  const last30 = orders.filter((o) => new Date(o.ordered_at) >= thirtyDaysAgo);
  const last7 = orders.filter((o) => new Date(o.ordered_at) >= sevenDaysAgo);
  const prev7 = orders.filter((o) => {
    const d = new Date(o.ordered_at);
    return d >= new Date(now.getTime() - 14 * 86400000) && d < sevenDaysAgo;
  });

  const totalRevenue30 = last30.reduce((s, o) => s + (o.total_price ?? 0), 0);
  const deliveredCount = last30.filter((o) => o.status === "delivered").length;
  const cancelledCount = last30.filter((o) => o.status === "cancelled").length;
  const cancelRate = last30.length > 0 ? Math.round((cancelledCount / last30.length) * 100) : 0;

  const rev7 = last7.reduce((s, o) => s + (o.total_price ?? 0), 0);
  const revPrev7 = prev7.reduce((s, o) => s + (o.total_price ?? 0), 0);
  const revTrend: "up" | "down" | "flat" =
    rev7 > revPrev7 ? "up" : rev7 < revPrev7 ? "down" : "flat";
  const revTrendText =
    revPrev7 > 0
      ? `Geçen haftaya göre ${rev7 >= revPrev7 ? "+" : ""}${Math.round(((rev7 - revPrev7) / revPrev7) * 100)}%`
      : "Geçen hafta veri yok";

  // Günlük istatistik (son 14 gün)
  const dailyMap = new Map<string, DailyStat>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, { date: key, count: 0, revenue: 0 });
  }
  for (const o of orders) {
    const key = o.ordered_at.slice(0, 10);
    if (dailyMap.has(key)) {
      const s = dailyMap.get(key)!;
      s.count += 1;
      s.revenue += o.total_price ?? 0;
    }
  }
  const dailyStats = Array.from(dailyMap.values());
  const maxCount = Math.max(...dailyStats.map((d) => d.count), 1);

  // En çok satan ürünler
  const productMap = new Map<string, { name: string; count: number; revenue: number }>();
  for (const o of last30) {
    for (const ln of o.line_items ?? []) {
      const key = ln.product_name || ln.barcode || "—";
      const existing = productMap.get(key);
      if (existing) {
        existing.count += ln.quantity || 1;
        existing.revenue += (ln.price || 0) * (ln.quantity || 1);
      } else {
        productMap.set(key, { name: key, count: ln.quantity || 1, revenue: (ln.price || 0) * (ln.quantity || 1) });
      }
    }
  }
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Durum filtrelenmiş listesi
  const filtered =
    filterStatus === "tumu"
      ? last30
      : last30.filter((o) => o.status === filterStatus);

  const statusCounts = Object.fromEntries(
    Object.keys(STATUS_LABEL).map((s) => [s, last30.filter((o) => o.status === s).length])
  );

  return (
    <div className="space-y-6 max-w-3xl w-full">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sipariş Analizi</h2>
        <p className="text-gray-500 mt-1">Son 30 gün — Trendyol sipariş özeti</p>
      </div>

      {/* Özet kartlar */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-28" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Toplam Sipariş (30g)"
            value={last30.length.toLocaleString("tr-TR")}
            sub={`Son 7 gün: ${last7.length}`}
            trend={last7.length >= prev7.length ? "up" : "down"}
          />
          <StatCard
            label="Ciro (30g)"
            value={totalRevenue30.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 })}
            sub={revTrendText}
            trend={revTrend}
          />
          <StatCard
            label="Teslim Edilen (30g)"
            value={deliveredCount.toLocaleString("tr-TR")}
            sub={last30.length > 0 ? `%${Math.round((deliveredCount / last30.length) * 100)} tamamlanma` : undefined}
          />
          <StatCard
            label="İptal Oranı (30g)"
            value={`%${cancelRate}`}
            sub={`${cancelledCount} iptal`}
            trend={cancelRate > 10 ? "down" : cancelRate > 5 ? "flat" : "up"}
          />
        </div>
      )}

      {/* Günlük bar grafik */}
      {!loading && last30.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Son 14 Gün — Günlük Sipariş</p>
          <div className="flex items-end gap-1 h-24">
            {dailyStats.map((d) => {
              const h = maxCount > 0 ? Math.max(4, Math.round((d.count / maxCount) * 88)) : 4;
              const label = new Date(d.date + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full bg-orange-400 rounded-t-sm hover:bg-orange-500 transition-colors cursor-default"
                    style={{ height: `${h}px` }}
                  />
                  <span className="text-[9px] text-gray-400 hidden md:block truncate w-full text-center">
                    {label.split(" ")[0]}
                  </span>
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1 hidden group-hover:block z-10 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                    {label}: {d.count} sipariş
                    {d.revenue > 0 && ` · ${d.revenue.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 })}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* En Çok Satan Ürünler */}
      {!loading && topProducts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-semibold text-gray-700">En Çok Satan Ürünler (30g)</p>
          </div>
          <div className="space-y-3">
            {topProducts.map((p, i) => {
              const maxRevenue = topProducts[0].revenue;
              const pct = maxRevenue > 0 ? Math.round((p.revenue / maxRevenue) * 100) : 0;
              return (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-gray-800 truncate">{p.name}</p>
                      <span className="text-xs font-semibold text-gray-600 ml-2 flex-shrink-0">
                        {p.revenue.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{p.count} adet</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Durum filtresi + sipariş listesi */}
      {!loading && last30.length > 0 && (
        <>
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setFilterStatus("tumu")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filterStatus === "tumu"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tümü ({last30.length})
            </button>
            {Object.entries(STATUS_LABEL).map(([key, { label }]) =>
              (statusCounts[key] ?? 0) > 0 ? (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    filterStatus === key
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label} ({statusCounts[key]})
                </button>
              ) : null
            )}
          </div>

          <div className="space-y-2">
            {filtered.slice(0, 50).map((o) => {
              const date = new Date(o.ordered_at).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });
              const lines = o.line_items ?? [];
              const firstProduct = lines[0]?.product_name ?? "—";
              const isOpen = expanded === o.id;

              return (
                <div key={o.id} className="bg-white rounded-xl border border-gray-200">
                  <button
                    onClick={() => setExpanded(isOpen ? null : o.id)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-900 truncate">{firstProduct}</p>
                        {lines.length > 1 && (
                          <span className="text-xs text-gray-400">+{lines.length - 1} ürün</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-400">#{o.marketplace_order_id.slice(-8)}</span>
                        <span className="text-xs text-gray-400">{date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={o.status} />
                      {o.total_price != null && (
                        <span className="text-sm font-semibold text-gray-900">
                          {o.total_price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                        </span>
                      )}
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
                      {lines.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Ürün Detayları</p>
                          <div className="space-y-2">
                            {lines.map((ln, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">{ln.product_name || ln.barcode || "—"}</span>
                                <div className="flex items-center gap-3 text-gray-500">
                                  <span>{ln.quantity}x</span>
                                  <span className="font-medium text-gray-900">
                                    {ln.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Kargo durumu güncelle */}
                      <div className="flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <p className="text-xs font-medium text-gray-500">Kargo Durumu</p>
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                          disabled={updatingStatus === o.id}
                          className="ml-auto text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50 bg-white"
                        >
                          {Object.entries(STATUS_LABEL).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Müşteri formu linki */}
                      {(() => {
                        const link = buildFormLink(o.marketplace_order_id, firstProduct);
                        if (!link) return (
                          <p className="text-xs text-gray-400 flex items-center gap-1.5">
                            <Link2 className="w-3 h-3" />
                            <span>Müşteri formu linki için önce <a href="/musteri" className="text-orange-500 hover:underline">Müşteri sayfasından</a> formu oluştur.</span>
                          </p>
                        );
                        return (
                          <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                            <p className="text-xs font-medium text-orange-700 mb-2 flex items-center gap-1.5">
                              <Link2 className="w-3.5 h-3.5" />
                              Müşteri Formu Linki
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-[11px] text-orange-600 truncate flex-1 font-mono bg-white border border-orange-100 rounded-lg px-2 py-1.5">
                                {link}
                              </p>
                              <button
                                onClick={() => copyFormLink(link, o.id)}
                                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium flex-shrink-0 transition-colors ${
                                  copiedLink === o.id
                                    ? "bg-green-500 text-white"
                                    : "bg-orange-500 text-white hover:bg-orange-600"
                                }`}
                              >
                                {copiedLink === o.id
                                  ? <><CheckCircle className="w-3.5 h-3.5" /> Kopyalandı</>
                                  : <><Copy className="w-3.5 h-3.5" /> Kopyala</>}
                              </button>
                            </div>
                            <p className="text-[10px] text-orange-400 mt-1.5">WhatsApp veya Trendyol mesajına yapıştır → müşteri 1 tıkla değerlendirme yapabilir</p>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length > 50 && (
              <p className="text-center text-xs text-gray-400 pt-2">
                İlk 50 sipariş gösteriliyor. Toplam: {filtered.length}
              </p>
            )}
          </div>
        </>
      )}

      {!loading && last30.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Son 30 günde sipariş bulunamadı.</p>
          <p className="text-xs text-gray-400 mt-1">Trendyol bağlantısını kontrol et ve senkronizasyonun çalıştığını doğrula.</p>
        </div>
      )}
    </div>
  );
}
