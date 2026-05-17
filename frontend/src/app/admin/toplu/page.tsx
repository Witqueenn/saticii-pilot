"use client";

import { useEffect, useState } from "react";
import { Megaphone, Send, Loader2, CheckCircle, Users } from "lucide-react";

interface Counts { all: number; paid: number; temel: number; profesyonel: number; marketing: number; }

const TARGETS = [
  { key: "all", label: "Tüm Aktif Satıcılar" },
  { key: "paid", label: "Ücretli Satıcılar (Pro + Marketing)" },
  { key: "temel", label: "Temel Plan" },
  { key: "profesyonel", label: "Pro Plan" },
  { key: "marketing", label: "Marketing Plan" },
];

export default function TopluPage() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [target, setTarget] = useState("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);

  useEffect(() => {
    fetch("/api/admin/email").then((r) => r.json()).then(setCounts);
  }, []);

  async function send() {
    if (!subject || !body) return;
    setSending(true);
    setResult(null);
    const res = await fetch("/api/admin/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body, target }),
    });
    const data = await res.json();
    setResult(data);
    setSending(false);
    if (data.sent > 0) { setSubject(""); setBody(""); }
  }

  const recipientCount = counts ? (counts[target as keyof Counts] ?? 0) : 0;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Toplu İşlemler</h2>
        <p className="text-gray-500 mt-1">Tüm satıcılara veya belirli segmentlere duyuru gönder</p>
      </div>

      {/* Toplu email */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Megaphone className="w-4 h-4 text-orange-500" />
          <h3 className="font-semibold text-gray-900">Toplu Email Gönder</h3>
        </div>

        {/* Hedef kitle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hedef Kitle</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TARGETS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTarget(key)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                  target === key ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className={`text-sm font-medium ${target === key ? "text-orange-700" : "text-gray-700"}`}>{label}</span>
                {counts && (
                  <span className={`text-sm font-bold ml-2 ${target === key ? "text-orange-600" : "text-gray-400"}`}>
                    {counts[key as keyof Counts] ?? 0}
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <Users className="w-3 h-3" />
            Seçili: <strong className="text-gray-700">{recipientCount} satıcı</strong>
          </p>
        </div>

        {/* Konu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Konu</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Yeni özellik duyurusu — SatıcıPilot"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
          />
        </div>

        {/* İçerik */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">İçerik</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            placeholder="Email içeriğini buraya yaz..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">Düz metin, satır sonları korunur.</p>
        </div>

        {result && (
          <div className={`flex items-center gap-2 rounded-xl p-3 text-sm ${result.sent > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {result.sent > 0
              ? `${result.sent} satıcıya email gönderildi.${result.failed > 0 ? ` ${result.failed} başarısız.` : ""}`
              : "Gönderim başarısız."}
          </div>
        )}

        <button
          onClick={send}
          disabled={sending || !subject || !body || recipientCount === 0}
          className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? "Gönderiliyor..." : `${recipientCount} Satıcıya Gönder`}
        </button>
      </div>

      {/* Uyarı kutusu */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">⚠️ Dikkat</p>
        <ul className="space-y-0.5 text-amber-700">
          <li>• Bu işlem geri alınamaz — email gerçek satıcılara gider</li>
          <li>• Test için önce sadece kendi e-postanla dene</li>
          <li>• Toplu email öncesi içeriği mutlaka kontrol et</li>
        </ul>
      </div>
    </div>
  );
}
