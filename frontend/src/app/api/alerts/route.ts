import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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

function lowStockHtml(shopName: string, products: { name: string; stock: number }[], dashboardUrl: string) {
  const rows = products
    .map(
      (p) =>
        `<tr>
          <td style="padding:8px 12px;font-size:13px;color:#111827;border-bottom:1px solid #f3f4f6">${p.name}</td>
          <td style="padding:8px 12px;font-size:13px;font-weight:700;color:#dc2626;border-bottom:1px solid #f3f4f6;text-align:right">${p.stock} adet</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:520px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#f97316;padding:24px 32px">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center">
          <span style="color:white;font-weight:900;font-size:14px">S</span>
        </div>
        <span style="color:white;font-weight:700;font-size:16px">SatıcıPilot</span>
      </div>
    </div>
    <div style="padding:32px">
      <div style="display:inline-block;background:#fef2f2;color:#dc2626;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:16px">
        ⚠️ Düşük Stok Uyarısı
      </div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827">
        ${products.length} ürünün stoğu kritik seviyede
      </h1>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6">
        <strong>${shopName}</strong> mağazanda aşağıdaki ürünlerin stoğu 5 adedinin altına düştü.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#fafafa;border-radius:8px;overflow:hidden">
        <thead>
          <tr style="background:#f3f4f6">
            <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#6b7280;text-align:left;text-transform:uppercase">Ürün</th>
            <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#6b7280;text-align:right;text-transform:uppercase">Stok</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <a href="${dashboardUrl}"
         style="display:block;background:#f97316;color:white;text-align:center;padding:14px 24px;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none;margin-bottom:24px">
        Ürünleri Görüntüle →
      </a>
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">
        Bu bildirimi almak istemiyorsan
        <a href="${dashboardUrl}/ayarlar" style="color:#f97316;text-decoration:none">ayarlardan</a>
        kapatabilirsin.
      </p>
    </div>
  </div>
</body>
</html>`;
}

function returnRateHtml(shopName: string, products: { name: string; return_rate: number }[], dashboardUrl: string) {
  const rows = products
    .map(
      (p) =>
        `<tr>
          <td style="padding:8px 12px;font-size:13px;color:#111827;border-bottom:1px solid #f3f4f6">${p.name}</td>
          <td style="padding:8px 12px;font-size:13px;font-weight:700;color:#dc2626;border-bottom:1px solid #f3f4f6;text-align:right">%${p.return_rate}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:520px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#f97316;padding:24px 32px">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center">
          <span style="color:white;font-weight:900;font-size:14px">S</span>
        </div>
        <span style="color:white;font-weight:700;font-size:16px">SatıcıPilot</span>
      </div>
    </div>
    <div style="padding:32px">
      <div style="display:inline-block;background:#fef2f2;color:#dc2626;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:16px">
        📦 Yüksek İade Oranı
      </div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827">
        ${products.length} ürünün iade oranı yüksek
      </h1>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6">
        <strong>${shopName}</strong> mağazanda aşağıdaki ürünlerin iade oranı %${20}'yi aştı. Ürün açıklaması ve görselleri gözden geçirmeyi düşün.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#fafafa;border-radius:8px;overflow:hidden">
        <thead>
          <tr style="background:#f3f4f6">
            <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#6b7280;text-align:left;text-transform:uppercase">Ürün</th>
            <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#6b7280;text-align:right;text-transform:uppercase">İade Oranı</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <a href="${dashboardUrl}"
         style="display:block;background:#f97316;color:white;text-align:center;padding:14px 24px;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none;margin-bottom:24px">
        Ürünleri İncele →
      </a>
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">
        Bu bildirimi almak istemiyorsan
        <a href="${dashboardUrl}/ayarlar" style="color:#f97316;text-decoration:none">ayarlardan</a>
        kapatabilirsin.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://saticii-pilot.vercel.app";
  const resend = getResend();

  const { data: sellers } = await supabase
    .from("sellers")
    .select("id, email, shop_name, notify_low_stock, notify_new_returns")
    .or("notify_low_stock.eq.true,notify_new_returns.eq.true");

  if (!sellers?.length) return NextResponse.json({ checked: 0 });

  const results: { seller_id: string; low_stock?: number; high_return?: number }[] = [];

  for (const seller of sellers) {
    if (!seller.email) continue;
    const toEmail = process.env.RESEND_TO_EMAIL ?? seller.email;

    if (seller.notify_low_stock) {
      const { data: low } = await supabase
        .from("products")
        .select("name, stock")
        .eq("seller_id", seller.id)
        .lte("stock", 5)
        .gte("stock", 0);

      if (low?.length) {
        await resend.emails.send({
          from: "SatıcıPilot <onboarding@resend.dev>",
          to: toEmail,
          subject: `⚠️ ${low.length} ürünün stoğu kritik — ${seller.shop_name}`,
          html: lowStockHtml(seller.shop_name, low, `${dashboardUrl}/urunler`),
        });
        results.push({ seller_id: seller.id, low_stock: low.length });
      }
    }

    if (seller.notify_new_returns) {
      const { data: highReturn } = await supabase
        .from("products")
        .select("name, return_rate")
        .eq("seller_id", seller.id)
        .gt("return_rate", 20);

      if (highReturn?.length) {
        const mapped = highReturn.map((p) => ({
          name: p.name,
          return_rate: Math.round((p.return_rate as number) ?? 0),
        }));
        await resend.emails.send({
          from: "SatıcıPilot <onboarding@resend.dev>",
          to: toEmail,
          subject: `📦 Yüksek iade oranı uyarısı — ${seller.shop_name}`,
          html: returnRateHtml(seller.shop_name, mapped, `${dashboardUrl}/urunler`),
        });
        results.push({ seller_id: seller.id, high_return: highReturn.length });
      }
    }
  }

  return NextResponse.json({ checked: sellers.length, results });
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (!process.env.NOTIFY_SECRET || secret !== process.env.NOTIFY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, seller_id, products } = body;

  if (!type || !seller_id || !Array.isArray(products) || products.length === 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: seller } = await supabase
    .from("sellers")
    .select("email, shop_name, notify_low_stock, notify_new_returns")
    .eq("id", seller_id)
    .single();

  if (!seller?.email) {
    return NextResponse.json({ skipped: "no_email" });
  }

  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://saticii-pilot.vercel.app";
  const toEmail = process.env.RESEND_TO_EMAIL ?? seller.email;
  const resend = getResend();

  if (type === "low_stock" && seller.notify_low_stock) {
    const { error } = await resend.emails.send({
      from: "SatıcıPilot <onboarding@resend.dev>",
      to: toEmail,
      subject: `⚠️ ${products.length} ürünün stoğu kritik — ${seller.shop_name}`,
      html: lowStockHtml(seller.shop_name, products, `${dashboardUrl}/urunler`),
    });
    if (error) {
      console.error("Resend low_stock error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }
    return NextResponse.json({ sent: true });
  }

  if (type === "high_return_rate" && seller.notify_new_returns) {
    const { error } = await resend.emails.send({
      from: "SatıcıPilot <onboarding@resend.dev>",
      to: toEmail,
      subject: `📦 Yüksek iade oranı uyarısı — ${seller.shop_name}`,
      html: returnRateHtml(seller.shop_name, products, `${dashboardUrl}/urunler`),
    });
    if (error) {
      console.error("Resend high_return_rate error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }
    return NextResponse.json({ sent: true });
  }

  return NextResponse.json({ skipped: "notifications_disabled_or_unknown_type" });
}
