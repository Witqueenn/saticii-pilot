"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  MessageSquare, AlertTriangle, Package, RotateCcw, ShoppingBag,
  ArrowRight, CheckCircle, Circle, Zap, ShieldCheck,
  Sparkles, RefreshCw, TrendingUp, TrendingDown, Minus, Loader2,
  Flag, Edit2, Check, X as XIcon,
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
  weekOrders: number;
  weekRevenue: number;
  lastWeekOrders: number;
}

interface DayCount {
  label: string;
  returns: number;
  reviews: number;
  orders: number;
}

function buildLast7Days(
  returns: { returned_at: string }[],
  reviews: { reviewed_at?: string; created_at?: string }[],
  orders: { ordered_at: string }[]
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
      orders: orders.filter((o) => o.ordered_at?.startsWith(key)).length,
    });
  }
  return days;
}

function ActivityChart({ data }: { data: DayCount[] }) {
  const max = Math.max(...data.map((d) => d.reviews + d.returns + d.orders), 1);
  const hasOrders = data.some((d) => d.orders > 0);
  return (
    <div>
      <div className="flex items-end gap-2 h-20">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end gap-0.5" style={{ height: "64px" }}>
              {hasOrders && (
                <div
                  className={`flex-1 rounded-t-sm transition-all ${d.orders === 0 ? "bg-green-100" : "bg-green-400"}`}
                  style={{ height: `${Math.max((d.orders / max) * 100, d.orders > 0 ? 6 : 2)}%` }}
                  title={`${d.orders} sipariş`}
                />
              )}
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
        {hasOrders && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-green-400 rounded-sm" />
            <span className="text-xs text-gray-500">Sipariş</span>
          </div>
        )}
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

// ── Sağlık Skoru ─────────────────────────────────────────────────────────────

interface ScoreBreakdown {
  replyScore: number;   // 0-30
  urgentScore: number;  // 0-25
  productScore: number; // 0-25
  returnScore: number;  // 0-20
  total: number;
}

function computeHealthScore(s: Summary): ScoreBreakdown {
  // Reply rate (0-30)
  const replyScore = s.totalReviews > 0
    ? Math.round(((s.totalReviews - s.pendingReviews) / s.totalReviews) * 30)
    : 30;

  // Urgent review penalty (0-25), each unresolved urgent = -5
  const urgentScore = Math.max(0, 25 - s.urgentReviews * 5);

  // Product quality (0-25)
  const productScore = s.totalProducts > 0
    ? Math.round(((s.totalProducts - s.lowScoreProducts) / s.totalProducts) * 25)
    : 25;

  // Return rate vs orders (0-20)
  let returnScore = 20;
  if (s.weekOrders > 0) {
    const rate = s.weekReturns / s.weekOrders;
    if (rate <= 0.05) returnScore = 20;
    else if (rate <= 0.10) returnScore = 15;
    else if (rate <= 0.20) returnScore = 8;
    else returnScore = 0;
  } else if (s.weekReturns > 0) {
    returnScore = 5;
  }

  return {
    replyScore,
    urgentScore,
    productScore,
    returnScore,
    total: Math.min(100, replyScore + urgentScore + productScore + returnScore),
  };
}

function scoreColor(total: number) {
  if (total >= 80) return { ring: "text-green-600", bg: "bg-green-50", border: "border-green-200", bar: "bg-green-500", label: "Mükemmel" };
  if (total >= 60) return { ring: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", bar: "bg-yellow-400", label: "İyi" };
  if (total >= 40) return { ring: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", bar: "bg-orange-400", label: "Orta" };
  return { ring: "text-red-600", bg: "bg-red-50", border: "border-red-200", bar: "bg-red-500", label: "Dikkat" };
}

function HealthScoreCard({ s }: { s: Summary }) {
  const bd = computeHealthScore(s);
  const c = scoreColor(bd.total);

  const components = [
    { label: "Yorum Yanıt Oranı", score: bd.replyScore, max: 30 },
    { label: "Acil Yorum Temizliği", score: bd.urgentScore, max: 25 },
    { label: "Ürün Açıklama Kalitesi", score: bd.productScore, max: 25 },
    { label: "İade Oranı", score: bd.returnScore, max: 20 },
  ];

  return (
    <div className={`${c.bg} ${c.border} border rounded-2xl p-5`}>
      <div className="flex items-center gap-5">
        {/* Büyük skor */}
        <div className="flex-shrink-0 text-center">
          <p className={`text-5xl font-black leading-none ${c.ring}`}>{bd.total}</p>
          <p className="text-xs text-gray-500 mt-1.5 font-medium">/ 100</p>
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full mt-2 inline-block ${c.bg} ${c.ring} border ${c.border}`}>
            {c.label}
          </span>
        </div>

        {/* Separator */}
        <div className="w-px self-stretch bg-gray-200 flex-shrink-0" />

        {/* Breakdown */}
        <div className="flex-1 space-y-2 min-w-0">
          <p className="text-xs font-semibold text-gray-600 mb-2.5">Mağaza Sağlık Skoru</p>
          {components.map(({ label, score, max }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500 w-36 flex-shrink-0 truncate">{label}</span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${c.bar} rounded-full transition-all duration-500`}
                  style={{ width: `${(score / max) * 100}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-gray-600 w-8 text-right flex-shrink-0">
                {score}/{max}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// ── Haftalık Hedef ───────────────────────────────────────────────────────────

function WeeklyGoalCard({
  revenue,
  goal,
  editing,
  goalInput,
  saving,
  onEdit,
  onCancel,
  onInputChange,
  onSave,
}: {
  revenue: number;
  goal: number | null;
  editing: boolean;
  goalInput: string;
  saving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onInputChange: (v: string) => void;
  onSave: () => void;
}) {
  const now = new Date();
  const dow = now.getDay(); // 0=Sun
  const daysIntoWeek = dow === 0 ? 7 : dow;
  const weekPct = Math.round((daysIntoWeek / 7) * 100);

  if (editing) {
    return (
      <div className="bg-white rounded-xl border border-orange-200 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-orange-500" />
          <p className="text-sm font-semibold text-gray-900">Haftalık Gelir Hedefi Belirle</p>
        </div>
        <p className="text-xs text-gray-500">Bu haftaya ait toplam ciro hedefini gir (₺)</p>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₺</span>
            <input
              type="number"
              min="1"
              value={goalInput}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }}
              placeholder="Örn: 10000"
              autoFocus
              className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <button
            onClick={onSave}
            disabled={saving || !goalInput}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Kaydet
          </button>
          <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-300 p-5 flex items-center gap-4">
        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Flag className="w-5 h-5 text-orange-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Haftalık hedef belirle</p>
          <p className="text-xs text-gray-400 mt-0.5">Ciro hedefinizi girin, ilerlemenizi her gün takip edin</p>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-sm text-orange-600 border border-orange-200 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors font-medium flex-shrink-0"
        >
          <Flag className="w-3.5 h-3.5" /> Hedef Belirle
        </button>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((revenue / goal) * 100));
  const remaining = Math.max(0, goal - revenue);
  const isAhead = pct >= weekPct;
  const isComplete = pct >= 100;

  let msg = "";
  let msgColor = "text-gray-500";
  if (isComplete) {
    msg = "Tebrikler! Haftalık hedefinize ulaştınız 🎉";
    msgColor = "text-green-600";
  } else if (isAhead) {
    msg = `Harika gidiyorsunuz! ${remaining.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 })} kaldı`;
    msgColor = "text-green-600";
  } else if (pct < weekPct - 15) {
    msg = `Hedefin gerisinde. Günde ortalama ${Math.ceil(remaining / Math.max(1, 7 - daysIntoWeek)).toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 })} daha satış yapmalısınız`;
    msgColor = "text-orange-600";
  } else {
    msg = `${remaining.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 })} daha kazanmanız gerekiyor`;
    msgColor = "text-gray-500";
  }

  return (
    <div className={`bg-white rounded-xl border p-5 space-y-4 ${isComplete ? "border-green-200" : "border-gray-200"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flag className={`w-4 h-4 ${isComplete ? "text-green-500" : "text-orange-500"}`} />
          <p className="text-sm font-semibold text-gray-900">Haftalık Gelir Hedefi</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isComplete ? "bg-green-100 text-green-700" : isAhead ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>
            %{pct}
          </span>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Edit2 className="w-3 h-3" /> Değiştir
        </button>
      </div>

      {/* Gelir / Hedef */}
      <div className="flex items-baseline gap-1.5">
        <span className={`text-3xl font-black ${isComplete ? "text-green-600" : "text-gray-900"}`}>
          {revenue.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 })}
        </span>
        <span className="text-sm text-gray-400 font-medium">
          / {goal.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 })}
        </span>
      </div>

      {/* Progress bar — gelir */}
      <div className="space-y-1.5">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isComplete ? "bg-green-500" : isAhead ? "bg-green-400" : "bg-orange-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {/* Hafta ilerleme işareti */}
        <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-200 rounded-full transition-all duration-700"
            style={{ width: `${weekPct}%` }}
          />
          <div
            className="absolute top-0 w-0.5 h-full bg-blue-400"
            style={{ left: `${weekPct}%` }}
            title={`Haftanın %${weekPct}'i geçti`}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-xs font-medium ${msgColor}`}>{msg}</p>
          <p className="text-[10px] text-gray-400">Haftanın %{weekPct}'i ({daysIntoWeek}. gün)</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const BRIEF_CACHE_KEY = "sp_daily_brief";

function getBriefCache(): { date: string; items: string[] } | null {
  try {
    const raw = localStorage.getItem(BRIEF_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setBriefCache(items: string[]) {
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem(BRIEF_CACHE_KEY, JSON.stringify({ date: today, items }));
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [chartData, setChartData] = useState<DayCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState("");
  const [isMarketplaceConnected, setIsMarketplaceConnected] = useState(false);
  const [briefItems, setBriefItems] = useState<string[] | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState<number | null>(null);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);

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
        { data: weekOrders },
        { data: lastWeekOrders },
        { data: sellerRow },
      ] = await Promise.all([
        supabase.from("reviews").select("is_urgent, is_replied").eq("seller_id", user.id),
        supabase.from("products").select("description_score, seo_score").eq("seller_id", user.id),
        supabase.from("returns").select("returned_at").eq("seller_id", user.id).gte("returned_at", weekAgo),
        supabase.from("returns").select("id").eq("seller_id", user.id).gte("returned_at", twoWeeksAgo).lt("returned_at", weekAgo),
        supabase.from("returns").select("returned_at").eq("seller_id", user.id),
        supabase.from("reviews").select("reviewed_at, is_replied, is_urgent").eq("seller_id", user.id),
        supabase.from("reviews").select("is_replied, is_urgent").eq("seller_id", user.id).gte("reviewed_at", twoWeeksAgo).lt("reviewed_at", weekAgo),
        supabase.from("marketplace_credentials").select("id").eq("seller_id", user.id).limit(1),
        supabase.from("orders").select("ordered_at, total_price").eq("seller_id", user.id).gte("ordered_at", weekAgo),
        supabase.from("orders").select("id").eq("seller_id", user.id).gte("ordered_at", twoWeeksAgo).lt("ordered_at", weekAgo),
        supabase.from("sellers").select("weekly_revenue_goal").eq("id", user.id).single(),
      ]);

      if (sellerRow?.weekly_revenue_goal) setWeeklyGoal(sellerRow.weekly_revenue_goal);

      setIsMarketplaceConnected((credentials?.length ?? 0) > 0);

      const thisWeekReviews = (allReviews ?? []).filter(r => r.reviewed_at >= weekAgo);
      const weekRevenue = (weekOrders ?? []).reduce((s: number, o: { total_price: number | null }) => s + (o.total_price ?? 0), 0);

      const s: Summary = {
        totalReviews: reviews?.length ?? 0,
        urgentReviews: reviews?.filter((r) => r.is_urgent && !r.is_replied).length ?? 0,
        pendingReviews: reviews?.filter((r) => !r.is_replied).length ?? 0,
        lowScoreProducts: products?.filter((p) => (p.description_score ?? 100) < 60).length ?? 0,
        weekReturns: weekReturns?.length ?? 0,
        totalProducts: products?.length ?? 0,
        lastWeekReturns: lastWeekReturns?.length ?? 0,
        lastWeekPending: lastWeekReviews?.filter(r => !r.is_replied).length ?? 0,
        lastWeekUrgent: lastWeekReviews?.filter(r => r.is_urgent).length ?? 0,
        weekOrders: weekOrders?.length ?? 0,
        weekRevenue,
        lastWeekOrders: lastWeekOrders?.length ?? 0,
      };
      setSummary(s);

      const allOrdersForChart = weekOrders ?? [];
      setChartData(buildLast7Days(allReturns ?? [], allReviews ?? [], allOrdersForChart));
      setLoading(false);
      loadBrief(s);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadBrief(s: Summary, force = false) {
    if (!s) return;
    const today = new Date().toISOString().split("T")[0];
    const cached = getBriefCache();
    if (!force && cached && cached.date === today) {
      setBriefItems(cached.items);
      return;
    }
    setBriefLoading(true);
    try {
      const res = await fetch("/api/ai/daily-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urgentReviews: s.urgentReviews,
          pendingReviews: s.pendingReviews,
          pendingQuestions: 0,
          weekReturns: s.weekReturns,
          lowScoreProducts: s.lowScoreProducts,
          weekOrders: s.weekOrders,
          weekRevenue: s.weekRevenue,
        }),
      });
      const data = await res.json();
      const items: string[] = data.items ?? [];
      setBriefItems(items);
      setBriefCache(items);
    } finally {
      setBriefLoading(false);
    }
  }

  async function saveGoal() {
    const val = parseFloat(goalInput.replace(/\./g, "").replace(",", "."));
    if (isNaN(val) || val <= 0) return;
    setSavingGoal(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("sellers").upsert({ id: user.id, weekly_revenue_goal: val });
        setWeeklyGoal(val);
      }
    } finally {
      setSavingGoal(false);
      setEditingGoal(false);
      setGoalInput("");
    }
  }

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
    {
      label: "Bu Haftaki Sipariş",
      value: summary?.weekOrders ?? 0,
      sub: summary?.weekRevenue
        ? `${summary.weekRevenue.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 })} ciro`
        : "Sipariş verisi bekleniyor",
      emptyHint: "Bağlandığında haftalık siparişler burada görünür",
      icon: ShoppingBag,
      color: "text-green-600",
      bg: "bg-green-50",
      delta: summary ? <DeltaBadge current={summary.weekOrders} previous={summary.lastWeekOrders} /> : null,
      href: "/siparisler",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl w-full">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* Haftalık Hedef */}
      {!loading && isMarketplaceConnected && (
        <WeeklyGoalCard
          revenue={summary?.weekRevenue ?? 0}
          goal={weeklyGoal}
          editing={editingGoal}
          goalInput={goalInput}
          saving={savingGoal}
          onEdit={() => { setGoalInput(weeklyGoal ? String(weeklyGoal) : ""); setEditingGoal(true); }}
          onCancel={() => { setEditingGoal(false); setGoalInput(""); }}
          onInputChange={setGoalInput}
          onSave={saveGoal}
        />
      )}

      {/* Sağlık Skoru */}
      {!loading && summary && isMarketplaceConnected && (
        <HealthScoreCard s={summary} />
      )}

      {/* AI Günlük Brief */}
      {!loading && isMarketplaceConnected && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-900">AI Günlük Analizi</p>
              <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">Bugün için</span>
            </div>
            <button
              onClick={() => summary && loadBrief(summary, true)}
              disabled={briefLoading}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${briefLoading ? "animate-spin" : ""}`} />
              Yenile
            </button>
          </div>

          {briefLoading ? (
            <div className="flex items-center gap-2 py-3">
              <Loader2 className="w-4 h-4 text-orange-400 animate-spin flex-shrink-0" />
              <p className="text-sm text-gray-500">Veriler analiz ediliyor…</p>
            </div>
          ) : briefItems && briefItems.length > 0 ? (
            <ul className="space-y-2">
              {briefItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          ) : briefItems && briefItems.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">Bugün bekleyen kritik bir aksiyon görünmüyor. Her şey yolunda!</p>
          ) : null}
        </div>
      )}

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
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
          {platformStatuses.map((p) => (
            <div key={p.name} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-sm font-medium text-gray-700 truncate mr-2">{p.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${p.color}`}>{p.status}</span>
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
