import { useState, useEffect } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { useLocation } from "wouter";
import {
  Pencil, X, Check, User, Shield, CreditCard, FileText, Building2,
  Waves, Users, Bell, Globe, Moon, Sun, LogOut, ChevronRight,
  Phone, Mail, MapPin, Fish, Calendar, Lock, Fingerprint, Download,
  UserPlus, Trash2, Plus
} from "lucide-react";
import profileImg from "@/assets/profile-emmanuel.jpg";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingFarm, setEditingFarm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [lang, setLang] = useState(() => localStorage.getItem("selected_language") || "en");

  // Personal info state — read from localStorage/onboarding
  const [fullName, setFullName] = useState(() => localStorage.getItem("profile_full_name") || "Emmanuel Mensah");
  const [phone, setPhone] = useState(() => localStorage.getItem("profile_phone") || "+233 24 000 0000");
  const [email, setEmail] = useState(() => localStorage.getItem("profile_email") || "emmanuel@voltafarm.gh");
  const [role, setRole] = useState(() => localStorage.getItem("profile_role") || "Farm Manager");

  // Farm info state
  const [farmName, setFarmName] = useState(() => localStorage.getItem("profile_farm_name") || "Volta Lake Farm");
  const [species, setSpecies] = useState(() => localStorage.getItem("onboarding_species") || "Tilapia");
  const [fishCount, setFishCount] = useState(() => localStorage.getItem("onboarding_fish_count") || "");
  const [pondCount, setPondCount] = useState(() => localStorage.getItem("onboarding_pond_count") || "");
  const [avgWeight, setAvgWeight] = useState(() => localStorage.getItem("onboarding_avg_weight") || "");

  // Interactive Account Modals State
  const [activeModal, setActiveModal] = useState<"security" | "subscription" | "billing" | "team" | null>(null);

  // Security states
  const [curPassword, setCurPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [biometricsEnabled, setBiometricsEnabled] = useState(() => localStorage.getItem("security_biometrics") === "true");
  const [showBiometricChoice, setShowBiometricChoice] = useState(false);

  // Subscription states
  const [subscriptionTier, setSubscriptionTier] = useState(() => localStorage.getItem("subscription_tier") || "Free Plan");

  // Invoices list state
  const [invoices, setInvoices] = useState<{ id: string; date: string; amount: string; status: "Paid" | "Pending" }[]>(() => {
    const stored = localStorage.getItem("billing_invoices");
    if (stored) return JSON.parse(stored);
    const defaults = [
      { id: "INV-2026-001", date: "July 1, 2026", amount: "120 GHS", status: "Paid" as const },
      { id: "INV-2026-002", date: "June 1, 2026", amount: "120 GHS", status: "Paid" as const },
      { id: "INV-2026-003", date: "May 1, 2026", amount: "120 GHS", status: "Paid" as const },
    ];
    localStorage.setItem("billing_invoices", JSON.stringify(defaults));
    return defaults;
  });

  // Team Members state
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string; role: string; access: string; phone: string }[]>(() => {
    const stored = localStorage.getItem("farm_team_members");
    if (stored) return JSON.parse(stored);
    const defaults = [
      { id: "1", name: "Emmanuel Mensah", role: "Farm Manager", access: "Owner / Full Access", phone: "+233 24 000 0000" },
      { id: "2", name: "Kofi Mensah", role: "Pond Technician", access: "Edit Access", phone: "+233 27 123 4567" },
      { id: "3", name: "Ama Serwaa", role: "Fish Feeder", access: "View Access", phone: "+233 55 987 6543" }
    ];
    localStorage.setItem("farm_team_members", JSON.stringify(defaults));
    return defaults;
  });

  // Selected team member for editing & add new member form states
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string; role: string; access: string; phone: string } | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [newMemName, setNewMemName] = useState("");
  const [newMemRole, setNewMemRole] = useState("");
  const [newMemAccess, setNewMemAccess] = useState("View Access");
  const [newMemPhone, setNewMemPhone] = useState("");

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

  // Security Handlers
  const handleUpdatePassword = () => {
    if (!curPassword || !newPassword || !confirmPassword) {
      toast({ title: "Error", description: "Please fill in all password fields", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    localStorage.setItem("security_password", newPassword);
    setCurPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast({ title: "Success", description: "Password updated successfully" });
  };

  const handleBiometricsToggle = () => {
    if (biometricsEnabled) {
      setBiometricsEnabled(false);
      localStorage.setItem("security_biometrics", "false");
      localStorage.removeItem("security_biometrics_method");
      toast({
        title: "Security Updated",
        description: "Biometric login disabled."
      });
    } else {
      setShowBiometricChoice(true);
    }
  };

  const handleSelectBiometricMethod = (method: "fingerprint" | "face_id") => {
    setBiometricsEnabled(true);
    localStorage.setItem("security_biometrics", "true");
    localStorage.setItem("security_biometrics_method", method);
    setShowBiometricChoice(false);
    toast({
      title: "Biometrics Enabled",
      description: `Configured login using ${method === "face_id" ? "Face ID" : "Fingerprint"}.`
    });
  };

  // Subscription Handlers
  const handleUpgrade = (tier: string) => {
    setSubscriptionTier(tier);
    localStorage.setItem("subscription_tier", tier);
    toast({ title: "Subscription Updated", description: `Upgraded to ${tier} successfully!` });
  };

  // Team Handlers
  const handleAddMember = () => {
    if (!newMemName || !newMemRole || !newMemPhone) {
      toast({ title: "Error", description: "Please enter name, role, and phone number", variant: "destructive" });
      return;
    }
    const newMember = {
      id: Math.random().toString(),
      name: newMemName,
      role: newMemRole,
      access: newMemAccess,
      phone: newMemPhone
    };
    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);
    localStorage.setItem("farm_team_members", JSON.stringify(updated));
    setNewMemName("");
    setNewMemRole("");
    setNewMemPhone("");
    setAddingMember(false);
    toast({ title: "Member Added", description: `${newMember.name} has been added to your team.` });
  };

  const handleSaveMemberChanges = () => {
    if (!selectedMember) return;
    const updated = teamMembers.map(m => m.id === selectedMember.id ? selectedMember : m);
    setTeamMembers(updated);
    localStorage.setItem("farm_team_members", JSON.stringify(updated));
    setSelectedMember(null);
    toast({ title: "Member Updated", description: "Team member details saved." });
  };

  const handleRemoveMember = (id: string) => {
    const updated = teamMembers.filter(m => m.id !== id);
    setTeamMembers(updated);
    localStorage.setItem("farm_team_members", JSON.stringify(updated));
    setSelectedMember(null);
    toast({ title: "Member Removed", description: "Team member has been removed." });
  };

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
          <StaticRow icon={<Shield className="h-4 w-4" />} label="Security" sub="Password & biometrics" onClick={() => setActiveModal("security")} />
          <StaticRow icon={<CreditCard className="h-4 w-4" />} label="Subscription" sub={`Active: ${subscriptionTier}`} onClick={() => setActiveModal("subscription")} />
          <StaticRow icon={<FileText className="h-4 w-4" />} label="Billing & Payments" sub="View invoices" onClick={() => setActiveModal("billing")} />
          <StaticRow icon={<Users className="h-4 w-4" />} label="Team Members" sub="Manage your farm team" onClick={() => setActiveModal("team")} />
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
        {/* ── Interactive Modals Overlay ── */}
        {activeModal && (
          <div className="absolute inset-0 bg-black/50 z-50 flex flex-col justify-end transition-all duration-200">
            <div className="bg-white rounded-t-3xl max-h-[85%] overflow-y-auto flex flex-col p-6 pb-12 shadow-2xl relative">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                  {activeModal === "security" && <Shield className="h-5 w-5 text-primary" />}
                  {activeModal === "subscription" && <CreditCard className="h-5 w-5 text-primary" />}
                  {activeModal === "billing" && <FileText className="h-5 w-5 text-primary" />}
                  {activeModal === "team" && <Users className="h-5 w-5 text-primary" />}
                  <h2 className="text-lg font-bold tracking-tight text-foreground capitalize">
                    {activeModal === "team" ? "Team Members" : activeModal === "billing" ? "Billing & Payments" : activeModal}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setSelectedMember(null);
                    setAddingMember(false);
                  }}
                  className="h-8 w-8 rounded-full bg-slate-100 grid place-items-center text-muted-foreground active:scale-95 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* 1. Security Modal */}
              {activeModal === "security" && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <Field label="Current Password" type="password" value={curPassword} onChange={setCurPassword} icon={<Lock className="h-4 w-4" />} />
                    <Field label="New Password" type="password" value={newPassword} onChange={setNewPassword} icon={<Lock className="h-4 w-4" />} />
                    <Field label="Confirm New Password" type="password" value={confirmPassword} onChange={setConfirmPassword} icon={<Lock className="h-4 w-4" />} />
                    <button
                      onClick={handleUpdatePassword}
                      className="w-full mt-2 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" /> Update Password
                    </button>
                  </div>
                  
                  {showBiometricChoice ? (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mt-4 space-y-4 animate-fade-in">
                      <p className="text-sm font-bold text-foreground">Choose Biometric Method</p>
                      <p className="text-xs text-muted-foreground">Select the default method you want to configure for logging into Volta Lake Farm.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSelectBiometricMethod("fingerprint")}
                          className="flex-1 py-3 rounded-xl border border-border bg-white text-sm font-semibold hover:border-primary active:scale-95 transition-all text-slate-800 flex flex-col items-center justify-center gap-2"
                        >
                          <Fingerprint className="h-6 w-6 text-primary" />
                          <span>Fingerprint</span>
                        </button>
                        <button
                          onClick={() => handleSelectBiometricMethod("face_id")}
                          className="flex-1 py-3 rounded-xl border border-border bg-white text-sm font-semibold hover:border-primary active:scale-95 transition-all text-slate-800 flex flex-col items-center justify-center gap-2"
                        >
                          <Shield className="h-6 w-6 text-primary" />
                          <span>Face ID</span>
                        </button>
                      </div>
                      <button
                        onClick={() => setShowBiometricChoice(false)}
                        className="w-full py-2.5 rounded-full border border-border text-xs font-semibold text-muted-foreground hover:bg-slate-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-surface border border-border/70 grid place-items-center text-muted-foreground">
                            <Fingerprint className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold tracking-tight">Biometric Login</p>
                            <p className="text-xs text-muted-foreground">Use Face ID or Fingerprint</p>
                          </div>
                        </div>
                        <button
                          onClick={handleBiometricsToggle}
                          className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${biometricsEnabled ? "bg-primary" : "bg-slate-200"}`}
                        >
                          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${biometricsEnabled ? "left-6" : "left-0.5"}`} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Subscription Modal */}
              {activeModal === "subscription" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Current Plan</p>
                    <p className="text-lg font-bold text-slate-800 mt-1">{subscriptionTier}</p>
                    <p className="text-xs text-muted-foreground mt-1">Upgrade anytime to unlock premium tools.</p>
                  </div>
                  
                  <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider pt-2">Available Plans</p>
                  
                  <div className="space-y-3">
                    {/* Free Plan */}
                    <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${subscriptionTier === "Free Plan" ? "border-primary bg-primary/5" : "border-border bg-white"}`}>
                      <div>
                        <p className="font-bold text-sm text-foreground">Free Tier</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Basic alerts & standard AI voice call limits.</p>
                      </div>
                      <button
                        disabled={subscriptionTier === "Free Plan"}
                        onClick={() => handleUpgrade("Free Plan")}
                        className={`px-4 py-2 rounded-full text-xs font-semibold ${subscriptionTier === "Free Plan" ? "bg-slate-100 text-slate-400" : "bg-primary text-primary-foreground shadow active:scale-95 transition-all"}`}
                      >
                        {subscriptionTier === "Free Plan" ? "Active" : "Select"}
                      </button>
                    </div>

                    {/* Pro Plan */}
                    <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${subscriptionTier === "Pro Plan" ? "border-primary bg-primary/5" : "border-border bg-white"}`}>
                      <div>
                        <p className="font-bold text-sm text-foreground">Pro Plan (120 GHS/mo)</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Real-time local weather & advanced AI calls.</p>
                      </div>
                      <button
                        disabled={subscriptionTier === "Pro Plan"}
                        onClick={() => handleUpgrade("Pro Plan")}
                        className={`px-4 py-2 rounded-full text-xs font-semibold ${subscriptionTier === "Pro Plan" ? "bg-slate-100 text-slate-400" : "bg-primary text-primary-foreground shadow active:scale-95 transition-all"}`}
                      >
                        {subscriptionTier === "Pro Plan" ? "Active" : "Upgrade"}
                      </button>
                    </div>

                    {/* Enterprise Plan */}
                    <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${subscriptionTier === "Enterprise Plan" ? "border-primary bg-primary/5" : "border-border bg-white"}`}>
                      <div>
                        <p className="font-bold text-sm text-foreground">Enterprise (390 GHS/mo)</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Multi-farm coordination & dedicated AI parameters.</p>
                      </div>
                      <button
                        disabled={subscriptionTier === "Enterprise Plan"}
                        onClick={() => handleUpgrade("Enterprise Plan")}
                        className={`px-4 py-2 rounded-full text-xs font-semibold ${subscriptionTier === "Enterprise Plan" ? "bg-slate-100 text-slate-400" : "bg-primary text-primary-foreground shadow active:scale-95 transition-all"}`}
                      >
                        {subscriptionTier === "Enterprise Plan" ? "Active" : "Upgrade"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Billing & Payments Modal */}
              {activeModal === "billing" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Payment Method</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-slate-600" />
                        <span className="text-sm font-semibold">Visa ending in 4242</span>
                      </div>
                      <button
                        onClick={() => toast({ title: "Edit Payment", description: "Payment processing integration requires upgrade." })}
                        className="text-xs font-semibold text-primary underline"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider pt-2">Billing History</p>
                  <div className="divide-y divide-border/60">
                    {invoices.map(inv => (
                      <div key={inv.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{inv.id}</p>
                          <p className="text-xs text-muted-foreground">{inv.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold">{inv.amount}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 font-semibold">{inv.status}</span>
                          <button
                            onClick={() => toast({ title: "Invoice Downloaded", description: `${inv.id}.pdf download initiated.` })}
                            className="h-8 w-8 rounded-full bg-slate-100 grid place-items-center text-slate-600 active:scale-90 transition-all"
                            title="Download invoice"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Team Members Modal */}
              {activeModal === "team" && (
                <div className="space-y-4">
                  {/* Toggle listing / adding / editing */}
                  {!addingMember && !selectedMember ? (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Active Team</p>
                        <button
                          onClick={() => setAddingMember(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold active:scale-95 transition-all"
                        >
                          <UserPlus className="h-3.5 w-3.5" /> Add Member
                        </button>
                      </div>

                      <div className="space-y-2 mt-2">
                        {teamMembers.map(member => (
                          <button
                            key={member.id}
                            onClick={() => {
                              if (member.id !== "1") { // Cannot edit owner
                                setSelectedMember({ ...member });
                              } else {
                                toast({ title: "Owner Profile", description: "Owner permissions are not editable." });
                              }
                            }}
                            className="w-full p-4 rounded-2xl border border-border bg-white text-left active:scale-98 transition-all hover:bg-slate-50 flex items-center justify-between group"
                          >
                            <div>
                              <p className="font-bold text-sm text-foreground flex items-center gap-1.5">
                                {member.name}
                                {member.id === "1" && <span className="text-[9px] uppercase tracking-wider font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded">Owner</span>}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">{member.role} • {member.phone}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-muted-foreground">{member.access}</span>
                              {member.id !== "1" && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-all" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : addingMember ? (
                    <div className="space-y-4 animate-fade-in">
                      <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">New Member Details</p>
                      
                      <div className="space-y-3">
                        <Field label="Full Name" value={newMemName} onChange={setNewMemName} icon={<User className="h-4 w-4" />} />
                        <Field label="Role" value={newMemRole} onChange={setNewMemRole} icon={<Pencil className="h-4 w-4" />} />
                        <Field label="Phone" value={newMemPhone} onChange={setNewMemPhone} type="tel" icon={<Phone className="h-4 w-4" />} />
                        
                        <div className="relative">
                          <label className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold block mb-1">Access Level</label>
                          <select
                            value={newMemAccess}
                            onChange={(e) => setNewMemAccess(e.target.value)}
                            className="w-full py-3 px-4 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary transition-all text-slate-700"
                          >
                            <option value="Full Access">Full Access</option>
                            <option value="Edit Access">Edit Access</option>
                            <option value="View Access">View Access</option>
                          </select>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => setAddingMember(false)}
                            className="flex-1 py-3 rounded-full border border-border text-sm font-medium text-muted-foreground active:scale-95 transition-all flex items-center justify-center gap-1.5"
                          >
                            <X className="h-3.5 w-3.5" /> Cancel
                          </button>
                          <button
                            onClick={handleAddMember}
                            className="flex-1 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                          >
                            <Check className="h-3.5 w-3.5" /> Add Member
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Edit Member Settings</p>
                      
                      {selectedMember && (
                        <div className="space-y-3">
                          <Field label="Full Name" value={selectedMember.name} onChange={(v) => setSelectedMember({ ...selectedMember, name: v })} icon={<User className="h-4 w-4" />} />
                          <Field label="Role" value={selectedMember.role} onChange={(v) => setSelectedMember({ ...selectedMember, role: v })} icon={<Pencil className="h-4 w-4" />} />
                          <Field label="Phone" value={selectedMember.phone} onChange={(v) => setSelectedMember({ ...selectedMember, phone: v })} type="tel" icon={<Phone className="h-4 w-4" />} />
                          
                          <div className="relative">
                            <label className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold block mb-1">Access Level</label>
                            <select
                              value={selectedMember.access}
                              onChange={(e) => setSelectedMember({ ...selectedMember, access: e.target.value })}
                              className="w-full py-3 px-4 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary transition-all text-slate-700"
                            >
                              <option value="Full Access">Full Access</option>
                              <option value="Edit Access">Edit Access</option>
                              <option value="View Access">View Access</option>
                            </select>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleRemoveMember(selectedMember.id)}
                              className="py-3 px-4 rounded-full border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-50 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                              title="Remove member"
                            >
                              <Trash2 className="h-4 w-4" /> Remove
                            </button>
                            <button
                              onClick={() => setSelectedMember(null)}
                              className="flex-1 py-3 rounded-full border border-border text-sm font-medium text-muted-foreground active:scale-95 transition-all flex items-center justify-center gap-1.5"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveMemberChanges}
                              className="flex-1 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}
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

function StaticRow({ icon, label, sub, onClick }: { icon: React.ReactNode; label: string; sub: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full py-4 flex items-center gap-4 text-left border-b border-border/40 group">
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
