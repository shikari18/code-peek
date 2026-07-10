import { useEffect, useState } from "react";
import App from "./App";

export function ClientApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js")
          .then((reg) => console.log("[PWA] Service Worker registered scope:", reg.scope))
          .catch((err) => console.error("[PWA] Service Worker registration failed:", err));
      });
    }
  }, []);

  if (!mounted) return null;
  return <App />;
}
