"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  MessageSquare, AlertTriangle, Package, RotateCcw,
  ArrowRight, CheckCircle, Circle, Zap, ShieldCheck,
  Sparkles, RefreshCw, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import Link from "next/link";
import { CardSkeleton } from "@/components/Skeleton";

interface Summary {
  totalReviews: number;
  urgentReviews: number;
  pendingReviews: number;
  lowScoreProducts: number;
  weekReturns: number;
  totalProducts: number;
  lastWeekReturns: number;
  lastWeekPending: number;
  lastWeekUrgent: number;
}

interface DayCount {
  label: string;
  returns: number;
  reviews: number;
}

function buildLast7Days(
  returns: { returned_at: string }[],
  reviews: { reviewed_at?: string; created_at?: string }[]
): DayCount[] {
  const days: DayCount[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("tr-TR", { weekday: "short" });
    days.push({
      label,
      returns: returns.filter((r) => r.returned_at?.startsWith(key)).length,
      reviews: reviews.filter((r) => (r.reviewed_at ?? r.created_at ?? "").startsWith(key)).length,
    });
  }
  return days;
}

function ActivityChart({ data }: { data: DayCount[] }) {
  const max = Math.max(...data.map((d) => d.reviews + d.returns), 1);
  return (
    <div>
      <div className="flex items-end gap-2 h-20">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end gap-0.5" style={{ height: "64px" }}>
              <div
                className={`flex-1 rounded-t-sm transition-all ${d.reviews === 0 ? "bg-orange-100" : "bg-orange-400"}`}
                style={{ height: `${Math.max((d.reviews / max) * 100, d.reviews > 0 ? 6 : 2)}%` }}
                title={`${d.reviews} yorum`}
              />
              <div
                className={`flex-1 rounded-t-sm transition-all ${d.returns === 0 ? "bg-red-100" : "bg-red-400"}`}
                style={{ height: `${Math.max((d.returns / max) * 100, d.returns > 0 ? 6 : 2)}%` }}
                title={`${d.returns} iade`}
              />
            </div>
            <span className="text-[9px] text-gray-400">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-orange-400 rounded-sm" />
          <span className="text-xs text-gray-500">Yorum</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-red-400 rounded-sm" />
          <span className="text-xs text-gray-500">İade</span>
        </div>
      </div>
    </div>
  );
}

