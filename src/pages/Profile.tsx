import { useState, useEffect } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { useLocation } from "wouter";
import {
  Pencil, X, Check, User, Shield, CreditCard, FileText, Building2,
  Waves, Users, Bell, Globe, Moon, Sun, LogOut, ChevronRight,
  Phone, Mail, MapPin, Fish, Calendar
} from "lucide-react";
import profileImg from "@/assets/profile-emmanuel.jpg";

export default function Profile() {
  const [, navigate] = useLocation();
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingFarm, setEditingFarm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [lang, setLang] = useState(() => localStorage.getItem("selected_language") || "en");

  // Personal info state — read from localStorage/onboarding
  const [fullName, setFullName] = useState("Emmanuel Mensah");
  const [phone, setPhone] = useState("+233 24 000 0000");
  const [email, setEmail] = useState("emmanuel@voltafarm.gh");
  const [role, setRole] = useState("Farm Manager");

  // Farm info state
  const [farmName, setFarmName] = useState("Volta Lake Farm");
  const [species, setSpecies] = useState(() => localStorage.getItem("onboarding_species") || "Tilapia");
  const [fishCount, setFishCount] = useState(() => localStorage.getItem("onboarding_fish_count") || "");
  const [pondCount, setPondCount] = useState(() => localStorage.getItem("onboarding_pond_count") || "");
  const [avgWeight, setAvgWeight] = useState(() => localStorage.getItem("onboarding_avg_weight") || "");

  // Member since
  const memberSince = (() => {
    const stored = localStorage.getItem("member_since");
    if (stored) return stored;
    const now = new Date().toLocaleDateString("en-GH", { month: "long", year: "numeric" });
    localStorage.setItem("member_since", now);
    return now;
  })();

  useEffect(() => {
    const handleLangUpdate = () => setLang(localStorage.getItem("selected_language") || "en");
    window.addEventListener("language_changed", handleLangUpdate);
    return () => window.removeEventListener("language_changed", handleLangUpdate);
  }, []);

  const savePersonal = () => {
    // Save personal info to localStorage so AI can read it
    localStorage.setItem("profile_full_name", fullName);
    localStorage.setItem("profile_phone", phone);
    localStorage.setItem("profile_email", email);
    localStorage.setItem("profile_role", role);
    setEditingPersonal(false);
  };

  const saveFarm = () => {
    localStorage.setItem("onboarding_species", species);
    localStorage.setItem("onboarding_fish_count", fishCount);
    localStorage.setItem("onboarding_pond_count", pondCount);
    localStorage.setItem("onboarding_avg_weight", avgWeight);
    window.dispatchEvent(new Event("farm_profile_updated"));
    setEditingFarm(false);
  };

  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem("selected_language", newLang);
    window.dispatchEvent(new Event("language_changed"));
  };

  const handleLogout = () => {
    // Clear session but preserve language preference
    const langPref = localStorage.getItem("selected_language");
    localStorage.clear();
    if (langPref) localStorage.setItem("selected_language", langPref);
    navigate("/");
  };

  const langLabel: Record<string, string> = {
    en: "English", tw: "Twi (Akan)", ha: "Hausa", fr: "French"
  };

  return (
    <PhoneShell>
      <div className="px-6 pt-4 pb-24 overflow-y-auto flex-1">
        {/* Avatar + name */}
        <div className="flex items-start gap-5 mt-2">
          <div className="h-24 w-24 rounded-full overflow-hidden border border-border/70 shrink-0 shadow-md">
            <img src={profileImg} alt={fullName} width={96} height={96} loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 pt-1">
            <h1 className="display-bold text-3xl leading-tight">{fullName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{role}</p>
            <p className="text-sm text-muted-foreground">{farmName}</p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Member since {memberSince}</span>
            </div>
          </div>
          <button
            aria-label="Edit profile"
            onClick={() => setEditingPersonal(true)}
            className="h-10 w-10 rounded-full bg-white border border-border/70 grid place-items-center shrink-0 shadow-sm active:scale-95 transition-all"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.6} />
          </button>
        </div>

        {/* ── Personal Information ── */}
        <Section label="Personal Information">
          {editingPersonal ? (
            <div className="py-4 space-y-3">
              <Field label="Full Name" value={fullName} onChange={setFullName} icon={<User className="h-4 w-4" />} />
              <Field label="Phone" value={phone} onChange={setPhone} type="tel" icon={<Phone className="h-4 w-4" />} />
              <Field label="Email" value={email} onChange={setEmail} type="email" icon={<Mail className="h-4 w-4" />} />
              <Field label="Role / Title" value={role} onChange={setRole} icon={<User className="h-4 w-4" />} />
              <div className="flex gap-2 pt-1">
                <button onClick={() => setEditingPersonal(false)} className="flex-1 py-3 rounded-full border border-border text-sm font-medium text-muted-foreground active:scale-95 transition-all flex items-center justify-center gap-1.5">
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
                <button onClick={savePersonal} className="flex-1 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <InfoRow icon={<User className="h-4 w-4" />} label="Full Name" value={fullName} onEdit={() => setEditingPersonal(true)} />
              <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={phone} onEdit={() => setEditingPersonal(true)} />
              <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={email} onEdit={() => setEditingPersonal(true)} />
              <InfoRow icon={<User className="h-4 w-4" />} label="Role" value={role} onEdit={() => setEditingPersonal(true)} />
            </>
          )}
        </Section>

        {/* ── Farm Details ── */}
        <Section label="Farm Details">
          {editingFarm ? (
            <div className="py-4 space-y-3">
              <Field label="Farm Name" value={farmName} onChange={setFarmName} icon={<Building2 className="h-4 w-4" />} />
              <Field label="Primary Species" value={species} onChange={setSpecies} icon={<Fish className="h-4 w-4" />} />
              <Field label="Total Fish Count" value={fishCount} onChange={setFishCount} type="number" icon={<Fish className="h-4 w-4" />} />
              <Field label="Number of Ponds" value={pondCount} onChange={setPondCount} type="number" icon={<Waves className="h-4 w-4" />} />
              <Field label="Avg Fish Weight (g)" value={avgWeight} onChange={setAvgWeight} type="number" icon={<Fish className="h-4 w-4" />} />
              <div className="flex gap-2 pt-1">
                <button onClick={() => setEditingFarm(false)} className="flex-1 py-3 rounded-full border border-border text-sm font-medium text-muted-foreground active:scale-95 transition-all flex items-center justify-center gap-1.5">
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
                <button onClick={saveFarm} className="flex-1 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <InfoRow icon={<Building2 className="h-4 w-4" />} label="Farm Name" value={farmName} onEdit={() => setEditingFarm(true)} />
              <InfoRow icon={<Fish className="h-4 w-4" />} label="Species" value={species || "Not set"} onEdit={() => setEditingFarm(true)} />
              <InfoRow icon={<Fish className="h-4 w-4" />} label="Fish Count" value={fishCount ? parseInt(fishCount).toLocaleString() : "Not set"} onEdit={() => setEditingFarm(true)} />
              <InfoRow icon={<Waves className="h-4 w-4" />} label="Ponds" value={pondCount ? `${pondCount} ponds` : "Not set"} onEdit={() => setEditingFarm(true)} />
              <InfoRow icon={<Fish className="h-4 w-4" />} label="Avg Weight" value={avgWeight ? `${avgWeight} g` : "Not set"} onEdit={() => setEditingFarm(true)} />
            </>
          )}
        </Section>

        {/* ── Preferences ── */}
        <Section label="Preferences">
          {/* Language */}
          <div className="py-4 flex items-center justify-between border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-surface border border-border/70 grid place-items-center text-muted-foreground">
                <Globe className="h-4 w-4" strokeWidth={1.6} />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight">Language</p>
                <p className="text-xs text-muted-foreground">{langLabel[lang] || "English"}</p>
              </div>
            </div>
            <select
              value={lang}
              onChange={(e) => handleLangChange(e.target.value)}
              className="text-xs font-semibold bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1.5 outline-none cursor-pointer text-slate-700"
            >
              <option value="en">English</option>
              <option value="tw">Twi</option>
              <option value="ha">Hausa</option>
              <option value="fr">French</option>
            </select>
          </div>

          {/* Notifications toggle */}
          <div className="py-4 flex items-center justify-between border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-surface border border-border/70 grid place-items-center text-muted-foreground">
                <Bell className="h-4 w-4" strokeWidth={1.6} />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight">Notifications</p>
                <p className="text-xs text-muted-foreground">{notifEnabled ? "Enabled" : "Disabled"}</p>
              </div>
            </div>
            <button
              onClick={() => setNotifEnabled(!notifEnabled)}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${notifEnabled ? "bg-primary" : "bg-slate-200"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${notifEnabled ? "left-6" : "left-0.5"}`} />
            </button>
          </div>

          {/* Appearance toggle */}
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-surface border border-border/70 grid place-items-center text-muted-foreground">
                {darkMode ? <Moon className="h-4 w-4" strokeWidth={1.6} /> : <Sun className="h-4 w-4" strokeWidth={1.6} />}
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight">Appearance</p>
                <p className="text-xs text-muted-foreground">{darkMode ? "Dark mode" : "Light mode"}</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${darkMode ? "bg-slate-700" : "bg-slate-200"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${darkMode ? "left-6" : "left-0.5"}`} />
            </button>
          </div>
        </Section>

        {/* ── Account ── */}
        <Section label="Account">
          <StaticRow icon={<Shield className="h-4 w-4" />} label="Security" sub="Password & biometrics" />
          <StaticRow icon={<CreditCard className="h-4 w-4" />} label="Subscription" sub="Free plan — upgrade anytime" />
          <StaticRow icon={<FileText className="h-4 w-4" />} label="Billing & Payments" sub="View invoices" />
          <StaticRow icon={<Users className="h-4 w-4" />} label="Team Members" sub="Manage your farm team" />
        </Section>

        {/* ── Log Out ── */}
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full py-4 flex items-center gap-4 text-left border-t border-border/70 group"
          >
            <div className="h-10 w-10 rounded-full bg-rose-50 border border-rose-100 grid place-items-center shrink-0">
              <LogOut className="h-4 w-4 text-rose-500" strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <p className="font-semibold tracking-tight text-destructive">Log Out</p>
              <p className="text-sm text-muted-foreground">Sign out from your account</p>
            </div>
          </button>
        </div>
      </div>
    </PhoneShell>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <p className="text-xs uppercase tracking-widest text-muted-foreground/80 font-semibold">{label}</p>
      <div className="mt-3 border-t border-border/70">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value, onEdit }: { icon: React.ReactNode; label: string; value: string; onEdit: () => void }) {
  return (
    <button onClick={onEdit} className="w-full py-3.5 flex items-center gap-3 border-b border-border/40 text-left group">
      <div className="h-8 w-8 rounded-full bg-surface border border-border/70 grid place-items-center shrink-0 text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
      <Pencil className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
    </button>
  );
}

function StaticRow({ icon, label, sub }: { icon: React.ReactNode; label: string; sub: string }) {
  return (
    <button className="w-full py-4 flex items-center gap-4 text-left border-b border-border/40 group">
      <div className="h-9 w-9 rounded-full bg-surface border border-border/70 grid place-items-center shrink-0 text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-semibold tracking-tight">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
}

function Field({ label, value, onChange, type = "text", icon }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; icon?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <label className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold block mb-1">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full py-3 ${icon ? "pl-10" : "pl-4"} pr-4 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary transition-colors`}
          placeholder={label}
        />
      </div>
    </div>
  );
}
