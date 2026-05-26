import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Resend } from "resend";
import { h } from "@/lib/html";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface DigestData {
  urgentUnreplied: number;
  pendingQuestions: number;
  todayReturns: number;
  lowStockCount: number;
}

async function buildDigest(
  supabase: SupabaseClient,
  sellerId: string
): Promise<DigestData> {
  const since = new Date(Date.now() - 25 * 3600 * 1000).toISOString();

  const [urgentReviews, questions, returns, lowStock] = await Promise.all([
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", sellerId)
      .eq("is_urgent", true)
      .eq("is_replied", false),
    supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", sellerId)
      .eq("is_answered", false),
    supabase
      .from("returns")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", sellerId)
      .gte("returned_at", since),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", sellerId)
      .lte("stock", 5)
      .gte("stock", 0),
  ]);

  return {
    urgentUnreplied: urgentReviews.count ?? 0,
    pendingQuestions: questions.count ?? 0,
    todayReturns: returns.count ?? 0,
    lowStockCount: lowStock.count ?? 0,
  };
}

function buildEmail(
  shopName: string,
  d: DigestData,
  dashboardUrl: string
): string {
  const rows: { emoji: string; label: string; value: number; href: string; urgent: boolean }[] = [
    { emoji: "⚡", label: "Acil yanıtsız yorum", value: d.urgentUnreplied, href: `${dashboardUrl}/yorumlar`, urgent: d.urgentUnreplied > 0 },
    { emoji: "❓", label: "Yanıtsız soru", value: d.pendingQuestions, href: `${dashboardUrl}/sorular`, urgent: d.pendingQuestions > 3 },
    { emoji: "📦", label: "Son 24s iade", value: d.todayReturns, href: `${dashboardUrl}/iadeler`, urgent: d.todayReturns > 5 },
    { emoji: "📉", label: "Düşük stoklu ürün", value: d.lowStockCount, href: `${dashboardUrl}/urunler`, urgent: d.lowStockCount > 0 },
  ];

  const rowsHtml = rows
    .map(
      (r) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:middle">
        <span style="font-size:14px">${r.emoji}</span>
        <span style="font-size:13px;color:#374151;margin-left:8px">${r.label}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;vertical-align:middle">
        <a href="${r.href}" style="font-size:15px;font-weight:700;color:${r.urgent ? "#dc2626" : "#111827"};text-decoration:none">
          ${r.value}
        </a>
      </td>
    </tr>`
    )
    .join("");

  const todayStr = new Date().toLocaleDateString("tr-TR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:480px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">

    <div style="background:#f97316;padding:18px 24px;display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:28px;height:28px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center">
          <span style="color:white;font-weight:900;font-size:12px">S</span>
        </div>
        <span style="color:white;font-weight:700;font-size:14px">SatıcıPilot</span>
      </div>
      <span style="color:rgba(255,255,255,0.85);font-size:11px">Günlük Özet</span>
    </div>

    <div style="padding:24px">
      <p style="margin:0 0 2px;font-size:12px;color:#9ca3af">${todayStr}</p>
      <h1 style="margin:0 0 4px;font-size:18px;font-weight:700;color:#111827">Günaydın, ${h(shopName)}! ☀️</h1>
      <p style="margin:0 0 20px;font-size:13px;color:#6b7280">Bugün ilgilenmen gereken konular:</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
        <tbody>${rowsHtml}</tbody>
      </table>

      <a href="${dashboardUrl}"
         style="display:block;background:#f97316;color:white;text-align:center;padding:12px;border-radius:10px;font-weight:600;font-size:13px;text-decoration:none;margin-bottom:20px">
        Panele Git →
      </a>

      <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center">
        Bu özeti almak istemiyorsan
        <a href="${dashboardUrl}/ayarlar" style="color:#f97316;text-decoration:none">ayarlardan</a>
        kapatabilirsin.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const dashboardUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://saticii-pilot.vercel.app";

  const { data: sellers } = await supabase
    .from("sellers")
    .select("id, email, shop_name")
    .eq("is_active", true)
    .eq("notify_daily_digest", true)
    .not("email", "is", null);

  if (!sellers || sellers.length === 0) {
    return NextResponse.json({ sent: 0, skipped: "no_active_sellers" });
  }

  const resend = getResend();
  const results: Array<{ shop: string; status: string }> = [];

  for (const seller of sellers) {
    try {
      const digest = await buildDigest(supabase, seller.id);

      const total =
        digest.urgentUnreplied +
        digest.pendingQuestions +
        digest.todayReturns +
        digest.lowStockCount;

      if (total === 0) {
        results.push({ shop: seller.shop_name, status: "skipped_nothing_pending" });
        continue;
      }

      const html = buildEmail(seller.shop_name, digest, dashboardUrl);
      const toEmail = process.env.RESEND_TO_EMAIL ?? seller.email;

      const { error } = await resend.emails.send({
        from: "SatıcıPilot <onboarding@resend.dev>",
        to: toEmail,
        subject: `☀️ Günlük özet — ${seller.shop_name}`,
        html,
      });

      results.push({ shop: seller.shop_name, status: error ? "email_error" : "sent" });
    } catch (err) {
      results.push({ shop: seller.shop_name, status: `error: ${String(err).slice(0, 60)}` });
    }
  }

  const sentCount = results.filter((r) => r.status === "sent").length;
  return NextResponse.json({ sent: sentCount, results });
}

export async function POST() {
  const cookieStore = await cookies();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabase();
  const { data: seller } = await supabase
    .from("sellers")
    .select("id, email, shop_name")
    .eq("id", user.id)
    .single();

  if (!seller?.email) {
    return NextResponse.json({ error: "Satıcı verisi bulunamadı" }, { status: 400 });
  }

  const dashboardUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://saticii-pilot.vercel.app";

  try {
    const digest = await buildDigest(supabase, seller.id);
    const html = buildEmail(seller.shop_name, digest, dashboardUrl);
    const toEmail = process.env.RESEND_TO_EMAIL ?? seller.email;

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: "SatıcıPilot <onboarding@resend.dev>",
      to: toEmail,
      subject: `☀️ Günlük özet — ${seller.shop_name}`,
      html,
    });

    if (error) return NextResponse.json({ error: "E-posta gönderilemedi" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
