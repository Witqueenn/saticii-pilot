import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export const light = {
  bg: "#f9fafb",
  card: "#ffffff",
  border: "#f3f4f6",
  borderStrong: "#e5e7eb",
  text: "#111827",
  textSub: "#6b7280",
  textMuted: "#9ca3af",
  input: "#f3f4f6",
  tabBar: "#ffffff",
  headerBg: "#ffffff",
  orange: "#f97316",
  pillBg: "#fff7ed",
};

export const dark = {
  bg: "#0f172a",
  card: "#1e293b",
  border: "#334155",
  borderStrong: "#475569",
  text: "#f1f5f9",
  textSub: "#94a3b8",
  textMuted: "#64748b",
  input: "#334155",
  tabBar: "#1e293b",
  headerBg: "#1e293b",
  orange: "#fb923c",
  pillBg: "#431407",
};

export type Theme = typeof light;

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  return ctx.theme;
}
