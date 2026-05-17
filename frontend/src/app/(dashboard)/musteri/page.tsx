"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Copy, Download, Star, Mail, CheckCircle, MessageSquare,
  Users, QrCode, UserCircle, Search,
} from "lucide-react";
import QRCode from "qrcode";
import ProGate from "@/components/ProGate";

interface Response {
  id: string;
  rating: number;
  comment: string | null;
  email: string | null;
  phone: string | null;
  wants_newsletter: boolean;
  product_ref: string | null;
  order_ref: string | null;
  created_at: string;
}

interface CustomerProfile {
  email: string;
  responseCount: number;
  avgRating: number;
  lastSeen: string;
  products: string[];
  isNewsletter: boolean;
  phone: string | null;
}

const BASE_URL = "https://saticipilot.com";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 18);
}

async function generateBrandedQR(url: string, shopName: string): Promise<string> {
  const rawQR = await QRCode.toDataURL(url, {
    margin: 1,
    width: 400,
    color: { dark: "#ea580c", light: "#ffffff" },
  });

  const canvas = document.createElement("canvas");
  const size = 400;
  const bottomPad = 64;
  canvas.width = size;
  canvas.height = size + bottomPad;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const img = new Image();
  img.src = rawQR;
  await new Promise<void>((resolve) => { img.onload = () => resolve(); });
  ctx.drawImage(img, 0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy, 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ea580c";
  ctx.beginPath();
  ctx.arc(cx, cy, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("S", cx, cy + 1);

  ctx.fillStyle = "#111827";
  ctx.font = "bold 15px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(shopName, size / 2, size + 10);

  ctx.fillStyle = "#9ca3af";
  ctx.font = "12px Arial, sans-serif";
  ctx.fillText("saticipilot.com", size / 2, size + 36);

  return canvas.toDataURL("image/png");
}

function buildProfiles(responses: Response[]): CustomerProfile[] {
  const map = new Map<string, CustomerProfile>();
  for (const r of responses) {
    if (!r.email) continue;
    const existing = map.get(r.email);
    if (!existing) {
      map.set(r.email, {
        email: r.email,
        responseCount: 1,
        avgRating: r.rating,
        lastSeen: r.created_at,
        products: r.product_ref ? [r.product_ref] : [],
        isNewsletter: r.wants_newsletter,
        phone: r.phone,
      });
    } else {
      existing.responseCount++;
      existing.avgRating = (existing.avgRating * (existing.responseCount - 1) + r.rating) / existing.responseCount;
      if (r.product_ref && !existing.products.includes(r.product_ref)) {
        existing.products.push(r.product_ref);
      }
      if (r.created_at > existing.lastSeen) existing.lastSeen = r.created_at;
      if (r.wants_newsletter) existing.isNewsletter = true;
      if (r.phone && !existing.phone) existing.phone = r.phone;
    }
  }
  return Array.from(map.values()).sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));
}

