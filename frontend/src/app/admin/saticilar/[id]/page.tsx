"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, Package, RotateCcw, Calendar } from "lucide-react";
import Link from "next/link";

interface Seller {
  id: string;
  shop_name: string;
  email: string;
  plan: string;
  is_active: boolean;
  created_at: string;
}

const planColor: Record<string, string> = {
  temel: "bg-gray-100 text-gray-600",
  profesyonel: "bg-orange-100 text-orange-700",
  kurumsal: "bg-purple-100 text-purple-700",
};

const planLabel: Record<string, string> = {
  temel: "Temel",
  profesyonel: "Profesyonel",
  kurumsal: "Kurumsal",
};

const planOptions = ["temel", "profesyonel", "kurumsal"];

export default function SellerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [stats, setStats] = useState({ reviews: 0, products: 0, returns: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

      const [{ count: reviewCount }, { count: productCount }, { count: returnCount }] = await Promise.all([
        supabase.from("reviews").select("*", { count: "exact", head: true }).eq("seller_id", id),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("seller_id", id),
        supabase.from("returns").select("*", { count: "exact", head: true }).eq("seller_id", id),
      ]);

      setStats({
        reviews: reviewCount ?? 0,
        products: productCount ?? 0,
        returns: returnCount ?? 0,
      });
      setLoading(false);
    }
    load();
  }, [id]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Yükleniyor...
      </div>
    );
  }

  if (!seller) return null;

  const statCards = [
    { label: "Yorum", value: stats.reviews, icon: MessageSquare, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Ürün", value: stats.products, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "İade", value: stats.returns, icon: RotateCcw, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Geri */}
      <Link
        href="/admin/saticilar"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Satıcılara Dön
      </Link>

      {/* Profil Kartı */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl font-bold">
              {seller.shop_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{seller.shop_name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{seller.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(seller.created_at).toLocaleDateString("tr-TR")} tarihinde katıldı
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={toggleActive}
            disabled={saving}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {seller.is_active ? (
              <><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-green-600">Aktif</span></>
            ) : (
              <><XCircle className="w-4 h-4 text-gray-400" /><span className="text-gray-400">Pasif</span></>
            )}
          </button>
        </div>
      </div>

      {/* Plan */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Plan</h3>
        <div className="flex gap-3">
          {planOptions.map((p) => (
            <button
              key={p}
              onClick={() => changePlan(p)}
              disabled={saving}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                seller.plan === p
                  ? p === "temel"
                    ? "border-gray-400 bg-gray-100 text-gray-700"
                    : p === "profesyonel"
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-200 text-gray-400 hover:border-gray-300"
              }`}
            >
              {planLabel[p]}
            </button>
          ))}
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-3">
            <div className={`${c.bg} ${c.color} p-2.5 rounded-lg`}>
              <c.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              <p className="text-xs text-gray-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