function GhostBarChart() {
  const heights = [30, 55, 20, 70, 45, 80, 35];
  const labels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  return (
    <div className="flex items-end gap-1.5 h-16 select-none">
      {heights.map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex flex-col justify-end" style={{ height: "48px" }}>
            <div className="w-full rounded-t-sm bg-gray-100" style={{ height: `${h}%` }} />
          </div>
          <span className="text-[9px] text-gray-300">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function DeltaBadge({ current, previous, lowerIsBetter = false }: { current: number; previous: number; lowerIsBetter?: boolean }) {
  if (previous === 0 && current === 0) return null;
  const diff = current - previous;
  if (diff === 0) return <span className="flex items-center gap-0.5 text-xs text-gray-400"><Minus className="w-3 h-3" />Aynı</span>;
  const improved = lowerIsBetter ? diff < 0 : diff > 0;
  const Icon = diff > 0 ? TrendingUp : TrendingDown;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${improved ? "text-green-600" : "text-red-500"}`}>
      <Icon className="w-3 h-3" />
      {diff > 0 ? "+" : ""}{diff} geçen haftaya göre
    </span>
  );
}

function SetupChecklist({ shopName, isConnected, hasProducts, hasData }: {
  shopName: string; isConnected: boolean; hasProducts: boolean; hasData: boolean;
}) {
  const steps = [
    { label: "Hesabını oluştur", done: true },
    { label: "Pazaryerini bağla", done: isConnected, href: "/baglanti" },
    { label: "Ürünleri senkronize et", done: hasProducts },
    { label: "İlk AI analizini görüntüle", done: hasData },
  ];
  const completedCount = steps.filter((s) => s.done).length;
  return (
    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Hoş geldin, {shopName}!</h3>
            <p className="text-orange-100 text-sm mt-0.5">İlk analizini almak için mağazanı bağla.</p>
          </div>
        </div>
        <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
          {completedCount}/{steps.length} tamamlandı
        </span>
      </div>
      <div className="space-y-2.5 mb-6">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            {step.done ? <CheckCircle className="w-4 h-4 text-white flex-shrink-0" /> : <Circle className="w-4 h-4 text-white/40 flex-shrink-0" />}
            <span className={`text-sm ${step.done ? "line-through text-white/60" : "text-white"}`}>{step.label}</span>
          </div>
        ))}
      </div>
      {!isConnected && (
        <Link href="/baglanti" className="inline-flex items-center gap-2 bg-white text-orange-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-colors">
          Trendyol mağazamı bağla <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

function DemoAICard() {
  return (
    <div className="bg-white rounded-xl border border-dashed border-orange-300 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-orange-500" />
        </div>
        <p className="text-sm font-semibold text-gray-700">Örnek AI Analizi</p>
        <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">Önizleme</span>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed space-y-2">
        <p>
          <span className="font-semibold text-gray-900">"Oversize Pamuk T-Shirt"</span> adlı ürün son 7 günde{" "}
          <span className="text-red-600 font-semibold">3 kez</span> beden uyumsuzluğu nedeniyle iade edildi.
        </p>
        <p className="text-gray-500 text-xs">
          Öneri: Ürün açıklamasına santimetre bazlı ölçü tablosu ekle. Bu değişiklik benzer ürünlerde iade oranını ortalama{" "}
          <span className="font-semibold text-green-600">%34</span> düşürüyor.
        </p>
      </div>
      <p className="text-xs text-gray-400">Mağazanı bağladığında gerçek ürünlerin için bu analizler otomatik üretilir.</p>
    </div>
  );
}

const platformStatuses = [
  { name: "Trendyol", status: "Aktif", color: "bg-green-100 text-green-700" },
  { name: "Hepsiburada", status: "Yakında", color: "bg-gray-100 text-gray-500" },
  { name: "N11", status: "Yakında", color: "bg-gray-100 text-gray-500" },
  { name: "Amazon TR", status: "Planlanıyor", color: "bg-gray-100 text-gray-400" },
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [chartData, setChartData] = useState<DayCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState("");
  const [isMarketplaceConnected, setIsMarketplaceConnected] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setShopName(user.user_metadata?.shop_name ?? "Mağazam");

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
      const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000).toISOString();

      const [
        { data: reviews },
        { data: products },
        { data: weekReturns },
        { data: lastWeekReturns },
        { data: allReturns },
        { data: allReviews },
        { data: lastWeekReviews },
        { data: credentials },
      ] = await Promise.all([
        supabase.from("reviews").select("is_urgent, is_replied").eq("seller_id", user.id),
        supabase.from("products").select("description_score, seo_score").eq("seller_id", user.id),
        supabase.from("returns").select("returned_at").eq("seller_id", user.id).gte("returned_at", weekAgo),
        supabase.from("returns").select("id").eq("seller_id", user.id).gte("returned_at", twoWeeksAgo).lt("returned_at", weekAgo),
        supabase.from("returns").select("returned_at").eq("seller_id", user.id),
        supabase.from("reviews").select("reviewed_at, is_replied, is_urgent").eq("seller_id", user.id),
        supabase.from("reviews").select("is_replied, is_urgent").eq("seller_id", user.id).gte("reviewed_at", twoWeeksAgo).lt("reviewed_at", weekAgo),
        supabase.from("marketplace_credentials").select("id").eq("seller_id", user.id).limit(1),
      ]);

      setIsMarketplaceConnected((credentials?.length ?? 0) > 0);

      const thisWeekReviews = (allReviews ?? []).filter(r => r.reviewed_at >= weekAgo);

      setSummary({
        totalReviews: reviews?.length ?? 0,
        urgentReviews: reviews?.filter((r) => r.is_urgent && !r.is_replied).length ?? 0,
        pendingReviews: reviews?.filter((r) => !r.is_replied).length ?? 0,
        lowScoreProducts: products?.filter((p) => (p.description_score ?? 100) < 60).length ?? 0,
        weekReturns: weekReturns?.length ?? 0,
        totalProducts: products?.length ?? 0,
        lastWeekReturns: lastWeekReturns?.length ?? 0,
        lastWeekPending: lastWeekReviews?.filter(r => !r.is_replied).length ?? 0,
        lastWeekUrgent: lastWeekReviews?.filter(r => r.is_urgent).length ?? 0,
      });

      setChartData(buildLast7Days(allReturns ?? [], allReviews ?? []));
      setLoading(false);
    }
    load();
  }, []);

  const hasData = summary !== null && (summary.urgentReviews > 0 || summary.lowScoreProducts > 0 || summary.weekReturns > 0);
  const hasProducts = (summary?.totalProducts ?? 0) > 0;

  const stats = [
    {
      label: "Bekleyen Yorum",
      value: summary?.pendingReviews ?? 0,
      sub: summary?.urgentReviews ? `${summary.urgentReviews} acil yanıt bekliyor` : "Yanıt bekleyen yorum yok",
      emptyHint: "Bağlandığında yanıt bekleyen yorumlar burada görünür",
      icon: MessageSquare,
      color: "text-blue-600",
      bg: "bg-blue-50",
      delta: summary ? <DeltaBadge current={summary.pendingReviews} previous={summary.lastWeekPending} lowerIsBetter /> : null,
      href: "/yorumlar",
    },
    {
      label: "Acil Yorum",
      value: summary?.urgentReviews ?? 0,
      sub: summary?.urgentReviews ? "Hemen yanıtla" : "Acil yorum yok",
      emptyHint: "Acil yorumlar burada görünür",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
      delta: summary ? <DeltaBadge current={summary.urgentReviews} previous={summary.lastWeekUrgent} lowerIsBetter /> : null,
      href: "/yorumlar",
    },
    {
      label: "Bu Haftaki İade",
      value: summary?.weekReturns ?? 0,
      sub: summary?.weekReturns ? "İade nedenleri analiz edildi" : "Bu hafta iade yok",
      emptyHint: "Bağlandığında iade kalıpları burada analiz edilir",
      icon: RotateCcw,
      color: "text-orange-600",
      bg: "bg-orange-50",
      delta: summary ? <DeltaBadge current={summary.weekReturns} previous={summary.lastWeekReturns} lowerIsBetter /> : null,
      href: "/iadeler",
    },
    {
      label: "Düşük Puanlı Ürün",
      value: summary?.lowScoreProducts ?? 0,
      sub: summary?.lowScoreProducts ? "AI açıklama önerisi hazır" : "Tüm açıklamalar yeterli",
      emptyHint: "Bağlandığında düşük puanlı ürünler listelenir",
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
      delta: null,
      href: "/urunler",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Günlük Özet</h2>
        <p className="text-gray-500 mt-1">
          SatıcıPilot; yorumları, iadeleri ve ürün performansını analiz ederek sana günlük yapılacaklar listesi çıkarır.
        </p>
      </div>

      {!loading && !isMarketplaceConnected && (
        <SetupChecklist shopName={shopName} isConnected={isMarketplaceConnected} hasProducts={hasProducts} hasData={hasData} />
      )}

      {/* KPI Kartları */}
      <div className="grid grid-cols-2 gap-4">
        {loading ? (
          <><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></>
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
              <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">
                {s.value === 0 && !isMarketplaceConnected ? s.emptyHint : s.sub}
              </p>
              {s.delta && <div className="mt-1.5">{s.delta}</div>}
            </div>
          </Link>
        ))}
      </div>

      {!loading && !isMarketplaceConnected && <DemoAICard />}

      {/* 7 Günlük Aktivite */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-sm">Son 7 Gün Aktivitesi</h3>
          {!loading && chartData.some(d => d.reviews + d.returns > 0) && (
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-400 rounded-sm inline-block" />Yorum</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-sm inline-block" />İade</span>
            </div>
          )}
        </div>
        {loading ? (
          <div className="flex items-end gap-1.5 h-16">
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="flex-1 animate-pulse bg-gray-100 rounded-t-sm" style={{ height: `${20 + i * 8}%` }} />
            ))}
          </div>
        ) : chartData.every(d => d.returns + d.reviews === 0) ? (
          <div className="relative">
            <GhostBarChart />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xs text-gray-400 bg-white/80 px-3 py-1.5 rounded-lg">
                Mağazan bağlandığında günlük aktivite burada görünür
              </p>
            </div>
          </div>
        ) : (
          <ActivityChart data={chartData} />
        )}
      </div>

      {/* Öncelikli Aksiyonlar */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Öncelikli Aksiyonlar</h3>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <RefreshCw className="w-3 h-3" /> Senkronizasyon sonrası güncellenir
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-10 animate-pulse bg-gray-100 rounded-lg" />)}
            </div>
          ) : !hasData ? (
            <div className="p-6 text-center space-y-2">
              <p className="text-sm text-gray-500">Şu an bekleyen aksiyon yok.</p>
              {!isMarketplaceConnected ? (
                <>
                  <p className="text-xs text-gray-400">
                    Mağazanı bağladıktan sonra acil yorumlar, düşük puanlı ürünler ve iade kalıpları burada listelenir.
                  </p>
                  <div className="mt-3 space-y-1.5 text-left max-w-xs mx-auto">
                    {["Yanıt bekleyen acil yorumlar", "Düşük dönüşüm riski taşıyan ürünler", "Aynı nedenden gelen iade kalıpları"].map((hint, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                        {hint}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-400">Her şey yolunda görünüyor.</p>
              )}
            </div>
          ) : (
            <>
              {(summary?.urgentReviews ?? 0) > 0 && (
                <Link href="/yorumlar" className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors group">
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0 animate-pulse" />
                  <p className="text-sm text-gray-700 flex-1">{summary!.urgentReviews} acil yorum yanıt bekliyor.</p>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 flex-shrink-0 mt-0.5 transition-colors" />
                </Link>
              )}
              {(summary?.lowScoreProducts ?? 0) > 0 && (
                <Link href="/urunler" className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors group">
                  <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 flex-1">{summary!.lowScoreProducts} ürünün açıklama puanı 60'ın altında — AI önerisi hazır.</p>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 flex-shrink-0 mt-0.5 transition-colors" />
                </Link>
              )}
              {(summary?.weekReturns ?? 0) > 0 && (
                <Link href="/iadeler" className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors group">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 flex-1">Bu hafta {summary!.weekReturns} iade — kalıp analizi için incele.</p>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 flex-shrink-0 mt-0.5 transition-colors" />
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* Platform Destek Durumu */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 text-sm mb-4">Desteklenen Pazaryerleri</h3>
        <div className="grid grid-cols-2 gap-3">
          {platformStatuses.map((p) => (
            <div key={p.name} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-sm font-medium text-gray-700">{p.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.color}`}>{p.status}</span>
            </div>
          ))}
        </div>
      </div>

      {!isMarketplaceConnected && !loading && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">API bilgilerin hazırsa hemen başla</h3>
              <p className="text-orange-100 text-sm mt-1">Ortalama kurulum 2 dakika. Trendyol Partner Panel'den API bilgilerini al, buraya gir.</p>
              <div className="flex items-center gap-3 mt-3 text-orange-200 text-xs">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Şifreli saklama</span>
                <span>·</span>
                <span>Sipariş işlemi yapılmaz</span>
              </div>
            </div>
            <Link href="/baglanti" className="bg-white text-orange-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-colors flex-shrink-0 whitespace-nowrap">
              Bağlantı ekranına git →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
