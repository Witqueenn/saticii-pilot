/**
 * POST /api/trendyol/test
 *
 * Tests a seller's Trendyol API credentials by making a live API call.
 * Accepts both cookie auth (web) and Bearer token auth (mobile).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { decrypt } from "@/app/api/credentials/route";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TRENDYOL_BASE = "https://api.trendyol.com/sapigw";

async function getUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const sb = createServiceClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: { user }, error } = await sb.auth.getUser(token);
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

  const serviceDb = createServiceClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: cred, error } = await serviceDb
    .from("marketplace_credentials")
    .select("api_key, api_secret, supplier_id, store_id")
    .eq("seller_id", user.id)
    .eq("marketplace", "trendyol")
    .maybeSingle();

  if (error || !cred) {
    return NextResponse.json({ ok: false, error: "Trendyol credentials bulunamadı. Lütfen önce bağlantı bilgilerini kaydedin." }, { status: 400 });
  }

  let apiKey: string, apiSecret: string;
  try {
    apiKey = cred.api_key ? decrypt(cred.api_key) : "";
    apiSecret = cred.api_secret ? decrypt(cred.api_secret) : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Credential şifre çözme hatası. CREDENTIAL_ENCRYPTION_KEY kontrol edin." }, { status: 500 });
  }

  const supplierId: string = cred.supplier_id || cred.store_id || "";
  if (!apiKey || !apiSecret || !supplierId) {
    return NextResponse.json({ ok: false, error: "API Key, API Secret ve Supplier ID gerekli." }, { status: 400 });
  }

  // Test call: fetch first page of products (lightweight)
  const authHeader = "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  try {
    const res = await fetch(
      `${TRENDYOL_BASE}/product/sellers/${supplierId}/products?page=0&size=1`,
      {
        headers: {
          Authorization: authHeader,
          "User-Agent": `${supplierId} - SaticiPilot`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(15_000),
      },
    );

    if (res.ok) {
      const body = await res.json();
      const productCount = body.totalElements ?? body.content?.length ?? "?";
      return NextResponse.json({ ok: true, message: `Bağlantı başarılı! ${productCount} ürün bulundu.` });
    }

    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({ ok: false, error: "API Key veya Secret hatalı. Trendyol Satıcı Paneli'nden kontrol edin." });
    }

    return NextResponse.json({ ok: false, error: `Trendyol API hatası: ${res.status} ${res.statusText}` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: `Bağlantı hatası: ${msg}` });
  }
}
