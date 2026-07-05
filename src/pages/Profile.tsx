import { PhoneShell } from "@/components/PhoneShell";
import { Pencil, User, Shield, CreditCard, FileText, Building2, Waves, Users, Bell, Globe, Moon, LogOut, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import profileImg from "@/assets/profile-emmanuel.jpg";

type Row = { icon: LucideIcon; title: string; sub: string; danger?: boolean };

const account: Row[] = [
  { icon: User, title: "Personal Information", sub: "Update your profile details" },
  { icon: Shield, title: "Security", sub: "Password, biometrics, and 2FA" },
  { icon: CreditCard, title: "Subscription", sub: "Manage your plan" },
  { icon: FileText, title: "Billing & Payment", sub: "View invoices and payment methods" },
];
const farm: Row[] = [
  { icon: Building2, title: "Farm Settings", sub: "Manage farm details and preferences" },
  { icon: Waves, title: "Pond Management", sub: "Add and manage your ponds" },
  { icon: Users, title: "Team", sub: "Manage team members and roles" },
];
const prefs: Row[] = [
  { icon: Bell, title: "Notification Preferences", sub: "Customize your alerts" },
  { icon: Globe, title: "Language", sub: "English (US)" },
  { icon: Moon, title: "Appearance", sub: "Light mode" },
];

export default function Profile() {
  return (
    <PhoneShell>
      <div className="px-6 pt-4">
        <div className="flex items-start gap-5 mt-2">
          <div className="h-24 w-24 rounded-full overflow-hidden border border-border/70 shrink-0">
            <img src={profileImg} alt="Emmanuel Mensah" width={96} height={96} loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 pt-1">
            <h1 className="display-bold text-3xl leading-tight">Emmanuel<br />Mensah</h1>
            <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
              <p>Farm Manager</p>
              <p>Volta Lake Farm</p>
              <p>Accra Region</p>
            </div>
          </div>
          <button
            aria-label="Edit profile"
            className="h-10 w-10 rounded-full bg-white border border-border/70 grid place-items-center shrink-0 shadow-sm"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.6} />
          </button>
        </div>

        <Group label="Account" rows={account} />
        <Group label="Farm" rows={farm} />
        <Group label="Preferences" rows={prefs} />
        <Group
          label=""
          rows={[{ icon: LogOut, title: "Log Out", sub: "Sign out from your account", danger: true }]}
        />
      </div>
    </PhoneShell>
  );
}

function Group({ label, rows }: { label: string; rows: Row[] }) {
  return (
    <div className="mt-8">
      {label && <p className="text-xs uppercase tracking-widest text-muted-foreground/80 font-medium">{label}</p>}
      <div className="mt-3 divide-y divide-border/70 border-t border-border/70">
        {rows.map((r, i) => (
          <button key={i} className="w-full py-4 flex items-center gap-4 text-left">
            <div className="h-10 w-10 rounded-full bg-surface border border-border/70 grid place-items-center shrink-0">
              <r.icon className="h-4 w-4" strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <p className={`font-semibold tracking-tight ${r.danger ? "text-destructive" : ""}`}>{r.title}</p>
              <p className="text-sm text-muted-foreground">{r.sub}</p>
            </div>
            {!r.danger && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </button>
        ))}
      </div>
    </div>
  );
}
