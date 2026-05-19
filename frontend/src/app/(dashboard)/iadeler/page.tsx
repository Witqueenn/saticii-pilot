"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RotateCcw, Upload, X, Download, FileText, CheckCircle, Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

interface Return {
  id: string;
  product_name: string;
  reason: string;
  customer_comment: string | null;
  returned_at: string;
}

interface ParsedReturn {
  product_name: string;
  reason_text: string;
  customer_comment?: string;
  returned_at?: string;
}

interface Pattern {
  product_name: string;
  total: number;
  reasons: Record<string, number>;
  topReason: string;
  recommendation: string;
}

const reasonLabel: Record<string, string> = {
  beden_uyumsuzlugu: "Beden Uyumsuzluğu",
  renk_farki:        "Renk Farkı",
  kalite_sorunu:     "Kalite Sorunu",
  yanlis_urun:       "Yanlış Ürün",
  hasarli:           "Hasarlı Geldi",
  diger:             "Diğer",
};

const reasonColor: Record<string, string> = {
  beden_uyumsuzlugu: "bg-orange-400",
  renk_farki:        "bg-blue-400",
  kalite_sorunu:     "bg-red-400",
  yanlis_urun:       "bg-purple-400",
  hasarli:           "bg-yellow-400",
  diger:             "bg-gray-400",
};

const reasonRecommendation: Record<string, string> = {
  beden_uyumsuzlugu: "Ürün sayfasına ölçü tablosu ve beden karşılaştırma rehberi ekle. Modelin üstündeki bedeni ve ölçülerini de belirt.",
  renk_farki:        "Ürün fotoğraflarını doğal gün ışığında güncelle. Renk tonunu açıklamada belirt.",
  kalite_sorunu:     "Ürün açıklamasında kumaş içeriğini ve bakım talimatlarını netleştir. Varsa sertifika bilgilerini ekle.",
  yanlis_urun:       "Ürün başlığı, kategori ve barkod bilgilerini kontrol et. Benzer ürünlerle karışıyor olabilir.",
  hasarli:           "Paketleme yöntemini gözden geçir. Kırılgan ürünler için ekstra koruma kullan.",
  diger:             "Müşteri yorumlarını incele ve sık tekrarlanan şikayetlere göre ürün açıklamasını güncelle.",
};

const SAMPLE_CSV = `Ürün Adı,İade Sebebi,Müşteri Yorumu,Tarih
"Pembe Floral Bluz S/M Beden",Beden uyumsuzluğu,"S beden aldım ama çok büyük geldi iade etmek istiyorum",2024-03-01
"Lacivert Pantolon M Beden",Renk farkı,"Fotoğraftan çok daha koyu renk geldi beklediğim gibi değil",2024-03-02
"Kırmızı Elbise L",Kalite sorunu,"Kumaş çok ince ve arka dikişi açık geldi",2024-03-03
"Beyaz Gömlek",Hasarlı geldi,"Koli içinde ezilmiş geldi kolları kırışmış",2024-03-04
"Siyah Kazak M",Beden uyumsuzluğu,"M beden aldım ama neredeyse S gibi dar oldu",2024-03-05`;

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === "," && !inQuotes) { result.push(current.trim()); current = ""; }
    else { current += char; }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): { rows: ParsedReturn[]; error?: string } {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { rows: [], error: "CSV en az 1 başlık + 1 veri satırı içermeli" };

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/"/g, "").trim());
  const idx: Record<string, number> = {};
  headers.forEach((h, i) => {
    if (h.includes("ürün") || h.includes("urun") || h.includes("product")) idx.product_name = i;
    if (h.includes("iade") || h.includes("sebep") || h.includes("reason") || h.includes("neden")) idx.reason_text = i;
    if (h.includes("yorum") || h.includes("comment") || h.includes("not")) idx.customer_comment = i;
    if (h.includes("tarih") || h.includes("date")) idx.returned_at = i;
  });

  if (idx.product_name === undefined) return { rows: [], error: '"Ürün Adı" sütunu bulunamadı' };
  if (idx.reason_text === undefined) return { rows: [], error: '"İade Sebebi" sütunu bulunamadı' };

  const rows: ParsedReturn[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]);
    const product_name = (vals[idx.product_name] ?? "").replace(/^"|"$/g, "").trim();
    const reason_text = (vals[idx.reason_text] ?? "").replace(/^"|"$/g, "").trim();
    if (!product_name || !reason_text) continue;
    rows.push({
      product_name,
      reason_text,
      customer_comment: idx.customer_comment !== undefined ? (vals[idx.customer_comment] ?? "").replace(/^"|"$/g, "").trim() || undefined : undefined,
      returned_at: idx.returned_at !== undefined ? (vals[idx.returned_at] ?? "").trim() || undefined : undefined,
    });
  }

  if (!rows.length) return { rows: [], error: "Geçerli iade satırı bulunamadı" };
  return { rows };
}