export default function MusteriPage() {
  const [tab, setTab] = useState<"form" | "musteriler" | "yanitlar">("form");
  const [formSlug, setFormSlug] = useState<string | null>(null);
  const [shopName, setShopName] = useState("Mağazam");
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [plan, setPlan] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: adminData }, { data: seller }] = await Promise.all([
        supabase.from("admin_users").select("id").eq("id", user.id).single(),
        supabase.from("sellers").select("plan, shop_name").eq("id", user.id).single(),
      ]);
      setPlan(adminData ? "profesyonel" : (seller?.plan ?? "temel"));

      const name = seller?.shop_name ?? user.user_metadata?.shop_name ?? "Mağazam";
      setShopName(name);

      let { data: form } = await supabase
        .from("customer_forms")
        .select("slug")
        .eq("seller_id", user.id)
        .single();

      if (!form) {
        const base = toSlug(name);
        const suffix = Math.random().toString(36).slice(2, 6);
        const slug = base ? `${base}-${suffix}` : suffix;
        const { data: newForm } = await supabase
          .from("customer_forms")
          .insert({ seller_id: user.id, slug })
          .select("slug")
          .single();
        form = newForm;
      }

      if (!form) return;
      setFormSlug(form.slug);

      const { data: rows } = await supabase
        .from("form_responses")
        .select("id, rating, comment, email, phone, wants_newsletter, product_ref, order_ref, created_at")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      setResponses(rows ?? []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!formSlug) return;
    const url = `${BASE_URL}/f/${formSlug}`;
    generateBrandedQR(url, shopName).then(setQrUrl);
  }, [formSlug, shopName]);

  const formUrl = formSlug ? `${BASE_URL}/f/${formSlug}` : "";

  function copyLink() {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadQR() {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `${formSlug ?? "qr"}-musteri-formu.png`;
    a.click();
  }

  const totalResponses = responses.length;
  const avgRating = totalResponses > 0
    ? (responses.reduce((s, r) => s + r.rating, 0) / totalResponses).toFixed(1)
    : null;
  const emailCount = responses.filter((r) => r.email).length;
  const newsletterCount = responses.filter((r) => r.wants_newsletter).length;

  const profiles = buildProfiles(responses);
  const filteredProfiles = search
    ? profiles.filter((p) => p.email.toLowerCase().includes(search.toLowerCase()))
    : profiles;

  if (loading || plan === null) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (plan !== "profesyonel") return <ProGate feature="Müşteri Takibi & QR Form" />;

  return (
    <div className="space-y-6 max-w-3xl w-full">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Müşteri Takibi</h2>
        <p className="text-gray-500 mt-1">Form yönetimi, müşteri profilleri ve geri bildirim analizi.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Toplam Yanıt", value: totalResponses, icon: MessageSquare, color: "text-blue-500" },
          { label: "Ort. Puan", value: avgRating ? `${avgRating} / 5` : "—", icon: Star, color: "text-orange-500" },
          { label: "Müşteri Profili", value: profiles.length, icon: UserCircle, color: "text-purple-500" },
          { label: "Bülten Abonesi", value: newsletterCount, icon: Users, color: "text-green-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: "form", label: "Form & QR", icon: QrCode },
          { key: "musteriler", label: `Müşteriler (${profiles.length})`, icon: UserCircle },
          { key: "yanitlar", label: `Yanıtlar (${totalResponses})`, icon: MessageSquare },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Form & QR Tab ── */}
      {tab === "form" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Form Linki</p>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <span className="text-xs text-gray-500 truncate flex-1">{formUrl}</span>
                <button onClick={copyLink} className="p-1 text-gray-400 hover:text-orange-500 transition-colors flex-shrink-0">
                  {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">Ürün bazlı link:</p>
              <code className="block text-[11px] bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-gray-600 break-all">
                {formUrl}?urun=ayakkabi-kirmizi
              </code>
              <p className="text-xs font-medium text-gray-500 mt-2">Sipariş bazlı link (Trendyol API sonrası otomatik):</p>
              <code className="block text-[11px] bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-blue-600 break-all">
                {formUrl}?siparis=TY83927&urun=elbise
              </code>
              <p className="text-xs text-gray-400">API bağlandığında her sipariş için bu link otomatik oluşturulur.</p>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
              <p className="text-xs font-semibold text-orange-700 mb-1">Nasıl kullanırsın?</p>
              <ul className="text-xs text-orange-600 space-y-0.5">
                <li>• Trendyol sipariş mesajından gönder</li>
                <li>• WhatsApp / Instagram DM olarak paylaş</li>
                <li>• QR kodu kargo kutusuna yapıştır</li>
              </ul>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col items-center gap-4">
            <p className="text-sm font-semibold text-gray-700 self-start">QR Kod</p>
            {qrUrl ? (
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="QR Kod" className="w-48 h-auto" />
              </div>
            ) : (
              <div className="w-48 h-52 bg-gray-100 rounded-2xl animate-pulse" />
            )}
            <button
              onClick={downloadQR}
              disabled={!qrUrl}
              className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:border-orange-300 hover:text-orange-600 transition-colors disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              PNG İndir
            </button>
            <p className="text-xs text-gray-400 text-center">Kargo kartına bastır veya dijital olarak paylaş</p>
          </div>
        </div>
      )}

      {/* ── Müşteriler Tab ── */}
      {tab === "musteriler" && (
        <div className="space-y-4">
          {profiles.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
              <UserCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">Henüz müşteri profili yok</p>
              <p className="text-gray-400 text-xs mt-1">Müşteriler form doldururken e-posta bıraktığında burada profil oluşur.</p>
            </div>
          ) : (
            <>
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="E-posta ile ara..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                />
              </div>

              <p className="text-xs text-gray-400">{filteredProfiles.length} müşteri profili · E-posta bırakan müşteriler listelenir</p>

              <div className="space-y-3">
                {filteredProfiles.map((p) => (
                  <div key={p.email} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {p.email[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{p.email}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {p.phone && <p className="text-xs text-gray-400">{p.phone}</p>}
                            {p.isNewsletter && (
                              <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
                                ● Bülten abonesi
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= Math.round(p.avgRating) ? "fill-orange-400 text-orange-400" : "fill-gray-200 text-gray-200"}`}
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">{p.avgRating.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{p.responseCount} yanıt</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-50">
                      <div className="flex flex-wrap gap-1">
                        {p.products.length > 0 ? (
                          p.products.slice(0, 3).map((pr) => (
                            <span key={pr} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{pr}</span>
                          ))
                        ) : (
                          <span className="text-gray-300">Ürün bilgisi yok</span>
                        )}
                        {p.products.length > 3 && (
                          <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">+{p.products.length - 3}</span>
                        )}
                      </div>
                      <span>{new Date(p.lastSeen).toLocaleDateString("tr-TR")}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                <p className="font-semibold mb-1">Trendyol API bağlandığında</p>
                <p className="text-xs text-blue-600">Bu profiller sipariş geçmişiyle eşleşecek — hangi müşterinin hangi siparişi değerlendirdiğini görebileceksin.</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Yanıtlar Tab ── */}
      {tab === "yanitlar" && (
        <div className="space-y-3">
          {responses.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">Henüz yanıt yok</p>
              <p className="text-gray-400 text-xs mt-1">Form linkini müşterilerinle paylaştıktan sonra yanıtlar burada görünür.</p>
            </div>
          ) : (
            responses.map((r) => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-orange-400 text-orange-400" : "fill-gray-200 text-gray-200"}`}
                          />
                        ))}
                      </div>
                      {r.product_ref && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{r.product_ref}</span>
                      )}
                      {r.order_ref && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">#{r.order_ref}</span>
                      )}
                    </div>
                    {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                      {r.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{r.email}</span>}
                      {r.wants_newsletter && <span className="text-green-600">● Bülten abonesi</span>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(r.created_at).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
