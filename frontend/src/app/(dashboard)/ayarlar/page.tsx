"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2, CheckCircle, CreditCard, Store, Bell, AlertTriangle,
  Mail, Phone, Gift, Copy, Users, Zap, UserCircle, Settings2,
} from "lucide-react";
import Link from "next/link";

const planLabel: Record<string, string> = {
  temel: "Temel", profesyonel: "Pro", marketing: "Marketing",
};
const planColor: Record<string, string> = {
  temel: "bg-gray-100 text-gray-700",
  profesyonel: "bg-orange-100 text-orange-700",
  marketing: "bg-indigo-100 text-indigo-700",
};
const planFeatures: Record<string, string[]> = {
  temel: ["Yorum merkezi (50/ay)", "İade takibi", "Ürün yönetimi", "Trendyol bağlantısı"],
  profesyonel: ["Sınırsız yorum", "AI yorum yanıtlama", "Rakip analizi", "Haftalık rapor", "Tüm pazaryerler"],
  marketing: ["Pro'nun her şeyi", "Kampanya planlayıcı", "E-posta & SMS", "API erişimi", "Dedike hesap yöneticisi"],
};

interface Toggle {
  key: "notify_urgent_reviews" | "notify_weekly_report" | "notify_new_returns" | "notify_low_stock" | "notify_daily_digest";
  label: string;
  desc: string;
}
const TOGGLES: Toggle[] = [
  { key: "notify_daily_digest", label: "Günlük özet", desc: "Her sabah 08:00'de günün özetini al (acil yorumlar, sorular, iadeler)" },
  { key: "notify_urgent_reviews", label: "Acil yorum bildirimi", desc: "1 yıldız yorum geldiğinde anında e-posta al" },
  { key: "notify_weekly_report", label: "Haftalık rapor", desc: "Her pazartesi haftalık özet e-postası al" },
  { key: "notify_new_returns", label: "Yeni iade bildirimi", desc: "Yeni iade talebi oluştuğunda e-posta al" },
  { key: "notify_low_stock", label: "Düşük stok uyarısı", desc: "Ürün stoğu kritik seviyeye düştüğünde bildirim al" },
];
type NotifState = Record<Toggle["key"], boolean>;

