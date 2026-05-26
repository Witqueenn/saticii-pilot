"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  HelpCircle, CheckCircle, Clock, Sparkles,
  Loader2, Copy, Package,
} from "lucide-react";
import { clsx } from "clsx";

interface Question {
  id: string;
  product_name: string | null;
  product_id: string | null;
  question: string;
  suggested_answer: string | null;
  is_answered: boolean;
  asked_at: string;
}

type FilterType = "tumu" | "bekleyen" | "cevaplandi";

const filters: { key: FilterType; label: string }[] = [
  { key: "tumu",       label: "Tümü" },
  { key: "bekleyen",   label: "Bekleyen" },
  { key: "cevaplandi", label: "Cevaplandı" },
];

export default function SorularPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("tumu");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drafting, setDrafting] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<Record<string, { trendyol_ok: boolean; message: string }>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [editingAnswer, setEditingAnswer] = useState<Record<string, string>>({});

  useEffect(() => { loadQuestions(); }, []);

  async function loadQuestions() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("questions")
      .select("*")
      .eq("seller_id", user.id)
      .order("asked_at", { ascending: false });
    setQuestions(data ?? []);
    setLoading(false);
  }

  async function draftAnswer(q: Question) {
    setDrafting(q.id);
    try {
      const res = await fetch("/api/ai/draft-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: q.id,
          product_name: q.product_name ?? "Ürün",
          question: q.question,
        }),
      });
      const { answer } = await res.json();
      if (answer) {
        setQuestions((prev) =>
          prev.map((item) => item.id === q.id ? { ...item, suggested_answer: answer } : item)
        );
        setEditingAnswer((prev) => ({ ...prev, [q.id]: answer }));
      }
    } finally {
      setDrafting(null);
    }
  }

  async function sendAnswer(q: Question) {
    const answerText = getAnswerText(q);
    if (!answerText.trim()) return;
    setSending(q.id);
    try {
      const res = await fetch("/api/trendyol/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: q.id, answer_text: answerText }),
      });
      const data = await res.json();
      setQuestions((prev) => prev.map((item) => item.id === q.id ? { ...item, is_answered: true, suggested_answer: answerText } : item));
      setSendResult((prev) => ({ ...prev, [q.id]: { trendyol_ok: !!data.trendyol_ok, message: data.message ?? "" } }));
    } finally {
      setSending(null);
    }
  }

  async function markAnswered(id: string) {
    const supabase = createClient();
    await supabase.from("questions").update({ is_answered: true }).eq("id", id);
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, is_answered: true } : q));
  }

  async function copyToClipboard(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function getAnswerText(q: Question): string {
    return editingAnswer[q.id] ?? q.suggested_answer ?? "";
  }

  const filtered = questions.filter((q) => {
    if (activeFilter === "bekleyen") return !q.is_answered;
    if (activeFilter === "cevaplandi") return q.is_answered;
    return true;
  });

  const pendingCount = questions.filter((q) => !q.is_answered).length;

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl w-full">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Müşteri Soruları</h2>
        <p className="text-gray-500 mt-1">
          {pendingCount > 0
            ? <span className="text-orange-600 font-medium">{pendingCount} bekleyen soru</span>
            : "Tüm sorular cevaplandı"}
          {" "}&middot; {questions.length} toplam
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={clsx(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeFilter === f.key
                ? "bg-orange-500 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300"
            )}
          >
            {f.label}
            {f.key === "bekleyen" && pendingCount > 0 && (
              <span className="ml-1.5 bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Soru bulunamadı</p>
          <p className="text-gray-300 text-xs mt-1">Trendyol&apos;dan sorular otomatik olarak senkronize edilir</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => {
            const isOpen = expanded === q.id;
            const answerText = getAnswerText(q);
            return (
              <div
                key={q.id}
                className={clsx(
                  "bg-white rounded-xl border overflow-hidden transition-colors",
                  q.is_answered ? "border-green-200" : "border-orange-200"
                )}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : q.id)}
                  className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {q.product_name && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Package className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-400 truncate">{q.product_name}</span>
                        </div>
                      )}
                      <p className="text-sm font-medium text-gray-800 leading-snug">{q.question}</p>
                      <p className="text-xs text-gray-400 mt-1.5">
                        {new Date(q.asked_at).toLocaleDateString("tr-TR", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {q.is_answered ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Cevaplandı
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                          <Clock className="w-3 h-3" /> Bekliyor
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                    {/* AI draft button */}
                    <button
                      onClick={() => draftAnswer(q)}
                      disabled={drafting === q.id}
                      className="flex items-center gap-2 text-sm bg-orange-50 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-100 disabled:opacity-60 transition-colors font-medium"
                    >
                      {drafting === q.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Sparkles className="w-4 h-4" />}
                      {drafting === q.id ? "Taslak oluşturuluyor..." : "AI ile Taslak Oluştur"}
                    </button>

                    {answerText && (
                      <div className="space-y-2">
                        <textarea
                          value={answerText}
                          onChange={(e) => setEditingAnswer((prev) => ({ ...prev, [q.id]: e.target.value }))}
                          rows={3}
                          className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                        />
                        <div className="flex gap-2 flex-wrap items-center">
                          {!q.is_answered && (
                            <button
                              onClick={() => sendAnswer(q)}
                              disabled={sending === q.id || !answerText.trim()}
                              className="flex items-center gap-1.5 text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60"
                            >
                              {sending === q.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                              {sending === q.id ? "Gönderiliyor…" : "Trendyol'a Gönder"}
                            </button>
                          )}
                          <button
                            onClick={() => copyToClipboard(q.id, answerText)}
                            className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-orange-300 transition-colors"
                          >
                            {copied === q.id ? (
                              <><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Kopyalandı</>
                            ) : (
                              <><Copy className="w-3.5 h-3.5" /> Kopyala</>
                            )}
                          </button>
                        </div>
                        {sendResult[q.id] && (
                          <p className={`text-xs mt-1 ${sendResult[q.id].trendyol_ok ? "text-green-600" : "text-amber-600"}`}>
                            {sendResult[q.id].message}
                          </p>
                        )}
                      </div>
                    )}

                    {!answerText && !q.is_answered && (
                      <button
                        onClick={() => markAnswered(q.id)}
                        className="flex items-center gap-1.5 text-xs text-green-700 border border-green-200 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Cevaplandı Olarak İşaretle
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
