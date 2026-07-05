import { Link, useLocation } from "wouter";
import { Home, Mic, Bell, User } from "lucide-react";

const items = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/assistant", icon: Mic, label: "Assistant" },
  { to: "/notifications", icon: Bell, label: "Alerts" },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

export function BottomNav() {
  const [pathname] = useLocation();
  return (
    <div className="mx-4 mb-4 mt-2 z-40 shrink-0">
      <nav className="mx-auto max-w-md rounded-full bg-white/90 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(15,23,42,0.15)] border border-border/60 px-4 py-3 flex items-center justify-around">
        {items.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              href={to}
              aria-label={label}
              className="p-2 flex items-center justify-center"
            >
              <Icon
                className={`h-5 w-5 transition-colors ${active ? "text-foreground" : "text-muted-foreground/60"}`}
                strokeWidth={active ? 2.4 : 1.6}
                fill={active && (label === "Home" || label === "Alerts" || label === "Profile") ? "currentColor" : "none"}
              />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
