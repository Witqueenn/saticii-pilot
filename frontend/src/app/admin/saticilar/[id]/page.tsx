"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft, CheckCircle, XCircle, MessageSquare, Package,
  RotateCcw, Calendar, Image, Star, Mail, Plus, Minus, Loader2,
} from "lucide-react";
import Link from "next/link";

interface Seller {
  id: string;
  shop_name: string;
  email: string;
  plan: string;
  is_active: boolean;
  created_at: string;
  phone: string | null;
  image_tokens: number;
  notify_urgent_reviews: boolean;
  notify_weekly_report: boolean;
}

const planColor: Record<string, string> = {
  temel: "border-gray-300 bg-gray-50 text-gray-700",
  profesyonel: "border-orange-500 bg-orange-50 text-orange-700",
  marketing: "border-indigo-500 bg-indigo-50 text-indigo-700",
};

const planLabel: Record<string, string> = {
  temel: "Temel (Ücretsiz)",
  profesyonel: "Pro — ₺599/ay",
  marketing: "Marketing — ₺999/ay",
};

const planOptions = ["temel", "profesyonel", "marketing"];

export default function SellerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [stats, setStats] = useState({ reviews: 0, products: 0, returns: 0, formResponses: 0, customerProfiles: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [savingToken, setSavingToken] = useState(false);
  const [tokenSaved, setTokenSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: sellerData } = await supabase
        .from("sellers")
        .select("*")
        .eq("id", id)
        .single();

      if (!sellerData) { router.push("/admin/saticilar"); return; }
      setSeller(sellerData);

      const [
        { count: reviewCount },
        { count: productCount },
        { count: returnCount },
        { count: formCount },
        { data: formRows },
      ] = await Promise.all([
        supabase.from("reviews").select("*", { count: "exact", head: true }).eq("seller_id", id),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("seller_id", id),
        supabase.from("returns").select("*", { count: "exact", head: true }).eq("seller_id", id),
        supabase.from("form_responses").select("*", { count: "exact", head: true }).eq("seller_id", id),
        supabase.from("form_responses").select("email").eq("seller_id", id).not("email", "is", null),
      ]);

      const uniqueEmails = new Set((formRows ?? []).map((r: any) => r.email)).size;

      setStats({
        reviews: reviewCount ?? 0,
        products: productCount ?? 0,
        returns: returnCount ?? 0,
        formResponses: formCount ?? 0,
        customerProfiles: uniqueEmails,
      });
      setLoading(false);
    }
    load();
  }, [id, router]);

  async function toggleActive() {
    if (!seller) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("sellers").update({ is_active: !seller.is_active }).eq("id", seller.id);
    setSeller({ ...seller, is_active: !seller.is_active });
    setSaving(false);
  }

  async function changePlan(plan: string) {
    if (!seller) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("sellers").update({ plan }).eq("id", seller.id);
    setSeller({ ...seller, plan });
    setSaving(false);
  }

  async function setTokens(amount: number) {
    if (!seller || amount < 0) return;
    setSavingToken(true);
    const supabase = createClient();
    await supabase.from("sellers").update({ image_tokens: amount }).eq("id", seller.id);
    setSeller({ ...seller, image_tokens: amount });
    setTokenSaved(true);
    setSavingToken(false);
    setTimeout(() => setTokenSaved(false), 2000);
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Yükleniyor...</div>;
  if (!seller) return null;

  const statCards = [
    { label: "Yorum", value: stats.reviews, icon: MessageSquare, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Ürün", value: stats.products, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "İade", value: stats.returns, icon: RotateCcw, color: "text-red-600", bg: "bg-red-50" },
    { label: "Form Yanıtı", value: stats.formResponses, icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Müşteri Profili", value: stats.customerProfiles, icon: Mail, color: "text-green-600", bg: "bg-green-50" },
    { label: "Görsel Token", value: seller.image_tokens ?? 0, icon: Image, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  const currentTokens = seller.image_tokens ?? 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/admin/saticilar" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" />
        Satıcılara Dön
      </Link>

      {/* Profil */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {seller.shop_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{seller.shop_name}</h2>
              <p className="text-sm text-gray-500">{seller.email}</p>
              {seller.phone && <p className="text-xs text-gray-400 mt-0.5">{seller.phone}</p>}
              <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                {new Date(seller.created_at).toLocaleDateString("tr-TR")} tarihinde katıldı
              </div>
            </div>
          </div>
          <button
            onClick={toggleActive}
            disabled={saving}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            {seller.is_active
              ? <><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-green-600">Aktif</span></>
              : <><XCircle className="w-4 h-4 text-gray-400" /><span className="text-gray-400">Pasif</span></>}
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {statCards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className={`${c.bg} ${c.color} p-2.5 rounded-lg flex-shrink-0`}>
              <c.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              <p className="text-xs text-gray-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Plan */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Plan Değiştir</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {planOptions.map((p) => (
            <button
              key={p}
              onClick={() => changePlan(p)}
              disabled={saving}
              className={`py-3 px-4 rounded-xl text-sm font-medium border-2 transition-all text-left ${
                seller.plan === p ? planColor[p] : "border-gray-200 text-gray-400 hover:border-gray-300 bg-white"
              }`}
            >
              <p className="font-semibold">{p === "temel" ? "Temel" : p === "profesyonel" ? "Pro" : "Marketing"}</p>
              <p className="text-xs mt-0.5 opacity-70">{p === "temel" ? "Ücretsiz" : p === "profesyonel" ? "₺599/ay" : "₺999/ay"}</p>
            </button>
          ))}
        </div>
        {saving && <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Kaydediliyor...</p>}
      </div>

      {/* Görsel Token Yönetimi */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Görsel Token</h3>
            <p className="text-xs text-gray-400 mt-0.5">Her AI görseli 1 token tüketir</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-indigo-600">{currentTokens}</p>
            <p className="text-xs text-gray-400">mevcut token</p>
          </div>
        </div>

        {/* Hızlı ayar butonları */}
        <div className="flex gap-2 mb-3">
          {[10, 25, 50, 100].map((amount) => (
            <button
              key={amount}
              onClick={() => setTokens(currentTokens + amount)}
              disabled={savingToken}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              <Plus className="w-3 h-3" />
              {amount}
            </button>
          ))}
          <button
            onClick={() => setTokens(0)}
            disabled={savingToken || currentTokens === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 ml-auto"
          >
            <Minus className="w-3 h-3" />
            Sıfırla
          </button>
        </div>

        {/* Manuel giriş */}
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Manuel token miktarı..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
          />
          <button
            onClick={() => {
              const n = parseInt(tokenInput);
              if (!isNaN(n) && n >= 0) { setTokens(n); setTokenInput(""); }
            }}
            disabled={savingToken || !tokenInput}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {savingToken ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ayarla"}
          </button>
        </div>
        {tokenSaved && <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Token güncellendi</p>}
      </div>

      {/* Bildirim tercihleri (salt okunur) */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Bildirim Tercihleri</h3>
        <div className="space-y-2">
          {[
            { label: "Acil yorum bildirimi", value: seller.notify_urgent_reviews },
            { label: "Haftalık rapor", value: seller.notify_weekly_report },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.value ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {item.value ? "Açık" : "Kapalı"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
