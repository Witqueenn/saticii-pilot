"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, CheckCircle, XCircle } from "lucide-react";

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

const planOptions = ["temel", "profesyonel", "kurumsal"];

export default function SaticilarPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("sellers")
        .select("*")
        .order("created_at", { ascending: false });
      setSellers(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function toggleActive(seller: Seller) {
    const supabase = createClient();
    await supabase
      .from("sellers")
      .update({ is_active: !seller.is_active })
      .eq("id", seller.id);
    setSellers((prev) =>
      prev.map((s) => s.id === seller.id ? { ...s, is_active: !s.is_active } : s)
    );
  }

  async function changePlan(seller: Seller, plan: string) {
    const supabase = createClient();
    await supabase.from("sellers").update({ plan }).eq("id", seller.id);
    setSellers((prev) =>
      prev.map((s) => s.id === seller.id ? { ...s, plan } : s)
    );
  }

  const filtered = sellers.filter(
    (s) =>
      s.shop_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Satıcılar</h2>
          <p className="text-gray-500 mt-1">{sellers.length} kayıtlı satıcı</p>
        </div>
      </div>

      {/* Arama */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Mağaza adı veya email ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Mağaza</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Plan</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Kayıt Tarihi</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-gray-400">Yükleniyor...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-gray-400">Satıcı bulunamadı.</td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{s.shop_name}</p>
                    <p className="text-xs text-gray-400">{s.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={s.plan}
                      onChange={(e) => changePlan(s, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${planColor[s.plan]}`}
                    >
                      {planOptions.map((p) => (
                        <option key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(s.created_at).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleActive(s)}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      {s.is_active ? (
                        <><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-green-600">Aktif</span></>
                      ) : (
                        <><XCircle className="w-4 h-4 text-gray-400" /><span className="text-gray-400">Pasif</span></>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
