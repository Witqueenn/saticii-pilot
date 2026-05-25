"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle, ExternalLink, ChevronDown, ChevronUp,
  Trash2, Loader2, MessageSquare, Clock,
  RotateCcw, Package, Star, TrendingUp, ShoppingBag, Globe,
  Wifi, WifiOff, RefreshCw, AlertCircle,
} from "lucide-react";

interface Field { key: string; label: string; placeholder: string; }
interface Platform {
  id: string;
  name: string;
  initials: string;
  color: string;
  description: string;
  features: { icon: React.ElementType; text: string }[];
  fields?: Field[];
  guide?: string;
  guideLabel?: string;
  comingSoon?: boolean;
}

const PLATFORMS: { title: string; items: Platform[] }[] = [
  {
    title: "Pazaryerleri",
    items: [
      {
        id: "trendyol",
        name: "Trendyol",
        initials: "TY",
        color: "bg-orange-100 text-orange-700",
        description: "Türkiye'nin 1 numaralı pazaryeri.",
        features: [
          { icon: MessageSquare, text: "Yorum analizi & AI yanıt taslağı" },
          { icon: RotateCcw,     text: "İade kalıp tespiti & sebep sınıflandırma" },
          { icon: Package,       text: "Ürün açıklama & SEO puanlama" },
          { icon: Star,          text: "Satıcı puanı & kargo skoru takibi" },
        ],
        fields: [
          { key: "api_key",     label: "API Key",     placeholder: "Trendyol API Key" },
          { key: "api_secret",  label: "API Secret",  placeholder: "Trendyol API Secret" },
          { key: "supplier_id", label: "Supplier ID", placeholder: "Mağaza ID" },
        ],
        guide: "https://partner.trendyol.com",
        guideLabel: "Trendyol Partner Panel",
      },
      {
        id: "hepsiburada",
        name: "Hepsiburada",
        initials: "HB",
        color: "bg-blue-100 text-blue-700",
        description: "Türkiye'nin köklü e-ticaret platformu.",
        features: [
          { icon: MessageSquare, text: "Ürün soruları yönetimi (HB'ye özel Q&A)" },
          { icon: Star,          text: "Değerlendirme analizi & satıcı puanı" },
          { icon: RotateCcw,     text: "İade talep yönetimi & HB politika uyumu" },
          { icon: TrendingUp,    text: "Kampanya & flash sale performansı" },
        ],
        fields: [
          { key: "api_key",    label: "Kullanıcı Adı", placeholder: "Hepsiburada kullanıcı adı" },
          { key: "api_secret", label: "Şifre",         placeholder: "Hepsiburada şifresi" },
        ],
        guide: "https://merchant.hepsiburada.com",
        guideLabel: "Hepsiburada Merchant Panel",
      },
      {
        id: "n11",
        name: "N11",
        initials: "N11",
        color: "bg-purple-100 text-purple-700",
        description: "Doğuş Grubu'nun pazaryeri.",
        features: [
          { icon: MessageSquare, text: "Mağaza & ürün değerlendirme analizi" },
          { icon: Package,       text: "Kategori bazlı ürün optimizasyonu" },
          { icon: RotateCcw,     text: "14 günlük iade politikası takibi" },
          { icon: Star,          text: "Mağaza puanı & kargo performansı" },
        ],
        fields: [
          { key: "api_key",    label: "API Key",    placeholder: "N11 API Key" },
          { key: "api_secret", label: "API Secret", placeholder: "N11 API Secret" },
        ],
        guide: "https://www.n11.com/magaza",
        guideLabel: "N11 Mağaza Paneli",
      },
      {
        id: "amazon_tr",
        name: "Amazon TR",
        initials: "AMZ",
        color: "bg-yellow-100 text-yellow-700",
        description: "Amazon Türkiye — A9 algoritması ve küresel satış.",
        features: [
          { icon: Star,          text: "Seller Central entegrasyonu" },
          { icon: Package,       text: "A9 algoritması için listing optimizasyonu" },
          { icon: MessageSquare, text: "Review & Q&A yönetimi" },
          { icon: TrendingUp,    text: "Buy Box takibi & rekabet analizi" },
        ],
        guide: "https://sellercentral.amazon.com.tr",
        guideLabel: "Amazon Seller Central",
        comingSoon: true,
      },
      {
        id: "pazarama",
        name: "Pazarama",
        initials: "PZ",
        color: "bg-red-100 text-red-700",
        description: "Türkiye'nin hızlı büyüyen pazaryeri.",
        features: [
          { icon: MessageSquare, text: "Ürün değerlendirme & yorum analizi" },
          { icon: RotateCcw,     text: "İade takibi & sebep analizi" },
          { icon: Package,       text: "Ürün listing optimizasyonu" },
          { icon: Star,          text: "Mağaza puanı & performans takibi" },
        ],
        comingSoon: true,
      },
      {
        id: "etsy",
        name: "Etsy",
        initials: "ET",
        color: "bg-orange-100 text-orange-800",
        description: "Küresel el yapımı & özgün ürün pazaryeri.",
        features: [
          { icon: MessageSquare, text: "Müşteri review & mesaj yönetimi" },
          { icon: RotateCcw,     text: "İade & dispute takibi" },
          { icon: Package,       text: "Listing SEO optimizasyonu (Etsy arama)" },
          { icon: TrendingUp,    text: "Shop stats & en çok satan ürün analizi" },
        ],
        comingSoon: true,
      },
    ],
  },
  {
    title: "Web Siteleri",
    items: [
      {
        id: "woocommerce",
        name: "WooCommerce",
        initials: "WC",
        color: "bg-indigo-100 text-indigo-700",
        description: "WordPress tabanlı e-ticaret — pazaryeriyle birleşik yönetim.",
        features: [
          { icon: ShoppingBag,   text: "Sipariş & stok senkronizasyonu" },
          { icon: MessageSquare, text: "Yorum yönetimi" },
          { icon: Package,       text: "Ürün katalog senkronizasyonu (Trendyol ↔ WC)" },
          { icon: TrendingUp,    text: "Çok kanallı satış performans karşılaştırması" },
        ],
        comingSoon: true,
      },
      {
        id: "shopify",
        name: "Shopify",
        initials: "SH",
        color: "bg-green-100 text-green-700",
        description: "Global e-ticaret platformu — Shopify + Trendyol birleşik yönetim.",
        features: [
          { icon: ShoppingBag,   text: "Sipariş & müşteri verisi entegrasyonu" },
          { icon: Package,       text: "Ürün katalog senkronizasyonu (Trendyol ↔ Shopify)" },
          { icon: RotateCcw,     text: "İade akışı karşılaştırması" },
          { icon: TrendingUp,    text: "Kanal bazlı gelir & büyüme analizi" },
        ],
        comingSoon: true,
      },
      {
        id: "custom_website",
        name: "Özel Web Sitesi",
        initials: "WEB",
        color: "bg-gray-100 text-gray-700",
        description: "WordPress, Wix, özel kodlu site — herhangi bir altyapı.",
        features: [
          { icon: Globe,         text: "Webhook ile sipariş & yorum bildirimi" },
          { icon: Package,       text: "Ürün kataloğu senkronizasyonu" },
          { icon: RotateCcw,     text: "İade talepleri takibi" },
          { icon: TrendingUp,    text: "Pazaryeri vs web sitesi satış karşılaştırması" },
        ],
        comingSoon: true,
      },
    ],
  },
  {
    title: "Sosyal Medya",
    items: [
      {
        id: "instagram",
        name: "Instagram",
        initials: "IG",
        color: "bg-pink-100 text-pink-700",
        description: "Instagram Business — sosyal satış + pazaryeri birlikte.",
        features: [
          { icon: MessageSquare, text: "Marka mention & yorum takibi" },
          { icon: Star,          text: "Ürün etiket satış performansı" },
          { icon: TrendingUp,    text: "Instagram → Trendyol dönüşüm analizi" },
          { icon: Package,       text: "DM'den gelen sipariş talepleri yönetimi" },
        ],
        comingSoon: true,
      },
    ],
  },
];

