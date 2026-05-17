"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus, Send, Tag, Calendar, Trash2, Loader2, CheckCircle,
  Megaphone, Mail, Sparkles, Copy, Hash, Zap, ToggleLeft, ToggleRight,
  BarChart2, Smartphone, MousePointerClick, Eye, Image, Download, Coins,
} from "lucide-react";
import ProGate from "@/components/ProGate";

interface Automation {
  id: string;
  name: string;
  trigger: string;
  subject: string;
  body: string;
  discount_code: string | null;
  is_active: boolean;
  sent_count: number;
}

const TEMPLATES = [
  {
    name: "Karşılama + İndirim Kodu",
    subject: "Geri bildiriminiz için teşekkürler! 🎁",
    body: "Merhaba,\n\nDeğerli görüşünüz için çok teşekkür ederiz!\n\nSizin için özel bir indirim kodu hazırladık. Bir sonraki alışverişinizde kullanabilirsiniz.\n\nKod: {discount_code}\n\nİyi alışverişler dileriz,\n{shop_name}",
    discount_code: "",
  },
  {
    name: "Sade Teşekkür",
    subject: "Geri bildiriminiz alındı",
    body: "Merhaba,\n\nGörüşünüzü paylaştığınız için teşekkür ederiz. Daha iyi bir deneyim sunabilmek için her zaman değerlendirmelerinizi dikkate alıyoruz.\n\nSaygılarımızla,\n{shop_name}",
    discount_code: "",
  },
  {
    name: "Ürün Memnuniyeti + Öneri",
    subject: "{urun} hakkında görüşünüz alındı",
    body: "Merhaba,\n\n{urun} siparişiniz hakkındaki değerlendirmeniz için teşekkür ederiz.\n\nMağazamızdaki diğer ürünleri de incelemenizi öneririz. Size özel %10 indirim fırsatını kaçırmayın!\n\nKod: {discount_code}\n\n{shop_name}",
    discount_code: "",
  },
];

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
  const [tab, setTab] = useState<"kampanya" | "email" | "otomasyon" | "performans" | "sms" | "gorsel">("kampanya");
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [showAutoForm, setShowAutoForm] = useState(false);
  const [savingAuto, setSavingAuto] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [autoForm, setAutoForm] = useState({
    name: TEMPLATES[0].name,
    subject: TEMPLATES[0].subject,
    body: TEMPLATES[0].body,
    discount_code: "",
  });

  // Segment counts
  const [segmentCounts, setSegmentCounts] = useState<Record<string, number>>({});
  const [segment, setSegment] = useState("all");

  // Campaign form
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", platform: "", discount_pct: "", start_date: "", end_date: "", notes: "" });

  // Email form
  const [emailForm, setEmailForm] = useState({ subject: "", body: "", discount_code: "", product: "", tone: "samimi" });

  // SMS
  const [smsMessage, setSmsMessage] = useState("");
  const [smsSegment, setSmsSegment] = useState("all");
  const [smsCounts, setSmsCounts] = useState<Record<string, number>>({});
  const [sendingSms, setSendingSms] = useState(false);
  const [smsResult, setSmsResult] = useState<{ sent: number; total: number } | null>(null);

  // Performans
  interface EmailSend { campaign_label: string; subject: string; segment: string; opened: boolean; clicked: boolean; }
  const [emailSends, setEmailSends] = useState<EmailSend[]>([]);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);

  // Görsel
  const [imageTokens, setImageTokens] = useState<number | null>(null);
  const [imageProduct, setImageProduct] = useState("");
  const [imageStyle, setImageStyle] = useState("beyaz");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

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

      const [{ data: cList }, { data: aList }] = await Promise.all([
        supabase.from("campaigns").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }),
        supabase.from("automations").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }),
      ]);
      setCampaigns(cList ?? []);
      setAutomations(aList ?? []);
      loadSegmentCounts();

      // SMS counts
      const smsCountsData: Record<string, number> = {};
      await Promise.all(SEGMENTS.map(async ({ key }) => {
        const res = await fetch(`/api/pazarlama/sms?segment=${key}`);
        const d = await res.json();
        smsCountsData[key] = d.count ?? 0;
      }));
      setSmsCounts(smsCountsData);

      // Performans: son 50 gönderim
      const { data: sends } = await supabase
        .from("email_sends")
        .select("campaign_label, subject, segment, opened, clicked")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);
      setEmailSends(sends ?? []);

      // Görsel token
      const tokenRes = await fetch("/api/pazarlama/gorsel");
      const tokenData = await tokenRes.json();
      setImageTokens(tokenData.tokens ?? 0);
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

  function applyTemplate(idx: number) {
    const t = TEMPLATES[idx];
    setSelectedTemplate(idx);
    setAutoForm({ name: t.name, subject: t.subject, body: t.body, discount_code: t.discount_code });
  }

  async function saveAutomation() {
    if (!userId || !autoForm.name || !autoForm.subject || !autoForm.body) return;
    setSavingAuto(true);
    const supabase = createClient();
    const { data } = await supabase.from("automations").insert({
      seller_id: userId,
      name: autoForm.name,
      trigger: "form_submitted",
      subject: autoForm.subject,
      body: autoForm.body,
      discount_code: autoForm.discount_code || null,
      is_active: true,
    }).select().single();
    if (data) setAutomations((prev) => [data, ...prev]);
    setShowAutoForm(false);
    setSavingAuto(false);
  }

  async function toggleAutomation(id: string, is_active: boolean) {
    const supabase = createClient();
    await supabase.from("automations").update({ is_active }).eq("id", id);
    setAutomations((prev) => prev.map((a) => a.id === id ? { ...a, is_active } : a));
  }

  async function deleteAutomation(id: string) {
    const supabase = createClient();
    await supabase.from("automations").delete().eq("id", id);
    setAutomations((prev) => prev.filter((a) => a.id !== id));
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

  async function sendSms() {
    setSendingSms(true);
    setSmsResult(null);
    const res = await fetch("/api/pazarlama/sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: smsMessage, segment: smsSegment }),
    });
    const data = await res.json();
    setSmsResult(data);
    setSendingSms(false);
    if (data.sent > 0) setSmsMessage("");
  }

  async function generateImage() {
    if (!imageProduct) return;
    setGeneratingImage(true);
    setGeneratedImage(null);
    setImageError(null);
    const res = await fetch("/api/pazarlama/gorsel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: imageProduct, style: imageStyle }),
    });
    const data = await res.json();
    if (data.url) {
      setGeneratedImage(data.url);
      setImageTokens(data.remaining);
    } else {
      setImageError(data.error ?? "Görsel oluşturulamadı");
    }
    setGeneratingImage(false);
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
    <div className="space-y-6 max-w-3xl w-full">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pazarlama</h2>
        <p className="text-gray-500 mt-1">Kampanya planla, müşterilere hedefli e-posta gönder, AI ile içerik üret.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: "kampanya", label: "Kampanyalar", icon: Megaphone },
          { key: "email", label: "E-posta", icon: Mail },
          { key: "gorsel", label: "Görsel AI", icon: Image },
          { key: "sms", label: "SMS", icon: Smartphone },
          { key: "otomasyon", label: "Otomasyonlar", icon: Zap },
          { key: "performans", label: "Performans", icon: BarChart2 },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
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
      {/* ── Görsel AI Tab ── */}
      {tab === "gorsel" && (
        <div className="space-y-5">
          {/* Token sayacı */}
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Coins className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Görsel Token</p>
                <p className="text-xs text-gray-500">Her görsel 1 token tüketir</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-violet-600">{imageTokens ?? "—"}</p>
              <p className="text-xs text-gray-400">kalan token</p>
            </div>
          </div>

          {imageTokens === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              Token'ların bitti. Ek token için{" "}
              <a href="mailto:destek@saticipilot.com?subject=Görsel Token Satın Alma" className="font-semibold underline">
                destek@saticipilot.com
              </a>{" "}
              ile iletişime geç.
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            {/* Ürün açıklaması */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ürün / Açıklama</label>
              <input
                type="text"
                value={imageProduct}
                onChange={(e) => setImageProduct(e.target.value)}
                placeholder="Örn: kırmızı çiçek desenli yazlık elbise"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50"
              />
            </div>

            {/* Stil seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Görsel Stili</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "beyaz", label: "Ürün Fotoğrafı", desc: "Beyaz zemin, stüdyo" },
                  { key: "instagram", label: "Instagram Post", desc: "Estetik flat lay" },
                  { key: "kampanya", label: "Kampanya Banner", desc: "İndirim temalı" },
                  { key: "lifestyle", label: "Lifestyle", desc: "Gerçek ortam" },
                ].map(({ key, label, desc }) => (
                  <button
                    key={key}
                    onClick={() => setImageStyle(key)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      imageStyle === key ? "border-violet-400 bg-violet-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className={`text-sm font-medium ${imageStyle === key ? "text-violet-700" : "text-gray-800"}`}>{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {imageError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{imageError}</div>
            )}

            <button
              onClick={generateImage}
              disabled={generatingImage || !imageProduct || (imageTokens ?? 0) === 0}
              className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {generatingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generatingImage ? "Oluşturuluyor... (~15sn)" : "Görsel Oluştur (1 token)"}
            </button>
          </div>

          {/* Sonuç */}
          {generatedImage && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
              <p className="text-sm font-semibold text-gray-700">Oluşturulan Görsel</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={generatedImage} alt="AI görseli" className="w-full rounded-xl border border-gray-100" />
              <a
                href={generatedImage}
                download="gorsel.png"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-violet-600 font-medium hover:underline"
              >
                <Download className="w-4 h-4" />
                Görseli İndir
              </a>
              <p className="text-xs text-gray-400">Not: DALL-E görselleri 1 saat sonra silinir. Hemen indirin.</p>
            </div>
          )}
        </div>
      )}

      {/* ── SMS Tab ── */}
      {tab === "sms" && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">SMS Kampanyası Yakında</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Müşterilerine doğrudan SMS ile ulaş. Bu özellik yakında aktif olacak.
          </p>
        </div>
      )}

      {/* ── Performans Tab ── */}
      {tab === "performans" && (() => {
        // Kampanya bazlı grupla
        const groups: Record<string, { label: string; segment: string; total: number; opened: number; clicked: number }> = {};
        for (const s of emailSends) {
          const key = s.campaign_label ?? s.subject;
          if (!groups[key]) groups[key] = { label: key, segment: s.segment, total: 0, opened: 0, clicked: 0 };
          groups[key].total++;
          if (s.opened) groups[key].opened++;
          if (s.clicked) groups[key].clicked++;
        }
        const rows = Object.values(groups);

        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Her gönderilen kampanyanın açılma ve tıklanma oranı. Resend webhook kurulumu gerekir.</p>

            {rows.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
                <BarChart2 className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">Henüz kampanya verisi yok</p>
                <p className="text-gray-400 text-xs mt-1">E-posta gönderdikten sonra istatistikler burada görünür.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rows.map((r) => {
                  const openRate = r.total > 0 ? Math.round((r.opened / r.total) * 100) : 0;
                  const clickRate = r.total > 0 ? Math.round((r.clicked / r.total) * 100) : 0;
                  return (
                    <div key={r.label} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{r.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{r.segment} segmenti · {r.total} kişi</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Eye className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-xs font-medium text-blue-700">Açılma Oranı</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-700">%{openRate}</p>
                          <p className="text-xs text-blue-500">{r.opened} / {r.total}</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <MousePointerClick className="w-3.5 h-3.5 text-purple-500" />
                            <span className="text-xs font-medium text-purple-700">Tıklanma Oranı</span>
                          </div>
                          <p className="text-2xl font-bold text-purple-700">%{clickRate}</p>
                          <p className="text-xs text-purple-500">{r.clicked} / {r.total}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500 space-y-1">
              <p className="font-semibold text-gray-700">Webhook kurulumu</p>
              <p>1. Resend dashboard → Webhooks → Add endpoint</p>
              <p>2. URL: <code className="bg-gray-100 px-1 rounded">https://saticii-pilot.vercel.app/api/webhooks/resend</code></p>
              <p>3. Events: <code className="bg-gray-100 px-1 rounded">email.opened</code>, <code className="bg-gray-100 px-1 rounded">email.clicked</code></p>
              <p>4. Signing secret'ı Vercel'de <code className="bg-gray-100 px-1 rounded">RESEND_WEBHOOK_SECRET</code> olarak ekle</p>
            </div>
          </div>
        );
      })()}

      {/* ── Otomasyonlar Tab ── */}
      {tab === "otomasyon" && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600">Müşteri formu doldurulunca otomatik e-posta gider.</p>
              <p className="text-xs text-gray-400 mt-0.5">Değişkenler: <code className="bg-gray-100 px-1 rounded">{"{shop_name}"}</code> <code className="bg-gray-100 px-1 rounded">{"{discount_code}"}</code> <code className="bg-gray-100 px-1 rounded">{"{urun}"}</code></p>
            </div>
            <button
              onClick={() => setShowAutoForm(!showAutoForm)}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> Yeni
            </button>
          </div>

          {showAutoForm && (
            <div className="bg-white border border-orange-200 rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Yeni Otomasyon</h3>

              {/* Şablon seçici */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Şablon Seç</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {TEMPLATES.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => applyTemplate(i)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        selectedTemplate === i
                          ? "border-orange-400 bg-orange-50 text-orange-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <span className="font-medium">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Otomasyon Adı</label>
                <input value={autoForm.name} onChange={(e) => setAutoForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">E-posta Konusu</label>
                <input value={autoForm.subject} onChange={(e) => setAutoForm((p) => ({ ...p, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">E-posta Metni</label>
                <textarea value={autoForm.body} onChange={(e) => setAutoForm((p) => ({ ...p, body: e.target.value }))}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">İndirim Kodu <span className="text-gray-400 font-normal">(isteğe bağlı)</span></label>
                <div className="flex gap-2">
                  <input value={autoForm.discount_code} onChange={(e) => setAutoForm((p) => ({ ...p, discount_code: e.target.value.toUpperCase() }))}
                    placeholder="HOSGELDIN10"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 font-mono tracking-widest" />
                  <button onClick={() => setAutoForm((p) => ({ ...p, discount_code: generateCode() }))}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-colors">
                    <Tag className="w-4 h-4" /> Oluştur
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={saveAutomation} disabled={savingAuto || !autoForm.name || !autoForm.subject || !autoForm.body}
                  className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors">
                  {savingAuto && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Kaydet ve Aktifleştir
                </button>
                <button onClick={() => setShowAutoForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">İptal</button>
              </div>
            </div>
          )}

          {automations.length === 0 && !showAutoForm ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
              <Zap className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">Henüz otomasyon yok</p>
              <p className="text-gray-400 text-xs mt-1">Otomasyon ekleyince form dolduran her müşteriye otomatik mail gider.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {automations.map((a) => (
                <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{a.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${a.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                          {a.is_active ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{a.subject}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" />Form doldurulunca</span>
                        <span className="flex items-center gap-1"><Send className="w-3 h-3" />{a.sent_count} gönderildi</span>
                        {a.discount_code && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{a.discount_code}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => toggleAutomation(a.id, !a.is_active)}
                        className={`transition-colors ${a.is_active ? "text-green-500 hover:text-gray-400" : "text-gray-300 hover:text-green-500"}`}>
                        {a.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                      </button>
                      <button onClick={() => deleteAutomation(a.id)} className="p-1.5 text-gray-300 hover:text-red-400 rounded-lg transition-colors">
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

    </div>
  );
}
