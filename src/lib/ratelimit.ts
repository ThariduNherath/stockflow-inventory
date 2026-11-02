type E = { n: number; first: number; until: number };
const MAX = 5, WINDOW = 15 * 60e3, BLOCK = 15 * 60e3;
const g = globalThis as any;
const store: Map<string, E> = g.rl || (g.rl = new Map());
export function ipOf(req: Request) {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}
export function blockedFor(key: string): number {
  const e = store.get(key), now = Date.now();
  if (!e) return 0;
  if (e.until > now) return Math.ceil((e.until - now) / 60e3);
  if (now - e.first > WINDOW) store.delete(key);
  return 0;
}
export function fail(key: string) {
  const now = Date.now();
  let e = store.get(key);
  if (!e || now - e.first > WINDOW) e = { n: 0, first: now, until: 0 };
  e.n++;
  if (e.n >= MAX) e.until = now + BLOCK;
  store.set(key, e);
  if (store.size > 5000) for (const [k, v] of Array.from(store.entries())) if (v.until < now && now - v.first > WINDOW) store.delete(k);
}
export function reset(key: string) { store.delete(key); }