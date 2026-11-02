"use client";
import { useEffect, useState } from "react";
const D: Record<string, Record<string, string>> = {
  en: { home: "Dashboard", products: "Products", orders: "Orders", customers: "Customers", suppliers: "Suppliers", purchases: "Purchases", scan: "Scan", stocktake: "Stock take", history: "History", reports: "Reports", audit: "Audit", users: "Users" },
  si: {
    home: "\u0DB8\u0DD4\u0DBD\u0DCA \u0DB4\u0DD2\u0DA7\u0DD4\u0DC0",
    products: "\u0DB7\u0DCF\u0DAB\u0DCA\u0DA9",
    orders: "\u0D87\u0DAB\u0DC0\u0DD4\u0DB8\u0DCA",
    customers: "\u0D9C\u0DB1\u0DD4\u0DAF\u0DD9\u0DB1\u0DD4\u0D9A\u0DBB\u0DD4\u0DC0\u0DB1\u0DCA",
    suppliers: "\u0DC3\u0DD0\u0DB4\u0DBA\u0DD4\u0DB8\u0DCA\u0D9A\u0DBB\u0DD4\u0DC0\u0DB1\u0DCA",
    purchases: "\u0DB8\u0DD2\u0DBD\u0DAF\u0DD3 \u0D9C\u0DD0\u0DB1\u0DD3\u0DB8\u0DCA",
    scan: "\u0DC3\u0DCA\u0D9A\u0DD1\u0DB1\u0DCA",
    stocktake: "\u0DAD\u0DDC\u0D9C \u0D9C\u0DAB\u0DB1",
    history: "\u0D89\u0DAD\u0DD2\u0DC4\u0DCF\u0DC3\u0DBA",
    reports: "\u0DC0\u0DCF\u0DBB\u0DCA\u0DAD\u0DCF",
    audit: "\u0DC0\u0DD2\u0D9C\u0DAB\u0DB1\u0DBA",
    users: "\u0DB4\u0DBB\u0DD2\u0DC1\u0DD3\u0DBD\u0D9A\u0DBA\u0DD2\u0DB1\u0DCA",
  },
};
export const setLang = (l: string) => { try { localStorage.setItem("lang", l); } catch {} window.dispatchEvent(new Event("lang")); };
export function useLang() {
  const [l, setL] = useState("en");
  useEffect(() => {
    const f = () => { try { setL(localStorage.getItem("lang") || "en"); } catch {} };
    f();
    window.addEventListener("lang", f);
    return () => window.removeEventListener("lang", f);
  }, []);
  const t = (k: string) => D[l]?.[k] ?? D.en[k] ?? k;
  return { l, t };
}