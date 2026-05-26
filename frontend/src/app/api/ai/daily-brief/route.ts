import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(req, "ai", 20, 3600, user.id);
  if (rl) return rl;

  const {
    urgentReviews, pendingReviews, pendingQuestions,
    weekReturns, lowScoreProducts, weekOrders, weekRevenue,
    topReturnReasons,
  } = await req.json();

  const prompt = `Sen Trendyol'da satış yapan Türk bir KOBİ satıcısına günlük rehberlik eden AI asistanısın.

Satıcının bugünkü verisi:
- Acil yorum (cevap bekliyor): ${urgentReviews}
- Toplam yanıtsız yorum: ${pendingReviews}
- Yanıtsız müşteri sorusu: ${pendingQuestions}
- Bu haftaki iade: ${weekReturns}
- Düşük açıklama puanlı ürün (<60): ${lowScoreProducts}
- Bu haftaki sipariş: ${weekOrders}
- Bu haftaki ciro: ${weekRevenue > 0 ? `₺${weekRevenue.toLocaleString("tr-TR")}` : "veri yok"}
${topReturnReasons ? `- Öne çıkan iade nedeni: ${topReturnReasons}` : ""}

Bu verilere bakarak satıcı için bugün en öncelikli 3-5 aksiyon maddesini üret.
Her madde somut, uygulanabilir ve Türkçe olsun. Eğer bir sorun yoksa bunu da belirt.
JSON formatında döndür: { "items": ["madde 1", "madde 2", ...] }
Her madde 1-2 cümle olsun, maksimum 20 kelime.`;

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
    const text = data.content?.[0]?.text ?? "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ items: [] });

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ items: parsed.items ?? [] });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
