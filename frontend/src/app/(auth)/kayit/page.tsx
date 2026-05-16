"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle } from "lucide-react";

export default function KayitPage() {
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { shop_name: shopName },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message === "User already registered"
        ? "Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene."
        : "Kayıt sırasında bir hata oluştu.");
      setLoading(false);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">E-postanı Doğrula</h2>
        <p className="text-sm text-gray-500">
          <strong>{email}</strong> adresine doğrulama linki gönderdik.
          Linke tıkladıktan sonra giriş yapabilirsin.
        </p>
        <Link
          href="/giris"
          className="inline-block text-sm text-orange-600 font-medium hover:underline"
        >
          Giriş sayfasına dön
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Hesap Oluştur</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Mağaza Adı
          </label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            required
            placeholder="Ayşe'nin Butik"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            E-posta
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="ornek@email.com"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Şifre
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="En az 8 karakter"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        Zaten hesabın var mı?{" "}
        <Link href="/giris" className="text-orange-600 font-medium hover:underline">
          Giriş Yap
        </Link>
      </p>
    </div>
  );
}
