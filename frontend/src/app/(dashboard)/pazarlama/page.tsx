"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus, Send, Tag, Calendar, Trash2, Loader2, CheckCircle,
  Megaphone, Mail, Sparkles, Copy, Hash,
} from "lucide-react";
import ProGate from "@/components/ProGate";

interface Campaign {
  id: string;
  title: string;
  platform: string | null;
  discount_pct: number | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  status: string;
}

const PLATFORMS = ["Trendyol", "Hepsiburada", "N11", "WooCommerce", "Shopify", "Hepsi"];

const STATUS_COLORS: Record<string, string> = {
  planned: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-500",
};
const STATUS_LABELS: Record<string, string> = {
  planned: "Planlandı", active: "Aktif", completed: "Tamamlandı",
};

const SEGMENTS = [
  { key: "all", label: "Tüm Liste" },
  { key: "newsletter", label: "Bülten Aboneleri" },
  { key: "rating5", label: "5 Yıldız Verenler" },
  { key: "rating4plus", label: "4+ Yıldız Verenler" },
];

const TONES = [
  { key: "samimi", label: "Samimi" },
  { key: "profesyonel", label: "Profesyonel" },
  { key: "acil", label: "Aciliyet" },
];

function generateCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function PazarlamaPage() {
  const [plan, setPlan] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tab, setTab] = useState<"kampanya" | "email">("kampanya");

  // Segment counts
  const [segmentCounts, setSegmentCounts] = useState<Record<string, number>>({});
  const [segment, setSegment] = useState("all");

  // Campaign form
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", platform: "", discount_pct: "", start_date: "", end_date: "", notes: "" });

  // Email form
  const [emailForm, setEmailForm] = useState({ subject: "", body: "", discount_code: "", product: "", tone: "samimi" });
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);

  // AI
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiInstagram, setAiInstagram] = useState<{ caption: string; hashtags: string[] } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const loadSegmentCounts = useCallback(async () => {
    const counts: Record<string, number> = {};
    await Promise.all(
      SEGMENTS.map(async ({ key }) => {
        const res = await fetch(`/api/pazarlama/email?segment=${key}`);
        const data = await res.json();
        counts[key] = data.count ?? 0;
      })
    );
    setSegmentCounts(counts);
  }, []);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [{ data: adminData }, { data: seller }] = await Promise.all([
        supabase.from("admin_users").select("id").eq("id", user.id).single(),
        supabase.from("sellers").select("plan").eq("id", user.id).single(),
      ]);
      const effectivePlan = adminData ? "marketing" : (seller?.plan ?? "temel");
      setPlan(effectivePlan);
      if (effectivePlan !== "marketing") return;

      const { data: cList } = await supabase
        .from("campaigns")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      setCampaigns(cList ?? []);
      loadSegmentCounts();
    }
    load();
  }, [loadSegmentCounts]);

  async function saveCampaign() {
    if (!userId || !form.title) return;
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase.from("campaigns").insert({
      seller_id: userId,
      title: form.title,
      platform: form.platform || null,
      discount_pct: form.discount_pct ? parseInt(form.discount_pct) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      notes: form.notes || null,
      status: "planned",
    }).select().single();
    if (data) setCampaigns((prev) => [data, ...prev]);
    setForm({ title: "", platform: "", discount_pct: "", start_date: "", end_date: "", notes: "" });
    setShowForm(false);
    setSaving(false);
  }

  async function deleteCampaign(id: string) {
    const supabase = createClient();
    await supabase.from("campaigns").delete().eq("id", id);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }

  async function updateStatus(id: string, status: string) {
    const supabase = createClient();
    await supabase.from("campaigns").update({ status }).eq("id", id);
    setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
  }

  async function generateAI() {
    if (!emailForm.subject) return;
    setGeneratingAI(true);
    setAiInstagram(null);
    const res = await fetch("/api/pazarlama/ai-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: emailForm.subject, product: emailForm.product, tone: emailForm.tone }),
    });
    const data = await res.json();
    if (data.email_body) setEmailForm((p) => ({ ...p, body: data.email_body }));
    if (data.instagram_caption) setAiInstagram({ caption: data.instagram_caption, hashtags: data.hashtags ?? [] });
    setGeneratingAI(false);
  }

  async function sendEmail() {
    setSending(true);
    setSendResult(null);
    const res = await fetch("/api/pazarlama/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...emailForm, segment }),
    });
    const data = await res.json();
    setSendResult(data);
    setSending(false);
    if (data.sent > 0) {
      setEmailForm((p) => ({ ...p, subject: "", body: "", discount_code: "" }));
      setAiInstagram(null);
      loadSegmentCounts();
    }
  }

  if (plan === null) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (plan !== "marketing") return <ProGate feature="Pazarlama Araçları" tier="marketing" />;

  const recipientCount = segmentCounts[segment] ?? 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pazarlama</h2>
        <p className="text-gray-500 mt-1">Kampanya planla, müşterilere hedefli e-posta gönder, AI ile içerik üret.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: "kampanya", label: "Kampanyalar", icon: Megaphone },
          { key: "email", label: "E-posta", icon: Mail },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as "kampanya" | "email")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Kampanya Tab ── */}
      {tab === "kampanya" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{campaigns.length} kampanya</p>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" /> Yeni Kampanya
            </button>
          </div>

          {showForm && (
            <div className="bg-white border border-orange-200 rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Yeni Kampanya</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kampanya Adı *</label>
                  <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Yaz sezonu indirimi"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Platform</label>
                  <select value={form.platform} onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50">
                    <option value="">Seç</option>
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">İndirim %</label>
                  <input type="number" value={form.discount_pct} onChange={(e) => setForm((p) => ({ ...p, discount_pct: e.target.value }))}
                    placeholder="20" min={1} max={90}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Başlangıç</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Bitiş</label>
                  <input type="date" value={form.end_date} onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notlar</label>
                  <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    rows={2} placeholder="Hangi ürünler, hedef, bütçe..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 resize-none" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={saveCampaign} disabled={saving || !form.title}
                  className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Kaydet
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">İptal</button>
              </div>
            </div>
          )}

          {campaigns.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">Henüz kampanya yok</p>
              <p className="text-gray-400 text-xs mt-1">İlk kampanyanı oluşturmak için "Yeni Kampanya"ya tıkla.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((c) => (
                <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{c.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status] ?? STATUS_COLORS.planned}`}>
                          {STATUS_LABELS[c.status] ?? c.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                        {c.platform && <span className="flex items-center gap-1"><Megaphone className="w-3 h-3" />{c.platform}</span>}
                        {c.discount_pct && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />%{c.discount_pct}</span>}
                        {c.start_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{c.start_date}{c.end_date ? ` → ${c.end_date}` : ""}</span>}
                      </div>
                      {c.notes && <p className="text-xs text-gray-500">{c.notes}</p>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {c.status === "planned" && (
                        <button onClick={() => updateStatus(c.id, "active")} className="text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded-lg transition-colors">Başlat</button>
                      )}
                      {c.status === "active" && (
                        <button onClick={() => updateStatus(c.id, "completed")} className="text-xs text-gray-500 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">Tamamla</button>
                      )}
                      <button onClick={() => deleteCampaign(c.id)} className="p-1.5 text-gray-300 hover:text-red-400 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── E-posta Tab ── */}
      {tab === "email" && (
        <div className="space-y-5">

          {/* Segment seçici */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Hedef Kitle</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SEGMENTS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSegment(key)}
                  className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                    segment === key
                      ? "border-orange-400 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className={`text-lg font-bold ${segment === key ? "text-orange-600" : "text-gray-900"}`}>
                    {segmentCounts[key] ?? "—"}
                  </span>
                  <span className={`text-[11px] mt-0.5 ${segment === key ? "text-orange-600 font-medium" : "text-gray-500"}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400">Seçili segment: <strong className="text-gray-700">{recipientCount} kişi</strong></p>
          </div>

          {/* AI içerik üretici */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <p className="text-sm font-semibold text-gray-700">AI İçerik Üretici</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Konu / Tema</label>
                <input
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="Yaz sezonu %30 indirim kampanyası"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ton</label>
                <select
                  value={emailForm.tone}
                  onChange={(e) => setEmailForm((p) => ({ ...p, tone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                >
                  {TONES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Ürün / Kategori <span className="text-gray-400">(isteğe bağlı)</span></label>
                <input
                  value={emailForm.product}
                  onChange={(e) => setEmailForm((p) => ({ ...p, product: e.target.value }))}
                  placeholder="Örn: kadın yazlık elbise"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                />
              </div>
            </div>
            <button
              onClick={generateAI}
              disabled={generatingAI || !emailForm.subject}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {generatingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generatingAI ? "Üretiliyor..." : "AI ile Yaz"}
            </button>

            {/* Instagram sonucu */}
            {aiInstagram && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-700">Instagram Caption</span>
                  </div>
                  <button onClick={() => copy(`${aiInstagram.caption}\n\n${aiInstagram.hashtags.map(h => `#${h}`).join(" ")}`, "instagram")}
                    className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors">
                    {copiedField === "instagram" ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedField === "instagram" ? "Kopyalandı" : "Kopyala"}
                  </button>
                </div>
                <p className="text-sm text-gray-700">{aiInstagram.caption}</p>
                <div className="flex flex-wrap gap-1">
                  {aiInstagram.hashtags.map((h) => (
                    <span key={h} className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">#{h}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* E-posta compose */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <p className="text-sm font-semibold text-gray-700">E-posta İçeriği</p>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mesaj</label>
              <textarea
                value={emailForm.body}
                onChange={(e) => setEmailForm((p) => ({ ...p, body: e.target.value }))}
                rows={6}
                placeholder="AI ile yaz butonuna tıkla veya kendin yaz..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 resize-none"
              />
              {emailForm.body && (
                <div className="flex justify-end mt-1">
                  <button onClick={() => copy(emailForm.body, "body")} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    {copiedField === "body" ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedField === "body" ? "Kopyalandı" : "Kopyala"}
                  </button>
                </div>
              )}
            </div>

            {/* İndirim kodu */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">İndirim Kodu <span className="text-gray-400 font-normal">(isteğe bağlı)</span></label>
              <div className="flex gap-2">
                <input
                  value={emailForm.discount_code}
                  onChange={(e) => setEmailForm((p) => ({ ...p, discount_code: e.target.value.toUpperCase() }))}
                  placeholder="YAZI2026"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 font-mono tracking-widest"
                />
                <button
                  onClick={() => setEmailForm((p) => ({ ...p, discount_code: generateCode() }))}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-colors"
                >
                  <Tag className="w-4 h-4" /> Oluştur
                </button>
              </div>
            </div>

            {sendResult && (
              <div className={`flex items-center gap-2 rounded-xl p-3 text-sm ${sendResult.sent > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {sendResult.sent > 0
                  ? `${sendResult.sent} kişiye başarıyla gönderildi.${sendResult.failed > 0 ? ` ${sendResult.failed} başarısız.` : ""}`
                  : "Gönderim başarısız oldu."}
              </div>
            )}

            <button
              onClick={sendEmail}
              disabled={sending || !emailForm.subject || !emailForm.body || recipientCount === 0}
              className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? "Gönderiliyor..." : `${recipientCount} Kişiye Gönder`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
