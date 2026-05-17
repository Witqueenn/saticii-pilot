import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const secret = req.headers.get("resend-webhook-secret");
  if (secret !== process.env.RESEND_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json();
  const { type, data } = body;

  const emailId = data?.email_id;
  if (!emailId) return NextResponse.json({ ok: true });

  if (type === "email.opened") {
    await supabase
      .from("email_sends")
      .update({ opened: true })
      .eq("resend_id", emailId);
  }

  if (type === "email.clicked") {
    await supabase
      .from("email_sends")
      .update({ clicked: true })
      .eq("resend_id", emailId);
  }

  return NextResponse.json({ ok: true });
}
