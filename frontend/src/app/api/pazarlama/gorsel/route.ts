import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import Replicate from "replicate";

const STYLE_PROMPTS: Record<string, string> = {
  beyaz: "professional product photo on a clean white background, soft shadows, studio lighting, e-commerce style, high resolution",
  instagram: "stylish Instagram post, aesthetically pleasing flat lay, warm tones, lifestyle photography, social media ready",
  kampanya: "bold promotional banner design, vibrant colors, sale/discount theme, eye-catching, modern graphic design",
  lifestyle: "lifestyle product photography, natural light, real-world setting, aspirational, warm and inviting atmosphere",
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const serviceSupabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: seller } = await serviceSupabase
    .from("sellers")
    .select("image_tokens")
    .eq("id", user.id)
    .single();

  if (!seller || (seller.image_tokens ?? 0) <= 0) {
    return NextResponse.json({ error: "Yeterli token yok" }, { status: 402 });
  }

  const { product, style } = await req.json();
  if (!product || !style) return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });

  const styleDesc = STYLE_PROMPTS[style] ?? STYLE_PROMPTS.beyaz;
  const prompt = `${product}, ${styleDesc}. No text, no watermarks.`;

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

  let imageUrl: string;
  try {
    const output = await replicate.run("black-forest-labs/flux-1.1-pro", {
      input: {
        prompt,
        aspect_ratio: "1:1",
        output_format: "webp",
        output_quality: 90,
      },
    });
    imageUrl = typeof output === "string" ? output : (output as string[])?.[0] ?? "";
    if (!imageUrl) throw new Error("No image URL");
  } catch {
    return NextResponse.json({ error: "Görsel oluşturulamadı" }, { status: 500 });
  }

  await serviceSupabase
    .from("sellers")
    .update({ image_tokens: seller.image_tokens - 1 })
    .eq("id", user.id);

  return NextResponse.json({ url: imageUrl, remaining: seller.image_tokens - 1 });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const serviceSupabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: seller } = await serviceSupabase
    .from("sellers")
    .select("image_tokens")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ tokens: seller?.image_tokens ?? 0 });
}
