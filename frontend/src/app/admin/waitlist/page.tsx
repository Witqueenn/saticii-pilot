"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, Download, Users, Send, Loader2, CheckCircle, Zap } from "lucide-react";

interface WaitlistEntry {
  id: string;
  email: string;
  created_at: string;
  invited_at: string | null;
}

export default function WaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ sent: number; total: number } | null>(null);

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

  async function sendInvite(email: string) {
    setInviting(email);
    try {
      await fetch("/api/admin/waitlist-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setEntries((prev) =>
        prev.map((e) => e.email === email ? { ...e, invited_at: new Date().toISOString() } : e)
      );
    } finally {
      setInviting(null);
    }
  }

  async function sendAll() {
    setSendingAll(true);
    setBulkResult(null);
    try {
      const res = await fetch("/api/admin/waitlist-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulk: true }),
      });
      const data = await res.json();
      setBulkResult({ sent: data.sent ?? 0, total: data.total ?? 0 });
      const now = new Date().toISOString();
      setEntries((prev) =>
        prev.map((e) => !e.invited_at ? { ...e, invited_at: now } : e)
      );
    } finally {
      setSendingAll(false);
    }
  }

  function exportCSV() {
    const header = "Email,Katılım Tarihi,Davet Tarihi";
    const rows = entries.map((e) =>
      `${e.email},${new Date(e.created_at).toLocaleDateString("tr-TR")},${e.invited_at ? new Date(e.invited_at).toLocaleDateString("tr-TR") : ""}`
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

  const uninvitedCount = entries.filter((e) => !e.invited_at).length;
  const invitedCount = entries.filter((e) => !!e.invited_at).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Waitlist</h2>
          <p className="text-gray-500 mt-1">{entries.length} kişi listeye katıldı</p>
        </div>
        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              CSV İndir
            </button>
          )}
          {uninvitedCount > 0 && (
            <button
              onClick={sendAll}
              disabled={sendingAll}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 transition-colors"
            >
              {sendingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {sendingAll ? "Gönderiliyor…" : `Hepsine Gönder (${uninvitedCount})`}
            </button>
          )}
        </div>
      </div>

      {bulkResult && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {bulkResult.total} kişiden {bulkResult.sent} tanesine davet gönderildi.
        </div>
      )}

      {/* Özet kart */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Toplam</p>
            <p className="text-2xl font-bold text-gray-900">{loading ? "—" : entries.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-3">
          <div className="bg-green-50 text-green-600 p-2.5 rounded-lg">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Davet Edildi</p>
            <p className="text-2xl font-bold text-gray-900">{loading ? "—" : invitedCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-3">
          <div className="bg-orange-50 text-orange-600 p-2.5 rounded-lg">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Bekleyen</p>
            <p className="text-2xl font-bold text-gray-900">{loading ? "—" : uninvitedCount}</p>
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
              <div key={e.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {e.email.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-800 flex-1 min-w-0 truncate">{e.email}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(e.created_at).toLocaleDateString("tr-TR")}
                </span>
                {e.invited_at ? (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-medium flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {new Date(e.invited_at).toLocaleDateString("tr-TR")}
                  </span>
                ) : (
                  <button
                    onClick={() => sendInvite(e.email)}
                    disabled={inviting === e.email}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors flex-shrink-0"
                  >
                    {inviting === e.email ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    Davet Gönder
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