function downloadSampleCSV() {
  const blob = new Blob(["﻿" + SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "iade_sablonu.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function AIPatternCard({ returns }: { returns: Return[] }) {
  const totalByReason: Record<string, number> = {};
  returns.forEach((r) => {
    totalByReason[r.reason] = (totalByReason[r.reason] ?? 0) + 1;
  });

  const sorted = Object.entries(totalByReason).sort((a, b) => b[1] - a[1]);
  if (!sorted.length) return null;

  const [topReason, topCount] = sorted[0];
  const pct = Math.round((topCount / returns.length) * 100);
  const productsWithTop = new Set(
    returns.filter((r) => r.reason === topReason).map((r) => r.product_name)
  ).size;

  return (
    <div className="bg-white rounded-xl border border-dashed border-orange-300 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-orange-500" />
        </div>
        <p className="text-sm font-semibold text-gray-700">AI Kalıp Tespiti</p>
        <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
          {sorted.length} sebep
        </span>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 text-sm leading-relaxed space-y-2">
        <p className="text-gray-700">
          İadelerin{" "}
          <span className="font-semibold text-gray-900">
            %{pct}'i {reasonLabel[topReason] ?? topReason} kaynaklı.
          </span>
          {productsWithTop > 1 && ` ${productsWithTop} farklı üründe aynı sorun tekrarlıyor.`}
        </p>
        <p className="text-xs text-gray-500">
          {reasonRecommendation[topReason] ?? reasonRecommendation.diger}
        </p>
      </div>
    </div>
  );
}

function buildPatterns(returns: Return[]): Pattern[] {
  const map: Record<string, { total: number; reasons: Record<string, number> }> = {};
  returns.forEach((r) => {
    if (!map[r.product_name]) map[r.product_name] = { total: 0, reasons: {} };
    map[r.product_name].total++;
    map[r.product_name].reasons[r.reason] = (map[r.product_name].reasons[r.reason] ?? 0) + 1;
  });
  return Object.entries(map)
    .map(([product_name, data]) => {
      const topReason = Object.entries(data.reasons).sort((a, b) => b[1] - a[1])[0][0];
      return { product_name, total: data.total, reasons: data.reasons, topReason, recommendation: reasonRecommendation[topReason] ?? reasonRecommendation.diger };
    })
    .sort((a, b) => b.total - a.total);
}

export default function IadelerPage() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);

  const [showImport, setShowImport] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedReturn[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState<number | null>(null);

  useEffect(() => {
    loadReturns();
    if (typeof window !== "undefined" && window.location.search.includes("csv=1")) {
      setShowImport(true);
    }
  }, []);

  async function loadReturns() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("returns")
      .select("*")
      .eq("seller_id", user.id)
      .order("returned_at", { ascending: false });
    setReturns(data ?? []);
    setLoading(false);
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
      const res = await fetch("/api/returns/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returns: parsedRows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "İçe aktarma başarısız");
      setImportDone(data.count);
      setParsedRows([]);
      await loadReturns();
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

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekReturns = returns.filter((r) => new Date(r.returned_at) >= weekAgo).length;

  const patterns = buildPatterns(returns);

  // Genel sebep dağılımı
  const totalByReason: Record<string, number> = {};
  returns.forEach((r) => {
    totalByReason[r.reason] = (totalByReason[r.reason] ?? 0) + 1;
  });
  const topReason = Object.entries(totalByReason).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="space-y-6 max-w-3xl w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">İade Analizi</h2>
          <p className="text-gray-500 mt-1">Tekrar eden iade sebepleri ve AI önerileri</p>
        </div>
        <button
          onClick={() => setShowImport(true)}
          className="flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600 text-sm transition-colors"
        >
          <Upload className="w-4 h-4" /> CSV İçe Aktar
        </button>
      </div>

      {/* KPI kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Toplam İade</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? "—" : returns.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Bu Hafta</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? "—" : weekReturns}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Farklı Ürün</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? "—" : patterns.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Başlıca Sebep</p>
          <p className="text-sm font-bold text-gray-900 mt-1 leading-tight">
            {loading ? "—" : topReason ? reasonLabel[topReason] : "—"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-32" /></div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ))}
        </div>
      ) : patterns.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <RotateCcw className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">Henüz iade kaydı yok</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">İade verilerini CSV olarak yükle, AI sebepler üzerinden kalıp analizi yapsın</p>
          <button
            onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            <Upload className="w-4 h-4" /> CSV İçe Aktar
          </button>
        </div>
      ) : (
        <>
          <AIPatternCard returns={returns} />

          {/* Genel sebep dağılımı */}
          {returns.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Genel Sebep Dağılımı</h3>
              <div className="space-y-2">
                {Object.entries(totalByReason)
                  .sort((a, b) => b[1] - a[1])
                  .map(([reason, count]) => (
                    <div key={reason} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-40 flex-shrink-0">{reasonLabel[reason]}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className={`${reasonColor[reason] ?? "bg-gray-400"} h-2 rounded-full transition-all`}
                          style={{ width: `${(count / returns.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-16 text-right flex-shrink-0">
                        {count} (%{Math.round((count / returns.length) * 100)})
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Ürün bazlı kalıp analizi */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Ürün Bazlı Kalıp Analizi</h3>
            {patterns.map((p) => (
              <div key={p.product_name} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{p.product_name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {p.total} iade · Başlıca: <strong>{reasonLabel[p.topReason]}</strong>
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2 ${
                    p.total >= 5 ? "bg-red-100 text-red-700" :
                    p.total >= 3 ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {p.total >= 5 ? "Yüksek Öncelik" : p.total >= 3 ? "Orta Öncelik" : "Düşük Öncelik"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {Object.entries(p.reasons)
                    .sort((a, b) => b[1] - a[1])
                    .map(([reason, count]) => (
                      <div key={reason} className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`${reasonColor[reason] ?? "bg-gray-400"} h-1.5 rounded-full`}
                            style={{ width: `${(count / p.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-40 flex-shrink-0">
                          {reasonLabel[reason]} ({count})
                        </span>
                      </div>
                    ))}
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-xs text-orange-700 font-medium mb-1">AI Önerisi</p>
                  <p className="text-sm text-orange-900">{p.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </>
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
                  <h3 className="font-semibold text-gray-900">CSV ile İade Aktar</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Toplu yükle, AI sebepleri otomatik sınıflandırsın</p>
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
                  <p className="text-lg font-semibold text-gray-900">{importDone} iade içe aktarıldı</p>
                  <p className="text-sm text-gray-500 mt-1">AI kalıp analizi tamamlandı.</p>
                  <button
                    onClick={closeImport}
                    className="mt-5 bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
                  >
                    Analize Bak
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-blue-900">CSV şablonu</p>
                      <p className="text-xs text-blue-600 mt-0.5">Gerekli sütunlar: Ürün Adı, İade Sebebi</p>
                    </div>
                    <button
                      onClick={downloadSampleCSV}
                      className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" /> Şablonu İndir
                    </button>
                  </div>

                  <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-colors group">
                    <Upload className="w-8 h-8 text-gray-300 group-hover:text-orange-400 mb-2 transition-colors" />
                    <p className="text-sm text-gray-600 font-medium">CSV dosyası seç</p>
                    <p className="text-xs text-gray-400 mt-1">veya buraya sürükle bırak</p>
                    <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
                  </label>

                  {parsedRows.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                      <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {parsedRows.length} kayıt okundu — AI sınıflandıracak
                      </p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {parsedRows.slice(0, 3).map((r, i) => (
                          <p key={i} className="text-xs text-green-700 truncate">
                            {i + 1}. {r.product_name} — {r.reason_text.slice(0, 50)}{r.reason_text.length > 50 ? "…" : ""}
                          </p>
                        ))}
                        {parsedRows.length > 3 && (
                          <p className="text-xs text-green-600 font-medium">+{parsedRows.length - 3} kayıt daha</p>
                        )}
                      </div>
                    </div>
                  )}

                  {parseError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {parseError}
                    </div>
                  )}

                  {parsedRows.length > 0 && (
                    <button
                      onClick={handleImport}
                      disabled={importing}
                      className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 transition-colors"
                    >
                      {importing
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> AI analiz ediyor...</>
                        : <><RotateCcw className="w-4 h-4" /> {parsedRows.length} Kaydı İçe Aktar</>}
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
