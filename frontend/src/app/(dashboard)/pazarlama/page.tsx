"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Send, Tag, Calendar, Trash2, Loader2, CheckCircle, Megaphone, Mail } from "lucide-react";
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
  created_at: string;
}

const PLATFORMS = ["Trendyol", "Hepsiburada", "N11", "WooCommerce", "Shopify", "Hepsi"];
const STATUS_COLORS: Record<string, string> = {
  planned: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-500",
};
const STATUS_LABELS: Record<string, string> = {
  planned: "Planlandı",
  active: "Aktif",
  completed: "Tamamlandı",
};

function generateCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function PazarlamaPage() {
  const [plan, setPlan] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [emailCount, setEmailCount] = useState(0);
  const [tab, setTab] = useState<"kampanya" | "email">("kampanya");

  // Campaign form
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", platform: "", discount_pct: "", start_date: "", end_date: "", notes: "" });

  // Email form
  const [emailForm, setEmailForm] = useState({ subject: "", body: "", discount_code: "" });
  const [generatedCode, setGeneratedCode] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);

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
      setPlan(adminData ? "marketing" : (seller?.plan ?? "temel"));

      const [{ data: cList }, { count }] = await Promise.all([
        supabase.from("campaigns").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }),
        supabase.from("form_responses").select("*", { count: "exact", head: true }).eq("seller_id", user.id).not("email", "is", null),
      ]);
      setCampaigns(cList ?? []);
      setEmailCount(count ?? 0);
    }
    load();
  }, []);

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

  async function sendEmail() {
    setSending(true);
    setSendResult(null);
    const res = await fetch("/api/pazarlama/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailForm),
    });
    const data = await res.json();
    setSendResult(data);
    setSending(false);
    if (data.sent > 0) setEmailForm({ subject: "", body: "", discount_code: "" });
  }

  if (plan === null) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (plan !== "marketing") return <ProGate feature="Pazarlama Araçları" tier="marketing" />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pazarlama</h2>
        <p className="text-gray-500 mt-1">Kampanya planla, müşterilere e-posta gönder, indirim kodu üret.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: "kampanya", label: "Kampanyalar", icon: Megaphone },
          { key: "email", label: `E-posta (${emailCount} kişi)`, icon: Mail },
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

      {/* Kampanya Tab */}
      {tab === "kampanya" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{campaigns.length} kampanya</p>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Yeni Kampanya
            </button>
          </div>

          {/* Yeni kampanya formu */}
          {showForm && (
            <div className="bg-white border border-orange-200 rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Yeni Kampanya</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kampanya Adı *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Yaz sezonu indirimi"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Platform</label>
                  <select
                    value={form.platform}
                    onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                  >
                    <option value="">Seç</option>
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">İndirim %</label>
                  <input
                    type="number"
                    value={form.discount_pct}
                    onChange={(e) => setForm((p) => ({ ...p, discount_pct: e.target.value }))}
                    placeholder="20"
                    min={1} max={90}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Başlangıç</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Bitiş</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notlar</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    rows={2}
                    placeholder="Hangi ürünler, hedef, bütçe..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveCampaign}
                  disabled={saving || !form.title}
                  className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Kaydet
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  İptal
                </button>
              </div>
            </div>
          )}

          {/* Kampanya listesi */}
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
                        {c.discount_pct && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />%{c.discount_pct} indirim</span>}
                        {c.start_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{c.start_date}{c.end_date ? ` → ${c.end_date}` : ""}</span>}
                      </div>
                      {c.notes && <p className="text-xs text-gray-500">{c.notes}</p>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {c.status === "planned" && (
                        <button
                          onClick={() => updateStatus(c.id, "active")}
                          className="text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded-lg transition-colors"
                        >
                          Başlat
                        </button>
                      )}
                      {c.status === "active" && (
                        <button
                          onClick={() => updateStatus(c.id, "completed")}
                          className="text-xs text-gray-500 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
                        >
                          Tamamla
                        </button>
                      )}
                      <button
                        onClick={() => deleteCampaign(c.id)}
                        className="p-1.5 text-gray-300 hover:text-red-400 rounded-lg transition-colors"
                      >
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

      {/* E-posta Tab */}
      {tab === "email" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            Müşteri formundan toplanan <strong>{emailCount} e-posta</strong> adresine kampanya maili gönderebilirsin.
          </div>

          {emailCount === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
              <Mail className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">Henüz e-posta adresi toplanmadı</p>
              <p className="text-gray-400 text-xs mt-1">Müşteri formunu paylaştıkça e-posta listesi büyür.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Konu</label>
                <input
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="Özel kampanyamız sizin için!"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mesaj</label>
                <textarea
                  value={emailForm.body}
                  onChange={(e) => setEmailForm((p) => ({ ...p, body: e.target.value }))}
                  rows={5}
                  placeholder="Değerli müşterimiz,&#10;&#10;Bu hafta tüm ürünlerde %20 indirim fırsatı sunuyoruz..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 resize-none"
                />
              </div>

              {/* İndirim kodu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">İndirim Kodu <span className="text-gray-400 font-normal">(isteğe bağlı)</span></label>
                <div className="flex gap-2">
                  <input
                    value={emailForm.discount_code}
                    onChange={(e) => setEmailForm((p) => ({ ...p, discount_code: e.target.value.toUpperCase() }))}
                    placeholder="YAZI2026"
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 font-mono tracking-widest"
                  />
                  <button
                    onClick={() => {
                      const code = generateCode();
                      setGeneratedCode(code);
                      setEmailForm((p) => ({ ...p, discount_code: code }));
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-colors"
                  >
                    <Tag className="w-4 h-4" />
                    Oluştur
                  </button>
                </div>
                {generatedCode && (
                  <p className="text-xs text-green-600 mt-1">Kod oluşturuldu: <strong>{generatedCode}</strong></p>
                )}
              </div>

              {sendResult && (
                <div className={`flex items-center gap-2 rounded-xl p-3 text-sm ${sendResult.sent > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {sendResult.sent} kişiye gönderildi{sendResult.failed > 0 ? `, ${sendResult.failed} başarısız` : ""}.
                </div>
              )}

              <button
                onClick={sendEmail}
                disabled={sending || !emailForm.subject || !emailForm.body}
                className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? "Gönderiliyor..." : `${emailCount} Kişiye Gönder`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
