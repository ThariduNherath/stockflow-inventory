"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [light, setLight] = useState(false);
  useEffect(() => { setLight(document.documentElement.classList.contains("light")); }, []);
  const toggle = () => {
    const n = !light;
    setLight(n);
    document.documentElement.classList.toggle("light", n);
    try { localStorage.setItem("theme", n ? "light" : "dark"); } catch {}
  };
  return <button onClick={toggle} title="Toggle theme" className={className}>{light ? <Moon size={18} /> : <Sun size={18} />}</button>;
}