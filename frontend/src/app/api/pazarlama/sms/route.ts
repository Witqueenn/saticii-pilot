import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { message, segment } = await req.json();
  if (!message) return NextResponse.json({ error: "Mesaj gerekli" }, { status: 400 });

  const netgsmUser = process.env.NETGSM_USER;
  const netgsmPass = process.env.NETGSM_PASS;
  const netgsmHeader = process.env.NETGSM_HEADER ?? "SaticiPilot";

  if (!netgsmUser || !netgsmPass) {
    return NextResponse.json({ error: "SMS sağlayıcı yapılandırılmamış" }, { status: 503 });
  }

  const serviceSupabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let query = serviceSupabase
    .from("form_responses")
    .select("phone")
    .eq("seller_id", user.id)
    .not("phone", "is", null);

  if (segment === "newsletter") query = query.eq("wants_newsletter", true);
  if (segment === "rating5") query = query.eq("rating", 5);
  if (segment === "rating4plus") query = query.gte("rating", 4);

  const { data: rows } = await query;
  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: "Bu segmentte telefon numarası yok" }, { status: 400 });
  }

  const phones = [...new Set(rows.map((r) => r.phone).filter(Boolean))] as string[];
  const gsmno = phones.map((p) => p.replace(/\D/g, "")).join(",");

  const url = new URL("https://api.netgsm.com.tr/sms/send/get/");
  url.searchParams.set("usercode", netgsmUser);
  url.searchParams.set("password", netgsmPass);
  url.searchParams.set("gsmno", gsmno);
  url.searchParams.set("message", message);
  url.searchParams.set("msgheader", netgsmHeader);

  const res = await fetch(url.toString());
  const text = await res.text();

  // Netgsm başarı kodları: 00, 01, 02
  const code = text.trim().split(" ")[0];
  const success = ["00", "01", "02"].includes(code);

  return NextResponse.json({
    ok: success,
    sent: success ? phones.length : 0,
    total: phones.length,
    code,
  });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const segment = req.nextUrl.searchParams.get("segment") ?? "all";
  const serviceSupabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let query = serviceSupabase
    .from("form_responses")
    .select("phone")
    .eq("seller_id", user.id)
    .not("phone", "is", null);

  if (segment === "newsletter") query = query.eq("wants_newsletter", true);
  if (segment === "rating5") query = query.eq("rating", 5);
  if (segment === "rating4plus") query = query.gte("rating", 4);

  const { data: rows } = await query;
  const unique = [...new Set((rows ?? []).map((r) => r.phone).filter(Boolean))];
  return NextResponse.json({ count: unique.length });
}
