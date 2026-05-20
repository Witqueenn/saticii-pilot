export interface CompetitorRow {
  id: string;
  our_product_id: string;
  our_product_name: string;
  our_price: number;
  competitor_name: string;
  competitor_product_name: string | null;
  competitor_price: number;
  category: string | null;
  checked_at: string;
}

export interface ProductGroup {
  our_product_id: string;
  our_product_name: string;
  our_price: number;
  minCompetitorPrice: number;
  latestCheckedAt: string;
  competitors: CompetitorRow[];
}

export function getStatus(our: number, min: number): "pahali" | "uygun" | "ucuz" {
  const ratio = our / min;
  if (ratio > 1.05) return "pahali";
  if (ratio < 0.95) return "ucuz";
  return "uygun";
}

export function timeAgo(iso: string): string {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hours < 1) return "az önce";
  if (hours < 24) return `${hours} saat önce`;
  return `${Math.floor(hours / 24)} gün önce`;
}

export function fmt(n: number): string {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function groupRows(rows: CompetitorRow[]): ProductGroup[] {
  const map = new Map<string, ProductGroup>();
  for (const row of rows) {
    const existing = map.get(row.our_product_id);
    if (!existing) {
      map.set(row.our_product_id, {
        our_product_id: row.our_product_id,
        our_product_name: row.our_product_name,
        our_price: row.our_price,
        minCompetitorPrice: row.competitor_price,
        latestCheckedAt: row.checked_at,
        competitors: [row],
      });
    } else {
      existing.competitors.push(row);
      if (row.competitor_price < existing.minCompetitorPrice) {
        existing.minCompetitorPrice = row.competitor_price;
      }
      if (new Date(row.checked_at) > new Date(existing.latestCheckedAt)) {
        existing.latestCheckedAt = row.checked_at;
      }
    }
  }
  return Array.from(map.values());
}
