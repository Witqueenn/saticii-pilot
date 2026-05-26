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
    const sb = createServiceClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: { user }, error } = await sb.auth.getUser(authHeader.slice(7));
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

async function generateImprovedDescription(
  name: string,
  category: string,
  currentDescription: string,
): Promise<{ improved: string; suggestions: string[] }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY ayarlanmamış");

  const prompt = `Sen bir Trendyol e-ticaret uzmanısın. Verilen ürün için iyileştirilmiş bir Türkçe açıklama yaz.

Ürün: ${name}
Kategori: ${category}
Mevcut açıklama: ${currentDescription || "(açıklama yok)"}

GÖREV:
1. Müşteri odaklı, satışa dönüştürücü bir ürün açıklaması yaz (maksimum 150 kelime)
2. 3 kısa SEO ve içerik iyileştirme önerisi ver

YANIT FORMATI (sadece bu JSON, başka bir şey yazma):
{"improved":"...açıklama buraya...","suggestions":["öneri 1","öneri 2","öneri 3"]}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic API hatası: ${res.status}`);
  const data = await res.json() as { content: { type: string; text: string }[] };
  const text = data.content?.[0]?.text?.trim() ?? "";

  // Extract JSON — model may wrap in code fences
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Geçersiz AI yanıtı");
  const parsed = JSON.parse(jsonMatch[0]) as { improved: string; suggestions: string[] };
  return { improved: parsed.improved ?? "", suggestions: parsed.suggestions ?? [] };
}

export async function POST(req: NextRequest) {
  const auth = await getUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user, supabase } = auth;

  const rl = await checkRateLimit(req, "ai", 20, 3600, user.id);
  if (rl) return rl;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 }); }

  const { product_id, product_name, category, description } = body as Record<string, unknown>;
  if (!product_name || typeof product_name !== "string")
    return NextResponse.json({ error: "product_name gerekli" }, { status: 400 });

  let result: { improved: string; suggestions: string[] };
  try {
    result = await generateImprovedDescription(
      product_name,
      typeof category === "string" ? category : "",
      typeof description === "string" ? description : "",
    );
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  if (product_id && typeof product_id === "string") {
    await supabase
      .from("products")
      .update({
        improved_description: result.improved,
        ai_suggestions: result.suggestions,
      })
      .eq("id", product_id)
      .eq("seller_id", user.id);
  }

  return NextResponse.json(result);
}
