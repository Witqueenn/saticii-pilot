"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle, User, CreditCard, Store, Bell } from "lucide-react";

const planLabel: Record<string, string> = {
  temel: "Temel",
  profesyonel: "Profesyonel",
  kurumsal: "Kurumsal",
};

const planColor: Record<string, string> = {
  temel: "bg-gray-100 text-gray-700",
  profesyonel: "bg-orange-100 text-orange-700",
  kurumsal: "bg-purple-100 text-purple-700",
};

const planFeatures: Record<string, string[]> = {
  temel: ["1 mağaza", "Yorum merkezi", "İade takibi", "Günlük özet"],
  profesyonel: ["3 mağazaya kadar", "AI cevap taslakları", "Ürün optimizasyonu", "Öncelikli destek"],
  kurumsal: ["Sınırsız mağaza", "Tüm AI özellikler", "Özel raporlar", "7/24 destek"],
};

export default function AyarlarPage() {
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("temel");
  const [notifyUrgentReviews, setNotifyUrgentReviews] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email ?? "");
      setShopName(user.user_metadata?.shop_name ?? "");

      const { data: seller } = await supabase
        .from("sellers")
        .select("plan, notify_urgent_reviews")
        .eq("id", user.id)
        .single();

      if (seller) {
        setPlan(seller.plan);
        setNotifyUrgentReviews(seller.notify_urgent_reviews ?? true);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function toggleNotification(value: boolean) {
    setSavingNotif(true);
    setNotifyUrgentReviews(value);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("sellers").update({ notify_urgent_reviews: value }).eq("id", user.id);
    }
    setSavingNotif(false);
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
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
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-60 transition-colors"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" /> Kaydedildi
              </span>
            )}
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

      {/* Bildirimler */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Bildirimler</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Acil yorum bildirimi</p>
              <p className="text-xs text-gray-400 mt-0.5">Acil yorum geldiğinde e-posta al</p>
            </div>
            <button
              onClick={() => toggleNotification(!notifyUrgentReviews)}
              disabled={savingNotif}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                notifyUrgentReviews ? "bg-orange-500" : "bg-gray-200"
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                notifyUrgentReviews ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Bildirimler {email} adresine gönderilir.
          </p>
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
            <span className={`text-sm px-3 py-1 rounded-full font-semibold ${planColor[plan]}`}>
              {planLabel[plan]}
            </span>
            <span className="text-sm text-gray-500">planındasınız</span>
          </div>
          <ul className="space-y-2">
            {planFeatures[plan].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <a
            href="/#fiyatlandirma"
            className="inline-block text-sm text-orange-600 font-medium hover:underline"
          >
            Planı yükselt →
          </a>
        </div>
      </div>
    </div>
  );
}
