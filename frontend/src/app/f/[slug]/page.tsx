"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Star, CheckCircle } from "lucide-react";

interface FormInfo {
  seller_name: string;
}

export default function CustomerFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const productRef = searchParams.get("urun");

  const [formInfo, setFormInfo] = useState<FormInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: form } = await supabase
        .from("customer_forms")
        .select("seller_id, is_active")
        .eq("slug", slug)
        .single();

      if (!form || !form.is_active) { setNotFound(true); return; }

      const { data: seller } = await supabase
        .from("sellers")
        .select("shop_name")
        .eq("id", form.seller_id)
        .single();

      setFormInfo({ seller_name: seller?.shop_name ?? "Mağaza" });
    }
    load();
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);

    await fetch("/api/forms/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, rating, comment, email, wants_newsletter: newsletter, product_ref: productRef }),
    });

    setDone(true);
    setSubmitting(false);
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">Form bulunamadı</p>
          <p className="text-sm mt-1">Bu bağlantı geçersiz veya devre dışı.</p>
        </div>
      </div>
    );
  }

  if (!formInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Teşekkürler!</h2>
          <p className="text-gray-500 text-sm">
            Görüşünüz {formInfo.seller_name} ile paylaşıldı.
          </p>
          {newsletter && (
            <p className="text-xs text-orange-600 mt-3 bg-orange-50 rounded-lg p-2">
              SatıcıPilot kampanya bültenine kaydoldunuz.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-sm w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-lg font-black">{formInfo.seller_name[0]}</span>
          </div>
          <h1 className="font-bold text-gray-900 text-lg">{formInfo.seller_name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {productRef ? `"${productRef}" ürününü` : "Siparişinizi"} nasıl buldunuz?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Stars */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Puanınız</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      s <= (hovered || rating)
                        ? "fill-orange-400 text-orange-400"
                        : "text-gray-200 fill-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-xs text-gray-400 mt-2">
                {["", "Çok kötü", "Kötü", "Orta", "İyi", "Mükemmel"][rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Yorumunuz <span className="text-gray-400 font-normal">(isteğe bağlı)</span></label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Ürün veya teslimat hakkında düşünceleriniz..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 resize-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">E-posta <span className="text-gray-400 font-normal">(isteğe bağlı)</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
            />
          </div>

          {/* Newsletter opt-in */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-orange-500"
            />
            <span className="text-xs text-gray-500 leading-relaxed">
              SatıcıPilot'un fırsat ve kampanya bülteninden haberdar olmak istiyorum.{" "}
              <span className="text-gray-400">(Verileriniz KVKK kapsamında işlenir.)</span>
            </span>
          </label>

          <button
            type="submit"
            disabled={!rating || submitting}
            className="w-full bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Gönderiliyor..." : "Gönder"}
          </button>
        </form>
      </div>
    </div>
  );
}
