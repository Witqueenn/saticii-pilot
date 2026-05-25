import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const REASON_LABELS: Record<string, string> = {
  beden_uyumsuzlugu: "Beden Uyumsuzluğu",
  renk_farki: "Renk Farkı",
  kalite_sorunu: "Kalite Sorunu",
  diger: "Diğer",
};

interface WeekStats {
  reviewCount: number;
  avgRating: number;
  urgentCount: number;
  urgentUnreplied: number;
  returnCount: number;
  returnReasons: Record<string, number>;
  orderCount: number;
  orderRevenue: number;
}

interface PendingReview {
  productName: string;
  rating: number;
  comment: string;
  customerName: string;
  hoursAgo: number;
}

interface SellerReport {
  sellerId: string;
  shopName: string;
  email: string;
  thisWeek: WeekStats;
  lastWeek: Omit<WeekStats, "urgentUnreplied" | "returnReasons">;
  urgentPending: PendingReview[];
}


async function buildSellerReport(
  supabase: SupabaseClient,
  seller: { id: string; shop_name: string; email: string }
): Promise<SellerReport> {
  const now = new Date();
  const week1Start = new Date(now.getTime() - 7 * 86400000).toISOString();
  const week2Start = new Date(now.getTime() - 14 * 86400000).toISOString();

  const [thisReviews, lastReviews, thisReturns, lastReturns, pendingRows, thisOrders] =
    await Promise.all([
      supabase
        .from("reviews")
        .select("rating, is_urgent, is_replied")
        .eq("seller_id", seller.id)
        .gte("reviewed_at", week1Start),
      supabase
        .from("reviews")
        .select("rating, is_urgent")
        .eq("seller_id", seller.id)
        .gte("reviewed_at", week2Start)
        .lt("reviewed_at", week1Start),
      supabase
        .from("returns")
        .select("reason")
        .eq("seller_id", seller.id)
        .gte("returned_at", week1Start),
      supabase
        .from("returns")
        .select("id")
        .eq("seller_id", seller.id)
        .gte("returned_at", week2Start)
        .lt("returned_at", week1Start),
      supabase
        .from("reviews")
        .select("product_name, rating, comment, customer_name, reviewed_at")
        .eq("seller_id", seller.id)
        .eq("is_urgent", true)
        .eq("is_replied", false)
        .order("reviewed_at", { ascending: false })
        .limit(3),
      supabase
        .from("orders")
        .select("total_price")
        .eq("seller_id", seller.id)
        .gte("ordered_at", week1Start),
    ]);

  const tr = thisReviews.data ?? [];
  const lr = lastReviews.data ?? [];
  const ret = thisReturns.data ?? [];
  const ord = thisOrders.data ?? [];
  const orderRevenue = ord.reduce((s, o) => s + (o.total_price ?? 0), 0);

  const returnReasons: Record<string, number> = {};
  for (const r of ret) {
    const key = r.reason ?? "diger";
    returnReasons[key] = (returnReasons[key] ?? 0) + 1;
  }

  const thisAvg =
    tr.length > 0
      ? tr.reduce((s, r) => s + (r.rating ?? 0), 0) / tr.length
      : 0;
  const lastAvg =
    lr.length > 0
      ? lr.reduce((s, r) => s + (r.rating ?? 0), 0) / lr.length
      : 0;

  const pending: PendingReview[] = (pendingRows.data ?? []).map((r) => ({
    productName: r.product_name,
    rating: r.rating,
    comment: r.comment ?? "",
    customerName: r.customer_name ?? "Müşteri",
    hoursAgo: Math.floor(
      (Date.now() - new Date(r.reviewed_at).getTime()) / 3600000
    ),
  }));

  return {
    sellerId: seller.id,
    shopName: seller.shop_name,
    email: seller.email,
    thisWeek: {
      reviewCount: tr.length,
      avgRating: Math.round(thisAvg * 10) / 10,
      urgentCount: tr.filter((r) => r.is_urgent).length,
      urgentUnreplied: tr.filter((r) => r.is_urgent && !r.is_replied).length,
      returnCount: ret.length,
      returnReasons,
      orderCount: ord.length,
      orderRevenue: Math.round(orderRevenue),
    },
    lastWeek: {
      reviewCount: lr.length,
      avgRating: Math.round(lastAvg * 10) / 10,
      urgentCount: lr.filter((r) => r.is_urgent).length,
      returnCount: (lastReturns.data ?? []).length,
      orderCount: 0,
      orderRevenue: 0,
    },
    urgentPending: pending,
  };
}

