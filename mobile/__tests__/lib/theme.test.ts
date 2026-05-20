import { light, dark, type Theme } from "@/lib/theme";

const REQUIRED_KEYS: (keyof Theme)[] = [
  "bg", "card", "border", "borderStrong",
  "text", "textSub", "textMuted",
  "input", "tabBar", "headerBg",
  "orange", "pillBg",
];

describe("theme tokens", () => {
  it("light tema tüm zorunlu anahtarları içerir", () => {
    for (const key of REQUIRED_KEYS) {
      expect(light[key]).toBeDefined();
      expect(typeof light[key]).toBe("string");
      expect(light[key].length).toBeGreaterThan(0);
    }
  });

  it("dark tema tüm zorunlu anahtarları içerir", () => {
    for (const key of REQUIRED_KEYS) {
      expect(dark[key]).toBeDefined();
      expect(typeof dark[key]).toBe("string");
      expect(dark[key].length).toBeGreaterThan(0);
    }
  });

  it("light ve dark aynı key setine sahip", () => {
    expect(Object.keys(light).sort()).toEqual(Object.keys(dark).sort());
  });

  it("light ve dark renkleri birbirinden farklı (tema geçişi anlamsız olmasın)", () => {
    // En az bir token farklı olmalı — tüm renkler aynıysa dark mode çalışmıyor
    const anyDifferent = REQUIRED_KEYS.some((k) => light[k] !== dark[k]);
    expect(anyDifferent).toBe(true);
  });
});
