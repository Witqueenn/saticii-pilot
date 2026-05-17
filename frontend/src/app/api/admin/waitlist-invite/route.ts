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

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "E-posta gerekli" }, { status: 400 });

  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#f97316;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px">
        <span style="color:white;font-weight:900;font-size:20px">SatıcıPilot</span>
      </div>
      <h2 style="color:#111827;font-size:20px;margin-bottom:8px">Erken Erişim Davetiniz Hazır!</h2>
      <p style="color:#374151;font-size:15px;line-height:1.7;">
        Waitlist'e kayıt olduğunuz için teşekkür ederiz. Erken erişim programımıza sizi davet etmekten mutluluk duyuyoruz.
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.7;">
        Aşağıdaki butona tıklayarak ücretsiz hesabınızı oluşturabilirsiniz:
      </p>
      <div style="text-align:center;margin:32px 0">
        <a href="https://saticipilot.com/kayit" style="background:#f97316;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block">
          Hesabımı Oluştur →
        </a>
      </div>
      <p style="color:#6b7280;font-size:13px;line-height:1.6;">
        İlk 3 ay tüm planlarda %50 indirim fırsatını kaçırmayın. Kredi kartı gerekmez.
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0"/>
      <p style="color:#9ca3af;font-size:12px;text-align:center">SatıcıPilot · saticipilot.com</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "SatıcıPilot <noreply@saticipilot.com>",
      to: email,
      subject: "SatıcıPilot'a Davet Edildiniz! 🎉",
      html,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Email gönderilemedi" }, { status: 500 });
  }
}
