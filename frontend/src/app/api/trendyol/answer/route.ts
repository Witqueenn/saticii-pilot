/**
 * POST /api/trendyol/answer
 *
 * Trendyol'a müşteri sorusu cevabı gönderir ve DB'yi günceller.
 * Body: { question_id: string, answer_text: string }
 * Returns: { ok, trendyol_ok, message }
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { decrypt } from "@/app/api/credentials/route";

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY      = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TY_BASE       = "https://api.trendyol.com/sapigw";

async function getUser(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const sb = createServiceClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: { user }, error } = await sb.auth.getUser(auth.slice(7));
    if (error || !user) return null;
    return user;
  }
  const cookieStore = await cookies();
  const sb = createServerClient(SUPABASE_URL, ANON_KEY, {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  });
  const { data: { user } } = await sb.auth.getUser();
  return user ?? null;
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { question_id, answer_text } = await req.json() as { question_id: string; answer_text: string };
  if (!question_id || !answer_text?.trim()) {
    return NextResponse.json({ error: "question_id ve answer_text gerekli" }, { status: 400 });
  }

  const db = createServiceClient(SUPABASE_URL, SERVICE_ROLE);

  const { data: question } = await db
    .from("questions")
    .select("id, marketplace_question_id, marketplace")
    .eq("id", question_id)
    .eq("seller_id", user.id)
    .single();

  if (!question) return NextResponse.json({ error: "Soru bulunamadı" }, { status: 404 });

  await db.from("questions")
    .update({ is_answered: true, suggested_answer: answer_text.trim() })
    .eq("id", question_id);

  if (!question.marketplace_question_id || question.marketplace !== "trendyol") {
    return NextResponse.json({ ok: true, trendyol_ok: false, message: "Cevap kaydedildi (Trendyol ID yok)" });
  }

  const { data: cred } = await db
    .from("marketplace_credentials")
    .select("api_key, api_secret, supplier_id, store_id")
    .eq("seller_id", user.id)
    .eq("marketplace", "trendyol")
    .maybeSingle();

  if (!cred) return NextResponse.json({ ok: true, trendyol_ok: false, message: "Cevap kaydedildi (credential yok)" });

  let apiKey: string, apiSecret: string;
  try {
    apiKey    = decrypt(cred.api_key);
    apiSecret = decrypt(cred.api_secret);
  } catch {
    return NextResponse.json({ ok: true, trendyol_ok: false, message: "Cevap kaydedildi (credential hatası)" });
  }

  const supplierId = cred.supplier_id || cred.store_id || "";
  const authHeader = "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  try {
    const tyRes = await fetch(
      `${TY_BASE}/suppliers/${supplierId}/questions/${question.marketplace_question_id}/answers`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "User-Agent": `${supplierId} - SaticiPilot`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: answer_text.trim() }),
        signal: AbortSignal.timeout(15_000),
      },
    );

    if (tyRes.ok || tyRes.status === 200 || tyRes.status === 201) {
      return NextResponse.json({ ok: true, trendyol_ok: true, message: "Trendyol'a başarıyla gönderildi" });
    }

    const errText = await tyRes.text().catch(() => "");
    return NextResponse.json({
      ok: true, trendyol_ok: false,
      message: `Cevap kaydedildi. Trendyol hatası: ${tyRes.status}${errText ? " — " + errText.slice(0, 120) : ""}`,
    });
  } catch (e) {
    return NextResponse.json({
      ok: true, trendyol_ok: false,
      message: `Cevap kaydedildi. Trendyol'a ulaşılamadı: ${String(e).slice(0, 80)}`,
    });
  }
}
