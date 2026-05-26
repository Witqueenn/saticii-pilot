import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const sb = createServiceClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: { user }, error } = await sb.auth.getUser(token);
    if (error || !user) return null;
    return { user, supabase: sb };
  }
  const cookieStore = await cookies();
  const sb = createServerClient(SUPABASE_URL, ANON_KEY, {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  });
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  return { user, supabase: sb };
}

async function generateAnswer(productName: string, question: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY ayarlanmamış");

  const prompt = `Sen bir Trendyol mağaza sahibisin. Müşterinin ürün sorusuna kısa, bilgilendirici ve samimi bir Türkçe cevap yaz.

Ürün: ${productName}
Soru: "${question}"

Kurallar:
- Maksimum 2-3 cümle
- Doğrudan soruyu yanıtla
- Emin olmadığın bilgi verme; gerekirse "Lütfen iletişime geçin" de
- Sadece cevabı yaz, başka açıklama ekleme`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API hatası: ${res.status} ${err}`);
  }

  const data = await res.json() as { content: { type: string; text: string }[] };
  return data.content?.[0]?.text?.trim() ?? "";
}

export async function POST(req: NextRequest) {
  const auth = await getUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user, supabase } = auth;

  const rl = await checkRateLimit(req, "ai", 20, 3600, user.id);
  if (rl) return rl;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 }); }

  const { question_id, product_name, question } = body as Record<string, unknown>;
  if (!question || typeof question !== "string" || !product_name || typeof product_name !== "string")
    return NextResponse.json({ error: "product_name ve question gerekli" }, { status: 400 });

  let answer: string;
  try {
    answer = await generateAnswer(product_name, question);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  if (question_id && typeof question_id === "string" && answer) {
    await supabase
      .from("questions")
      .update({ suggested_answer: answer })
      .eq("id", question_id)
      .eq("seller_id", user.id);
  }

  return NextResponse.json({ answer });
}
