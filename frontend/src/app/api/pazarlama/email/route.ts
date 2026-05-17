import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const serviceSupabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { subject, body, discount_code, segment } = await req.json();
  if (!subject || !body) return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });

  let query = serviceSupabase
    .from("form_responses")
    .select("email, rating, wants_newsletter")
    .eq("seller_id", user.id)
    .not("email", "is", null);

  if (segment === "newsletter") query = query.eq("wants_newsletter", true);
  if (segment === "rating5") query = query.eq("rating", 5);
  if (segment === "rating4plus") query = query.gte("rating", 4);

  const { data: rows } = await query;
  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: "Bu segmentte e-posta bulunamadı" }, { status: 400 });
  }

  const { data: seller } = await serviceSupabase
    .from("sellers")
    .select("shop_name")
    .eq("id", user.id)
    .single();

  const shopName = seller?.shop_name ?? "Mağaza";
  const unique = [...new Set(rows.map((r) => r.email).filter(Boolean))] as string[];

  const htmlBody = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#f97316;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px">
        <span style="color:white;font-weight:900;font-size:20px">${shopName}</span>
      </div>
      <div style="color:#374151;font-size:15px;line-height:1.7;white-space:pre-wrap">${body}</div>
      ${discount_code ? `
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px;text-align:center;margin-top:24px">
        <p style="color:#9a3412;font-size:13px;font-weight:600;margin:0 0 8px">İndirim Kodunuz</p>
        <p style="color:#ea580c;font-size:28px;font-weight:900;letter-spacing:4px;margin:0">${discount_code}</p>
      </div>` : ""}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0"/>
      <p style="color:#9ca3af;font-size:12px;text-align:center">
        Bu e-posta ${shopName} tarafından gönderilmiştir. SatıcıPilot altyapısıyla iletilmektedir.
      </p>
    </div>
  `;

  let sent = 0;
  let failed = 0;
  const campaignLabel = `${subject} — ${new Date().toLocaleDateString("tr-TR")}`;

  for (const email of unique) {
    try {
      const result = await resend.emails.send({
        from: "SatıcıPilot <noreply@saticipilot.com>",
        to: email,
        subject,
        html: htmlBody,
      });
      sent++;
      if (result.data?.id) {
        await serviceSupabase.from("email_sends").insert({
          seller_id: user.id,
          resend_id: result.data.id,
          recipient_email: email,
          subject,
          segment: segment ?? "all",
          campaign_label: campaignLabel,
        });
      }
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, total: unique.length });
}

export async function GET(req: NextRequest) {
  const serviceSupabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const segment = req.nextUrl.searchParams.get("segment") ?? "all";

  let query = serviceSupabase
    .from("form_responses")
    .select("email, rating, wants_newsletter")
    .eq("seller_id", user.id)
    .not("email", "is", null);

  if (segment === "newsletter") query = query.eq("wants_newsletter", true);
  if (segment === "rating5") query = query.eq("rating", 5);
  if (segment === "rating4plus") query = query.gte("rating", 4);

  const { data: rows } = await query;
  const unique = [...new Set((rows ?? []).map((r) => r.email).filter(Boolean))];
  return NextResponse.json({ count: unique.length });
}
