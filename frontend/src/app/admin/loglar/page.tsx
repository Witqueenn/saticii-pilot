"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, Star, Users, Activity } from "lucide-react";

interface LogEntry {
  time: string;
  type: "email" | "form" | "signup";
  seller: string;
  detail: string;
  meta?: string;
}

interface SellerMap { [id: string]: string }

export default function LoglarPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"hepsi" | "email" | "form" | "signup">("hepsi");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: sends }, { data: responses }, { data: sellers }] = await Promise.all([
        supabase.from("email_sends").select("seller_id, subject, recipient_email, opened, clicked, created_at").order("created_at", { ascending: false }).limit(100),
        supabase.from("form_responses").select("seller_id, rating, email, created_at").order("created_at", { ascending: false }).limit(100),
        supabase.from("sellers").select("id, shop_name, created_at").order("created_at", { ascending: false }).limit(50),
      ]);

      const map: SellerMap = {};
      (sellers ?? []).forEach((s: any) => { map[s.id] = s.shop_name; });

      const entries: LogEntry[] = [];

      (sends ?? []).forEach((s: any) => {
        entries.push({
          time: s.created_at,
          type: "email",
          seller: map[s.seller_id] ?? s.seller_id?.slice(0, 8) ?? "—",
          detail: `Email gönderildi: "${s.subject}"`,
          meta: s.recipient_email,
        });
      });

      (responses ?? []).forEach((r: any) => {
        entries.push({
          time: r.created_at,
          type: "form",
          seller: map[r.seller_id] ?? r.seller_id?.slice(0, 8) ?? "—",
          detail: `Form yanıtı: ${r.rating} yıldız`,
          meta: r.email ?? "anonim",
        });
      });

      (sellers ?? []).forEach((s: any) => {
        entries.push({
          time: s.created_at,
          type: "signup",
          seller: s.shop_name,
          detail: "Yeni satıcı kaydı",
          meta: undefined,
        });
      });

      entries.sort((a, b) => b.time.localeCompare(a.time));
      setLogs(entries);
      setLoading(false);
    }
    load();
  }, []);

  const typeConfig = {
    email: { icon: Mail, color: "text-blue-600", bg: "bg-blue-50", label: "Email" },
    form: { icon: Star, color: "text-yellow-600", bg: "bg-yellow-50", label: "Form" },
    signup: { icon: Users, color: "text-green-600", bg: "bg-green-50", label: "Kayıt" },
  };

  const filtered = filter === "hepsi" ? logs : logs.filter((l) => l.type === filter);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Aktivite Logları</h2>
        <p className="text-gray-500 mt-1">Platform geneli son aktiviteler</p>
      </div>

      {/* Özet */}
      <div className="grid grid-cols-3 gap-4">
        {(["email", "form", "signup"] as const).map((type) => {
          const cfg = typeConfig[type];
          const count = logs.filter((l) => l.type === type).length;
          return (
            <div key={type} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={`${cfg.bg} ${cfg.color} p-2 rounded-lg`}><cfg.icon className="w-4 h-4" /></div>
              <div>
                <p className="text-xl font-bold text-gray-900">{loading ? "—" : count}</p>
                <p className="text-xs text-gray-500">{cfg.label} kaydı</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtre */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(["hepsi", "email", "form", "signup"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {f === "hepsi" ? "Hepsi" : f === "email" ? "Email" : f === "form" ? "Form" : "Kayıt"}
            <span className="ml-1.5 text-xs text-gray-400">({logs.filter((l) => f === "hepsi" || l.type === f).length})</span>
          </button>
        ))}
      </div>

      {/* Log listesi */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">{filtered.length} kayıt</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Kayıt bulunamadı.</div>
        ) : (
          <div className="divide-y divide-gray-100 overflow-y-auto max-h-[600px]">
            {filtered.slice(0, 200).map((log, i) => {
              const cfg = typeConfig[log.type];
              return (
                <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className={`${cfg.bg} ${cfg.color} p-1.5 rounded-lg flex-shrink-0`}>
                    <cfg.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{log.detail}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-medium text-orange-600">{log.seller}</span>
                      {log.meta && <span className="text-xs text-gray-400">· {log.meta}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(log.time).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
