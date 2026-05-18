"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  AlertTriangle, CheckCircle, MessageSquare, Clock, Filter,
  Sparkles, Loader2, Copy, Upload, X, Download, FileText,
} from "lucide-react";
import { clsx } from "clsx";
import { ReviewSkeleton } from "@/components/Skeleton";

interface Review {
  id: string;
  product_name: string;
  rating: number;
  comment: string;
  customer_name: string | null;
  sentiment: string | null;
  is_urgent: boolean;
  is_replied: boolean;
  suggested_reply: string | null;
  reviewed_at: string;
}

interface ParsedReview {
  product_name: string;
  rating: number;
  comment: string;
  customer_name?: string;
  reviewed_at?: string;
}

const sentimentLabel: Record<string, { label: string; color: string }> = {
  olumlu: { label: "Olumlu", color: "bg-green-100 text-green-700" },
  notr:   { label: "Nötr",   color: "bg-gray-100 text-gray-600" },
  olumsuz:{ label: "Olumsuz",color: "bg-red-100 text-red-700" },
  acil:   { label: "ACİL",   color: "bg-red-600 text-white" },
};

type FilterType = "tumu" | "acil" | "bekleyen" | "cevaplandi";

const filters: { key: FilterType; label: string }[] = [
  { key: "tumu",       label: "Tümü" },
  { key: "acil",       label: "Acil" },
  { key: "bekleyen",   label: "Bekleyen" },
  { key: "cevaplandi", label: "Cevaplandı" },
];

const SAMPLE_CSV = `Ürün Adı,Puan,Yorum,Müşteri Adı,Tarih
"Pembe Floral Bluz S/M Beden",5,"Harika ürün tam beden geldi çok memnun kaldım teşekkürler",Ayşe K.,2024-03-01
"Lacivert Pantolon M Beden",2,"Beden uyumsuz çıktı iade etmek istiyorum lütfen",Fatma S.,2024-03-02
"Beyaz Gömlek",4,"Güzel kumaş ama dikişleri biraz kalın olmuş",Zeynep A.,2024-03-03
"Kırmızı Elbise L Beden",3,"Rengi fotoğraftan farklı ama kalitesi fena değil",Elif D.,2024-03-04
"Siyah Kazak",1,"Hiç beğenmedim resimden çok farklı iade ediyorum kesinlikle",Merve T.,2024-03-05`;

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): { rows: ParsedReview[]; error?: string } {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { rows: [], error: "CSV en az 1 başlık + 1 veri satırı içermeli" };

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/"/g, "").trim());

  const idx: Record<string, number> = {};
  headers.forEach((h, i) => {
    if (h.includes("ürün") || h.includes("urun") || h.includes("product")) idx.product_name = i;
    if (h.includes("puan") || h.includes("rating") || h.includes("star") || h.includes("puan")) idx.rating = i;
    if (h.includes("yorum") || h.includes("comment") || h.includes("review")) idx.comment = i;
    if (h.includes("müşteri") || h.includes("musteri") || h.includes("customer") || h.includes("isim") || h.includes("ad ")) idx.customer_name = i;
    if (h.includes("tarih") || h.includes("date")) idx.reviewed_at = i;
  });

  if (idx.product_name === undefined) return { rows: [], error: '"Ürün Adı" sütunu bulunamadı' };
  if (idx.rating === undefined) return { rows: [], error: '"Puan" sütunu bulunamadı' };
  if (idx.comment === undefined) return { rows: [], error: '"Yorum" sütunu bulunamadı' };

  const rows: ParsedReview[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]);
    const product_name = (vals[idx.product_name] ?? "").replace(/^"|"$/g, "").trim();
    const comment = (vals[idx.comment] ?? "").replace(/^"|"$/g, "").trim();
    const rating = parseInt(vals[idx.rating] ?? "0");
    if (!product_name || !comment || isNaN(rating)) continue;
    rows.push({
      product_name,
      rating: Math.min(5, Math.max(1, rating)),
      comment,
      customer_name: idx.customer_name !== undefined ? (vals[idx.customer_name] ?? "").replace(/^"|"$/g, "").trim() || undefined : undefined,
      reviewed_at: idx.reviewed_at !== undefined ? (vals[idx.reviewed_at] ?? "").trim() || undefined : undefined,
    });
  }

  if (!rows.length) return { rows: [], error: "Geçerli yorum satırı bulunamadı" };
  return { rows };
}

