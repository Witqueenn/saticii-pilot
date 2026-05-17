"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

export default function SifremiUnuttumPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/sifre-sifirla`,
    });

    if (error) {
      setError("Bir hata oluştu. E-posta adresini kontrol et.");
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center space-y-5">
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-orange-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mail gönderildi</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            <strong className="text-gray-700">{email}</strong> adresine şifre sıfırlama linki gönderdik.
          </p>
        </div>
        <Link href="/giris" className="inline-flex items-center gap-2 text-sm text-orange-600 font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Giriş sayfasına dön
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Şifreni sıfırla</h2>
        <p className="text-gray-500 text-sm mt-1">E-posta adresine sıfırlama linki gönderelim</p>
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 transition-all"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-100"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Gönderiliyor..." : "Sıfırlama Linki Gönder"}
        </button>
      </form>

      <Link href="/giris" className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-600 mt-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Giriş sayfasına dön
      </Link>
    </div>
  );
}
