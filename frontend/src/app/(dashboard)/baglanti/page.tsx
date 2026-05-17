"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, ExternalLink, ChevronDown, ChevronUp, Trash2, Loader2 } from "lucide-react";

const platforms = [
  {
    id: "trendyol",
    name: "Trendyol",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "Trendyol API Key" },
      { key: "api_secret", label: "API Secret", placeholder: "Trendyol API Secret" },
      { key: "supplier_id", label: "Supplier ID", placeholder: "Mağaza ID" },
    ],
    guide: "https://partner.trendyol.com",
    guideLabel: "Trendyol Partner Panel",
  },
  {
    id: "hepsiburada",
    name: "Hepsiburada",
    fields: [
      { key: "api_key", label: "Username", placeholder: "Hepsiburada kullanıcı adı" },
      { key: "api_secret", label: "Password", placeholder: "Hepsiburada şifresi" },
    ],
    guide: "https://merchant.hepsiburada.com",
    guideLabel: "Hepsiburada Merchant Panel",
  },
  {
    id: "n11",
    name: "N11",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "N11 API Key" },
      { key: "api_secret", label: "API Secret", placeholder: "N11 API Secret" },
    ],
    guide: "https://www.n11.com/magaza",
    guideLabel: "N11 Mağaza Paneli",
  },
];

interface Credential {
  id: string;
  marketplace: string;
}

export default function BaglantiPage() {
  const [connected, setConnected] = useState<Credential[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("marketplace_credentials")
        .select("id, marketplace")
        .eq("seller_id", user.id);
      setConnected(data ?? []);
    }
    load();
  }, []);

  function setValue(platform: string, field: string, value: string) {
    setValues((prev) => ({
      ...prev,
      [platform]: { ...(prev[platform] ?? {}), [field]: value },
    }));
  }

  function isConnected(platformId: string) {
    return connected.some((c) => c.marketplace === platformId);
  }

  async function handleSave(platformId: string) {
    if (!userId) return;
    setSaving(platformId);
    const supabase = createClient();
    const vals = values[platformId] ?? {};

    await supabase.from("marketplace_credentials").upsert({
      seller_id: userId,
      marketplace: platformId,
      api_key: vals.api_key ?? "",
      api_secret: vals.api_secret ?? "",
      supplier_id: vals.supplier_id ?? null,
    }, { onConflict: "seller_id,marketplace" });

    const { data } = await supabase
      .from("marketplace_credentials")
      .select("id, marketplace")
      .eq("seller_id", userId);
    setConnected(data ?? []);
    setSaving(null);
    setOpen(null);
    setValues((prev) => ({ ...prev, [platformId]: {} }));
  }

  async function handleDelete(platformId: string) {
    if (!userId) return;
    setDeleting(platformId);
    const supabase = createClient();
    await supabase
      .from("marketplace_credentials")
      .delete()
      .eq("seller_id", userId)
      .eq("marketplace", platformId);
    setConnected((prev) => prev.filter((c) => c.marketplace !== platformId));
    setDeleting(null);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pazaryeri Bağlantıları</h2>
        <p className="text-gray-500 mt-1">
          {connected.length > 0
            ? `${connected.length} pazaryeri bağlı`
            : "Henüz bağlı pazaryeri yok"}
        </p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
        API bilgilerin şifreli olarak saklanır ve yalnızca veri çekme amacıyla kullanılır.
      </div>

      <div className="space-y-3">
        {platforms.map((p) => {
          const conn = isConnected(p.id);
          return (
            <div
              key={p.id}
              className={`bg-white rounded-xl border overflow-hidden transition-colors ${conn ? "border-green-300" : "border-gray-200"}`}
            >
              <button
                onClick={() => setOpen(open === p.id ? null : p.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                    {p.name[0]}
                  </div>
                  <span className="font-medium text-gray-900">{p.name}</span>
                  {conn && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Bağlı
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {conn && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                      disabled={deleting === p.id}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {deleting === p.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  )}
                  {open === p.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {open === p.id && (
                <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                  <a
                    href={p.guide}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    API bilgilerini {p.guideLabel}'nden al
                  </a>
                  {p.fields.map((f) => (
                    <div key={f.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                      <input
                        type={f.key.includes("secret") || f.key.includes("password") ? "password" : "text"}
                        placeholder={f.placeholder}
                        value={values[p.id]?.[f.key] ?? ""}
                        onChange={(e) => setValue(p.id, f.key, e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
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

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-center">
        <p className="text-sm text-gray-500">Başka bir platform mu kullanıyorsun?</p>
        <a href="mailto:destek@saticipilot.com" className="text-sm text-orange-600 font-medium hover:underline mt-1 inline-block">
          Entegrasyon talep et →
        </a>
      </div>
    </div>
  );
}
