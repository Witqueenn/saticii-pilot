/**
 * POST /api/trendyol/sync
 *
 * Pulls products and recent orders from Trendyol API, upserts to Supabase.
 * Returns { products, orders, errors[] }.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient, SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { decrypt } from "@/app/api/credentials/route";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TY_BASE      = "https://api.trendyol.com/sapigw";
const TIMEOUT_MS   = 20_000;

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

function tyHeaders(apiKey: string, apiSecret: string, supplierId: string) {
  return {
    Authorization: "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64"),
    "User-Agent": `${supplierId} - SaticiPilot`,
    "Content-Type": "application/json",
  };
}

// ── Ürün senkronizasyonu ──────────────────────────────────────────────────────

interface TyProduct {
  productCode: string;
  title: string;
  categoryName?: string;
  salePrice?: number;
  listPrice?: number;
  quantity?: number;
  description?: string;
  images?: { url: string }[];
}

function calcDescriptionScore(desc: string | null | undefined): number {
  if (!desc?.trim()) return 0;
  const d = desc.trim();
  let score = 20;
  if (d.length > 80)  score += 15;
  if (d.length > 250) score += 15;
  if (d.length > 600) score += 10;
  if (/\d/.test(d)) score += 10;
  if (d.split(/[.!?\n]/).filter(Boolean).length > 2) score += 10;
  if (/(cm|mm|gr|kg|ml|lt|adet|renk|beden|numara)/i.test(d)) score += 10;
  if (!/[A-ZÜĞŞÇÖİ]{6,}/.test(d)) score += 10;
  return Math.min(100, score);
}

function calcSeoScore(title: string): number {
  if (!title?.trim()) return 0;
  const t = title.trim();
  let score = 10;
  if (t.length >= 25) score += 15;
  if (t.length >= 50) score += 10;
  if (t.length >= 70 && t.length <= 130) score += 10;
  if (/\d/.test(t)) score += 10;
  if (t.split(/\s+/).length >= 4) score += 15;
  if (t.split(/\s+/).length >= 7) score += 10;
  if (!/[A-ZÜĞŞÇÖİ]{6,}/.test(t)) score += 10;
  if (!(/[!?]{2,}/.test(t))) score += 10;
  return Math.min(100, score);
}

async function syncProducts(
  db: SupabaseClient,
  sellerId: string,
  supplierId: string,
  headers: Record<string, string>,
): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  let synced = 0;
  let page = 0;
  const size = 200;

  while (true) {
    const url = `${TY_BASE}/product/sellers/${supplierId}/products?page=${page}&size=${size}&approved=true`;
    let res: Response;
    try {
      res = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
    } catch (e) {
      errors.push(`Ürün sayfa ${page} isteği başarısız: ${e}`);
      break;
    }

    if (!res.ok) {
      errors.push(`Ürün API hatası: ${res.status} ${res.statusText}`);
      break;
    }

    const body = await res.json() as { content: TyProduct[]; totalPages: number };
    const products = body.content ?? [];

    if (products.length > 0) {
      const rows = products.map((p) => ({
        seller_id:        sellerId,
        name:             p.title,
        category:         p.categoryName ?? null,
        price:            p.salePrice ?? p.listPrice ?? null,
        stock:            p.quantity ?? 0,
        description:      p.description ?? null,
        marketplace:      "trendyol",
        description_score: calcDescriptionScore(p.description),
        seo_score:         calcSeoScore(p.title),
      }));

      const { error } = await db.from("products")
        .upsert(rows, { onConflict: "seller_id,name", ignoreDuplicates: false });
      if (error) errors.push(`Ürün kaydetme hatası: ${error.message}`);
      else synced += rows.length;
    }

    if (page >= (body.totalPages ?? 1) - 1 || products.length < size) break;
    page++;
  }

  return { synced, errors };
}

// ── Sipariş senkronizasyonu ───────────────────────────────────────────────────

interface TyOrderLine {
  productName: string;
  barcode:     string;
  quantity:    number;
  price:       number;
  productCode: string;
}

interface TyOrder {
  orderNumber:    string;
  status:         string;
  totalPrice:     number;
  orderDate:      number; // unix ms
  lines:          TyOrderLine[];
}

const STATUS_MAP: Record<string, string> = {
  Created:     "created",
  Picking:     "picking",
  Invoiced:    "invoiced",
  Shipped:     "shipped",
  Delivered:   "delivered",
  Cancelled:   "cancelled",
  UnDelivered: "returned",
};

async function syncOrders(
  db: SupabaseClient,
  sellerId: string,
  supplierId: string,
  headers: Record<string, string>,
): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  let synced = 0;
  let page = 0;
  const size = 200;

  // Son 60 günü çek
  const orderDateEnd   = Date.now();
  const orderDateStart = orderDateEnd - 60 * 86400 * 1000;

  while (true) {
    const params = new URLSearchParams({
      status: "Created,Picking,Invoiced,Shipped,Delivered,Cancelled,UnDelivered",
      orderDateStart: String(orderDateStart),
      orderDateEnd:   String(orderDateEnd),
      page: String(page),
      size: String(size),
    });
    const url = `${TY_BASE}/integration/order/sellers/${supplierId}/orders?${params}`;
    let res: Response;
    try {
      res = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
    } catch (e) {
      errors.push(`Sipariş sayfa ${page} isteği başarısız: ${e}`);
      break;
    }

    if (!res.ok) {
      errors.push(`Sipariş API hatası: ${res.status} ${res.statusText}`);
      break;
    }

    const body = await res.json() as { content: TyOrder[]; totalPages: number };
    const orders = body.content ?? [];

    if (orders.length > 0) {
      const rows = orders.map((o) => ({
        seller_id:            sellerId,
        marketplace_order_id: String(o.orderNumber),
        status:               STATUS_MAP[o.status] ?? "created",
        total_price:          o.totalPrice ?? null,
        ordered_at:           new Date(o.orderDate).toISOString(),
        line_items:           (o.lines ?? []).map((ln) => ({
          product_name: ln.productName,
          barcode:      ln.barcode,
          quantity:     ln.quantity,
          price:        ln.price,
          product_id:   ln.productCode,
        })),
      }));

      const { error } = await db.from("orders")
        .upsert(rows, { onConflict: "seller_id,marketplace_order_id", ignoreDuplicates: false });
      if (error) errors.push(`Sipariş kaydetme hatası: ${error.message}`);
      else synced += rows.length;
    }

    if (page >= (body.totalPages ?? 1) - 1 || orders.length < size) break;
    page++;
  }

  return { synced, errors };
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createServiceClient(SUPABASE_URL, SERVICE_ROLE);

  const { data: cred } = await db
    .from("marketplace_credentials")
    .select("api_key, api_secret, supplier_id, store_id")
    .eq("seller_id", user.id)
    .eq("marketplace", "trendyol")
    .maybeSingle();

  if (!cred) {
    return NextResponse.json({ error: "Trendyol credentials bulunamadı" }, { status: 400 });
  }

  let apiKey: string, apiSecret: string;
  try {
    apiKey    = decrypt(cred.api_key);
    apiSecret = decrypt(cred.api_secret);
  } catch {
    return NextResponse.json({ error: "Credential şifre çözme hatası" }, { status: 500 });
  }

  const supplierId = cred.supplier_id || cred.store_id || "";
  if (!apiKey || !apiSecret || !supplierId) {
    return NextResponse.json({ error: "API Key, Secret ve Supplier ID gerekli" }, { status: 400 });
  }

  const headers = tyHeaders(apiKey, apiSecret, supplierId);

  const [productResult, orderResult] = await Promise.all([
    syncProducts(db, user.id, supplierId, headers),
    syncOrders(db, user.id, supplierId, headers),
  ]);

  // Son senkronizasyon zamanını güncelle
  await db.from("sellers").update({ last_synced_at: new Date().toISOString() }).eq("id", user.id);

  const allErrors = [...productResult.errors, ...orderResult.errors];

  return NextResponse.json({
    ok: allErrors.length === 0,
    products: productResult.synced,
    orders:   orderResult.synced,
    errors:   allErrors,
    syncedAt: new Date().toISOString(),
  });
}
