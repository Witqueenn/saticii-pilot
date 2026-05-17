"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, Eye, MousePointerClick, TrendingUp } from "lucide-react";

interface EmailSend {
  id: string;
  seller_id: string;
  recipient_email: string;
  subject: string;
  segment: string;
  campaign_label: string;
  opened: boolean;
  clicked: boolean;
  created_at: string;
}

interface CampaignRow {
  label: string;
  seller_id: string;
  total: number;
  opened: number;
  clicked: number;
  segment: string;
  date: string;
}

interface SellerMap { [id: string]: string }

export default function KampanyalarPage() {
  const [sends, setSends] = useState<EmailSend[]>([]);
  const [sellerNames, setSellerNames] = useState<SellerMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: sendData }, { data: sellers }] = await Promise.all([
        supabase.from("email_sends").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("sellers").select("id, shop_name"),
      ]);
      setSends(sendData ?? []);
      const map: SellerMap = {};
      (sellers ?? []).forEach((s: any) => { map[s.id] = s.shop_name; });
      setSellerNames(map);
      setLoading(false);
    }
    load();
  }, []);

  // Kampanya bazlı grupla
  const campaigns: CampaignRow[] = [];
  const seen = new Map<string, CampaignRow>();
  for (const s of sends) {
    const key = `${s.seller_id}__${s.campaign_label ?? s.subject}`;
    if (!seen.has(key)) {
      const row: CampaignRow = { label: s.campaign_label ?? s.subject, seller_id: s.seller_id, total: 0, opened: 0, clicked: 0, segment: s.segment, date: s.created_at };
      seen.set(key, row);
      campaigns.push(row);
    }
    const row = seen.get(key)!;
    row.total++;
    if (s.opened) row.opened++;
    if (s.clicked) row.clicked++;
  }

  const totalSent = sends.length;
  const totalOpened = sends.filter((s) => s.opened).length;
  const totalClicked = sends.filter((s) => s.clicked).length;
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Email Kampanyaları</h2>
        <p className="text-gray-500 mt-1">Tüm satıcıların gönderdiği email kampanyaları</p>
      </div>

      {/* Özet */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Toplam Gönderim", value: totalSent, icon: Mail, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Açılma Oranı", value: `%${openRate}`, icon: Eye, color: "text-green-600", bg: "bg-green-50" },
          { label: "Tıklama Oranı", value: `%${clickRate}`, icon: MousePointerClick, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Kampanya Sayısı", value: campaigns.length, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`${c.bg} ${c.color} p-2 rounded-lg w-fit mb-3`}><c.icon className="w-4 h-4" /></div>
            <p className="text-2xl font-bold text-gray-900">{loading ? "—" : c.value}</p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Kampanya listesi */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">Kampanya Detayları</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Yükleniyor...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Henüz kampanya gönderilmemiş.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Kampanya</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Satıcı</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Segment</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Gönderim</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Açılma</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Tıklama</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaigns.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{c.label}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{sellerNames[c.seller_id] ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c.segment}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">{c.total}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-green-700 font-medium">
                        {c.total > 0 ? `%${Math.round((c.opened / c.total) * 100)}` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-purple-700 font-medium">
                        {c.total > 0 ? `%${Math.round((c.clicked / c.total) * 100)}` : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">{new Date(c.date).toLocaleDateString("tr-TR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