function formatSyncTime(iso: string | null): string {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} sa önce`;
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

interface Credential { id: string; marketplace: string; }

export default function BaglantiPage() {
  const [connected, setConnected] = useState<Credential[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { ok: boolean; message: string } | null>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ products: number; orders: number; reviews: number; questions: number; errors: string[] } | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [{ data: creds }, { data: ints }, { data: seller }] = await Promise.all([
        supabase.from("marketplace_credentials").select("id, marketplace").eq("seller_id", user.id),
        supabase.from("platform_interests").select("platform").eq("seller_id", user.id),
        supabase.from("sellers").select("last_synced_at").eq("id", user.id).single(),
      ]);
      if (seller?.last_synced_at) setLastSyncedAt(seller.last_synced_at);
      setConnected(creds ?? []);
      setInterests((ints ?? []).map((r: { platform: string }) => r.platform));
    }
    load();
  }, []);

  function setValue(platform: string, field: string, value: string) {
    setValues((prev) => ({ ...prev, [platform]: { ...(prev[platform] ?? {}), [field]: value } }));
  }

  function isConnected(platformId: string) {
    return connected.some((c) => c.marketplace === platformId);
  }

  async function handleSave(platformId: string) {
    if (!userId) return;
    setSaving(platformId);
    const vals = values[platformId] ?? {};
    const res = await fetch("/api/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        marketplace: platformId,
        api_key: vals.api_key ?? "",
        api_secret: vals.api_secret ?? "",
        supplier_id: vals.supplier_id ?? null,
        store_url: vals.store_url ?? null,
      }),
    });
    if (!res.ok) {
      console.error("Credential save failed:", await res.text());
      setSaving(null);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase.from("marketplace_credentials").select("id, marketplace").eq("seller_id", userId);
    setConnected(data ?? []);
    setSaving(null);
    setOpen(null);
    setValues((prev) => ({ ...prev, [platformId]: {} }));
  }

  async function handleDelete(platformId: string) {
    if (!userId) return;
    setDeleting(platformId);
    await fetch("/api/credentials", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marketplace: platformId }),
    });
    setConnected((prev) => prev.filter((c) => c.marketplace !== platformId));
    setDeleting(null);
  }

  async function handleTest(platformId: string) {
    setTesting(platformId);
    setTestResult((prev) => ({ ...prev, [platformId]: null }));
    try {
      const res = await fetch(`/api/${platformId}/test`, { method: "POST" });
      const data = await res.json();
      setTestResult((prev) => ({ ...prev, [platformId]: { ok: !!data.ok, message: data.message || data.error || "" } }));
    } catch {
      setTestResult((prev) => ({ ...prev, [platformId]: { ok: false, message: "Bağlantı hatası" } }));
    }
    setTesting(null);
  }

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/trendyol/sync", { method: "POST" });
      const data = await res.json();
      setSyncResult({ products: data.products ?? 0, orders: data.orders ?? 0, reviews: data.reviews ?? 0, questions: data.questions ?? 0, errors: data.errors ?? [] });
      if (data.syncedAt) setLastSyncedAt(data.syncedAt);
    } catch {
      setSyncResult({ products: 0, orders: 0, reviews: 0, questions: 0, errors: ["Ağ hatası, tekrar deneyin"] });
    } finally {
      setSyncing(false);
    }
  }

  async function handleInterest(platformId: string) {
    if (!userId) return;
    setSaving(platformId);
    const supabase = createClient();
    await supabase.from("platform_interests").upsert(
      { seller_id: userId, platform: platformId },
      { onConflict: "seller_id,platform" }
    );
    setInterests((prev) => [...prev, platformId]);
    setSaving(null);
  }

  const totalConnected = connected.length;

  return (
    <div className="space-y-8 max-w-2xl w-full">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bağlantılar</h2>
        <p className="text-gray-500 mt-1">
          {totalConnected > 0 ? `${totalConnected} platform bağlı` : "Henüz bağlı platform yok"}
        </p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
        API bilgilerin şifreli olarak saklanır ve yalnızca veri çekme amacıyla kullanılır. Sipariş işlemi yapılmaz.
      </div>

      {PLATFORMS.map((section) => (
        <div key={section.title} className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
            {section.title}
          </h3>

          {section.items.map((p) => {
            const conn = isConnected(p.id);
            const interested = interests.includes(p.id);
            return (
              <div
                key={p.id}
                className={`bg-white rounded-xl border overflow-hidden transition-colors ${
                  conn ? "border-green-300" : p.comingSoon ? "border-gray-100" : "border-gray-200"
                }`}
              >
                <button
                  onClick={() => setOpen(open === p.id ? null : p.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${p.color} ${p.comingSoon ? "opacity-60" : ""}`}>
                      {p.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${p.comingSoon ? "text-gray-400" : "text-gray-900"}`}>{p.name}</span>
                        {conn && (
                          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Bağlı
                          </span>
                        )}
                        {p.comingSoon && !conn && (
                          <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> Yakında
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {conn && p.id === "trendyol" && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleTest(p.id); }}
                          disabled={testing === p.id}
                          title={testResult[p.id]?.message || "Bağlantıyı test et"}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors text-gray-500 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                        >
                          {testing === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                           testResult[p.id]?.ok === true ? <Wifi className="w-3.5 h-3.5 text-green-500" /> :
                           testResult[p.id]?.ok === false ? <WifiOff className="w-3.5 h-3.5 text-red-500" /> :
                           <Wifi className="w-3.5 h-3.5" />}
                          Test
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSync(); }}
                          disabled={syncing}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-60 font-medium"
                        >
                          {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                          {syncing ? "Senkronize…" : "Senkronize Et"}
                        </button>
                      </div>
                    )}
                    {conn && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                        disabled={deleting === p.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        {deleting === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    )}
                    {open === p.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {p.id === "trendyol" && conn && (syncResult || lastSyncedAt) && (
                  <div className={`px-5 py-2.5 border-t text-xs flex items-start gap-2.5 flex-wrap ${
                    syncResult?.errors?.length
                      ? "bg-amber-50 border-amber-100"
                      : syncResult
                      ? "bg-green-50 border-green-100"
                      : "bg-gray-50 border-gray-100"
                  }`}>
                    {syncResult ? (
                      <>
                        {syncResult.errors.length === 0
                          ? <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-green-600" />
                          : <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
                        }
                        <div className="flex-1">
                          <span className={`font-medium ${syncResult.errors.length ? "text-amber-700" : "text-green-700"}`}>
                            {syncResult.products} ürün · {syncResult.orders} sipariş · {syncResult.reviews} yorum · {syncResult.questions} soru
                          </span>
                          {syncResult.errors.length > 0 && (
                            <div className="mt-0.5 space-y-0.5 text-amber-600">
                              {syncResult.errors.map((e, i) => <div key={i}>{e}</div>)}
                            </div>
                          )}
                        </div>
                        {lastSyncedAt && (
                          <span className="text-gray-400 ml-auto">{formatSyncTime(lastSyncedAt)}</span>
                        )}
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
                        <span className="text-gray-500">Son senkron: {formatSyncTime(lastSyncedAt)}</span>
                      </>
                    )}
                  </div>
                )}

                {open !== p.id && (
                  <div className={`px-5 pb-3 grid grid-cols-2 gap-1.5 ${p.comingSoon ? "opacity-50" : ""}`}>
                    {p.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                        <f.icon className="w-3.5 h-3.5 flex-shrink-0 text-orange-400" />
                        {f.text}
                      </div>
                    ))}
                  </div>
                )}

                {open === p.id && p.comingSoon && (
                  <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                      {p.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                          <f.icon className="w-3.5 h-3.5 flex-shrink-0 text-orange-400" />
                          {f.text}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      Bu entegrasyon geliştirme aşamasındadır. İlgilendiğini belirtirsen öncelik sırasına ekliyoruz ve hazır olunca seni bilgilendiriyoruz.
                    </p>
                    {interested ? (
                      <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                        <CheckCircle className="w-4 h-4" /> Erken erişim isteğin kaydedildi
                      </div>
                    ) : (
                      <button
                        onClick={() => handleInterest(p.id)}
                        disabled={saving === p.id}
                        className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-60 transition-colors"
                      >
                        {saving === p.id && <Loader2 className="w-4 h-4 animate-spin" />}
                        Erken Erişim İste
                      </button>
                    )}
                    {p.guide && (
                      <a href={p.guide} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline">
                        <ExternalLink className="w-3 h-3" />
                        {p.guideLabel}
                      </a>
                    )}
                  </div>
                )}

                {open === p.id && !p.comingSoon && (
                  <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                    {p.guide && (
                      <a href={p.guide} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                        <ExternalLink className="w-3 h-3" />
                        {p.guideLabel}&apos;nden bilgileri al
                      </a>
                    )}
                    {p.fields?.map((f) => (
                      <div key={f.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                        <input
                          type={f.key.includes("secret") || f.key.includes("password") || f.key.includes("token") ? "password" : "text"}
                          placeholder={f.placeholder}
                          value={values[p.id]?.[f.key] ?? ""}
                          onChange={(e) => setValue(p.id, f.key, e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => handleSave(p.id)}
                      disabled={saving === p.id}
                      className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-60 transition-colors"
                    >
                      {saving === p.id && <Loader2 className="w-4 h-4 animate-spin" />}
                      {saving === p.id ? "Kaydediliyor..." : conn ? "Güncelle" : "Bağla"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-center">
        <p className="text-sm text-gray-500">Başka bir platform mu kullanıyorsun?</p>
        <a href="mailto:destek@saticipilot.com" className="text-sm text-orange-600 font-medium hover:underline mt-1 inline-block">
          Entegrasyon talep et →
        </a>
      </div>
    </div>
  );
}
