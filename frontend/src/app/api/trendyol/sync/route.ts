/**
 * POST /api/trendyol/sync  — kullanıcı tetiklemeli (session auth)
 * GET  /api/trendyol/sync  — Vercel Cron (Authorization: Bearer CRON_SECRET)
 *                            Tüm bağlı satıcıları sırayla senkronize eder.
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

// ── İade senkronizasyonu ─────────────────────────────────────────────────────

interface TyClaim {
  id?:                number | string;
  claimId?:           number | string;
  productId?:         number | string;
  barcode?:           string;
  productName?:       string;
  productModelName?:  string;
  claimReason?:       string;
  returnReason?:      string;
  claimReasonText?:   string;
  reasonText?:        string;
  customerFirstName?: string;
  customerLastName?:  string;
  createdDate?:       string;
  returnDate?:        string;
}

const RETURN_REASON_MAP: Record<string, string> = {
  SIZE_INCOMPATIBILITY:       "beden_uyumsuzlugu",
  BEDEN_UYUMSUZLUGU:          "beden_uyumsuzlugu",
  COLOR_DIFFERENCE:           "renk_farki",
  RENK_FARKI:                 "renk_farki",
  DOES_NOT_MATCH_DESCRIPTION: "renk_farki",
  QUALITY_ISSUE:              "kalite_sorunu",
  KALITE_SORUNU:              "kalite_sorunu",
  WRONG_DELIVERY:             "yanlis_urun",
  YANLIS_URUN:                "yanlis_urun",
  DEFECTIVE:                  "hasarli",
  DAMAGED:                    "hasarli",
  HASARLI:                    "hasarli",
};

async function syncReturns(
  db: SupabaseClient,
  sellerId: string,
  supplierId: string,
  headers: Record<string, string>,
): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  let synced = 0;
  let page = 0;
  const size = 100;

  while (true) {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    const url = `${TY_BASE}/suppliers/${supplierId}/claims?${params}`;
    let res: Response;
    try {
      res = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
    } catch (e) {
      errors.push(`İade sayfa ${page} isteği başarısız: ${e}`);
      break;
    }
    if (!res.ok) { errors.push(`İade API hatası: ${res.status} ${res.statusText}`); break; }

    const body = await res.json() as { content: TyClaim[]; totalPages: number };
    const items = body.content ?? [];
    if (items.length === 0) break;

    const rows = items.map((r) => {
      const rawReason = String(r.claimReason ?? r.returnReason ?? "").toUpperCase();
      const customerName = [r.customerFirstName, r.customerLastName].filter(Boolean).join(" ");
      const comment = r.claimReasonText ?? r.reasonText ?? (customerName || null);
      return {
        seller_id:            sellerId,
        marketplace:          "trendyol",
        marketplace_return_id: String(r.id ?? r.claimId ?? ""),
        product_id:           String(r.productId ?? r.barcode ?? ""),
        product_name:         r.productName ?? r.productModelName ?? "",
        reason:               RETURN_REASON_MAP[rawReason] ?? "diger",
        customer_comment:     comment,
        returned_at:          parseTyDate(r.createdDate ?? r.returnDate),
      };
    });

    const { error } = await db.from("returns")
      .upsert(rows, { onConflict: "seller_id,marketplace,marketplace_return_id", ignoreDuplicates: false });
    if (error) errors.push(`İade kaydetme hatası: ${error.message}`);
    else synced += rows.length;

    if (page >= (body.totalPages ?? 1) - 1 || items.length < size) break;
    page++;
  }

  return { synced, errors };
}

// ── Yorum senkronizasyonu ─────────────────────────────────────────────────────

interface TyReview {
  id:                number | string;
  productId?:        number | string;
  productBarcode?:   string;
  productName?:      string;
  productModelName?: string;
  rate?:             number;
  starCount?:        number;
  text?:             string;
  comment?:          string;
  sellerName?:       string;
  userFullName?:     string;
  sellerComment?:    string;
  reply?:            string;
  reviewDate?:       string;
  creationDate?:     string;
}

function parseTyDate(raw: string | undefined | null): string {
  if (!raw) return new Date().toISOString();
  // ISO with offset → direct
  if (/T.*[Z+\-]\d{2}/.test(raw)) return new Date(raw).toISOString();
  // "2024-01-15T12:00:00" without tz → assume UTC
  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return new Date(raw + "Z").toISOString();
  // "2024-01-15"
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return new Date(raw + "T00:00:00Z").toISOString();
  return new Date().toISOString();
}

async function syncReviews(
  db: SupabaseClient,
  sellerId: string,
  supplierId: string,
  headers: Record<string, string>,
): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  let synced = 0;
  let page = 0;
  const size = 100;
  const endMs   = Date.now();
  const startMs = endMs - 90 * 86400 * 1000; // son 90 gün

  while (true) {
    const params = new URLSearchParams({
      page: String(page), size: String(size),
      orderByField: "CreatedDate", orderByDirection: "DESC",
      startDate: String(startMs), endDate: String(endMs),
    });
    const url = `${TY_BASE}/suppliers/${supplierId}/reviews?${params}`;
    let res: Response;
    try {
      res = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
    } catch (e) {
      errors.push(`Yorum sayfa ${page} isteği başarısız: ${e}`);
      break;
    }
    if (!res.ok) { errors.push(`Yorum API hatası: ${res.status} ${res.statusText}`); break; }

    const body = await res.json() as { content: TyReview[]; totalPages: number };
    const items = body.content ?? [];
    if (items.length === 0) break;

    const rows = items.map((r) => {
      const rating = r.rate ?? r.starCount ?? 3;
      return {
        seller_id:             sellerId,
        marketplace:           "trendyol",
        marketplace_review_id: String(r.id),
        product_id:            String(r.productId ?? r.productBarcode ?? ""),
        product_name:          r.productName ?? r.productModelName ?? "",
        rating,
        comment:               r.text ?? r.comment ?? "",
        customer_name:         r.sellerName ?? r.userFullName ?? "",
        is_urgent:             rating <= 2,
        is_replied:            !!(r.sellerComment ?? r.reply),
        reviewed_at:           parseTyDate(r.reviewDate ?? r.creationDate),
      };
    });

    const { error } = await db.from("reviews")
      .upsert(rows, { onConflict: "seller_id,marketplace,marketplace_review_id", ignoreDuplicates: false });
    if (error) errors.push(`Yorum kaydetme hatası: ${error.message}`);
    else synced += rows.length;

    if (page >= (body.totalPages ?? 1) - 1 || items.length < size) break;
    page++;
  }

  return { synced, errors };
}

// ── Soru senkronizasyonu ──────────────────────────────────────────────────────

interface TyQuestion {
  id?:                 number | string;
  questionId?:         number | string;
  productId?:          number | string;
  productContentId?:   number | string;
  productName?:        string;
  productModelName?:   string;
  text?:               string;
  questionText?:       string;
  publicQuestion?:     string;
  question?:           string;
  status?:             string;
  answers?:            unknown[];
  createdDate?:        string;
  askDate?:            string;
}

async function syncQuestions(
  db: SupabaseClient,
  sellerId: string,
  supplierId: string,
  headers: Record<string, string>,
): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  let synced = 0;
  let page = 0;
  const size = 100;

  while (true) {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    const url = `${TY_BASE}/suppliers/${supplierId}/questions?${params}`;
    let res: Response;
    try {
      res = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
    } catch (e) {
      errors.push(`Soru sayfa ${page} isteği başarısız: ${e}`);
      break;
    }
    if (!res.ok) { errors.push(`Soru API hatası: ${res.status} ${res.statusText}`); break; }

    const body = await res.json() as { content: TyQuestion[]; totalPages: number };
    const items = body.content ?? [];
    if (items.length === 0) break;

    const rows = items.map((q) => {
      const qId = String(q.id ?? q.questionId ?? "");
      const qText = q.text ?? q.questionText ?? q.publicQuestion ?? q.question ?? "";
      const status = String(q.status ?? "").toUpperCase();
      const isAnswered = status === "ANSWERED" || (Array.isArray(q.answers) && q.answers.length > 0);
      return {
        seller_id:               sellerId,
        marketplace:             "trendyol",
        marketplace_question_id: qId,
        product_id:              String(q.productId ?? q.productContentId ?? ""),
        product_name:            q.productName ?? q.productModelName ?? "",
        question:                qText,
        is_answered:             isAnswered,
        asked_at:                parseTyDate(q.createdDate ?? q.askDate),
      };
    });

    const { error } = await db.from("questions")
      .upsert(rows, { onConflict: "seller_id,marketplace,marketplace_question_id", ignoreDuplicates: false });
    if (error) errors.push(`Soru kaydetme hatası: ${error.message}`);
    else synced += rows.length;

    if (page >= (body.totalPages ?? 1) - 1 || items.length < size) break;
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

  const [productResult, orderResult, reviewResult, questionResult, returnResult] = await Promise.all([
    syncProducts(db, user.id, supplierId, headers),
    syncOrders(db, user.id, supplierId, headers),
    syncReviews(db, user.id, supplierId, headers),
    syncQuestions(db, user.id, supplierId, headers),
    syncReturns(db, user.id, supplierId, headers),
  ]);

  await db.from("sellers").update({ last_synced_at: new Date().toISOString() }).eq("id", user.id);

  const allErrors = [
    ...productResult.errors, ...orderResult.errors,
    ...reviewResult.errors,  ...questionResult.errors,
    ...returnResult.errors,
  ];

  return NextResponse.json({
    ok:        allErrors.length === 0,
    products:  productResult.synced,
    orders:    orderResult.synced,
    reviews:   reviewResult.synced,
    questions: questionResult.synced,
    returns:   returnResult.synced,
    errors:    allErrors,
    syncedAt:  new Date().toISOString(),
  });
}

// ── Expo push notification ────────────────────────────────────────────────────

async function sendPush(token: string, title: string, body: string, data: Record<string, string> = {}) {
  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ to: token, title, body, sound: "default", badge: 1, data }),
      signal: AbortSignal.timeout(8_000),
    });
  } catch { /* push is best-effort */ }
}

