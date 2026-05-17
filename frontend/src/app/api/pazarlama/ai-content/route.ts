import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { subject, product, tone } = await req.json();
  if (!subject) return NextResponse.json({ error: "Konu gerekli" }, { status: 400 });

  const toneMap: Record<string, string> = {
    samimi: "samimi, arkadaşça ve sıcak",
    profesyonel: "profesyonel ve güven verici",
    acil: "aciliyet hissi veren, fırsatı kaçırma korkusu yaratan",
  };

  const prompt = `Sen bir Türk e-ticaret mağazası için uzman bir pazarlama yazarısın. Doğal, satış odaklı Türkçe yazıyorsun.

Konu: "${subject}"${product ? `\nÜrün/Kampanya: "${product}"` : ""}
Ton: ${toneMap[tone] ?? toneMap.samimi}

Tam olarak şu formatta JSON döndür (başka hiçbir şey yazma):
{
  "email_body": "E-posta metni buraya (max 120 kelime, paragraflar arası boş satır)",
  "instagram_caption": "Instagram gönderisi buraya (2-3 cümle, enerjik)",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = completion.choices[0].message.content ?? "{}";
  const result = JSON.parse(content);

  return NextResponse.json(result);
}
