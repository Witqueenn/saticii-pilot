"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star, Mail, MessageSquare, Users } from "lucide-react";

interface FormResponse {
  id: string;
  seller_id: string;
  rating: number;
  comment: string | null;
  email: string | null;
  wants_newsletter: boolean;
  product_ref: string | null;
  created_at: string;
}

interface SellerMap { [id: string]: string }

export default function FormlarPage() {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [sellerNames, setSellerNames] = useState<SellerMap>({});
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: rows }, { data: sellers }] = await Promise.all([
        supabase.from("form_responses").select("*").order("created_at", { ascending: false }).limit(300),
        supabase.from("sellers").select("id, shop_name"),
      ]);
      setResponses(rows ?? []);
      const map: SellerMap = {};
      (sellers ?? []).forEach((s: any) => { map[s.id] = s.shop_name; });
      setSellerNames(map);
      setLoading(false);
    }
    load();
  }, []);

  const avg = responses.length > 0 ? (responses.reduce((s, r) => s + r.rating, 0) / responses.length).toFixed(1) : "—";
  const withEmail = responses.filter((r) => r.email).length;
  const newsletter = responses.filter((r) => r.wants_newsletter).length;

  const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  responses.forEach((r) => { ratingDist[r.rating] = (ratingDist[r.rating] ?? 0) + 1; });
  const maxDist = Math.max(...Object.values(ratingDist), 1);

  const filtered = filterRating !== null ? responses.filter((r) => r.rating === filterRating) : responses;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Form Yanıtları</h2>
        <p className="text-gray-500 mt-1">Tüm satıcıların müşteri geri bildirimleri</p>
      </div>

      {/* Özet */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Toplam Yanıt", value: responses.length, icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Ort. Puan", value: avg, icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "E-posta Toplanan", value: withEmail, icon: Mail, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Bülten Abonesi", value: newsletter, icon: Users, color: "text-green-600", bg: "bg-green-50" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`${c.bg} ${c.color} p-2 rounded-lg w-fit mb-3`}><c.icon className="w-4 h-4" /></div>
            <p className="text-2xl font-bold text-gray-900">{loading ? "—" : c.value}</p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Puan dağılımı */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Puan Dağılımı</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                onClick={() => setFilterRating(filterRating === star ? null : star)}
                className={`w-full flex items-center gap-3 rounded-lg px-2 py-1 transition-colors ${filterRating === star ? "bg-orange-50" : "hover:bg-gray-50"}`}
              >
                <span className="text-sm text-gray-600 w-8 text-right">{star}★</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-orange-400 transition-all"
                    style={{ width: `${((ratingDist[star] ?? 0) / maxDist) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-8 text-left">{ratingDist[star] ?? 0}</span>
              </button>
            ))}
          </div>
          {filterRating && (
            <button onClick={() => setFilterRating(null)} className="text-xs text-orange-600 mt-3 hover:underline">
              Filtreyi kaldır
            </button>
          )}
        </div>

        {/* Son yanıtlar */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">
              {filterRating ? `${filterRating} Yıldız Yanıtları (${filtered.length})` : `Son Yanıtlar (${responses.length})`}
            </h3>
          </div>
          <div className="overflow-y-auto max-h-72 divide-y divide-gray-100">
            {loading ? (
              <p className="p-5 text-sm text-gray-400 text-center">Yükleniyor...</p>
            ) : filtered.length === 0 ? (
              <p className="p-8 text-center text-gray-400 text-sm">Yanıt bulunamadı.</p>
            ) : filtered.slice(0, 50).map((r) => (
              <div key={r.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs text-yellow-500 font-medium">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                      <span className="text-xs text-gray-400 truncate">{sellerNames[r.seller_id] ?? "—"}</span>
                    </div>
                    {r.comment && <p className="text-xs text-gray-600 truncate">{r.comment}</p>}
                    {r.email && <p className="text-xs text-gray-400">{r.email}</p>}
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{new Date(r.created_at).toLocaleDateString("tr-TR")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
