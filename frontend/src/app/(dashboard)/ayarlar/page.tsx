"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle, User, CreditCard, Store, Bell, Phone } from "lucide-react";

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
  key: "notify_urgent_reviews" | "notify_weekly_report";
  label: string;
  desc: string;
}

const TOGGLES: Toggle[] = [
  { key: "notify_urgent_reviews", label: "Acil yorum bildirimi", desc: "Acil yorum geldiğinde e-posta al" },
  { key: "notify_weekly_report", label: "Haftalık rapor", desc: "Her pazartesi haftalık özet e-postası al" },
];

export default function AyarlarPage() {
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("temel");
  const [notifs, setNotifs] = useState({ notify_urgent_reviews: true, notify_weekly_report: true });
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
        .select("plan, notify_urgent_reviews, notify_weekly_report, phone")
        .eq("id", user.id)
        .single();

      if (seller) {
        setPlan(seller.plan ?? "temel");
        setPhone(seller.phone ?? "");
        setNotifs({
          notify_urgent_reviews: seller.notify_urgent_reviews ?? true,
          notify_weekly_report: seller.notify_weekly_report ?? true,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function saveShopName(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.auth.updateUser({ data: { shop_name: shopName } });
    await supabase.from("sellers").update({ shop_name: shopName }).eq("id", user.id);
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

  async function toggleNotif(key: "notify_urgent_reviews" | "notify_weekly_report", value: boolean) {
    setTogglingKey(key);
    setNotifs((p) => ({ ...p, [key]: value }));
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("sellers").update({ [key]: value }).eq("id", user.id);
    setTogglingKey(null);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl w-full">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ayarlar</h2>
        <p className="text-gray-500 mt-1">Hesap ve mağaza bilgilerini yönet</p>
      </div>

      {/* Mağaza bilgileri */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Store className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Mağaza Bilgileri</h3>
        </div>
        <form onSubmit={saveShopName} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mağaza Adı</label>
            <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50" />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-60 transition-colors">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            {saved && <span className="flex items-center gap-1.5 text-sm text-green-600"><CheckCircle className="w-4 h-4" /> Kaydedildi</span>}
          </div>
        </form>
      </div>

      {/* Hesap bilgileri */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Hesap Bilgileri</h3>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">E-posta</p>
            <p className="text-sm font-medium text-gray-900">{email}</p>
          </div>
          <p className="text-xs text-gray-400">E-posta adresini değiştirmek için destek ekibiyle iletişime geç.</p>
        </div>
      </div>

      {/* Telefon */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Phone className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Telefon</h3>
        </div>
        <form onSubmit={savePhone} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon Numarası</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="05xxxxxxxxx"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50" />
            <p className="text-xs text-gray-400 mt-1.5">SMS bildirimleri için kullanılır.</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={savingPhone}
              className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-60 transition-colors">
              {savingPhone && <Loader2 className="w-4 h-4 animate-spin" />}
              {savingPhone ? "Kaydediliyor..." : "Kaydet"}
            </button>
            {savedPhone && <span className="flex items-center gap-1.5 text-sm text-green-600"><CheckCircle className="w-4 h-4" /> Kaydedildi</span>}
          </div>
        </form>
      </div>

      {/* Bildirimler */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Bildirimler</h3>
        </div>
        <div className="space-y-5">
          {TOGGLES.map((t) => (
            <div key={t.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">{t.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
              </div>
              <button
                onClick={() => toggleNotif(t.key, !notifs[t.key])}
                disabled={togglingKey === t.key}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${notifs[t.key] ? "bg-orange-500" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${notifs[t.key] ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          ))}
          <p className="text-xs text-gray-400">Bildirimler <strong>{email}</strong> adresine gönderilir.</p>
        </div>
      </div>

      {/* Plan bilgisi */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <CreditCard className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Aktif Plan</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={`text-sm px-3 py-1 rounded-full font-semibold ${planColor[plan] ?? planColor.temel}`}>
              {planLabel[plan] ?? plan}
            </span>
            <span className="text-sm text-gray-500">planındasınız</span>
          </div>
          <ul className="space-y-2">
            {(planFeatures[plan] ?? planFeatures.temel).map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {plan !== "marketing" && (
            <a href="mailto:destek@saticipilot.com?subject=Plan Yükseltme" className="inline-block text-sm text-orange-600 font-medium hover:underline">
              Planı yükselt →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
