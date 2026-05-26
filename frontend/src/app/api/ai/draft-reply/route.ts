import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function buildPrompt(productName: string, rating: number, comment: string, sentiment: string | null): string {
  const tone = rating <= 2 || sentiment === "acil"
    ? "özür dileyen, çözüm odaklı ve empatik"
    : rating === 3
    ? "anlayışlı ve yardımsever"
    : "sıcak ve teşekkür eden";

  return `Sen bir Trendyol mağaza sahibisin. Müşteri yorumuna kısa, profesyonel ve samimi bir Türkçe cevap yaz.

Ürün: ${productName}
Puan: ${rating}/5
Yorum: "${comment}"

Kurallar:
- Ton ${tone} olsun
- Maksimum 3 cümle
- Müşteriyi adıyla değil "değerli müşterimiz" veya "sayın müşterimiz" diye hitap et
- Sorun varsa çözüm öner (iade, değişim, iletişim)
- Gereksiz tekrar etme, doğrudan konuya gir
- Sadece cevabı yaz, başka açıklama ekleme`;
}

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

async function generateReply(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY ayarlanmamış");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
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

  const { review_id, product_name, rating, comment, sentiment } = await req.json();
  if (!comment || !product_name || rating == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  let reply: string;
  try {
    reply = await generateReply(buildPrompt(product_name, rating, comment, sentiment));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  if (review_id && reply) {
    await supabase
      .from("reviews")
      .update({ suggested_reply: reply })
      .eq("id", review_id)
      .eq("seller_id", user.id);
  }

  return NextResponse.json({ reply });
}
