import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export interface ReviewAnalysisResult {
  totalAnalyzed: number;
  sentiment: { positive: number; neutral: number; negative: number };
  complaints: { topic: string; count: number; example: string }[];
  praises: { topic: string; count: number; example: string }[];
  recommendations: string[];
  summary: string;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(req, "ai", 20, 3600, user.id);
  if (rl) return rl;

  const { reviews } = await req.json() as {
    reviews: { rating: number; comment: string; product_name: string }[];
  };

  if (!reviews || reviews.length === 0) {
    return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 400 });
  }

  const reviewText = reviews
    .slice(0, 60)
    .map((r, i) => `${i + 1}. [${r.rating}★] ${r.product_name}: "${r.comment}"`)
    .join("\n");

  const prompt = `Türk e-ticaret satıcısının Trendyol yorumlarını analiz et. Aşağıdaki ${reviews.length} yorumu değerlendir:

${reviewText}

JSON formatında şu bilgileri döndür:
{
  "sentiment": { "positive": <4-5 yıldız sayısı>, "neutral": <3 yıldız sayısı>, "negative": <1-2 yıldız sayısı> },
  "complaints": [
    { "topic": "<kısa konu adı>", "count": <kaç yorumda geçiyor>, "example": "<kısa örnek alıntı>" }
  ],
  "praises": [
    { "topic": "<kısa konu adı>", "count": <kaç yorumda geçiyor>, "example": "<kısa örnek alıntı>" }
  ],
  "recommendations": ["<aksiyon önerisi 1>", "<aksiyon önerisi 2>", "<aksiyon önerisi 3>"],
  "summary": "<2-3 cümlelik genel özet>"
}

Kurallar:
- complaints: en fazla 4 madde, en sık tekrarlanan konular
- praises: en fazla 4 madde, en sık tekrarlanan konular
- recommendations: tam olarak 3 madde, somut ve uygulanabilir
- Tüm metin Türkçe
- Sadece JSON döndür, başka açıklama ekleme`;

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
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "Analiz üretilemedi" }, { status: 500 });

    const parsed = JSON.parse(jsonMatch[0]) as Omit<ReviewAnalysisResult, "totalAnalyzed">;
    return NextResponse.json({ ...parsed, totalAnalyzed: reviews.length });
  } catch {
    return NextResponse.json({ error: "AI hatası" }, { status: 500 });
  }
}
