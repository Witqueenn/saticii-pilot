import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { h } from "@/lib/html";

function validateInput(slug: unknown, rating: unknown, comment: unknown, email: unknown, phone: unknown, product_ref: unknown) {
  if (typeof slug !== "string" || slug.length > 100) return "Geçersiz slug";
  if (typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating)) return "Puan 1-5 arasında olmalı";
  if (comment !== undefined && comment !== null && (typeof comment !== "string" || comment.length > 2000)) return "Yorum çok uzun";
  if (email !== undefined && email !== null && (typeof email !== "string" || email.length > 200 || !email.includes("@"))) return "Geçersiz e-posta";
  if (phone !== undefined && phone !== null && (typeof phone !== "string" || phone.length > 20)) return "Geçersiz telefon";
  if (product_ref !== undefined && product_ref !== null && (typeof product_ref !== "string" || product_ref.length > 200)) return "Geçersiz ürün referansı";
  return null;
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const resend = new Resend(process.env.RESEND_API_KEY);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const { slug, rating, comment, email, phone, wants_newsletter, product_ref } = body;

  const validationError = validateInput(slug, rating, comment, email, phone, product_ref);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const { data: form } = await supabase
    .from("customer_forms")
    .select("id, seller_id, is_active")
    .eq("slug", slug)
    .single();

  if (!form || !form.is_active) {
    return NextResponse.json({ error: "Form bulunamadı" }, { status: 404 });
  }

  const { error } = await supabase.from("form_responses").insert({
    seller_id: form.seller_id,
    form_id: form.id,
    product_ref: product_ref ?? null,
    rating,
    comment: comment ?? null,
    email: email ?? null,
    phone: phone ?? null,
    wants_newsletter: !!wants_newsletter,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Otomasyonları tetikle (sadece e-posta varsa)
  if (email && typeof email === "string") {
    const { data: automations } = await supabase
      .from("automations")
      .select("*")
      .eq("seller_id", form.seller_id)
      .eq("trigger", "form_submitted")
      .eq("is_active", true);

    if (automations && automations.length > 0) {
      const { data: seller } = await supabase
        .from("sellers")
        .select("shop_name")
        .eq("id", form.seller_id)
        .single();

      const shopName = seller?.shop_name ?? "Mağaza";

      for (const automation of automations) {
        const resolvedBody = automation.body
          .replace(/\{shop_name\}/g, shopName)
          .replace(/\{discount_code\}/g, automation.discount_code ?? "")
          .replace(/\{urun\}/g, typeof product_ref === "string" ? h(product_ref) : "ürününüz");

        const htmlBody = `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <div style="background:#f97316;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px">
              <span style="color:white;font-weight:900;font-size:20px">${h(shopName)}</span>
            </div>
            <div style="color:#374151;font-size:15px;line-height:1.7;white-space:pre-wrap">${h(resolvedBody)}</div>
            ${automation.discount_code ? `
            <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px;text-align:center;margin-top:24px">
              <p style="color:#9a3412;font-size:13px;font-weight:600;margin:0 0 8px">İndirim Kodunuz</p>
              <p style="color:#ea580c;font-size:28px;font-weight:900;letter-spacing:4px;margin:0">${h(automation.discount_code)}</p>
            </div>` : ""}
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0"/>
            <p style="color:#9ca3af;font-size:12px;text-align:center">
              Bu e-posta ${h(shopName)} tarafından otomatik olarak gönderilmiştir.
            </p>
          </div>
        `;

        try {
          await resend.emails.send({
            from: "SatıcıPilot <noreply@saticipilot.com>",
            to: email,
            subject: automation.subject,
            html: htmlBody,
          });
          await supabase
            .from("automations")
            .update({ sent_count: automation.sent_count + 1 })
            .eq("id", automation.id);
        } catch {
          // Otomasyon maili gönderilemese bile form kaydı başarılı sayılır
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