function downloadSampleCSV() {
  const blob = new Blob(["﻿" + SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "yorum_sablonu.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function YorumlarPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("tumu");
  const [drafting, setDrafting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // CSV import state
  const [showImport, setShowImport] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedReview[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState<number | null>(null);

  useEffect(() => {
    loadReviews();
    if (typeof window !== "undefined" && window.location.search.includes("csv=1")) {
      setShowImport(true);
    }
  }, []);

  async function loadReviews() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("seller_id", user.id)
      .order("reviewed_at", { ascending: false });
    setReviews(data ?? []);
    setLoading(false);
  }

  async function markReplied(id: string) {
    const supabase = createClient();
    await supabase.from("reviews").update({ is_replied: true }).eq("id", id);
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, is_replied: true } : r)));
  }

  async function draftReply(r: Review) {
    setDrafting(r.id);
    try {
      const res = await fetch("/api/ai/draft-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_id: r.id,
          product_name: r.product_name,
          rating: r.rating,
          comment: r.comment,
          sentiment: r.sentiment,
        }),
      });
      const { reply } = await res.json();
      if (reply) {
        setReviews((prev) =>
          prev.map((rev) => (rev.id === r.id ? { ...rev, suggested_reply: reply } : rev))
        );
      }
    } finally {
      setDrafting(null);
    }
  }

  async function copyToClipboard(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(null);
    setParsedRows([]);
    setImportDone(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { rows, error } = parseCSV(text);
      if (error) setParseError(error);
      else setParsedRows(rows);
    };
    reader.readAsText(file, "UTF-8");
  }

  async function handleImport() {
    if (!parsedRows.length) return;
    setImporting(true);
    setParseError(null);
    try {
      const res = await fetch("/api/reviews/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviews: parsedRows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "İçe aktarma başarısız");
      setImportDone(data.count);
      setParsedRows([]);
      await loadReviews();
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setImporting(false);
    }
  }

  function closeImport() {
    setShowImport(false);
    setParsedRows([]);
    setParseError(null);
    setImportDone(null);
  }

  const filtered = reviews.filter((r) => {
    if (activeFilter === "acil") return r.is_urgent && !r.is_replied;
    if (activeFilter === "bekleyen") return !r.is_replied;
    if (activeFilter === "cevaplandi") return r.is_replied;
    return true;
  });

  const counts = {
    tumu: reviews.length,
    acil: reviews.filter((r) => r.is_urgent && !r.is_replied).length,
    bekleyen: reviews.filter((r) => !r.is_replied).length,
    cevaplandi: reviews.filter((r) => r.is_replied).length,
  };

  return (
    <div className="space-y-6 max-w-3xl w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Yorum Merkezi</h2>
          <p className="text-gray-500 mt-1">AI ile analiz edilmiş yorumlar ve cevap taslakları</p>
        </div>
        <div className="flex items-center gap-3 text-sm flex-wrap">
          {counts.acil > 0 && (
            <span className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-medium">
              <AlertTriangle className="w-4 h-4" /> {counts.acil} acil
            </span>
          )}
          <span className="flex items-center gap-1 text-gray-500">
            <Clock className="w-4 h-4" /> {counts.bekleyen} bekliyor
          </span>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <Upload className="w-4 h-4" /> CSV İçe Aktar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={clsx(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
              activeFilter === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {label}
            <span
              className={clsx(
                "ml-1.5 text-xs px-1.5 py-0.5 rounded-full",
                activeFilter === key ? "bg-orange-100 text-orange-600" : "bg-gray-200 text-gray-500"
              )}
            >
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <ReviewSkeleton /><ReviewSkeleton /><ReviewSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          {reviews.length === 0 ? (
            <>
              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">Henüz yorum yok</p>
              <p className="text-gray-400 text-sm mt-1 mb-4">Trendyol yorumlarını CSV olarak içe aktar veya API bağlantısı kur</p>
              <button
                onClick={() => setShowImport(true)}
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                <Upload className="w-4 h-4" /> CSV İçe Aktar
              </button>
            </>
          ) : (
            <>
              <Filter className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Bu filtrede yorum yok.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className={clsx(
                "bg-white rounded-xl border p-5 space-y-3 transition-all",
                r.is_urgent && !r.is_replied ? "border-red-200 shadow-sm shadow-red-50" : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{r.product_name}</p>
                  {r.customer_name && <p className="text-xs text-gray-400 mt-0.5">{r.customer_name}</p>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-yellow-400 text-sm">
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </span>
                    {r.sentiment && sentimentLabel[r.sentiment] && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sentimentLabel[r.sentiment].color}`}>
                        {sentimentLabel[r.sentiment].label}
                      </span>
                    )}
                    {r.is_replied && (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Cevaplandı
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {new Date(r.reviewed_at).toLocaleDateString("tr-TR")}
                </span>
              </div>

              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 leading-relaxed">{r.comment}</p>

              {r.suggested_reply && !r.is_replied && (
                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50 space-y-2">
                  <p className="text-xs text-orange-600 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Cevap Taslağı
                  </p>
                  <p className="text-sm text-orange-900 leading-relaxed">{r.suggested_reply}</p>
                  <div className="flex gap-2 pt-1 flex-wrap">
                    <button
                      onClick={() => markReplied(r.id)}
                      className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      ✓ Cevapladım
                    </button>
                    <button
                      onClick={() => copyToClipboard(r.id, r.suggested_reply!)}
                      className="text-xs text-orange-600 border border-orange-300 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copied === r.id ? "Kopyalandı!" : "Kopyala"}
                    </button>
                    <button
                      onClick={() => draftReply(r)}
                      disabled={drafting === r.id}
                      className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                    >
                      {drafting === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Yeniden Oluştur
                    </button>
                  </div>
                </div>
              )}

              {!r.suggested_reply && !r.is_replied && (
                <button
                  onClick={() => draftReply(r)}
                  disabled={drafting === r.id}
                  className="flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-medium disabled:opacity-60 transition-colors"
                >
                  {drafting === r.id
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Oluşturuluyor...</>
                    : <><Sparkles className="w-3.5 h-3.5" /> AI ile cevap taslağı oluştur</>}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── CSV İçe Aktarma Modalı ─────────────────────── */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">CSV ile Yorum Aktar</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Trendyol yorumlarını toplu analiz et</p>
                </div>
              </div>
              <button onClick={closeImport} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {importDone !== null ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-gray-900">{importDone} yorum içe aktarıldı</p>
                  <p className="text-sm text-gray-500 mt-1">AI analizi tamamlandı. Yorum merkezinde görüntüleyebilirsin.</p>
                  <button
                    onClick={closeImport}
                    className="mt-5 bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
                  >
                    Yorumları Gör
                  </button>
                </div>
              ) : (
                <>
                  {/* Şablon indir */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-blue-900">CSV şablonu</p>
                      <p className="text-xs text-blue-600 mt-0.5">Gerekli sütunlar: Ürün Adı, Puan, Yorum</p>
                    </div>
                    <button
                      onClick={downloadSampleCSV}
                      className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" /> Şablonu İndir
                    </button>
                  </div>

                  {/* Dosya yükleme */}
                  <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-colors group">
                    <Upload className="w-8 h-8 text-gray-300 group-hover:text-orange-400 mb-2 transition-colors" />
                    <p className="text-sm text-gray-600 font-medium">CSV dosyası seç</p>
                    <p className="text-xs text-gray-400 mt-1">veya buraya sürükle bırak</p>
                    <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
                  </label>

                  {/* Önizleme */}
                  {parsedRows.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                      <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {parsedRows.length} yorum okundu — AI analiz edecek
                      </p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {parsedRows.slice(0, 3).map((r, i) => (
                          <p key={i} className="text-xs text-green-700 truncate">
                            {i + 1}. {r.product_name} — {r.rating}★ — {r.comment.slice(0, 50)}{r.comment.length > 50 ? "…" : ""}
                          </p>
                        ))}
                        {parsedRows.length > 3 && (
                          <p className="text-xs text-green-600 font-medium">+{parsedRows.length - 3} yorum daha</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Hata */}
                  {parseError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                      {parseError}
                    </div>
                  )}

                  {/* Import butonu */}
                  {parsedRows.length > 0 && (
                    <button
                      onClick={handleImport}
                      disabled={importing}
                      className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 transition-colors"
                    >
                      {importing ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> AI analiz ediyor...</>
                      ) : (
                        <><Sparkles className="w-4 h-4" /> {parsedRows.length} Yorumu Analiz Et</>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
