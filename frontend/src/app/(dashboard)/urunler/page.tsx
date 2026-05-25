"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Package, Sparkles, Loader2, Copy, CheckCircle, ChevronDown, ChevronUp, Zap, X, Plus } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number | null;
  stock: number | null;
  return_rate: number | null;
  description_score: number | null;
  seo_score: number | null;
  ai_suggestions: string[] | null;
  improved_description: string | null;
}

function ScorePill({ score, label }: { score: number; label: string }) {
  const cls = score >= 70
    ? "bg-green-100 text-green-700"
    : score >= 50
    ? "bg-yellow-100 text-yellow-700"
    : "bg-red-100 text-red-700";
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${cls}`}>
      {label} {score}
    </span>
  );
}

export default function UrunlerPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"tumu" | "dusuk">("tumu");
  const [generating, setGenerating] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", category: "", price: "", stock: "", description: "" });
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("products")
        .select("id, name, category, description, price, stock, return_rate, description_score, seo_score, ai_suggestions, improved_description")
        .eq("seller_id", user.id)
        .order("description_score", { ascending: true });

      setProducts(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function improveDescription(p: Product) {
    setGenerating(p.id);
    try {
      const res = await fetch("/api/ai/improve-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: p.id,
          product_name: p.name,
          category: p.category,
          description: p.description ?? "",
        }),
      });
      const { improved, suggestions } = await res.json();
      if (improved) {
        setProducts((prev) =>
          prev.map((item) =>
            item.id === p.id
              ? { ...item, improved_description: improved, ai_suggestions: suggestions ?? item.ai_suggestions }
              : item
          )
        );
        setExpanded(p.id);
      }
    } finally {
      setGenerating(null);
    }
  }

  async function copyText(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast("Açıklama panoya kopyalandı");
    setTimeout(() => setCopied(null), 2000);
  }

  async function bulkImprove() {
    const lowScore = products.filter((p) => (p.description_score ?? 100) < 60 && !p.improved_description);
    if (!lowScore.length) {
      toast("İyileştirilecek ürün bulunamadı", "info");
      return;
    }
    setBulkRunning(true);
    setBulkProgress({ done: 0, total: lowScore.length });
    let done = 0;
    for (const p of lowScore) {
      if (!bulkRunning && done > 0) break;
      try {
        const res = await fetch("/api/ai/improve-product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: p.id,
            product_name: p.name,
            category: p.category,
            description: p.description ?? "",
          }),
        });
        const { improved, suggestions } = await res.json();
        if (improved) {
          setProducts((prev) =>
            prev.map((item) =>
              item.id === p.id
                ? { ...item, improved_description: improved, ai_suggestions: suggestions ?? item.ai_suggestions }
                : item
            )
          );
        }
      } catch {
        // tek ürün başarısız olursa devam et
      }
      done += 1;
      setBulkProgress({ done, total: lowScore.length });
    }
    setBulkRunning(false);
    setBulkProgress(null);
    toast(`${done} ürün için AI açıklama oluşturuldu`);
  }

  async function addProduct() {
    if (!addForm.name.trim()) { setAddError("Ürün adı zorunlu"); return; }
    setAddSaving(true);
    setAddError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from("products").insert({
        seller_id: user.id,
        name: addForm.name.trim(),
        category: addForm.category.trim() || null,
        description: addForm.description.trim() || null,
        price: addForm.price ? parseFloat(addForm.price.replace(",", ".")) : null,
        stock: addForm.stock ? parseInt(addForm.stock) : 0,
        description_score: 50,
        seo_score: 50,
      }).select().single();
      if (error) { setAddError(error.message); return; }
      setProducts((prev) => [data as Product, ...prev]);
      setShowAddModal(false);
      setAddForm({ name: "", category: "", price: "", stock: "", description: "" });
      toast("Ürün eklendi");
    } finally {
      setAddSaving(false);
    }
  }

  const filtered = products.filter((p) => {
    if (filter === "dusuk") return (p.description_score ?? 100) < 60;
    return true;
  });

  const lowCount = products.filter((p) => (p.description_score ?? 100) < 60).length;

  return (
    <div className="space-y-6 max-w-3xl w-full">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ürün Analizi</h2>
          <p className="text-gray-500 mt-1">Açıklama ve SEO puanları, AI iyileştirme önerileri</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {lowCount > 0 && (
            <span className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-medium">
              {lowCount} ürün dikkat gerektiriyor
            </span>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Ürün Ekle
          </button>
          {lowCount > 0 && !bulkRunning && (
            <button
              onClick={bulkImprove}
              className="flex items-center gap-1.5 text-xs border border-orange-300 text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Tümünü İyileştir ({lowCount})
            </button>
          )}
        </div>
      </div>

      {/* Toplu iyileştirme progress */}
      {bulkRunning && bulkProgress && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-4">
          <Loader2 className="w-4 h-4 text-orange-500 animate-spin flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-orange-900">
              AI açıklama oluşturuluyor… {bulkProgress.done}/{bulkProgress.total}
            </p>
            <div className="mt-2 h-1.5 bg-orange-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${(bulkProgress.done / bulkProgress.total) * 100}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => setBulkRunning(false)}
            className="text-orange-400 hover:text-orange-600 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: "tumu" as const, label: `Tümü (${products.length})` },
          { key: "dusuk" as const, label: `Düşük Puan (${lowCount})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              filter === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {filter === "dusuk" ? "Düşük puanlı ürün yok." : "Henüz ürün yok."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 truncate">{p.name}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                      <ScorePill score={p.description_score ?? 0} label="İçerik" />
                      <ScorePill score={p.seo_score ?? 0} label="SEO" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <p className="text-xs text-gray-400 truncate">{p.category}</p>
                    {p.price && (
                      <span className="text-xs text-gray-500 font-medium">
                        {p.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                      </span>
                    )}
                    {p.return_rate !== null && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.return_rate > 20 ? "bg-red-100 text-red-700" :
                        p.return_rate > 10 ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        %{p.return_rate} iade
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {p.ai_suggestions && p.ai_suggestions.length > 0 && (
                <div className="bg-orange-50 rounded-lg p-3 space-y-1.5">
                  <p className="text-xs text-orange-600 font-medium">AI Önerileri</p>
                  <ul className="space-y-1">
                    {p.ai_suggestions.map((s, i) => (
                      <li key={i} className="text-sm text-orange-900 flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5 flex-shrink-0">→</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improved description panel */}
              {p.improved_description && expanded === p.id && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-blue-600 font-medium">AI İyileştirilmiş Açıklama</p>
                    <button
                      onClick={() => copyText(p.id, p.improved_description!)}
                      className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
                    >
                      {copied === p.id
                        ? <><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Kopyalandı</>
                        : <><Copy className="w-3.5 h-3.5" /> Kopyala</>}
                    </button>
                  </div>
                  <p className="text-sm text-blue-900 leading-relaxed">{p.improved_description}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => improveDescription(p)}
                  disabled={generating === p.id}
                  className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors disabled:opacity-50"
                >
                  {generating === p.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Sparkles className="w-3.5 h-3.5" />}
                  {generating === p.id ? "Oluşturuluyor..." : "AI ile açıklama oluştur"}
                </button>
                {p.improved_description && (
                  <button
                    onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 ml-auto"
                  >
                    {expanded === p.id
                      ? <><ChevronUp className="w-3.5 h-3.5" /> Gizle</>
                      : <><ChevronDown className="w-3.5 h-3.5" /> Göster</>}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Ürün Ekle Modalı ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">Yeni Ürün Ekle</h3>
                <p className="text-xs text-gray-400 mt-0.5">Ürün bilgilerini gir, AI analizi sonra çalışacak</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Ürün Adı *</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Örn: Oversize Pamuk T-Shirt Siyah"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Kategori</label>
                  <input
                    type="text"
                    value={addForm.category}
                    onChange={(e) => setAddForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="Giyim / Üst Giyim"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Stok</label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.stock}
                    onChange={(e) => setAddForm((f) => ({ ...f, stock: e.target.value }))}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Fiyat (₺)</label>
                <input
                  type="text"
                  value={addForm.price}
                  onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="299,90"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Açıklama</label>
                <textarea
                  value={addForm.description}
                  onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Ürün özellikleri ve malzeme bilgisi…"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              {addError && <p className="text-xs text-red-600">{addError}</p>}
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                İptal
              </button>
              <button
                onClick={addProduct}
                disabled={addSaving}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {addSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {addSaving ? "Ekleniyor…" : "Ürünü Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
