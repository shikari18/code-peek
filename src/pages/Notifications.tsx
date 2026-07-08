import { useState, useEffect } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { CloudRain, TrendingUp, Pill, Droplet, FileText, Bell, Calculator } from "lucide-react";

type AlertItem = {
  id: string;
  iconName: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
};

const DEFAULT_ALERTS: AlertItem[] = [
  { id: "1", iconName: "CloudRain", title: "Storm expected at 3PM", body: "Heavy rain and strong winds expected. Secure ponds and check oxygen levels.", time: "8:30 AM", unread: true },
  { id: "2", iconName: "TrendingUp", title: "Market price increase", body: "Catfish price in Kumasi increased by 8% today.", time: "7:15 AM", unread: true },
  { id: "3", iconName: "Pill", title: "Medicine reminder", body: "Oxytetracycline treatment scheduled for Pond 2.", time: "6:45 AM", unread: true },
  { id: "4", iconName: "Droplet", title: "Water quality alert", body: "Dissolved oxygen dropped low in Pond 4.", time: "Yesterday, 6:20 PM" },
  { id: "5", iconName: "FileText", title: "Feed plan updated", body: "AI adjusted today's feed amount for Pond 3.", time: "Yesterday, 11:40 AM" }
];

const iconMap: Record<string, any> = {
  CloudRain,
  TrendingUp,
  Pill,
  Droplet,
  FileText,
  Calculator,
  Bell
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<AlertItem[]>([]);

  const loadNotifications = () => {
    const stored = localStorage.getItem("app_notifications");
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch {
        setNotifications(DEFAULT_ALERTS);
      }
    } else {
      localStorage.setItem("app_notifications", JSON.stringify(DEFAULT_ALERTS));
      setNotifications(DEFAULT_ALERTS);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Listen for custom background events
    window.addEventListener("notifications_updated", loadNotifications);
    return () => {
      window.removeEventListener("notifications_updated", loadNotifications);
    };
  }, []);

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    localStorage.setItem("app_notifications", JSON.stringify(updated));
    setNotifications(updated);
  };

  const handleClearAll = () => {
    localStorage.setItem("app_notifications", JSON.stringify([]));
    setNotifications([]);
  };

  return (
    <PhoneShell>
      <div className="px-6 pt-8 pb-12 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h1 className="display text-6xl">Alerts</h1>
          <div className="flex gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-[10px] uppercase tracking-wider font-bold text-primary hover:opacity-85 active:scale-95 transition-all"
            >
              Mark Read
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleClearAll}
              className="text-[10px] uppercase tracking-wider font-bold text-rose-500 hover:opacity-85 active:scale-95 transition-all"
            >
              Clear
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Bell className="h-7 w-7" strokeWidth={1.6} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px] leading-relaxed">
                No new alerts. Background monitoring will push live alerts when weather or oxygen rates change.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8 divide-y divide-border/70">
            {notifications.map((it) => {
              const IconComponent = iconMap[it.iconName] || Bell;
              return (
                <div key={it.id} className="py-5 flex gap-4 animate-slide-up">
                  <div className={`h-11 w-11 rounded-full border grid place-items-center shrink-0 ${
                    it.unread 
                      ? "bg-primary/5 border-primary/20 text-primary shadow-sm" 
                      : "bg-surface border-border/70 text-muted-foreground/80"
                  }`}>
                    <IconComponent className="h-[18px] w-[18px]" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`font-semibold tracking-tight ${it.unread ? "text-slate-950 font-bold" : "text-slate-700"}`}>
                        {it.title}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0 pt-0.5">{it.time}</span>
                    </div>
                    <div className="flex items-start justify-between gap-3 mt-1">
                      <p className="text-xs text-muted-foreground leading-relaxed">{it.body}</p>
                      {it.unread && (
                        <span className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_8px_rgba(3,105,161,0.5)]" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PhoneShell>
  );
}
