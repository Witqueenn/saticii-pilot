"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle, Mail } from "lucide-react";

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
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center space-y-5">
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-orange-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">E-postanı kontrol et</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            <strong className="text-gray-700">{email}</strong> adresine doğrulama linki gönderdik.
            Linke tıkladıktan sonra giriş yapabilirsin.
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
          {["Spam klasörünü kontrol et", "Link 24 saat geçerli", "Sorun yaşarsan tekrar kayıt olmayı dene"].map((t) => (
            <div key={t} className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              {t}
            </div>
          ))}
        </div>
        <Link href="/giris" className="inline-block text-sm text-orange-600 font-semibold hover:underline">
          Giriş sayfasına dön →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">14 gün ücretsiz başla</h2>
        <p className="text-gray-500 text-sm mt-1">Kredi kartı gerekmez, kurulum yok</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mağaza Adı</label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            required
            placeholder="Ayşe'nin Butik"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 transition-all"
          />
        </div>

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
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Şifre</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="En az 8 karakter"
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
          className="w-full bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-100 mt-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Hesap oluşturuluyor..." : "Ücretsiz Başla"}
        </button>
      </form>

      <p className="text-xs text-gray-400 text-center mt-4">
        Kayıt olarak{" "}
        <a href="#" className="hover:underline">Kullanım Şartları</a>'nı kabul etmiş olursun.
      </p>

      <p className="text-sm text-gray-500 text-center mt-4">
        Zaten hesabın var mı?{" "}
        <Link href="/giris" className="text-orange-600 font-semibold hover:underline">
          Giriş Yap
        </Link>
      </p>
    </div>
  );
}
