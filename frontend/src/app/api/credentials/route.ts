import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getEncryptionKey(): Buffer {
  const hex = process.env.CREDENTIAL_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("CREDENTIAL_ENCRYPTION_KEY must be a 64-char hex string (32 bytes). Generate with: openssl rand -hex 32");
  }
  return Buffer.from(hex, "hex");
}

function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("hex"), tag.toString("hex"), encrypted.toString("hex")].join(":");
}

export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  const parts = ciphertext.split(":");
  if (parts.length !== 3) throw new Error("Invalid ciphertext format");
  const [ivHex, tagHex, encHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const enc = Buffer.from(encHex, "hex");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

async function getUser(req: NextRequest) {
  // Support both cookie auth (web) and Bearer token auth (mobile)
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

const VALID_MARKETPLACES = new Set([
  "trendyol", "hepsiburada", "n11", "amazon_tr", "pazarama",
  "etsy", "woocommerce", "shopify", "custom_website", "instagram",
]);

// POST /api/credentials — save encrypted credentials
export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 }); }

  const { marketplace, api_key, api_secret, supplier_id } = body as Record<string, unknown>;

  if (!marketplace || typeof marketplace !== "string" || !VALID_MARKETPLACES.has(marketplace))
    return NextResponse.json({ error: "Geçersiz marketplace" }, { status: 400 });
  if (api_key !== undefined && (typeof api_key !== "string" || api_key.length > 500))
    return NextResponse.json({ error: "api_key çok uzun" }, { status: 400 });
  if (api_secret !== undefined && (typeof api_secret !== "string" || api_secret.length > 500))
    return NextResponse.json({ error: "api_secret çok uzun" }, { status: 400 });
  if (supplier_id !== undefined && supplier_id !== null && (typeof supplier_id !== "string" || supplier_id.length > 100))
    return NextResponse.json({ error: "supplier_id geçersiz" }, { status: 400 });

  const serviceDb = createServiceClient(SUPABASE_URL, SERVICE_ROLE);
  const { error } = await serviceDb.from("marketplace_credentials").upsert(
    {
      seller_id: user.id,
      marketplace,
      api_key: api_key ? encrypt(api_key as string) : "",
      api_secret: api_secret ? encrypt(api_secret as string) : "",
      supplier_id: (supplier_id as string | null) || null,
    },
    { onConflict: "seller_id,marketplace" },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/credentials — remove credentials for a marketplace
export async function DELETE(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 }); }

  const { marketplace } = body as Record<string, unknown>;
  if (!marketplace || typeof marketplace !== "string" || !VALID_MARKETPLACES.has(marketplace))
    return NextResponse.json({ error: "Geçersiz marketplace" }, { status: 400 });

  const serviceDb = createServiceClient(SUPABASE_URL, SERVICE_ROLE);
  const { error } = await serviceDb
    .from("marketplace_credentials")
    .delete()
    .eq("seller_id", user.id)
    .eq("marketplace", marketplace);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
