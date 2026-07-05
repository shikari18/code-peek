import { DetailShell } from "@/components/DetailShell";
import { TrendingUp, Droplet, Fish, BarChart2, ShieldCheck } from "lucide-react";

const factors = [
  { icon: Fish, label: "Feeding Consistency", score: 92, trend: "+3" },
  { icon: Droplet, label: "Survival Rate", score: 87, trend: "+1" },
  { icon: TrendingUp, label: "Harvest History", score: 78, trend: "+5" },
  { icon: BarChart2, label: "Growth Performance", score: 83, trend: "+2" },
];

const offers = [
  { lender: "Ecobank Ghana", amount: "GHS 12,000", rate: "14% p.a.", badge: "Pre-approved" },
  { lender: "Fidelity Bank", amount: "GHS 8,500", rate: "16% p.a.", badge: "Eligible" },
];

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 1000) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="oklch(0.92 0.01 255)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke="oklch(0.20 0.04 260)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute text-center">
        <p className="display-bold text-3xl leading-none">{score}</p>
        <p className="text-[10px] text-muted-foreground mt-1">/ 1000</p>
      </div>
    </div>
  );
}

export default function CreditScore() {
  const score = 840;

  return (
    <DetailShell
      title="Fish Credit Score"
      subtitle="Your farm data builds your financial reputation."
    >
      <div className="flex flex-col items-center mt-2">
        <ScoreRing score={score} />
        <p className="mt-3 font-semibold text-lg tracking-tight">Excellent</p>
        <p className="text-xs text-muted-foreground mt-1">Based on 14 months of farm data</p>
      </div>

      <p className="text-xs text-muted-foreground mt-8 mb-3">Score Factors</p>
      <div className="space-y-3">
        {factors.map((f) => (
          <div key={f.label} className="flex items-center gap-4">
            <div className="h-9 w-9 rounded-full bg-surface border border-border/70 grid place-items-center shrink-0">
              <f.icon className="h-4 w-4" strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-medium">{f.label}</p>
                <span className="text-xs text-emerald-600 font-medium">{f.trend}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-foreground"
                  style={{ width: `${f.score}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-8 mb-3">Loan Offers Available</p>
      <div className="space-y-3">
        {offers.map((o) => (
          <div key={o.lender} className="rounded-2xl bg-white/70 border border-border/70 p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-full bg-surface border border-border/70 grid place-items-center shrink-0">
              <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold tracking-tight">{o.lender}</p>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{o.badge}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{o.amount} · {o.rate}</p>
            </div>
            <button className="text-xs font-medium text-foreground border border-border/70 px-3 py-1.5 rounded-full shrink-0">
              Apply
            </button>
          </div>
        ))}
      </div>
    </DetailShell>
  );
}
