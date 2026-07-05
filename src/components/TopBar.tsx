import { Bell } from "lucide-react";
import { Link } from "wouter";
import profileImg from "@/assets/profile-emmanuel.jpg";

export function TopBar() {
  return (
    <header className="flex items-center justify-between px-6 pt-6 pb-2">
      <span className="text-sm font-semibold tracking-tight">Fish Doctor</span>
      <div className="flex items-center gap-3">
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="h-9 w-9 grid place-items-center rounded-full hover:bg-accent/60 transition-colors"
        >
          <Bell className="h-[18px] w-[18px] text-foreground" strokeWidth={1.6} />
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
