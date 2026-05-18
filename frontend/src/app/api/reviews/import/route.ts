import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import OpenAI from "openai";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface RawReview {
  product_name: string;
  rating: number;
  comment: string;
  customer_name?: string;
  reviewed_at?: string;
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

  // Toplu sentiment analizi
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const reviewList = reviews
    .map((r, i) => `${i + 1}. Ürün: ${r.product_name} | Puan: ${r.rating}/5 | Yorum: ${r.comment}`)
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 1500,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: `Türkçe e-ticaret yorumlarını analiz et. Her yorum için tek satır JSON döndür.

Sentiment kuralları:
- "olumlu": memnun müşteri, puan 4-5
- "notr": karışık görüş veya puan 3
- "olumsuz": şikayet, puan 1-2
- "acil": iade talebi, hukuki tehdit, very bad experience, çok sert şikayet

is_urgent: sadece "acil" için true.

Her yorum için tam olarak bu formatta bir satır yaz (başka hiçbir şey yazma):
{"i":NUMARA,"sentiment":"...","is_urgent":true_veya_false}

Yorumlar:
${reviewList}`,
      },
    ],
  });

  const responseText = completion.choices[0]?.message?.content ?? "";
  const classifications: Record<number, { sentiment: string; is_urgent: boolean }> = {};

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
