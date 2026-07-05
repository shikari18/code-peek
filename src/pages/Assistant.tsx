import { PhoneShell } from "@/components/PhoneShell";
import { Camera, Square, MicOff } from "lucide-react";

export default function Assistant() {
  return (
    <PhoneShell>
      <div className="px-6 pt-8 flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground">AI Assistant</p>
        <h1 className="display text-6xl mt-3 leading-[0.95]">
          How can I<br />help you?
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-snug max-w-[16rem]">
          Speak naturally. I'll listen, think, and help.
        </p>

        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[280px]">
          <div className="relative grid place-items-center">
            {[240, 180, 120].map((s) => (
              <div
                key={s}
                className="absolute rounded-full border border-border/60"
                style={{ width: s, height: s }}
              />
            ))}
            <div className="relative h-24 w-24 rounded-full bg-white shadow-[0_10px_40px_-8px_rgba(15,23,42,0.15)] grid place-items-center border border-border/60">
              <Waveform />
            </div>
          </div>
          <p className="mt-16 text-sm text-foreground">Listening…</p>
          <div className="mt-3 flex items-center gap-1.5">
            {[0.3, 0.4, 1, 0.5, 0.3, 0.2].map((o, i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-foreground"
                style={{ opacity: o }}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between px-2 pb-2">
          <ActionButton icon={<Camera className="h-5 w-5" strokeWidth={1.6} />} label="Camera" />
          <div className="flex flex-col items-center gap-2">
            <button
              aria-label="Stop"
              className="h-16 w-16 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-xl"
            >
              <Square className="h-5 w-5" fill="currentColor" />
            </button>
            <span className="text-xs text-muted-foreground">Tap to stop</span>
          </div>
          <ActionButton icon={<MicOff className="h-5 w-5" strokeWidth={1.6} />} label="Mute" />
        </div>
      </div>
    </PhoneShell>
  );
}

function Waveform() {
  const bars = [6, 12, 20, 14, 8];
  return (
    <div className="flex items-center gap-[3px]">
      {bars.map((h, i) => (
        <span key={i} className="w-[2px] bg-foreground rounded-full" style={{ height: h }} />
      ))}
    </div>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button className="h-12 w-12 rounded-full bg-white border border-border/70 grid place-items-center shadow-sm">
        {icon}
      </button>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
