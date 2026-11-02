import "./globals.css";
import Toaster from "@/components/Toast";
import Pwa from "@/components/Pwa";
export const metadata = {
  title: "StockFlow",
  manifest: "/manifest.webmanifest",
  icons: { apple: "/icon-192.png" },
  appleWebApp: { capable: true, title: "StockFlow", statusBarStyle: "black-translucent" },
};
export const viewport = { width: "device-width", initialScale: 1, themeColor: "#020617" };
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "try{if(localStorage.getItem('theme')==='light')document.documentElement.classList.add('light')}catch(e){}" }} />
      </head>
      <body>{children}<Toaster /><Pwa /></body>
    </html>
  );
}