function pctChange(curr: number, prev: number) {
  if (prev === 0) return curr > 0 ? "+yeni" : "—";
  const p = Math.round(((curr - prev) / prev) * 100);
  if (p > 0) return `+%${p}`;
  if (p < 0) return `-%${Math.abs(p)}`;
  return "değişmedi";
}

function upColor(curr: number, prev: number) {
  if (curr > prev) return "#16a34a";
  if (curr < prev) return "#dc2626";
  return "#6b7280";
}

function downColor(curr: number, prev: number) {
  return upColor(prev, curr);
}

function starBar(rating: number) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function generateActions(r: SellerReport): string[] {
  const items: string[] = [];
  const { thisWeek: t, lastWeek: l } = r;

  if (t.urgentUnreplied > 0)
    items.push(
      `⚡ <strong>${t.urgentUnreplied} acil yorum</strong> yanıtsız — hemen yanıtla`
    );

  const total = t.returnCount;
  if (total > 0) {
    const size = t.returnReasons["beden_uyumsuzlugu"] ?? 0;
    const color = t.returnReasons["renk_farki"] ?? 0;
    const quality = t.returnReasons["kalite_sorunu"] ?? 0;
    if (size / total > 0.4)
      items.push(
        `📏 İadelerin <strong>%${Math.round((size / total) * 100)}'i</strong> beden uyumsuzluğu — beden tablolarını güncelle`
      );
    if (color / total > 0.3)
      items.push(
        `🎨 İadelerin <strong>%${Math.round((color / total) * 100)}'i</strong> renk farkı — ürün fotoğraflarını gözden geçir`
      );
    if (quality / total > 0.2)
      items.push(`🔍 Kalite şikayeti oranı yüksek — tedarikçiyle görüş`);
  }

  if (t.avgRating > 0 && l.avgRating > 0 && t.avgRating < l.avgRating - 0.2)
    items.push(
      `⭐ Ortalama puan düştü (${l.avgRating.toFixed(1)} → ${t.avgRating.toFixed(1)})`
    );

  if (l.returnCount > 0 && t.returnCount > l.returnCount * 1.3)
    items.push(
      `📦 İade sayısı %${Math.round(((t.returnCount - l.returnCount) / l.returnCount) * 100)} arttı`
    );

  if (items.length === 0)
    items.push("✅ Bu hafta kritik sorun yok — harika gidiyorsun!");

  return items;
}

