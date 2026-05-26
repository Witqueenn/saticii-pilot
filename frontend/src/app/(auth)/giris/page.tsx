"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function GirisPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        if (authError.message === "Email not confirmed") {
          setError("E-postanı doğrulamadan giriş yapamazsın. Gelen kutunu kontrol et.");
        } else if (authError.message?.includes("Invalid login credentials")) {
          setError("E-posta veya şifre hatalı.");
        } else {
          setError(authError.message || "Giriş yapılamadı. Tekrar dene.");
        }
        return;
      }

      // Full page reload ensures middleware sees the fresh session cookie.
      window.location.href = "/genel";
    } catch (err) {
      setError(`Bağlantı hatası: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Hoş geldin</h2>
        <p className="text-gray-500 text-sm mt-1">Hesabına giriş yap</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="ornek@email.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-700">Şifre</label>
            <Link href="/sifremi-unuttum" className="text-xs text-orange-600 hover:underline">
              Şifremi unuttum
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 transition-all"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-100"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        Hesabın yok mu?{" "}
        <Link href="/kayit" className="text-orange-600 font-semibold hover:underline">
          Ücretsiz kayıt ol
        </Link>
      </p>
    </div>
  );
}
