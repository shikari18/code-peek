import { DetailShell } from "@/components/DetailShell";
import { Users, TrendingDown, Factory, ShoppingCart, ChevronRight } from "lucide-react";

const groups = [
  { name: "Volta Lake Cluster", farmers: 47, status: "Buying", item: "Floating Pellets (32%)", saving: "18%" },
  { name: "Accra Region Group", farmers: 112, status: "Open", item: "Catfish Starter Feed", saving: "22%" },
  { name: "Kumasi Feed Co-op", farmers: 89, status: "Negotiating", item: "Tilapia Grower Mix", saving: "15%" },
];

const statusColor: Record<string, string> = {
  Buying: "bg-emerald-100 text-emerald-700",
  Open: "bg-blue-100 text-blue-700",
  Negotiating: "bg-amber-100 text-amber-700",
};

export default function CommunityBuying() {
  return (
    <DetailShell
      title="Community Buying"
      subtitle="Join farmers nearby to buy feed cheaper together."
    >
      <div className="rounded-2xl bg-white/80 border border-border/70 p-5 flex items-center gap-4 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.08)]">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Your Buying Power</p>
          <p className="display-bold text-3xl mt-1">300 Farmers</p>
          <p className="text-xs text-muted-foreground mt-1">You save up to 22% on feed costs</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-surface border border-border/70 grid place-items-center">
          <Users className="h-5 w-5" strokeWidth={1.6} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        <Metric icon={<TrendingDown className="h-4 w-4" />} label="Transport Saved" value="40%" />
        <Metric icon={<ShoppingCart className="h-4 w-4" />} label="Avg. Discount" value="18%" />
        <Metric icon={<Factory className="h-4 w-4" />} label="Mills Connected" value="6" />
      </div>

      <p className="text-xs text-muted-foreground mt-8 mb-3">Active Groups Near You</p>
      <div className="space-y-3">
        {groups.map((g) => (
          <div key={g.name} className="rounded-2xl bg-white/70 border border-border/70 p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-full bg-surface border border-border/70 grid place-items-center shrink-0">
              <Users className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold tracking-tight truncate">{g.name}</p>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${statusColor[g.status]}`}>{g.status}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{g.item}</p>
              <p className="text-xs text-muted-foreground">{g.farmers} farmers · Saving {g.saving}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        ))}
      </div>

      <button className="mt-6 w-full rounded-full bg-primary text-primary-foreground py-4 font-medium shadow-lg">
        Join a Buying Group
      </button>
    </DetailShell>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-white/50 px-2 py-4">
      <div className="flex justify-center text-muted-foreground mb-1">{icon}</div>
      <p className="display-bold text-2xl">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
