import { useState, useEffect } from "react";
import { Headset } from "lucide-react";
import { Link } from "wouter";
import profileImg from "@/assets/profile-emmanuel.jpg";

export function TopBar() {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("selected_language") || "en";
  });

  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem("selected_language", newLang);
    // Dispatch event to let other components know the language changed in real-time
    window.dispatchEvent(new Event("language_changed"));
  };

  useEffect(() => {
    const handleUpdate = () => {
      setLang(localStorage.getItem("selected_language") || "en");
    };
    window.addEventListener("language_changed", handleUpdate);
    return () => window.removeEventListener("language_changed", handleUpdate);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 pt-6 pb-2">
      <span className="text-sm font-semibold tracking-tight">Fish Doctor</span>
      <div className="flex items-center gap-3">
        {/* Language selector dropdown */}
        <select
          value={lang}
          onChange={(e) => handleLangChange(e.target.value)}
          className="text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-200/50 rounded-full px-2.5 py-1.5 outline-none cursor-pointer text-slate-700"
        >
          <option value="en">EN</option>
          <option value="tw">TW (Twi)</option>
          <option value="ha">HA (Hausa)</option>
          <option value="fr">FR</option>
        </select>

        <Link
          href="/assistant"
          aria-label="Call Assistant"
          className="h-9 w-9 grid place-items-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm active:scale-95"
        >
          <Headset className="h-[18px] w-[18px]" strokeWidth={2} />
        </Link>
        <Link
          href="/profile"
          aria-label="Profile"
          className="h-9 w-9 rounded-full overflow-hidden ring-1 ring-border"
        >
          <img src={profileImg} alt="Emmanuel" width={36} height={36} loading="lazy" className="h-full w-full object-cover" />
        </Link>
      </div>
    </header>
  );
}
