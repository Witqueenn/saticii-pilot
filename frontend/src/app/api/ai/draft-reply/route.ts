import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

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

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { review_id, product_name, rating, comment, sentiment } = await req.json();
  if (!comment || !product_name || rating == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: buildPrompt(product_name, rating, comment, sentiment) }],
    max_tokens: 200,
    temperature: 0.7,
  });

  const reply = completion.choices[0]?.message?.content?.trim() ?? "";

  // Veritabanına kaydet
  if (review_id) {
    await supabase
      .from("reviews")
      .update({ suggested_reply: reply })
      .eq("id", review_id)
      .eq("seller_id", user.id);
  }

  return NextResponse.json({ reply });
}
