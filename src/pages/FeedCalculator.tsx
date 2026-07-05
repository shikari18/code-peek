import { DetailShell, Field, Select, Input } from "@/components/DetailShell";
import { Calculator, Info } from "lucide-react";

export default function FeedCalculator() {
  return (
    <DetailShell title="Feed Calculator" subtitle="Calculate the right amount of feed for your fish.">
      <Field label="Pond"><Select value="Pond 1" /></Field>
      <Field label="Fish Type"><Select value="Tilapia" /></Field>
      <Field label="Total Biomass"><Input value="850" suffix="kg" /></Field>
      <Field label="Feed Type"><Select value="Floating Pellets (32%)" /></Field>
      <Field label="Water Temperature"><Input value="28" suffix="°C" /></Field>

      <div className="mt-6 rounded-2xl bg-white/80 border border-border/70 p-5 flex items-center gap-4 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.08)]">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Recommended Feed</p>
          <p className="mt-1">
            <span className="display-bold text-4xl">25.6</span>
            <span className="text-sm text-muted-foreground ml-1">kg / day</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">2.9% of biomass</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-surface border border-border/70 grid place-items-center">
          <Calculator className="h-5 w-5" strokeWidth={1.6} />
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-muted/60 border border-border/50 px-4 py-3 flex gap-3 items-start">
        <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          This is an AI recommendation based on your inputs and current conditions.
        </p>
      </div>
    </DetailShell>
  );
}
