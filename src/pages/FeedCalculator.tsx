import { DetailShell, Field } from "@/components/DetailShell";
import { Calculator, Info, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

type FeedingRecord = {
  pond: string;
  fishType: string;
  biomass: number;
  feedType: string;
  temp: number;
  recommendedFeed: string;
  percentBiomass: string;
  time: string;
};

export default function FeedCalculator() {
  const [pond, setPond] = useState("Pond 1");
  const [fishType, setFishType] = useState("Tilapia");
  const [biomass, setBiomass] = useState<number>(850);
  const [feedType, setFeedType] = useState("Floating Pellets (32%)");
  const [temp, setTemp] = useState<number>(28);
  const [history, setHistory] = useState<FeedingRecord[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("feed_calculations");
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        setHistory([]);
      }
    }
  }, []);

  // Calculation formula:
  // Optimal temp for tilapia is 28-30°C: feeding rate is 3% of biomass.
  // For catfish: 2.5% of biomass.
  // If temp is cold (< 24°C), reduce feed rate by 50%.
  // If temp is hot (> 32°C), reduce feed rate by 30%.
  let feedRate = fishType === "Tilapia" ? 0.03 : 0.025;
  if (temp < 24) {
    feedRate *= 0.5;
  } else if (temp > 32) {
    feedRate *= 0.7;
  }

  const recommendedFeed = (biomass * feedRate).toFixed(1);
  const percentBiomass = (feedRate * 100).toFixed(1);

  const handleLogRecord = () => {
    const newRecord: FeedingRecord = {
      pond,
      fishType,
      biomass,
      feedType,
      temp,
      recommendedFeed,
      percentBiomass,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
    };
    const updated = [newRecord, ...history];
    setHistory(updated);
    localStorage.setItem("feed_calculations", JSON.stringify(updated));
  };

  const handleDeleteRecord = (index: number) => {
    const updated = history.filter((_, i) => i !== index);
    setHistory(updated);
    localStorage.setItem("feed_calculations", JSON.stringify(updated));
  };

  return (
    <DetailShell title="Feed Calculator" subtitle="Calculate the right amount of feed for your fish.">
      <div className="space-y-4">
        <Field label="Pond">
          <select
            value={pond}
            onChange={(e) => setPond(e.target.value)}
            className="w-full rounded-xl border border-border bg-white px-4 py-3.5 text-sm outline-none focus:border-primary appearance-none cursor-pointer"
          >
            <option value="Pond 1">Pond 1</option>
            <option value="Pond 2">Pond 2</option>
            <option value="Pond 3">Pond 3</option>
            <option value="Pond 4">Pond 4</option>
          </select>
        </Field>

        <Field label="Fish Type">
          <select
            value={fishType}
            onChange={(e) => setFishType(e.target.value)}
            className="w-full rounded-xl border border-border bg-white px-4 py-3.5 text-sm outline-none focus:border-primary appearance-none cursor-pointer"
          >
            <option value="Tilapia">Tilapia</option>
            <option value="Catfish">Catfish</option>
          </select>
        </Field>

        <Field label="Total Biomass (kg)">
          <input
            type="number"
            value={biomass || ""}
            onChange={(e) => setBiomass(Number(e.target.value))}
            className="w-full rounded-xl border border-border bg-white px-4 py-3.5 text-sm outline-none focus:border-primary"
            placeholder="e.g. 850"
          />
        </Field>

        <Field label="Feed Type">
          <select
            value={feedType}
            onChange={(e) => setFeedType(e.target.value)}
            className="w-full rounded-xl border border-border bg-white px-4 py-3.5 text-sm outline-none focus:border-primary appearance-none cursor-pointer"
          >
            <option value="Floating Pellets (32%)">Floating Pellets (32%)</option>
            <option value="Floating Pellets (28%)">Floating Pellets (28%)</option>
            <option value="Sinking Pellets (30%)">Sinking Pellets (30%)</option>
          </select>
        </Field>

        <Field label="Water Temperature (°C)">
          <input
            type="number"
            value={temp || ""}
            onChange={(e) => setTemp(Number(e.target.value))}
            className="w-full rounded-xl border border-border bg-white px-4 py-3.5 text-sm outline-none focus:border-primary"
            placeholder="e.g. 28"
          />
        </Field>
      </div>

      <div className="mt-6 rounded-2xl bg-white/80 border border-border/70 p-5 flex items-center gap-4 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.08)]">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Recommended Feed</p>
          <p className="mt-1">
            <span className="display-bold text-4xl">{recommendedFeed}</span>
            <span className="text-sm text-muted-foreground ml-1">kg / day</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">{percentBiomass}% of biomass</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-surface border border-border/70 grid place-items-center">
          <Calculator className="h-5 w-5" strokeWidth={1.6} />
        </div>
      </div>

      <button
        onClick={handleLogRecord}
        className="mt-4 w-full py-4 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-md hover:bg-primary/95 active:scale-95 transition-all"
      >
        Log Feeding Record
      </button>

      <div className="mt-4 rounded-xl bg-muted/60 border border-border/50 px-4 py-3 flex gap-3 items-start">
        <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          This is an AI recommendation based on your inputs and current conditions.
        </p>
      </div>

      <div className="mt-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/80 font-medium">History Log</p>
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground italic mt-3">No feed calculations recorded yet.</p>
        ) : (
          <div className="mt-3 space-y-3 pb-8">
            {history.map((h, i) => (
              <div key={i} className="rounded-xl border border-border/75 bg-white/55 p-3 flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-foreground">{h.pond} • {h.fishType}</p>
                  <p className="text-muted-foreground mt-0.5">{h.recommendedFeed} kg feed ({h.percentBiomass}%)</p>
                  <p className="text-muted-foreground text-[10px]">{h.time}</p>
                </div>
                <button
                  onClick={() => handleDeleteRecord(i)}
                  className="h-7 w-7 rounded-full hover:bg-rose-50 text-muted-foreground hover:text-rose-500 grid place-items-center transition-colors"
                  aria-label="Delete calculation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DetailShell>
  );
}

