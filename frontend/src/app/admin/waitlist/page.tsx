"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, Download, Users } from "lucide-react";

interface WaitlistEntry {
  id: string;
  email: string;
  created_at: string;
}

export default function WaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("waitlist")
        .select("*")
        .order("created_at", { ascending: false });
      setEntries(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  function exportCSV() {
    const header = "Email,Tarih";
    const rows = entries.map((e) =>
      `${e.email},${new Date(e.created_at).toLocaleDateString("tr-TR")}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Waitlist</h2>
          <p className="text-gray-500 mt-1">{entries.length} kişi listeye katıldı</p>
        </div>
        {entries.length > 0 && (
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            CSV İndir
          </button>
        )}
      </div>

      {/* Özet kart */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Toplam Kayıt</p>
            <p className="text-2xl font-bold text-gray-900">{loading ? "—" : entries.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-3">
          <div className="bg-green-50 text-green-600 p-2.5 rounded-lg">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Bu Hafta</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "—" : entries.filter((e) => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(e.created_at) >= weekAgo;
              }).length}
            </p>
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">E-posta Listesi</p>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-100">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="px-5 py-3.5 flex items-center justify-between animate-pulse">
                <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-20" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Mail className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Henüz kimse katılmamış.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {entries.map((e) => (
              <div key={e.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {e.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-800">{e.email}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(e.created_at).toLocaleDateString("tr-TR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
