"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Loader2 } from "lucide-react";

export default function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.from("waitlist").insert({ email });

    if (error) {
      if (error.code === "23505") {
        setError("Bu e-posta zaten listede.");
      } else {
        setError("Bir hata oluştu, tekrar dene.");
      }
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  return (
    <section className="px-6 py-20 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-3">
          Erken erişim listesine katıl
        </h2>
        <p className="text-gray-400 mb-8">
          Lansman öncesi %50 indirim fırsatını kaçırma. Satıcılar erken erişim için listeye katılıyor.
        </p>

        {done ? (
          <div className="flex items-center justify-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-6 py-4">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-400 font-medium">Listeye eklendin! Yakında haberdar edeceğiz.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e-posta@adresin.com"
              className="flex-1 px-4 py-3 rounded-xl text-sm bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Ekleniyor..." : "Listeye Katıl"}
            </button>
          </form>
        )}

        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </div>
    </section>
  );
}
