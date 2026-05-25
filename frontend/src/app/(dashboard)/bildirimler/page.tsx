"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  AlertTriangle, HelpCircle, Package, RotateCcw,
  Bell, CheckCircle, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

type NotifType = "urgent_review" | "pending_question" | "low_product" | "recent_return";

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  href: string;
  time: string | null;
}

const TYPE_META: Record<NotifType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  urgent_review:     { icon: AlertTriangle, color: "text-red-600",    bg: "bg-red-50",    label: "Acil Yorum" },
  pending_question:  { icon: HelpCircle,    color: "text-blue-600",   bg: "bg-blue-50",   label: "Müşteri Sorusu" },
  low_product:       { icon: Package,       color: "text-orange-600", bg: "bg-orange-50", label: "Ürün Uyarısı" },
  recent_return:     { icon: RotateCcw,     color: "text-yellow-600", bg: "bg-yellow-50", label: "İade" },
};

type FilterKey = "tumu" | NotifType;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "tumu",             label: "Tümü" },
  { key: "urgent_review",    label: "Acil Yorumlar" },
  { key: "pending_question", label: "Sorular" },
  { key: "low_product",      label: "Ürünler" },
  { key: "recent_return",    label: "İadeler" },
];

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} dk önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} saat önce`;
  return `${Math.floor(hrs / 24)} gün önce`;
}

export default function BildirimlerPage() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("tumu");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [
        { data: urgentReviews },
        { data: pendingQuestions },
        { data: lowProducts },
        { data: recentReturns },
      ] = await Promise.all([
        supabase
          .from("reviews")
          .select("id, product_name, reviewed_at")
          .eq("seller_id", user.id)
          .eq("is_urgent", true)
          .eq("is_replied", false)
          .order("reviewed_at", { ascending: false })
          .limit(20),
        supabase
          .from("questions")
          .select("id, question_text, asked_at")
          .eq("seller_id", user.id)
          .eq("is_answered", false)
          .order("asked_at", { ascending: false })
          .limit(20),
        supabase
          .from("products")
          .select("id, name, description_score")
          .eq("seller_id", user.id)
          .lt("description_score", 60)
          .order("description_score", { ascending: true })
          .limit(10),
        supabase
          .from("returns")
          .select("id, product_name, reason, returned_at")
          .eq("seller_id", user.id)
          .order("returned_at", { ascending: false })
          .limit(15),
      ]);

      const items: Notif[] = [];

      for (const r of urgentReviews ?? []) {
        items.push({
          id: `ur-${r.id}`,
          type: "urgent_review",
          title: "Acil yorum yanıt bekliyor",
          body: r.product_name,
          href: "/yorumlar",
          time: r.reviewed_at,
        });
      }

      for (const q of pendingQuestions ?? []) {
        items.push({
          id: `pq-${q.id}`,
          type: "pending_question",
          title: "Yanıtsız müşteri sorusu",
          body: (q.question_text as string)?.slice(0, 80) ?? "",
          href: "/sorular",
          time: q.asked_at,
        });
      }

      for (const p of lowProducts ?? []) {
        items.push({
          id: `lp-${p.id}`,
          type: "low_product",
          title: `Açıklama puanı düşük — ${p.description_score ?? 0}/100`,
          body: p.name,
          href: "/urunler",
          time: null,
        });
      }

      for (const ret of recentReturns ?? []) {
        items.push({
          id: `rt-${ret.id}`,
          type: "recent_return",
          title: "İade alındı",
          body: `${ret.product_name}${ret.reason ? ` — ${ret.reason}` : ""}`,
          href: "/iadeler",
          time: ret.returned_at,
        });
      }

      // Sırala: önce zamanlı olanlar (yeni → eski), zamansızlar en sona
      items.sort((a, b) => {
        if (a.time && b.time) return new Date(b.time).getTime() - new Date(a.time).getTime();
        if (a.time) return -1;
        if (b.time) return 1;
        return 0;
      });

      setNotifs(items);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = filter === "tumu" ? notifs : notifs.filter((n) => n.type === filter);

  const counts: Record<FilterKey, number> = {
    tumu:             notifs.length,
    urgent_review:    notifs.filter((n) => n.type === "urgent_review").length,
    pending_question: notifs.filter((n) => n.type === "pending_question").length,
    low_product:      notifs.filter((n) => n.type === "low_product").length,
    recent_return:    notifs.filter((n) => n.type === "recent_return").length,
  };

  return (
    <div className="space-y-6 max-w-2xl w-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bildirimler</h2>
          <p className="text-gray-500 mt-1">Tüm uyarılar ve aksiyon gerektiren öğeler tek yerde.</p>
        </div>
        {notifs.length > 0 && (
          <span className="mt-1 flex-shrink-0 text-xs bg-red-100 text-red-600 font-semibold px-3 py-1.5 rounded-lg">
            {notifs.length} bekleyen
          </span>
        )}
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              filter === key
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            )}
          >
            {label}
            {counts[key] > 0 && (
              <span className={clsx(
                "text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center",
                filter === key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              )}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <p className="font-semibold text-gray-700">
            {filter === "tumu" ? "Bekleyen bildirim yok" : "Bu kategoride bildirim yok"}
          </p>
          <p className="text-sm text-gray-400 mt-1">Her şey yolunda görünüyor.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const meta = TYPE_META[n.type];
            const Icon = meta.icon;
            return (
              <Link
                key={n.id}
                href={n.href}
                className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-4 hover:border-orange-200 hover:shadow-sm transition-all group"
              >
                <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${meta.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                      {meta.label}
                    </span>
                    {n.time && (
                      <span className="text-[10px] text-gray-400">{relativeTime(n.time)}</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800 mt-1">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{n.body}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 flex-shrink-0 mt-1 transition-colors" />
              </Link>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Bildirimler ilgili sayfadan işaretlendiğinde otomatik kaybolur.
        </p>
      )}
    </div>
  );
}
