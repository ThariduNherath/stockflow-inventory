const ok = (s: string | null) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
export function range(sp: URLSearchParams) {
  const f = sp.get("from"), t = sp.get("to");
  const to = ok(t) ? new Date(t + "T23:59:59.999") : new Date();
  const from = ok(f) ? new Date(f + "T00:00:00") : new Date(to.getTime() - 29 * 864e5);
  if (!ok(f)) from.setHours(0, 0, 0, 0);
  return { from, to };
}
export const dayKey = (d: Date) =>
  d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");