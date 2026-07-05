import { DetailShell } from "@/components/DetailShell";
import { MapPin, TrendingUp } from "lucide-react";

const prices = [
  { name: "Tilapia (Medium)", price: "GHS 24.00 / kg", change: "+8%" },
  { name: "Tilapia (Large)", price: "GHS 32.50 / kg", change: "+6%" },
  { name: "Catfish (Medium)", price: "GHS 28.00 / kg", change: "+5%" },
  { name: "Catfish (Large)", price: "GHS 36.00 / kg", change: "+4%" },
  { name: "Heterotis", price: "GHS 45.00 / kg", change: "+7%" },
  { name: "Shrimp (Medium)", price: "GHS 80.00 / kg", change: "+3%" },
];

export default function MarketPrices() {
  return (
    <DetailShell title="Market Prices" subtitle="Today's fish prices from major markets.">
      <div className="rounded-xl border border-border bg-white px-4 py-3.5 flex items-center gap-2 text-sm">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1">Kumasi</span>
        <span className="text-muted-foreground">▾</span>
      </div>
      <p className="text-xs text-muted-foreground mt-3">Prices updated today, 8:30 AM</p>

      <div className="mt-4 divide-y divide-border/70">
        {prices.map((p) => (
          <div key={p.name} className="py-4 flex items-center justify-between">
            <div>
              <p className="font-semibold tracking-tight">{p.name}</p>
              <p className="text-sm text-muted-foreground">{p.price}</p>
            </div>
            <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
              {p.change} <TrendingUp className="h-3.5 w-3.5" />
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-white/70 border border-border/70 p-5 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Market Trend</p>
          <p className="display-bold text-2xl mt-1">Rising</p>
          <p className="text-xs text-muted-foreground mt-1">Prices are trending up this week.</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-surface border border-border/70 grid place-items-center">
          <TrendingUp className="h-5 w-5" strokeWidth={1.6} />
        </div>
      </div>
    </DetailShell>
  );
}
