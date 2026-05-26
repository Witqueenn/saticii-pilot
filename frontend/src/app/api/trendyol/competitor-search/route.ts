/**
 * POST /api/trendyol/competitor-search
 * Trendyol public search API ile rakip ürünleri getirir.
 * Body: { query: string }
 * Returns: { products: { id, name, brand, price, seller }[] }
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY      = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

interface TySearchProduct {
  id?: number | string;
  contentId?: number | string;
  name?: string;
  brand?: { name?: string };
  price?: { sellingPrice?: number; originalPrice?: number; discountedPrice?: number };
  ratingScore?: { averageRating?: number; totalCount?: number };
  merchantName?: string;
  seller?: { name?: string };
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { query } = await req.json() as { query: string };
  if (!query?.trim()) return NextResponse.json({ error: "query gerekli" }, { status: 400 });

  const q = encodeURIComponent(query.trim());
  const url = `https://public.trendyol.com/discovery-web-productgw-service/api/infinite-scroll/sp?q=${q}&pi=1&culture=tr-TR&userGenderId=1&pId=0&sst=BEST_SELLER`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SaticiPilot/1.0)",
        Accept: "application/json",
        Referer: "https://www.trendyol.com/",
      },
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) {
      return NextResponse.json({ products: [], error: `Trendyol arama hatası: ${res.status}` });
    }

    const body = await res.json();
    const rawProducts: TySearchProduct[] = body?.result?.products ?? [];

    const products = rawProducts.slice(0, 20).map((p) => ({
      id:     String(p.id ?? p.contentId ?? ""),
      name:   p.name ?? "",
      brand:  p.brand?.name ?? "",
      price:  p.price?.sellingPrice ?? p.price?.discountedPrice ?? p.price?.originalPrice ?? 0,
      seller: p.merchantName ?? p.seller?.name ?? "",
      rating: p.ratingScore?.averageRating ?? null,
    }));

    return NextResponse.json({ products });
  } catch (e) {
    return NextResponse.json({ products: [], error: `Bağlantı hatası: ${String(e).slice(0, 80)}` });
  }
}
