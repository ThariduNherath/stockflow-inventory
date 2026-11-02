export function csv(rows: (string | number | null | undefined)[][]) {
  const cell = (v: any) => {
    let s = v == null ? "" : String(v);
    if (typeof v === "string" && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return "\ufeff" + rows.map((r) => r.map(cell).join(",")).join("\r\n");
}