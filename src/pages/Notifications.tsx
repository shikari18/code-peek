import { PhoneShell } from "@/components/PhoneShell";
import { CloudRain, TrendingUp, Pill, Droplet, FileText, Bell } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Item = { icon: LucideIcon; title: string; body: string; time: string; unread?: boolean };

const today: Item[] = [
  { icon: CloudRain, title: "Storm expected at 3PM", body: "Heavy rain and strong winds expected. Secure ponds and check oxygen levels.", time: "8:30 AM", unread: true },
  { icon: TrendingUp, title: "Market price increase", body: "Catfish price in Kumasi increased by 8% today.", time: "7:15 AM", unread: true },
  { icon: Pill, title: "Medicine reminder", body: "Oxytetracycline treatment scheduled for Pond 2.", time: "6:45 AM", unread: true },
];
const yesterday: Item[] = [
  { icon: Droplet, title: "Water quality alert", body: "Dissolved oxygen dropped low in Pond 4.", time: "Yesterday, 6:20 PM" },
  { icon: FileText, title: "Feed plan updated", body: "AI adjusted today's feed amount for Pond 3.", time: "Yesterday, 11:40 AM" },
];
const week: Item[] = [
  { icon: Bell, title: "System update", body: "Fish Doctor v2.4.1 is now available.", time: "Mon, 9:10 AM" },
];

export default function Notifications() {
  return (
    <PhoneShell>
      <div className="px-6 pt-8">
        <h1 className="display text-6xl">Notifications</h1>
        <Section label="Today" items={today} />
        <Section label="Yesterday" items={yesterday} />
        <Section label="This Week" items={week} />
      </div>
    </PhoneShell>
  );
}

function Section({ label, items }: { label: string; items: Item[] }) {
  return (
    <div className="mt-8">
      <p className="eyebrow">{label}</p>
      <div className="mt-3 divide-y divide-border/70">
        {items.map((it, i) => (
          <div key={i} className="py-5 flex gap-4">
            <div className="h-11 w-11 rounded-full bg-surface border border-border/70 grid place-items-center shrink-0">
              <it.icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold tracking-tight">{it.title}</p>
                <span className="text-xs text-muted-foreground shrink-0 pt-0.5">{it.time}</span>
              </div>
              <div className="flex items-start justify-between gap-3 mt-1">
                <p className="text-sm text-muted-foreground leading-snug">{it.body}</p>
                {it.unread && <span className="h-2 w-2 rounded-full bg-foreground mt-1.5 shrink-0" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
