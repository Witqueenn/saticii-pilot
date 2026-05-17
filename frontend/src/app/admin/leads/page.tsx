"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Target, ExternalLink, ChevronDown, X, Check, Loader2 } from "lucide-react";

interface Lead {
  id: string;
  shop_name: string;
  marketplace: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  store_url: string | null;
  status: string;
  source: string | null;
  notes: string | null;
  created_at: string;
}

const STATUSES = [
  { key: "kesfedildi", label: "Keşfedildi", color: "bg-gray-100 text-gray-600" },
  { key: "ulasildi",   label: "Ulaşıldı",   color: "bg-blue-100 text-blue-700" },
  { key: "demo",       label: "Demo",        color: "bg-purple-100 text-purple-700" },
  { key: "deneme",     label: "Deneme",      color: "bg-orange-100 text-orange-700" },
  { key: "musteri",    label: "Müşteri",     color: "bg-green-100 text-green-700" },
  { key: "kayip",      label: "Kayıp",       color: "bg-red-100 text-red-700" },
];

const MARKETPLACES = ["trendyol", "hepsiburada", "n11", "amazon", "ciceksepeti", "diğer"];

const EMPTY_FORM = {
  shop_name: "", marketplace: "trendyol", contact_name: "", contact_email: "",
  contact_phone: "", store_url: "", status: "kesfedildi", source: "", notes: "",
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUSES.find((s) => s.key === status);
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s?.color ?? "bg-gray-100 text-gray-600"}`}>{s?.label ?? status}</span>;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("hepsi");
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setLeads(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setForm(EMPTY_FORM); setEditLead(null); setShowModal(true); }
  function openEdit(lead: Lead) {
    setForm({
      shop_name: lead.shop_name, marketplace: lead.marketplace,
      contact_name: lead.contact_name ?? "", contact_email: lead.contact_email ?? "",
      contact_phone: lead.contact_phone ?? "", store_url: lead.store_url ?? "",
      status: lead.status, source: lead.source ?? "", notes: lead.notes ?? "",
    });
    setEditLead(lead);
    setShowModal(true);
  }

  async function save() {
    if (!form.shop_name.trim()) return;
    setSaving(true);
    const payload = {
      shop_name: form.shop_name.trim(),
      marketplace: form.marketplace,
      contact_name: form.contact_name || null,
      contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null,
      store_url: form.store_url || null,
      status: form.status,
      source: form.source || null,
      notes: form.notes || null,
      updated_at: new Date().toISOString(),
    };
    if (editLead) {
      await supabase.from("leads").update(payload).eq("id", editLead.id);
    } else {
      await supabase.from("leads").insert(payload);
    }
    setSaving(false);
    setShowModal(false);
    load();
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("leads").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
  }

  async function deleteLead(id: string) {
    if (!confirm("Bu lead'i silmek istediğine emin misin?")) return;
    await supabase.from("leads").delete().eq("id", id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }

  const filtered = filterStatus === "hepsi" ? leads : leads.filter((l) => l.status === filterStatus);

  const stats = {
    total: leads.length,
    active: leads.filter((l) => !["musteri", "kayip"].includes(l.status)).length,
    musteri: leads.filter((l) => l.status === "musteri").length,
    kayip: leads.filter((l) => l.status === "kayip").length,
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">BD & Leads</h2>
          <p className="text-gray-500 mt-1">Potansiyel müşteri takibi</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> Lead Ekle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Toplam Lead", value: stats.total, color: "text-gray-900" },
          { label: "Aktif Pipeline", value: stats.active, color: "text-orange-600" },
          { label: "Müşteriye Döndü", value: stats.musteri, color: "text-green-600" },
          { label: "Kayıp", value: stats.kayip, color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{loading ? "—" : s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pipeline görünümü */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {STATUSES.map((s) => {
          const count = leads.filter((l) => l.status === s.key).length;
          return (
            <button
              key={s.key}
              onClick={() => setFilterStatus(filterStatus === s.key ? "hepsi" : s.key)}
              className={`rounded-xl border p-3 text-left transition-all ${filterStatus === s.key ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
            >
              <p className="text-lg font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </button>
          );
        })}
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <Target className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">{filtered.length} lead</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Lead bulunamadı.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((lead) => (
              <div key={lead.id}>
                <div
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                >
                  {/* Mağaza */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{lead.shop_name}</span>
                      <span className="text-xs text-gray-400 capitalize">{lead.marketplace}</span>
                      {lead.store_url && (
                        <a
                          href={lead.store_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-orange-500 hover:text-orange-600"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {lead.contact_email && (
                      <p className="text-xs text-gray-400 mt-0.5">{lead.contact_email}</p>
                    )}
                  </div>

                  {/* Status dropdown */}
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <StatusBadge status={lead.status} />
                    <div className="relative group">
                      <button className="p-1 text-gray-300 hover:text-gray-500 transition-colors">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute right-0 top-6 z-10 bg-white rounded-xl border border-gray-200 shadow-lg p-1 w-36 hidden group-hover:block">
                        {STATUSES.map((s) => (
                          <button
                            key={s.key}
                            onClick={() => updateStatus(lead.id, s.key)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 hover:bg-gray-50 ${lead.status === s.key ? "text-orange-600" : "text-gray-700"}`}
                          >
                            {lead.status === s.key && <Check className="w-3 h-3" />}
                            {lead.status !== s.key && <span className="w-3" />}
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(lead.created_at).toLocaleDateString("tr-TR")}
                  </span>
                </div>

                {/* Expanded detail */}
                {expandedId === lead.id && (
                  <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3">
                      {lead.contact_name && <div><p className="text-xs text-gray-400">İletişim</p><p className="text-sm text-gray-700">{lead.contact_name}</p></div>}
                      {lead.contact_phone && <div><p className="text-xs text-gray-400">Telefon</p><p className="text-sm text-gray-700">{lead.contact_phone}</p></div>}
                      {lead.source && <div><p className="text-xs text-gray-400">Kaynak</p><p className="text-sm text-gray-700">{lead.source}</p></div>}
                    </div>
                    {lead.notes && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Notlar</p>
                        <p className="text-sm text-gray-700 bg-white rounded-lg border border-gray-200 px-3 py-2 whitespace-pre-wrap">{lead.notes}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => openEdit(lead)} className="text-xs text-orange-600 font-semibold hover:underline">Düzenle</button>
                      <span className="text-gray-300">·</span>
                      <button onClick={() => deleteLead(lead.id)} className="text-xs text-red-500 hover:underline">Sil</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editLead ? "Lead Düzenle" : "Yeni Lead"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Mağaza Adı *</label>
                  <input
                    value={form.shop_name}
                    onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
                    placeholder="Ayşe'nin Butik"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Platform</label>
                  <select
                    value={form.marketplace}
                    onChange={(e) => setForm({ ...form, marketplace: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                  >
                    {MARKETPLACES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Durum</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                  >
                    {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">İletişim Adı</label>
                  <input
                    value={form.contact_name}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    placeholder="Ayşe Kaya"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    placeholder="ayse@ornek.com"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    value={form.contact_phone}
                    onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                    placeholder="0532 000 00 00"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Kaynak</label>
                  <input
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    placeholder="LinkedIn, Trendyol arama, referans..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Mağaza URL</label>
                  <input
                    value={form.store_url}
                    onChange={(e) => setForm({ ...form, store_url: e.target.value })}
                    placeholder="https://www.trendyol.com/magaza/..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Notlar</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    placeholder="Görüşme notları, ilgi alanları, takip tarihi..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={save}
                disabled={saving || !form.shop_name.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editLead ? "Kaydet" : "Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
