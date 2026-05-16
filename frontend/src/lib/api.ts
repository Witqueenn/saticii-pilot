const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API hatası: ${res.status}`);
  return res.json();
}

export const api = {
  reviews: {
    list: (sellerId: string, urgentOnly = false) =>
      apiFetch<Review[]>(`/reviews?seller_id=${sellerId}&urgent_only=${urgentOnly}`),
    dailySummary: (sellerId: string) =>
      apiFetch<DailySummary>(`/reviews/daily-summary?seller_id=${sellerId}`),
    analyze: (reviewId: string) =>
      apiFetch(`/reviews/${reviewId}/analyze`, { method: "POST" }),
    markReplied: (reviewId: string) =>
      apiFetch(`/reviews/${reviewId}/reply`, { method: "PATCH" }),
  },
  products: {
    list: (sellerId: string, lowScoreOnly = false) =>
      apiFetch<Product[]>(`/products?seller_id=${sellerId}&low_score_only=${lowScoreOnly}`),
    analyze: (productId: string) =>
      apiFetch(`/products/${productId}/analyze`, { method: "POST" }),
  },
  returns: {
    report: (sellerId: string) =>
      apiFetch<ReturnReport>(`/returns/report?seller_id=${sellerId}`),
    list: (sellerId: string) =>
      apiFetch<Return[]>(`/returns?seller_id=${sellerId}`),
  },
};

// Tipler
export interface Review {
  id: string;
  product_name: string;
  rating: number;
  comment: string;
  sentiment: "olumlu" | "notr" | "olumsuz" | "acil" | null;
  is_urgent: boolean;
  is_replied: boolean;
  ai_summary: string | null;
  suggested_reply: string | null;
  reviewed_at: string;
}

export interface DailySummary {
  total: number;
  urgent: number;
  pending_reply: number;
  sentiment_breakdown: Record<string, number>;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string | null;
  description_score: number | null;
  seo_score: number | null;
  ai_suggestions: string[] | null;
  improved_description: string | null;
}

export interface ReturnPattern {
  product_id: string;
  product_name: string;
  total_returns: number;
  dominant_reason: string;
  recommendation: string;
  urgency: "yuksek" | "orta" | "dusuk";
}

export interface ReturnReport {
  total_returns: number;
  patterns: ReturnPattern[];
}

export interface Return {
  id: string;
  product_name: string;
  reason: string;
  returned_at: string;
}
