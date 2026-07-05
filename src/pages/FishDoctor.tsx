import { DetailShell, Field, Select } from "@/components/DetailShell";
import { Camera, Sparkles, Info } from "lucide-react";
import { useState } from "react";

const symptoms = ["Loss of appetite", "Lethargy", "Red spots", "Fin damage", "Erratic swimming", "Other"];

export default function FishDoctor() {
  const [active, setActive] = useState("Other");
  return (
    <DetailShell title="Fish Doctor" subtitle="AI diagnosis for healthier fish.">
      <Field label="Select Affected Pond"><Select value="Pond 2" /></Field>

      <p className="text-xs text-muted-foreground mt-6 mb-3">What symptoms are you seeing?</p>
      <div className="flex flex-wrap gap-2">
        {symptoms.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              active === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white border-border text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-6 mb-2">Add Photos (optional)</p>
      <button className="w-full rounded-2xl border border-border bg-white/60 py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <div className="h-11 w-11 rounded-full bg-muted grid place-items-center">
          <Camera className="h-5 w-5" strokeWidth={1.6} />
        </div>
        <span className="text-sm">Tap to add photos</span>
      </button>

      <button className="mt-5 w-full rounded-full bg-primary text-primary-foreground py-4 flex items-center justify-center gap-2 font-medium shadow-lg">
        <Sparkles className="h-4 w-4" />
        Analyze with AI
      </button>

      <div className="mt-4 rounded-xl bg-muted/60 border border-border/50 px-4 py-3 flex gap-3 items-start">
        <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Our AI will analyze the symptoms and suggest possible causes and treatments.
        </p>
      </div>
    </DetailShell>
  );
}