function dateRange() {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 86400000);
  const fmt = (d: Date) =>
    d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function buildEmail(r: SellerReport, dashboardUrl: string): string {
  const { thisWeek: t, lastWeek: l } = r;
  const actions = generateActions(r);
  const range = dateRange();

  const kpis = [
    {
      label: "Yorumlar",
      value: t.reviewCount,
      sub: `${pctChange(t.reviewCount, l.reviewCount)} geçen haftaya göre`,
      color: upColor(t.reviewCount, l.reviewCount),
    },
    {
      label: "Ort. Puan",
      value: t.avgRating > 0 ? t.avgRating.toFixed(1) : "—",
      sub: `${pctChange(t.avgRating * 10, l.avgRating * 10)} geçen haftaya göre`,
      color: upColor(t.avgRating, l.avgRating),
    },
    {
      label: "Acil Yorum",
      value: t.urgentCount,
      sub:
        t.urgentUnreplied > 0
          ? `${t.urgentUnreplied} yanıtsız`
          : "tümü yanıtlandı",
      color: t.urgentUnreplied > 0 ? "#dc2626" : "#16a34a",
    },
    {
      label: "İade",
      value: t.returnCount,
      sub: `${pctChange(t.returnCount, l.returnCount)} geçen haftaya göre`,
      color: downColor(t.returnCount, l.returnCount),
    },
  ];

  const kpiHtml = kpis
    .map(
      (k) => `
    <td style="width:25%;padding:0 6px;text-align:center;vertical-align:top">
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px 8px">
        <div style="font-size:22px;font-weight:800;color:#111827;margin-bottom:2px">${k.value}</div>
        <div style="font-size:11px;font-weight:600;color:#6b7280;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.04em">${k.label}</div>
        <div style="font-size:10px;color:${k.color};font-weight:600">${k.sub}</div>
      </div>
    </td>`
    )
    .join("");

  const urgentHtml =
    r.urgentPending.length > 0
      ? `
    <div style="margin-bottom:24px">
      <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#111827">
        ⚡ Bekleyen Acil Yorumlar
      </h3>
      ${r.urgentPending
        .map(
          (p) => `
      <div style="border-left:3px solid #f97316;padding:10px 12px;margin-bottom:8px;background:#fff7ed;border-radius:0 8px 8px 0">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:12px;font-weight:600;color:#111827">${p.customerName} &nbsp;<span style="color:#f97316">${starBar(p.rating)}</span></span>
          <span style="font-size:11px;color:#9ca3af">${p.hoursAgo < 24 ? p.hoursAgo + " saat önce" : Math.floor(p.hoursAgo / 24) + " gün önce"}</span>
        </div>
        <div style="font-size:12px;color:#374151;font-style:italic">"${p.comment.length > 100 ? p.comment.slice(0, 100) + "…" : p.comment}"</div>
        <div style="font-size:11px;color:#6b7280;margin-top:4px">${p.productName}</div>
      </div>`
        )
        .join("")}
    </div>`
      : "";

  const returnTotal = t.returnCount;
  const returnHtml =
    returnTotal > 0
      ? `
    <div style="margin-bottom:24px">
      <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#111827">
        📦 Bu Haftaki İade Nedenleri
      </h3>
      ${Object.entries(t.returnReasons)
        .sort(([, a], [, b]) => b - a)
        .map(([reason, count]) => {
          const pct = Math.round((count / returnTotal) * 100);
          return `
        <div style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;margin-bottom:3px">
            <span style="font-size:12px;color:#374151">${REASON_LABELS[reason] ?? reason}</span>
            <span style="font-size:12px;font-weight:600;color:#111827">${count} iade (%${pct})</span>
          </div>
          <div style="background:#f3f4f6;border-radius:4px;height:6px;overflow:hidden">
            <div style="background:#f97316;height:6px;width:${pct}%;border-radius:4px"></div>
          </div>
        </div>`;
        })
        .join("")}
    </div>`
      : "";

  const actionsHtml = `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-bottom:24px">
      <h3 style="margin:0 0 10px;font-size:13px;font-weight:700;color:#15803d">Aksiyon Önerileri</h3>
      <ul style="margin:0;padding-left:0;list-style:none">
        ${actions.map((a) => `<li style="font-size:12px;color:#166534;margin-bottom:6px;line-height:1.5">${a}</li>`).join("")}
      </ul>
    </div>`;

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">

    <div style="background:#f97316;padding:20px 28px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:30px;height:30px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center">
            <span style="color:white;font-weight:900;font-size:13px">S</span>
          </div>
          <span style="color:white;font-weight:700;font-size:15px">SatıcıPilot</span>
        </div>
        <span style="color:rgba(255,255,255,0.85);font-size:12px">Haftalık Rapor</span>
      </div>
    </div>

    <div style="padding:28px">
      <div style="margin-bottom:20px">
        <p style="margin:0 0 4px;font-size:13px;color:#6b7280">${range}</p>
        <h1 style="margin:0;font-size:20px;font-weight:700;color:#111827">
          Merhaba ${r.shopName}! 👋
        </h1>
        <p style="margin:6px 0 0;font-size:13px;color:#6b7280">Bu haftaki mağaza özetin hazır.</p>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
        <tr>${kpiHtml}</tr>
      </table>

      ${t.orderCount > 0 ? `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 16px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between">
        <div>
          <p style="margin:0 0 2px;font-size:12px;font-weight:700;color:#15803d">🛒 Bu Haftaki Siparişler</p>
          <p style="margin:0;font-size:13px;color:#166534">${t.orderCount} sipariş &nbsp;·&nbsp; ${t.orderRevenue.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 })} ciro</p>
        </div>
        <a href="${dashboardUrl}/siparisler" style="font-size:11px;font-weight:600;color:#15803d;text-decoration:none;background:white;border:1px solid #bbf7d0;padding:6px 12px;border-radius:8px">Detay →</a>
      </div>` : ""}
      ${urgentHtml}
      ${returnHtml}
      ${actionsHtml}

      <div style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap">
        <a href="${dashboardUrl}/yorumlar"
           style="flex:1;min-width:100px;display:block;background:#f97316;color:white;text-align:center;padding:12px;border-radius:10px;font-weight:600;font-size:12px;text-decoration:none">
          Yorumlar →
        </a>
        <a href="${dashboardUrl}/sorular"
           style="flex:1;min-width:100px;display:block;background:#f3f4f6;color:#374151;text-align:center;padding:12px;border-radius:10px;font-weight:600;font-size:12px;text-decoration:none">
          Sorular →
        </a>
        <a href="${dashboardUrl}/siparisler"
           style="flex:1;min-width:100px;display:block;background:#f3f4f6;color:#374151;text-align:center;padding:12px;border-radius:10px;font-weight:600;font-size:12px;text-decoration:none">
          Siparişler →
        </a>
        <a href="${dashboardUrl}/iadeler"
           style="flex:1;min-width:100px;display:block;background:#f3f4f6;color:#374151;text-align:center;padding:12px;border-radius:10px;font-weight:600;font-size:12px;text-decoration:none">
          İadeler →
        </a>
      </div>

      <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center">
        Bu raporu almak istemiyorsan
        <a href="${dashboardUrl}/ayarlar" style="color:#f97316;text-decoration:none">ayarlardan</a>
        kapatabilirsin.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  // Vercel Cron veya manuel tetikleme için yetki kontrolü
  const authHeader = req.headers.get("authorization");
  const secretHeader = req.headers.get("x-webhook-secret");
  const cronSecret = process.env.CRON_SECRET;
  const notifySecret = process.env.NOTIFY_SECRET;

  const authorized =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (notifySecret && secretHeader === notifySecret);

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const dashboardUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://saticii-pilot.vercel.app";

  const { data: sellers } = await supabase
    .from("sellers")
    .select("id, email, shop_name, notify_urgent_reviews, notify_weekly_report")
    .eq("is_active", true)
    .eq("notify_weekly_report", true)
    .not("email", "is", null);

  if (!sellers || sellers.length === 0) {
    return NextResponse.json({ sent: 0, skipped: "no_active_sellers" });
  }

  const resend = getResend();
  const results: Array<{ shop: string; status: string }> = [];

  for (const seller of sellers) {
    try {
      const report = await buildSellerReport(supabase, seller);

      // Bu haftada hiç aktivite yoksa rapor gönderme
      const hasActivity =
        report.thisWeek.reviewCount > 0 ||
        report.thisWeek.returnCount > 0 ||
        report.thisWeek.orderCount > 0;
      if (!hasActivity) {
        results.push({ shop: seller.shop_name, status: "skipped_no_activity" });
        continue;
      }

      const html = buildEmail(report, `${dashboardUrl}`);
      const toEmail = process.env.RESEND_TO_EMAIL ?? seller.email;

      const { error } = await resend.emails.send({
        from: "SatıcıPilot <onboarding@resend.dev>",
        to: toEmail,
        subject: `📊 Haftalık rapor — ${seller.shop_name} (${dateRange()})`,
        html,
      });

      if (error) {
        console.error(`Resend error for ${seller.shop_name}:`, error);
        results.push({ shop: seller.shop_name, status: "email_error" });
      } else {
        results.push({ shop: seller.shop_name, status: "sent" });
      }
    } catch (err) {
      console.error(`Error processing ${seller.shop_name}:`, err);
      results.push({ shop: seller.shop_name, status: "error" });
    }
  }

  const sentCount = results.filter((r) => r.status === "sent").length;
  return NextResponse.json({ sent: sentCount, results });
}

// Manuel tek-satıcı gönderimi — oturum cookie'siyle yetkilendirilir
export async function POST() {
  const cookieStore = await cookies();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
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

  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://saticii-pilot.vercel.app";

  try {
    const report = await buildSellerReport(supabase, seller);
    const html = buildEmail(report, dashboardUrl);
    const toEmail = process.env.RESEND_TO_EMAIL ?? seller.email;

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: "SatıcıPilot <onboarding@resend.dev>",
      to: toEmail,
      subject: `📊 Haftalık rapor — ${seller.shop_name} (${dateRange()})`,
      html,
    });

    if (error) return NextResponse.json({ error: "E-posta gönderilemedi" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
