"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Zap, CheckCircle, Loader2, Star, Users, Gift,
  MessageSquare, RotateCcw, BarChart2, ArrowRight,
} from "lucide-react";

const FEATURES = [
  { icon: MessageSquare, label: "AI Yorum Yanıtlama", desc: "Tek tıkla kişiselleştirilmiş cevaplar" },
  { icon: RotateCcw, label: "İade Analizi", desc: "Tekrar eden iadelerin kök nedenini bul" },
  { icon: BarChart2, label: "Rakip Takibi", desc: "Fiyat & yorum karşılaştırması" },
];

const TESTIMONIALS = [
  { name: "Ayşe K.", shop: "Ayşe Tekstil", text: "İlk haftada yanıt süremiz 3 güne düştü." },
  { name: "Mehmet T.", shop: "MT Elektronik", text: "İade oranım %34 azaldı, hayat kurtardı." },
  { name: "Selin A.", shop: "Selin Butik", text: "Rakip analizi sayesinde fiyatlarımı optimize ettim." },
];

function BetaForm() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") ?? "";
  const inviterName = searchParams.get("by") ?? "";

  const [email, setEmail] = useState("");
  const [shopName, setShopName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [count] = useState(847);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.from("waitlist").insert({
      email,
      shop_name: shopName || null,
      referred_by: refCode || null,
    });

    if (error) {
      if (error.code === "23505") {
        setError("Bu e-posta zaten listede!");
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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">SatıcıPilot</span>
        </Link>
        <Link href="/auth/giris" className="text-sm text-gray-400 hover:text-white transition-colors">
          Zaten hesabın var mı? Giriş yap →
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left */}
          <div>
            {/* Invite badge */}
            {refCode && (
              <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-sm font-medium px-4 py-2 rounded-full mb-6">
                <Gift className="w-4 h-4" />
                {inviterName ? `${inviterName} seni davet etti` : "Davet linki ile geldin"} — özel erişim açık!
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Trendyol mağazanı{" "}
              <span className="text-orange-500">AI ile büyüt</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Yorum yönetiminden rakip analizine, iade takibinden kampanyalara — hepsi tek panelde.
              Beta listesine katıl, ilk kullananlardan ol.
            </p>

            {/* Counter */}
            <div className="flex items-center gap-2 mb-8">
              <div className="flex -space-x-2">
                {["bg-orange-500", "bg-blue-500", "bg-green-500", "bg-purple-500"].map((c, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-gray-950 flex items-center justify-center text-xs font-bold`}>
                    {["A", "M", "S", "K"][i]}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{count}+ satıcı listede</p>
                <p className="text-xs text-gray-500">Yeni üye ekleniyor</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-10">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.label}</p>
                    <p className="text-xs text-gray-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="space-y-3">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-1 mb-1.5">
                    {[1,2,3,4,5].map((s) => <Star key={s} className="w-3 h-3 fill-orange-400 text-orange-400" />)}
                  </div>
                  <p className="text-sm text-gray-300 mb-2">"{t.text}"</p>
                  <p className="text-xs text-gray-500 font-medium">{t.name} · {t.shop}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="md:sticky md:top-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              {done ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Listeye katıldın!</h2>
                  <p className="text-gray-400 text-sm mb-6">
                    Erken erişim açıldığında <strong className="text-white">{email}</strong> adresine ilk haber biz göndereceğiz.
                  </p>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-left">
                    <p className="text-sm text-orange-400 font-semibold mb-1">Sırayı atlamak ister misin?</p>
                    <p className="text-xs text-gray-400 mb-3">Arkadaşlarını davet et, erken erişimi hızlandır.</p>
                    <Link
                      href="/auth/kayit"
                      className="flex items-center justify-center gap-2 w-full bg-orange-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
                    >
                      Hemen Başla <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-1.5 bg-orange-500/15 text-orange-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                      <Zap className="w-3.5 h-3.5" />
                      Beta Erken Erişim
                    </div>
                    <h2 className="text-2xl font-bold text-white">Listeye Katıl</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      Ücretsiz — kredi kartı gerekmez
                    </p>
                  </div>

                  {refCode && (
                    <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2.5 mb-4">
                      <Gift className="w-4 h-4 text-orange-400 flex-shrink-0" />
                      <p className="text-xs text-orange-300">Davet kodu uygulandı — öncelikli erişim aktif!</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Mağaza Adı <span className="text-gray-600">(opsiyonel)</span></label>
                      <input
                        type="text"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="Örn: Ayşe Tekstil"
                        className="w-full px-4 py-3 rounded-xl text-sm bg-white/10 border border-white/15 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">E-posta *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="ornek@email.com"
                        className="w-full px-4 py-3 rounded-xl text-sm bg-white/10 border border-white/15 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    {error && (
                      <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-orange-500 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {loading ? "Ekleniyor..." : "Ücretsiz Listeye Katıl"}
                      {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </form>

                  <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
                    {[
                      "Erken erişim açıldığında ilk sen haberdar olursun",
                      "Lansman öncesi %50 indirim",
                      "İptal için bir şey yapmana gerek yok",
                    ].map((t) => (
                      <div key={t} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-500">{t}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Already registered */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Zaten hesabın var mı?{" "}
              <Link href="/auth/giris" className="text-orange-400 font-semibold hover:underline">
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BetaPage() {
  return (
    <Suspense>
      <BetaForm />
    </Suspense>
  );
}
