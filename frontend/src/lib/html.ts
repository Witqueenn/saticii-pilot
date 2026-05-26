const ESC: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
};

export function h(str: string | null | undefined): string {
  if (!str) return "";
  return str.replace(/[&<>"']/g, (c) => ESC[c] ?? c);
}
