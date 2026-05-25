import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface RawReview {
  product_name: string;
  rating: number;
  comment: string;
  customer_name?: string;
  reviewed_at?: string;
}

async function classifyReviews(reviewList: string): Promise<string> {
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
      max_tokens: 1500,
      messages: [{
        role: "user",
        content: `Türkçe e-ticaret yorumlarını analiz et. Her yorum için tek satır JSON döndür.

Sentiment kuralları:
- "olumlu": memnun müşteri, puan 4-5
- "notr": karışık görüş veya puan 3
- "olumsuz": şikayet, puan 1-2
- "acil": iade talebi, hukuki tehdit, çok sert şikayet

is_urgent: sadece "acil" için true.

Her yorum için tam olarak bu formatta bir satır yaz (başka hiçbir şey yazma):
{"i":NUMARA,"sentiment":"...","is_urgent":true_veya_false}

Yorumlar:
${reviewList}`,
      }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic API hatası: ${res.status}`);
  const data = await res.json() as { content: { type: string; text: string }[] };
  return data.content?.[0]?.text ?? "";
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reviews } = await req.json() as { reviews: RawReview[] };
  if (!reviews?.length) return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 400 });
  if (reviews.length > 200) return NextResponse.json({ error: "Maksimum 200 yorum yüklenebilir" }, { status: 400 });

  const reviewList = reviews
    .map((r, i) => `${i + 1}. Ürün: ${r.product_name} | Puan: ${r.rating}/5 | Yorum: ${r.comment}`)
    .join("\n");

  const classifications: Record<number, { sentiment: string; is_urgent: boolean }> = {};
  try {
    const responseText = await classifyReviews(reviewList);
    for (const line of responseText.split("\n")) {
      try {
        const parsed = JSON.parse(line.trim());
        if (parsed.i !== undefined) {
          classifications[parsed.i] = {
            sentiment: parsed.sentiment ?? "notr",
            is_urgent: !!parsed.is_urgent,
          };
        }
      } catch {}
    }
  } catch {
    // AI başarısız olursa nötr sentiment ile devam et
  }

  const serviceSupabase = createSupabase(SUPABASE_URL, SERVICE_ROLE);

  const rows = reviews.map((r, i) => {
    const cls = classifications[i + 1] ?? { sentiment: "notr", is_urgent: false };
    return {
      seller_id: user.id,
      marketplace: "trendyol",
      product_id: `csv-${Date.now()}-${i}`,
      product_name: r.product_name,
      rating: Math.min(5, Math.max(1, r.rating)),
      comment: r.comment,
      customer_name: r.customer_name || null,
      sentiment: cls.sentiment,
      is_urgent: cls.is_urgent,
      reviewed_at: r.reviewed_at || new Date().toISOString(),
    };
  });

  const { error } = await serviceSupabase.from("reviews").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ count: rows.length });
}
