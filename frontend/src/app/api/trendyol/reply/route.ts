/**
 * POST /api/trendyol/reply
 *
 * Trendyol'a yorum yanıtı gönderir ve DB'yi günceller.
 * Body: { review_id: string, reply_text: string }
 * Returns: { ok, trendyol_ok, message }
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { decrypt } from "@/app/api/credentials/route";

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY      = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TY_BASE       = "https://api.trendyol.com/sapigw";

async function getUser(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const sb = createServiceClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: { user }, error } = await sb.auth.getUser(auth.slice(7));
    if (error || !user) return null;
    return user;
  }
  const cookieStore = await cookies();
  const sb = createServerClient(SUPABASE_URL, ANON_KEY, {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  });
  const { data: { user } } = await sb.auth.getUser();
  return user ?? null;
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { review_id, reply_text } = await req.json() as { review_id: string; reply_text: string };
  if (!review_id || !reply_text?.trim()) {
    return NextResponse.json({ error: "review_id ve reply_text gerekli" }, { status: 400 });
  }

  const db = createServiceClient(SUPABASE_URL, SERVICE_ROLE);

  // Yorumu ve marketplace_review_id'yi çek
  const { data: review } = await db
    .from("reviews")
    .select("id, marketplace_review_id, marketplace")
    .eq("id", review_id)
    .eq("seller_id", user.id)
    .single();

  if (!review) return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 404 });

  // DB'yi güncelle (Trendyol'dan bağımsız)
  await db.from("reviews")
    .update({ is_replied: true, suggested_reply: reply_text.trim() })
    .eq("id", review_id);

  // marketplace_review_id yoksa sadece DB güncellemesi yeterli
  if (!review.marketplace_review_id || review.marketplace !== "trendyol") {
    return NextResponse.json({ ok: true, trendyol_ok: false, message: "Yanıt kaydedildi (Trendyol ID yok)" });
  }

  // Trendyol credentials
  const { data: cred } = await db
    .from("marketplace_credentials")
    .select("api_key, api_secret, supplier_id, store_id")
    .eq("seller_id", user.id)
    .eq("marketplace", "trendyol")
    .maybeSingle();

  if (!cred) return NextResponse.json({ ok: true, trendyol_ok: false, message: "Yanıt kaydedildi (credential yok)" });

  let apiKey: string, apiSecret: string;
  try {
    apiKey    = decrypt(cred.api_key);
    apiSecret = decrypt(cred.api_secret);
  } catch {
    return NextResponse.json({ ok: true, trendyol_ok: false, message: "Yanıt kaydedildi (credential hatası)" });
  }

  const supplierId = cred.supplier_id || cred.store_id || "";
  const authHeader = "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  try {
    const tyRes = await fetch(
      `${TY_BASE}/product/sellers/${supplierId}/reviews/${review.marketplace_review_id}/seller-comments`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "User-Agent": `${supplierId} - SaticiPilot`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentText: reply_text.trim() }),
        signal: AbortSignal.timeout(15_000),
      },
    );

    if (tyRes.ok || tyRes.status === 200 || tyRes.status === 201) {
      return NextResponse.json({ ok: true, trendyol_ok: true, message: "Trendyol'a başarıyla gönderildi" });
    }

    const errText = await tyRes.text().catch(() => "");
    return NextResponse.json({
      ok: true, trendyol_ok: false,
      message: `Yanıt kaydedildi. Trendyol hatası: ${tyRes.status}${errText ? " — " + errText.slice(0, 120) : ""}`,
    });
  } catch (e) {
    return NextResponse.json({
      ok: true, trendyol_ok: false,
      message: `Yanıt kaydedildi. Trendyol'a ulaşılamadı: ${String(e).slice(0, 80)}`,
    });
  }
}
