import { DetailShell } from "@/components/DetailShell";
import { Droplet, Thermometer, CircleDot, Gauge, ChevronRight, Lightbulb, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

type Alert = {
  icon?: string;
  title: string;
  pond: string;
  detail: string;
  time: string;
  tone: "high" | "medium";
};

const defaultAlerts: Alert[] = [
  { icon: "Droplet", title: "Low Dissolved Oxygen", pond: "Pond 4", detail: "DO level is 2.1 mg/L", time: "Today, 8:15 AM", tone: "high" },
  { icon: "Thermometer", title: "High Water Temperature", pond: "Pond 2", detail: "Temperature is 33.8 °C", time: "Today, 7:50 AM", tone: "high" },
  { icon: "CircleDot", title: "High Ammonia Level", pond: "Pond 1", detail: "Ammonia is 0.65 mg/L", time: "Today, 6:30 AM", tone: "medium" },
  { icon: "Gauge", title: "Water Level Drop", pond: "Pond 3", detail: "Water level dropped by 12 cm", time: "Yesterday, 5:20 PM", tone: "medium" },
];

const iconMap: Record<string, any> = {
  Droplet,
  Thermometer,
  CircleDot,
  Gauge,
  AlertTriangle,
};

const filters = ["All", "High", "Medium", "Low"] as const;

export default function PondAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [active, setActive] = useState<(typeof filters)[number]>("All");

  useEffect(() => {
    const stored = localStorage.getItem("pond_alerts");
    if (stored) {
      try {
        setAlerts(JSON.parse(stored));
      } catch (e) {
        setAlerts(defaultAlerts);
      }
    } else {
      localStorage.setItem("pond_alerts", JSON.stringify(defaultAlerts));
      setAlerts(defaultAlerts);
    }
  }, []);

  const filteredAlerts = alerts.filter((a) => {
    if (active === "All") return true;
    return a.tone.toLowerCase() === active.toLowerCase();
  });

  const high = filteredAlerts.filter((a) => a.tone === "high");
  const medium = filteredAlerts.filter((a) => a.tone === "medium");

  return (
    <DetailShell title="Pond Alerts" subtitle="Stay informed about important pond events.">
      <div className="rounded-full bg-white/70 border border-border p-1 flex text-sm">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`flex-1 py-2 rounded-full transition-colors ${
              active === f ? "bg-primary text-primary-foreground" : "text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <AlertSection label="High Priority" items={high} accent="bg-rose-100" />
      <AlertSection label="Medium Priority" items={medium} accent="bg-amber-100" />

      <div className="mt-6 rounded-xl bg-muted/60 border border-border/50 px-4 py-3 flex gap-3 items-start">
        <Lightbulb className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
        <div>
          <p className="text-sm font-medium">Tip</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
            Keep monitoring your ponds and take action early to prevent losses.
          </p>
        </div>
      </div>
    </DetailShell>
  );
}

function AlertSection({ label, items, accent }: { label: string; items: Alert[]; accent: string }) {
  return (
    <div className="mt-6">
      <p className="text-sm text-muted-foreground mb-3">{label}</p>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic pl-2">No alerts in this category</p>
      ) : (
        <div className="space-y-3">
          {items.map((a) => {
            const IconComponent = (a.icon && iconMap[a.icon]) || AlertTriangle;
            return (
              <div key={a.title} className="rounded-2xl bg-white/70 border border-border/70 p-4 flex items-center gap-4">
                <div className={`h-11 w-11 rounded-full ${accent} grid place-items-center shrink-0`}>
                  <IconComponent className="h-[18px] w-[18px]" strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold tracking-tight">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.pond}</p>
                  <p className="text-xs text-muted-foreground">{a.detail}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

