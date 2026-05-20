import { getStatus, timeAgo, fmt, groupRows, type CompetitorRow } from "@/lib/competitorUtils";

// ── getStatus ─────────────────────────────────────────────────────────────────

describe("getStatus", () => {
  it("pahalı: bizim fiyat rakipten %5'ten fazla yüksekse", () => {
    expect(getStatus(106, 100)).toBe("pahali");
    expect(getStatus(110, 100)).toBe("pahali");
  });

  it("ucuz: bizim fiyat rakipten %5'ten fazla düşükse", () => {
    expect(getStatus(94, 100)).toBe("ucuz");
    expect(getStatus(80, 100)).toBe("ucuz");
  });

  it("uygun: fark ±%5 içindeyse", () => {
    expect(getStatus(100, 100)).toBe("uygun");
    expect(getStatus(105, 100)).toBe("uygun"); // tam eşik — dahil
    expect(getStatus(95, 100)).toBe("uygun");  // tam eşik — dahil
    expect(getStatus(102, 100)).toBe("uygun");
  });

  it("sıfır fiyata karşı bölme hatası üretmez", () => {
    expect(() => getStatus(100, 0)).not.toThrow();
  });
});

// ── timeAgo ──────────────────────────────────────────────────────────────────

describe("timeAgo", () => {
  function isoHoursAgo(h: number) {
    return new Date(Date.now() - h * 3600000).toISOString();
  }

  it("1 saatten az → 'az önce'", () => {
    expect(timeAgo(isoHoursAgo(0.5))).toBe("az önce");
    expect(timeAgo(new Date().toISOString())).toBe("az önce");
  });

  it("1–23 saat → '<n> saat önce'", () => {
    expect(timeAgo(isoHoursAgo(1))).toBe("1 saat önce");
    expect(timeAgo(isoHoursAgo(5))).toBe("5 saat önce");
    expect(timeAgo(isoHoursAgo(23))).toBe("23 saat önce");
  });

  it("24+ saat → '<n> gün önce'", () => {
    expect(timeAgo(isoHoursAgo(24))).toBe("1 gün önce");
    expect(timeAgo(isoHoursAgo(48))).toBe("2 gün önce");
    expect(timeAgo(isoHoursAgo(72))).toBe("3 gün önce");
  });
});

// ── fmt ──────────────────────────────────────────────────────────────────────

describe("fmt", () => {
  it("Türkçe locale ile iki ondalık basamak üretir", () => {
    expect(fmt(1234.5)).toBe("1.234,50");
    expect(fmt(99)).toBe("99,00");
    expect(fmt(0)).toBe("0,00");
    expect(fmt(1234567.89)).toBe("1.234.567,89");
  });
});

// ── groupRows ────────────────────────────────────────────────────────────────

function makeRow(overrides: Partial<CompetitorRow> = {}): CompetitorRow {
  return {
    id: "r1",
    our_product_id: "p1",
    our_product_name: "T-Shirt",
    our_price: 100,
    competitor_name: "Rakip A",
    competitor_product_name: null,
    competitor_price: 90,
    category: "giyim",
    checked_at: "2026-05-20T08:00:00.000Z",
    ...overrides,
  };
}

describe("groupRows", () => {
  it("boş dizi → boş sonuç", () => {
    expect(groupRows([])).toEqual([]);
  });

  it("tek ürün, tek rakip", () => {
    const groups = groupRows([makeRow()]);
    expect(groups).toHaveLength(1);
    expect(groups[0].our_product_id).toBe("p1");
    expect(groups[0].minCompetitorPrice).toBe(90);
    expect(groups[0].competitors).toHaveLength(1);
  });

  it("aynı ürün için en düşük rakip fiyatı seçer", () => {
    const rows = [
      makeRow({ id: "r1", competitor_price: 90 }),
      makeRow({ id: "r2", competitor_price: 70 }),
      makeRow({ id: "r3", competitor_price: 80 }),
    ];
    const groups = groupRows(rows);
    expect(groups).toHaveLength(1);
    expect(groups[0].minCompetitorPrice).toBe(70);
    expect(groups[0].competitors).toHaveLength(3);
  });

  it("aynı ürün için en güncel checked_at'i saklar", () => {
    const rows = [
      makeRow({ id: "r1", checked_at: "2026-05-18T08:00:00.000Z" }),
      makeRow({ id: "r2", checked_at: "2026-05-20T08:00:00.000Z" }),
      makeRow({ id: "r3", checked_at: "2026-05-19T08:00:00.000Z" }),
    ];
    const groups = groupRows(rows);
    expect(groups[0].latestCheckedAt).toBe("2026-05-20T08:00:00.000Z");
  });

  it("farklı ürünleri ayrı gruplara böler", () => {
    const rows = [
      makeRow({ our_product_id: "p1", our_product_name: "T-Shirt" }),
      makeRow({ our_product_id: "p2", our_product_name: "Kazak", id: "r2" }),
      makeRow({ our_product_id: "p1", our_product_name: "T-Shirt", id: "r3" }),
    ];
    const groups = groupRows(rows);
    expect(groups).toHaveLength(2);
    const ids = groups.map((g) => g.our_product_id).sort();
    expect(ids).toEqual(["p1", "p2"]);
  });

  it("p1 grubunda p2 rakiplerini karıştırmaz", () => {
    const rows = [
      makeRow({ our_product_id: "p1", competitor_price: 90 }),
      makeRow({ our_product_id: "p2", competitor_price: 50, id: "r2" }),
    ];
    const groups = groupRows(rows);
    const p1 = groups.find((g) => g.our_product_id === "p1")!;
    const p2 = groups.find((g) => g.our_product_id === "p2")!;
    expect(p1.minCompetitorPrice).toBe(90);
    expect(p2.minCompetitorPrice).toBe(50);
    expect(p1.competitors).toHaveLength(1);
  });
});