async function maybePushAlerts(db: SupabaseClient, sellerId: string) {
  const { data: seller } = await db
    .from("sellers")
    .select("push_token")
    .eq("id", sellerId)
    .single();
  if (!seller?.push_token) return;

  const since = new Date(Date.now() - 25 * 3600 * 1000).toISOString();

  const [{ count: urgentReviews }, { count: pendingQuestions }] = await Promise.all([
    db.from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", sellerId)
      .eq("is_urgent", true)
      .eq("is_replied", false)
      .gte("reviewed_at", since),
    db.from("questions")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", sellerId)
      .eq("is_answered", false)
      .gte("asked_at", since),
  ]);

  const total = (urgentReviews ?? 0) + (pendingQuestions ?? 0);
  if (total === 0) return;

  const parts: string[] = [];
  if ((urgentReviews ?? 0) > 0) parts.push(`${urgentReviews} acil yorum`);
  if ((pendingQuestions ?? 0) > 0) parts.push(`${pendingQuestions} yeni soru`);

  const screen = (urgentReviews ?? 0) > 0 ? "reviews" : "questions";
  await sendPush(seller.push_token, "SatıcıPilot — Aksiyon Gerekiyor", parts.join(", ") + " bekliyor", { screen });
}

// ── Cron handler (GET) ────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createServiceClient(SUPABASE_URL, SERVICE_ROLE);

  const { data: creds } = await db
    .from("marketplace_credentials")
    .select("seller_id, api_key, api_secret, supplier_id, store_id")
    .eq("marketplace", "trendyol");

  if (!creds || creds.length === 0) {
    return NextResponse.json({ ok: true, sellers: 0, results: [] });
  }

  const results: Array<{
    seller_id: string;
    products?: number; orders?: number; reviews?: number;
    questions?: number; returns?: number;
    errors?: string[]; skipped?: string;
  }> = [];

  for (const cred of creds) {
    let apiKey: string, apiSecret: string;
    try {
      apiKey    = decrypt(cred.api_key);
      apiSecret = decrypt(cred.api_secret);
    } catch {
      results.push({ seller_id: cred.seller_id, skipped: "decrypt_error" });
      continue;
    }

    const supplierId = cred.supplier_id || cred.store_id || "";
    if (!apiKey || !apiSecret || !supplierId) {
      results.push({ seller_id: cred.seller_id, skipped: "missing_credentials" });
      continue;
    }

    const headers = tyHeaders(apiKey, apiSecret, supplierId);

    try {
      const [p, o, r, q, ret] = await Promise.all([
        syncProducts(db, cred.seller_id, supplierId, headers),
        syncOrders(db, cred.seller_id, supplierId, headers),
        syncReviews(db, cred.seller_id, supplierId, headers),
        syncQuestions(db, cred.seller_id, supplierId, headers),
        syncReturns(db, cred.seller_id, supplierId, headers),
      ]);

      await db.from("sellers")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("id", cred.seller_id);

      await maybePushAlerts(db, cred.seller_id);

      results.push({
        seller_id: cred.seller_id,
        products:  p.synced, orders: o.synced,
        reviews:   r.synced, questions: q.synced, returns: ret.synced,
        errors:    [...p.errors, ...o.errors, ...r.errors, ...q.errors, ...ret.errors],
      });
    } catch (e) {
      results.push({ seller_id: cred.seller_id, skipped: String(e) });
    }
  }

  return NextResponse.json({ ok: true, sellers: results.length, results });
}
