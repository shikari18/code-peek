import { DetailShell } from "@/components/DetailShell";
import { Wifi, Sun, Thermometer, Droplet, Gauge, MessageSquare, PhoneCall, Zap } from "lucide-react";

const readings = [
  { icon: Droplet, label: "Dissolved Oxygen", value: "4.8 mg/L", status: "ok" },
  { icon: Thermometer, label: "Temperature", value: "27.4 °C", status: "ok" },
  { icon: Gauge, label: "Water Level", value: "1.2 m", status: "warning" },
];

const statusStyle: Record<string, string> = {
  ok: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
};

const alerts = [
  { icon: MessageSquare, label: "SMS Alert", desc: "Text message to any phone" },
  { icon: PhoneCall, label: "Voice Alert", desc: "Automated call in your language" },
  { icon: Zap, label: "App Notification", desc: "Push alert on Fish Doctor app" },
];

export default function PondDevice() {
  return (
    <DetailShell
      title="Pond Device"
      subtitle="Solar-powered monitor for your pond — works without a smartphone."
    >
      <div className="rounded-2xl bg-white/80 border border-border/70 p-5 flex items-center gap-4 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.08)]">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="text-xs font-medium text-emerald-700">Device Online</p>
          </div>
          <p className="display-bold text-2xl mt-2">Pond 1 Monitor</p>
          <p className="text-xs text-muted-foreground mt-1">Last sync: 2 minutes ago</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Sun className="h-5 w-5 text-amber-500" strokeWidth={1.6} />
          <p className="text-[10px] text-muted-foreground">Solar</p>
          <Wifi className="h-4 w-4 text-muted-foreground mt-1" strokeWidth={1.6} />
          <p className="text-[10px] text-muted-foreground">GSM</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-7 mb-3">Live Readings</p>
      <div className="space-y-3">
        {readings.map((r) => (
          <div key={r.label} className="rounded-2xl bg-white/70 border border-border/70 p-4 flex items-center gap-4">
            <div className={`h-11 w-11 rounded-full grid place-items-center shrink-0 ${statusStyle[r.status]}`}>
              <r.icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <p className="font-semibold tracking-tight">{r.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.value}</p>
            </div>
            <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${statusStyle[r.status]}`}>
              {r.status === "ok" ? "Normal" : "Low"}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-7 mb-3">Alert Methods</p>
      <div className="space-y-3">
        {alerts.map((a) => (
          <div key={a.label} className="flex items-center gap-4 py-3 border-b border-border/70">
            <div className="h-9 w-9 rounded-full bg-surface border border-border/70 grid place-items-center shrink-0">
              <a.icon className="h-4 w-4" strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{a.label}</p>
              <p className="text-xs text-muted-foreground">{a.desc}</p>
            </div>
            <div className="h-5 w-9 rounded-full bg-primary relative shrink-0">
              <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow" />
            </div>
          </div>
        ))}
      </div>

      <button className="mt-6 w-full rounded-full border border-border/70 bg-white py-4 font-medium text-sm shadow-sm">
        Order a Pond Device — Coming Soon
      </button>
    </DetailShell>
  );
}
