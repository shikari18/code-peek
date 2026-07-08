import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { PhoneShell } from "./PhoneShell";

export function DetailShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <PhoneShell showTopBar={false}>
      <div className="px-6 pt-6">
        <Link href="/home" aria-label="Back" className="h-9 w-9 -ml-2 grid place-items-center rounded-full hover:bg-accent/60">
          <ArrowLeft className="h-5 w-5" strokeWidth={1.6} />
        </Link>
        <h1 className="display text-5xl mt-6">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-xs leading-snug">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </PhoneShell>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export function Select({ 
  value, 
  onChange, 
  options = [] 
}: { 
  value: string; 
  onChange?: (val: string) => void; 
  options?: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-xl border border-border bg-white px-4 py-3.5 text-sm appearance-none outline-none focus:border-primary cursor-pointer pr-10 font-medium"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-[10px]">▼</span>
    </div>
  );
}

export function Input({ value, suffix }: { value: string; suffix?: string }) {
  return (
    <div className="w-full rounded-xl border border-border bg-white px-4 py-3.5 flex items-center justify-between text-sm">
      <span>{value}</span>
      {suffix && <span className="text-muted-foreground">{suffix}</span>}
    </div>
  );
}