function getInitials(name: string, fallback: string) {
  const src = name || fallback;
  const parts = src.split(/[\s@]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

type Tab = "profil" | "bildirimler" | "plan" | "ekip";

export default function AyarlarPage() {
  const [tab, setTab] = useState<Tab>("profil");
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("temel");
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [notifs, setNotifs] = useState<NotifState>({
    notify_daily_digest: true,
    notify_urgent_reviews: true,
    notify_weekly_report: true,
    notify_new_returns: false,
    notify_low_stock: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [sendingReport, setSendingReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [sendingDigest, setSendingDigest] = useState(false);
  const [digestSent, setDigestSent] = useState(false);
  const [teamMembers, setTeamMembers] = useState<{ id: string; email: string; role: string; invited_at: string }[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"viewer" | "admin">("viewer");
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      setShopName(user.user_metadata?.shop_name ?? "");
      const { data: seller } = await supabase
        .from("sellers")
        .select("plan, notify_daily_digest, notify_urgent_reviews, notify_weekly_report, notify_new_returns, notify_low_stock, phone, referral_code, referral_count")
        .eq("id", user.id).single();
      if (seller) {
        setPlan(seller.plan ?? "temel");
        setPhone(seller.phone ?? "");
        setNotifs({
          notify_daily_digest: seller.notify_daily_digest ?? true,
          notify_urgent_reviews: seller.notify_urgent_reviews ?? true,
          notify_weekly_report: seller.notify_weekly_report ?? true,
          notify_new_returns: seller.notify_new_returns ?? false,
          notify_low_stock: seller.notify_low_stock ?? false,
        });
        setReferralCount(seller.referral_count ?? 0);
        if (seller.referral_code) {
          setReferralCode(seller.referral_code);
        } else {
          const code = "SP" + Math.random().toString(36).toUpperCase().slice(2, 8);
          await supabase.from("sellers").update({ referral_code: code }).eq("id", user.id);
          setReferralCode(code);
        }
      }
      const { data: team } = await supabase.from("team_members").select("id, email, role, invited_at").eq("seller_id", user.id).order("invited_at");
      setTeamMembers(team ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.auth.updateUser({ data: { shop_name: shopName } });
    await supabase.from("sellers").update({ shop_name: shopName, phone }).eq("id", user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function toggleNotif(key: Toggle["key"], value: boolean) {
    setTogglingKey(key);
    setNotifs((p) => ({ ...p, [key]: value }));
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("sellers").update({ [key]: value }).eq("id", user.id);
    setTogglingKey(null);
  }

  async function sendReportNow() {
    setSendingReport(true);
    try {
      await fetch("/api/weekly-report", { method: "POST" });
      setReportSent(true);
      setTimeout(() => setReportSent(false), 5000);
    } finally {
      setSendingReport(false);
    }
  }

  async function sendDigestNow() {
    setSendingDigest(true);
    try {
      await fetch("/api/daily-digest", { method: "POST" });
      setDigestSent(true);
      setTimeout(() => setDigestSent(false), 5000);
    } finally {
      setSendingDigest(false);
    }
  }

  function copyReferral() {
    navigator.clipboard.writeText(`https://saticipilot.com/beta?ref=${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function inviteMember() {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) return;
    setInviting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from("team_members").insert({
        seller_id: user.id, email: inviteEmail.trim().toLowerCase(), role: inviteRole,
      }).select().single();
      if (!error && data) { setTeamMembers((p) => [...p, data]); setInviteEmail(""); }
    } finally { setInviting(false); }
  }

  async function removeMember(id: string) {
    setRemovingId(id);
    const supabase = createClient();
    await supabase.from("team_members").delete().eq("id", id);
    setTeamMembers((p) => p.filter((m) => m.id !== id));
    setRemovingId(null);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>;
  }

  const initials = getInitials(shopName, email);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profil", label: "Profil", icon: UserCircle },
    { id: "bildirimler", label: "Bildirimler", icon: Bell },
    { id: "plan", label: "Plan & Fatura", icon: CreditCard },
    { id: "ekip", label: "Ekip", icon: Users },
  ];

  return (
    <div className="space-y-6 max-w-2xl w-full">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ayarlar</h2>
        <p className="text-gray-500 mt-1 text-sm">Hesap bilgileri, bildirim tercihleri ve plan yönetimi.</p>
      </div>

      {/* Profile header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{shopName || "Mağaza adı belirlenmemiş"}</p>
          <p className="text-sm text-gray-500 truncate">{email}</p>
          <span className={`mt-1 inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${planColor[plan] ?? planColor.temel}`}>
            {planLabel[plan] ?? plan} Plan
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              tab === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Profil */}
      {tab === "profil" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Mağaza & İletişim</h3>
          </div>
          <p className="text-xs text-gray-400 mb-5">Bu bilgiler müşterilere gönderilen otomatik cevaplarda kullanılır.</p>
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mağaza Adı</label>
              <input
                type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} required
                placeholder="Örn: Ayşe Tekstil"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> E-posta</span>
              </label>
              <input type="email" value={email} disabled
                className="w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Değişiklik için destek@saticipilot.com ile iletişime geç.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Telefon</span>
              </label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xxxxxxxxx"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-60 transition-colors"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </button>
              {saved && <span className="flex items-center gap-1.5 text-sm text-green-600"><CheckCircle className="w-4 h-4" /> Kaydedildi</span>}
            </div>
          </form>
        </div>
      )}

      {/* Tab: Bildirimler */}
      {tab === "bildirimler" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Bildirim Tercihleri</h3>
          </div>
          <p className="text-xs text-gray-400 mb-5">
            Bildirimler <strong className="text-gray-600">{email}</strong> adresine gönderilir.
          </p>
          <div className="space-y-5">
            {TOGGLES.map((t) => (
              <div key={t.key}>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{t.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleNotif(t.key, !notifs[t.key])}
                    disabled={togglingKey === t.key}
                    className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 ${notifs[t.key] ? "bg-orange-500" : "bg-gray-200"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${notifs[t.key] ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
                {t.key === "notify_daily_digest" && (
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={sendDigestNow}
                      disabled={sendingDigest}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-colors"
                    >
                      {sendingDigest ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3" />}
                      {sendingDigest ? "Gönderiliyor…" : "Şimdi Gönder"}
                    </button>
                    {digestSent && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" /> Özet gönderildi
                      </span>
                    )}
                  </div>
                )}
                {t.key === "notify_weekly_report" && (
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={sendReportNow}
                      disabled={sendingReport}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-colors"
                    >
                      {sendingReport ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3" />}
                      {sendingReport ? "Gönderiliyor…" : "Şimdi Gönder"}
                    </button>
                    {reportSent && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" /> Rapor gönderildi
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Plan & Fatura */}
      {tab === "plan" && (
        <div className="space-y-4">
          {/* Mevcut plan */}
          <div className={`rounded-xl p-6 ${plan === "temel" ? "bg-gray-900" : "bg-gradient-to-br from-orange-500 to-orange-600"}`}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-medium text-white/60 uppercase tracking-wide mb-1">Mevcut planın</p>
                <h3 className="text-2xl font-black text-white">{planLabel[plan] ?? plan}</h3>
                {plan === "temel" && (
                  <p className="text-sm text-white/60 mt-0.5">Sonsuza kadar ücretsiz</p>
                )}
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${planColor[plan] ?? planColor.temel}`}>
                {planLabel[plan] ?? plan}
              </span>
            </div>
            <ul className="space-y-2 mb-4">
              {(planFeatures[plan] ?? planFeatures.temel).map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                  <CheckCircle className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {plan !== "marketing" && (
              <Link
                href="/fiyatlar"
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-orange-500" />
                Planı Yükselt
              </Link>
            )}
          </div>

          {/* Fatura */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Faturalandırma</h3>
            <div className="space-y-3">
              {[
                { label: "Ödeme yöntemi", desc: "Henüz kart eklenmedi · deneme süresi sonunda gerekecek", cta: "Kart Ekle" },
                { label: "Fatura adresi", desc: "Türkiye · KOBİ / Şahıs", cta: "Düzenle" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{row.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{row.desc}</p>
                  </div>
                  <a
                    href="mailto:destek@saticipilot.com"
                    className="flex-shrink-0 px-3 py-1.5 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {row.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Referral */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-4 h-4 text-orange-500" />
              <h3 className="font-semibold text-gray-900">Arkadaşını Davet Et</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Davet ettiğin her satıcı Pro plana geçtiğinde <strong className="text-orange-600">1 ay ücretsiz Pro</strong> kazanırsın.
            </p>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-mono text-sm text-gray-700 truncate select-all">
                saticipilot.com/beta?ref={referralCode}
              </div>
              <button
                onClick={copyReferral}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium flex-shrink-0 transition-colors ${copied ? "bg-green-500 text-white" : "bg-orange-500 text-white hover:bg-orange-600"}`}
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Kopyalandı" : "Kopyala"}
              </button>
            </div>
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5">
              <Users className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <p className="text-sm text-orange-700">
                Şu ana kadar <strong>{referralCount}</strong> kişiyi davet ettin.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Ekip */}
      {tab === "ekip" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Ekip Üyeleri</h3>
          </div>
          <p className="text-xs text-gray-400 mb-5">Mağazana erişimi olan kişileri yönet.</p>

          {/* Davet formu */}
          <div className="flex items-center gap-2 mb-5">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && inviteMember()}
              placeholder="ekip@ornek.com"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "viewer" | "admin")}
              className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none"
            >
              <option value="viewer">Görüntüleyici</option>
              <option value="admin">Yönetici</option>
            </select>
            <button
              onClick={inviteMember}
              disabled={inviting || !inviteEmail.includes("@")}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              Davet Et
            </button>
          </div>

          {/* Üye listesi */}
          {teamMembers.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">Henüz ekip üyesi yok. Yukarıdan davet gönder.</div>
          ) : (
            <div className="space-y-2">
              {teamMembers.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-orange-600">{m.email.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{m.email}</p>
                      <p className="text-xs text-gray-400">{new Date(m.invited_at).toLocaleDateString("tr-TR")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${m.role === "admin" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                      {m.role === "admin" ? "Yönetici" : "Görüntüleyici"}
                    </span>
                    <button
                      onClick={() => removeMember(m.id)}
                      disabled={removingId === m.id}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      {removingId === m.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Settings2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h3 className="font-semibold text-red-700">Tehlike Bölgesi</h3>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-800">Hesabı sil</p>
            <p className="text-xs text-gray-400 mt-0.5">Tüm veriler kalıcı olarak silinir, geri alınamaz.</p>
          </div>
          <a
            href="mailto:destek@saticipilot.com?subject=Hesap Silme Talebi"
            className="flex-shrink-0 px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
          >
            Talep gönder
          </a>
        </div>
      </div>
    </div>
  );
}
