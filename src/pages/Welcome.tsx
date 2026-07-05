import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Check, ArrowRight } from "lucide-react";

const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "tw", name: "Twi", native: "Twi" },
  { code: "ha", name: "Hausa", native: "Hausa" },
  { code: "fr", name: "French", native: "Français" },
] as const;

export default function Welcome() {
  const [selected, setSelected] = useState<string>("en");
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full flex justify-center">
      <div className="w-full max-w-md flex flex-col min-h-screen px-6 pt-16 pb-8">
        <p className="eyebrow">Welcome</p>
        <h1 className="display-bold text-2xl mt-4 leading-none whitespace-nowrap">Choose your language</h1>
        <p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-xs">
          Select the language you'd like to use across Fish Doctor. You can change it later in settings.
        </p>

        <div className="mt-10 divide-y divide-border/70 border-y border-border/70">
          {languages.map((l) => {
            const active = selected === l.code;
            return (
              <button
                key={l.code}
                onClick={() => setSelected(l.code)}
                className="w-full flex items-center gap-4 py-5 text-left"
              >
                <div className="flex-1">
                  <p className="text-lg font-semibold tracking-tight">{l.name}</p>
                  {l.native !== l.name && (
                    <p className="text-sm text-muted-foreground">{l.native}</p>
                  )}
                </div>
                <div
                  className={`h-6 w-6 rounded-full grid place-items-center border transition-colors ${
                    active ? "bg-primary border-primary text-primary-foreground" : "border-border"
                  }`}
                >
                  {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-10">
          <button
            onClick={() => navigate("/signin")}
            className="w-full py-4 rounded-full bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 shadow-lg"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
          <Link href="/signin" className="block text-center mt-4 text-sm text-muted-foreground">
            Skip for now
          </Link>
        </div>
      </div>
    </div>
  );
}
