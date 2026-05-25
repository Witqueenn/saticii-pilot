import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { product_name, our_price, category, competitors } = await req.json();
  if (!product_name || !our_price || !Array.isArray(competitors) || competitors.length === 0) {
    return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
  }

  const compList = competitors
    .map((c: { name: string; price: number }) => `- ${c.name}: ₺${c.price}`)
    .join("\n");

  const minPrice = Math.min(...competitors.map((c: { price: number }) => c.price));
  const maxPrice = Math.max(...competitors.map((c: { price: number }) => c.price));
  const avgPrice = Math.round(competitors.reduce((s: number, c: { price: number }) => s + c.price, 0) / competitors.length);

  const prompt = `Sen Türk e-ticaret piyasasında deneyimli bir fiyatlandırma danışmanısın. Trendyol'da satış yapan bir satıcı için fiyat analizi yap.

Ürün: ${product_name}${category ? ` (Kategori: ${category})` : ""}
Bizim fiyatımız: ₺${our_price}

Rakip fiyatları:
${compList}

İstatistikler:
- En ucuz rakip: ₺${minPrice}
- En pahalı rakip: ₺${maxPrice}
- Ortalama rakip fiyatı: ₺${avgPrice}

Şu konuları analiz et:
1. Mevcut fiyat konumumu (pahalı mı, uygun mu, ucuz mu?) 2-3 cümle
2. Somut fiyat önerisi (TL olarak aralık ver)
3. Neden bu fiyat aralığı? 1-2 cümle gerekçe
4. Varsa dikkat edilmesi gereken risk (1 cümle)

Yanıtı Türkçe, kısa ve pratik yaz. 150 kelimeyi geçme.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const suggestion = data.content?.[0]?.text ?? null;
    return NextResponse.json({ suggestion });
  } catch (err) {
    console.error("price-suggestion error:", err);
    return NextResponse.json({ error: "AI hatası" }, { status: 500 });
  }
}
