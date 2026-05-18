import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import OpenAI from "openai";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const VALID_REASONS = ["beden_uyumsuzlugu", "renk_farki", "kalite_sorunu", "yanlis_urun", "hasarli", "diger"] as const;

interface RawReturn {
  product_name: string;
  reason_text: string;
  customer_comment?: string;
  returned_at?: string;
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { returns } = await req.json() as { returns: RawReturn[] };
  if (!returns?.length) return NextResponse.json({ error: "İade kaydı bulunamadı" }, { status: 400 });
  if (returns.length > 200) return NextResponse.json({ error: "Maksimum 200 kayıt yüklenebilir" }, { status: 400 });

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const list = returns
    .map((r, i) => `${i + 1}. Ürün: ${r.product_name} | Sebep: ${r.reason_text}`)
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 1000,
    temperature: 0,
    messages: [{
      role: "user",
      content: `Aşağıdaki e-ticaret iade kayıtlarını sınıflandır. Her biri için tam olarak bu formatta bir satır yaz:
{"i":NUMARA,"reason":"KATEGORI"}

Kategoriler (sadece bunları kullan):
- beden_uyumsuzlugu: beden, numara, ölçü, büyük, küçük, dar, geniş
- renk_farki: renk, ton, fotoğraftan farklı
- kalite_sorunu: kalite, kumaş, dikiş, yırtık, defolu, ince
- yanlis_urun: yanlış ürün, farklı ürün, başka ürün
- hasarli: hasarlı, kırık, ezilmiş, bozuk, paket
- diger: diğer tüm durumlar

${list}`,
    }],
  });

  const text = completion.choices[0]?.message?.content ?? "";
  const classifications: Record<number, string> = {};
  for (const line of text.split("\n")) {
    try {
      const parsed = JSON.parse(line.trim());
      if (parsed.i !== undefined && VALID_REASONS.includes(parsed.reason)) {
        classifications[parsed.i] = parsed.reason;
      }
    } catch {}
  }

  const serviceSupabase = createSupabase(SUPABASE_URL, SERVICE_ROLE);

  const rows = returns.map((r, i) => ({
    seller_id: user.id,
    marketplace: "trendyol",
    product_id: `csv-${Date.now()}-${i}`,
    product_name: r.product_name,
    reason: classifications[i + 1] ?? "diger",
    customer_comment: r.customer_comment || null,
    returned_at: r.returned_at || new Date().toISOString(),
  }));

  const { error } = await serviceSupabase.from("returns").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ count: rows.length });
}
