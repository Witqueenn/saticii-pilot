import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const serviceSupabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: admin } = await serviceSupabase.from("admin_users").select("id").eq("id", user.id).single();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { subject, body, target } = await req.json();
  if (!subject || !body) return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });

  let query = serviceSupabase.from("sellers").select("email, shop_name, plan").eq("is_active", true);
  if (target === "paid") query = query.neq("plan", "temel") as typeof query;
  if (target === "temel") query = query.eq("plan", "temel") as typeof query;
  if (target === "profesyonel") query = query.eq("plan", "profesyonel") as typeof query;
  if (target === "marketing") query = query.eq("plan", "marketing") as typeof query;

  const { data: sellers } = await query;
  if (!sellers || sellers.length === 0) return NextResponse.json({ error: "Hedef bulunamadı" }, { status: 400 });

  const resend = new Resend(process.env.RESEND_API_KEY);

  const htmlBody = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#f97316;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px">
        <span style="color:white;font-weight:900;font-size:20px">SatıcıPilot</span>
      </div>
      <div style="color:#374151;font-size:15px;line-height:1.7;white-space:pre-wrap">${body}</div>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0"/>
      <p style="color:#9ca3af;font-size:12px;text-align:center">SatıcıPilot · saticipilot.com</p>
    </div>
  `;

  let sent = 0;
  let failed = 0;

  for (const seller of sellers) {
    try {
      await resend.emails.send({
        from: "SatıcıPilot <noreply@saticipilot.com>",
        to: seller.email,
        subject,
        html: htmlBody,
      });
      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, total: sellers.length });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const serviceSupabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: admin } = await serviceSupabase.from("admin_users").select("id").eq("id", user.id).single();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { data: sellers } = await serviceSupabase.from("sellers").select("plan, is_active");
  const active = (sellers ?? []).filter((s: any) => s.is_active);

  return NextResponse.json({
    all: active.length,
    paid: active.filter((s: any) => s.plan !== "temel").length,
    temel: active.filter((s: any) => s.plan === "temel").length,
    profesyonel: active.filter((s: any) => s.plan === "profesyonel").length,
    marketing: active.filter((s: any) => s.plan === "marketing").length,
  });
}
