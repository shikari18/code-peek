import { PhoneCall } from "lucide-react";
import { Link } from "wouter";
import profileImg from "@/assets/profile-emmanuel.jpg";

export function TopBar() {
  return (
    <header className="flex items-center justify-between px-6 pt-6 pb-2">
      <span className="text-sm font-semibold tracking-tight">Fish Doctor</span>
      <div className="flex items-center gap-3">
        <Link
          href="/assistant"
          aria-label="Call Assistant"
          className="h-9 w-9 grid place-items-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm active:scale-95"
        >
          <PhoneCall className="h-[16px] w-[16px]" strokeWidth={2.4} />
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
