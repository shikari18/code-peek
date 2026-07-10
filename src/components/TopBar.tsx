import { useState, useEffect } from "react";
import { Headset } from "lucide-react";
import { Link } from "wouter";
import profileImg from "@/assets/profile-emmanuel.jpg";

export function TopBar() {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("selected_language") || "en";
  });

  const [profileImgSrc, setProfileImgSrc] = useState(() => {
    return localStorage.getItem("profile_image_url") || profileImg;
  });

  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem("selected_language", newLang);
    window.dispatchEvent(new Event("language_changed"));
  };

  useEffect(() => {
    const handleUpdate = () => {
      setLang(localStorage.getItem("selected_language") || "en");
    };
    const handleProfileUpdate = () => {
      setProfileImgSrc(localStorage.getItem("profile_image_url") || profileImg);
    };
    window.addEventListener("language_changed", handleUpdate);
    window.addEventListener("profile_updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("language_changed", handleUpdate);
      window.removeEventListener("profile_updated", handleProfileUpdate);
    };
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
          className="h-9 w-9 rounded-full overflow-hidden ring-1 ring-border flex items-center justify-center bg-slate-900 text-white"
        >
          {profileImgSrc === "APPLE_AVATAR" ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-slate-300">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          ) : (
            <img src={profileImgSrc} alt="Emmanuel" width={36} height={36} loading="lazy" className="h-full w-full object-cover" />
          )}
        </Link>
      </div>
    </header>
  );
}
