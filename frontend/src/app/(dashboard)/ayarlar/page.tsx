"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle, CreditCard, Store, Bell, AlertTriangle, Mail, Phone, Globe } from "lucide-react";

const planLabel: Record<string, string> = {
  temel: "Temel",
  profesyonel: "Pro",
  marketing: "Marketing",
};

const planColor: Record<string, string> = {
  temel: "bg-gray-100 text-gray-700",
  profesyonel: "bg-orange-100 text-orange-700",
  marketing: "bg-indigo-100 text-indigo-700",
};

const planFeatures: Record<string, string[]> = {
  temel: ["Yorum merkezi", "İade takibi", "Ürün yönetimi", "Pazaryeri bağlantısı"],
  profesyonel: ["Temel + Rakip Analizi", "Müşteri Takibi & QR Form", "AI Yorum Yanıtlama", "Haftalık E-posta Raporu"],
  marketing: ["Pro planın her şeyi", "Kampanya Planlayıcı", "E-posta & SMS Kampanyası", "Otomasyon & AI İçerik"],
};

interface Toggle {
  key: "notify_urgent_reviews" | "notify_weekly_report" | "notify_new_returns" | "notify_low_stock";
  label: string;
  desc: string;
}

const TOGGLES: Toggle[] = [
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

export default function AyarlarPage() {
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("temel");
  const [notifs, setNotifs] = useState<NotifState>({
    notify_urgent_reviews: true,
    notify_weekly_report: true,
    notify_new_returns: false,
    notify_low_stock: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [savedPhone, setSavedPhone] = useState(false);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email ?? "");
      setShopName(user.user_metadata?.shop_name ?? "");

      const { data: seller } = await supabase
        .from("sellers")
        .select("plan, notify_urgent_reviews, notify_weekly_report, notify_new_returns, notify_low_stock, phone")
        .eq("id", user.id)
        .single();

      if (seller) {
        setPlan(seller.plan ?? "temel");
        setPhone(seller.phone ?? "");
        setNotifs({
          notify_urgent_reviews: seller.notify_urgent_reviews ?? true,
          notify_weekly_report: seller.notify_weekly_report ?? true,
          notify_new_returns: seller.notify_new_returns ?? false,
          notify_low_stock: seller.notify_low_stock ?? false,
        });
      }
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

  async function savePhone(e: React.FormEvent) {
    e.preventDefault();
    setSavingPhone(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("sellers").update({ phone }).eq("id", user.id);
    setSavingPhone(false);
    setSavedPhone(true);
    setTimeout(() => setSavedPhone(false), 3000);
  }

  async function toggleNotif(key: Toggle["key"], value: boolean) {
    setTogglingKey(key);
    setNotifs((p) => ({ ...p, [key]: value }));
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("sellers").update({ [key]: value }).eq("id", user.id);
    setTogglingKey(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  const initials = getInitials(shopName, email);

  return (
    <div className="space-y-6 max-w-2xl w-full">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ayarlar</h2>
        <p className="text-gray-500 mt-1 text-sm">Hesap ve mağaza bilgilerini yönet</p>
      </div>

      {/* Profile header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
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

      {/* Mağaza + iletişim bilgileri */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Store className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Mağaza & İletişim</h3>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mağaza Adı</label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Örn: Ayşe Tekstil"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> E-posta</span>
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">E-posta değişikliği için destek@saticipilot.com ile iletişime geç.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Telefon</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xxxxxxxxx"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
            />
            <p className="text-xs text-gray-400 mt-1">SMS bildirimleri için kullanılır.</p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-60 transition-colors"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" /> Kaydedildi
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Bildirimler */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Bildirimler</h3>
        </div>
        <p className="text-xs text-gray-400 mb-5">Bildirimler <strong className="text-gray-600">{email}</strong> adresine gönderilir.</p>
        <div className="space-y-5">
          {TOGGLES.map((t) => (
            <div key={t.key} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">{t.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
              </div>
              <button
                onClick={() => toggleNotif(t.key, !notifs[t.key])}
                disabled={togglingKey === t.key}
                className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 ${notifs[t.key] ? "bg-orange-500" : "bg-gray-200"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${notifs[t.key] ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Plan bilgisi */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Aktif Plan</h3>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${planColor[plan] ?? planColor.temel}`}>
            {planLabel[plan] ?? plan}
          </span>
        </div>
        <ul className="space-y-2 mb-4">
          {(planFeatures[plan] ?? planFeatures.temel).map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        {plan !== "marketing" && (
          <a
            href="mailto:destek@saticipilot.com?subject=Plan Yükseltme"
            className="inline-flex items-center gap-1.5 text-sm text-orange-600 font-medium hover:text-orange-700 transition-colors"
          >
            Planı yükselt <Globe className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Tehlike bölgesi */}
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
