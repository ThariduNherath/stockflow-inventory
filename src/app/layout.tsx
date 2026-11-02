import "./globals.css";
import Toaster from "@/components/Toast";
export const metadata = { title: "StockFlow" };
export const viewport = { width: "device-width", initialScale: 1, themeColor: "#020617" };
export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}<Toaster /></body></html>);
}