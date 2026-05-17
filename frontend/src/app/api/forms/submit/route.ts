import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { slug, rating, comment, email, phone, wants_newsletter, product_ref } = await req.json();

  if (!slug || !rating) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

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
  if (email) {
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
          .replace(/\{urun\}/g, product_ref ?? "ürününüz");

        const htmlBody = `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <div style="background:#f97316;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px">
              <span style="color:white;font-weight:900;font-size:20px">${shopName}</span>
            </div>
            <div style="color:#374151;font-size:15px;line-height:1.7;white-space:pre-wrap">${resolvedBody}</div>
            ${automation.discount_code ? `
            <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px;text-align:center;margin-top:24px">
              <p style="color:#9a3412;font-size:13px;font-weight:600;margin:0 0 8px">İndirim Kodunuz</p>
              <p style="color:#ea580c;font-size:28px;font-weight:900;letter-spacing:4px;margin:0">${automation.discount_code}</p>
            </div>` : ""}
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0"/>
            <p style="color:#9ca3af;font-size:12px;text-align:center">
              Bu e-posta ${shopName} tarafından otomatik olarak gönderilmiştir.
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
