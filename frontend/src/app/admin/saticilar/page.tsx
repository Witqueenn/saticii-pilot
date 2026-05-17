"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, CheckCircle, XCircle, ChevronRight, Link2, Link2Off } from "lucide-react";
import Link from "next/link";
import { ListSkeleton } from "@/components/Skeleton";

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
  marketing: "bg-indigo-100 text-indigo-700",
};

const planLabel: Record<string, string> = {
  temel: "Temel",
  profesyonel: "Pro",
  marketing: "Marketing",
};

const planOptions = ["temel", "profesyonel", "marketing"];

type FilterPlan = "hepsi" | "temel" | "profesyonel" | "marketing";
type FilterStatus = "hepsi" | "aktif" | "pasif";

export default function SaticilarPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<FilterPlan>("hepsi");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("hepsi");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data }, { data: creds }] = await Promise.all([
        supabase.from("sellers").select("*").order("created_at", { ascending: false }),
        supabase.from("marketplace_credentials").select("seller_id"),
      ]);
      setSellers(data ?? []);
      setConnectedIds(new Set((creds ?? []).map((c: any) => c.seller_id)));
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

  const filtered = sellers.filter((s) => {
    const matchSearch =
      s.shop_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === "hepsi" || s.plan === filterPlan as string;
    const matchStatus =
      filterStatus === "hepsi" ||
      (filterStatus === "aktif" && s.is_active) ||
      (filterStatus === "pasif" && !s.is_active);
    return matchSearch && matchPlan && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Satıcılar</h2>
        <p className="text-gray-500 mt-1">{sellers.length} kayıtlı satıcı</p>
      </div>

      {/* Filtreler */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Mağaza adı veya email ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value as FilterPlan)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="hepsi">Tüm Planlar</option>
          <option value="temel">Temel</option>
          <option value="profesyonel">Profesyonel</option>
          <option value="marketing">Marketing</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="hepsi">Tüm Durumlar</option>
          <option value="aktif">Aktif</option>
          <option value="pasif">Pasif</option>
        </select>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Mağaza</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Plan</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 hidden md:table-cell">Bağlantı</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 hidden sm:table-cell">Kayıt</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Durum</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4">
                  <div className="space-y-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="flex items-center gap-4 animate-pulse">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-gray-200 rounded w-1/3" />
                          <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                        </div>
                        <div className="h-5 w-20 bg-gray-200 rounded-full" />
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">Satıcı bulunamadı.</td>
              </tr>
            ) : (
              filtered.map((s) => {
                const isConn = connectedIds.has(s.id);
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {s.shop_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{s.shop_name}</p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={s.plan}
                        onChange={(e) => changePlan(s, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${planColor[s.plan]}`}
                      >
                        {planOptions.map((p) => (
                          <option key={p} value={p}>{planLabel[p]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className={`flex items-center gap-1 text-xs font-medium ${isConn ? "text-green-600" : "text-gray-400"}`}>
                        {isConn
                          ? <><Link2 className="w-3.5 h-3.5" /> Bağlı</>
                          : <><Link2Off className="w-3.5 h-3.5" /> Bağlantı yok</>}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs hidden sm:table-cell">
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
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/saticilar/${s.id}`}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
