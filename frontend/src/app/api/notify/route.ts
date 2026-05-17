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

function emailHtml(shopName: string, urgentCount: number, dashboardUrl: string) {
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
        ⚡ Acil Bildirim
      </div>

      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827">
        ${urgentCount} acil yorum yanıt bekliyor
      </h1>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6">
        <strong>${shopName}</strong> mağazanda yanıt bekleyen acil yorum var. Hızlı yanıt vermek mağaza puanını ve arama sıralamasını olumlu etkiler.
      </p>

      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;margin-bottom:24px">
        <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5">
          <strong>Neden önemli?</strong> Trendyol, 24 saat içinde yanıt veren mağazaları arama sonuçlarında %15 daha üst sıralarda gösteriyor.
        </p>
      </div>

      <a href="${dashboardUrl}"
         style="display:block;background:#f97316;color:white;text-align:center;padding:14px 24px;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none;margin-bottom:24px">
        Yorumları Görüntüle →
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

export async function POST(req: NextRequest) {
  // Webhook secret doğrulama
  const secret = req.headers.get("x-webhook-secret");
  if (!process.env.NOTIFY_SECRET || secret !== process.env.NOTIFY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const review = body.record;

  // Sadece acil ve henüz bildirilmemiş yorumlar
  if (!review?.is_urgent || review?.notified_at) {
    return NextResponse.json({ skipped: true });
  }

  const supabase = getSupabase();

  // Satıcı bilgilerini çek
  const { data: seller } = await supabase
    .from("sellers")
    .select("email, shop_name, notify_urgent_reviews")
    .eq("id", review.seller_id)
    .single();

  if (!seller || !seller.notify_urgent_reviews || !seller.email) {
    return NextResponse.json({ skipped: "notifications_disabled" });
  }

  // Aynı satıcının kaç acil yorumu var?
  const { count } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", review.seller_id)
    .eq("is_urgent", true)
    .is("notified_at", null);

  const urgentCount = count ?? 1;
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://saticii-pilot.vercel.app";

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: "SatıcıPilot <onboarding@resend.dev>",
    to: seller.email,
    subject: `⚡ ${urgentCount} acil yorum yanıt bekliyor — ${seller.shop_name}`,
    html: emailHtml(seller.shop_name, urgentCount, `${dashboardUrl}/yorumlar`),
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }

  // Bildirilen yorumu işaretle
  await getSupabase()
    .from("reviews")
    .update({ notified_at: new Date().toISOString() })
    .eq("id", review.id);

  return NextResponse.json({ sent: true, to: seller.email });
}
