import { useState } from "react";

export default function GoogleChooser() {
  const [step, setStep] = useState<"choose" | "signing_back_in" | "custom_email" | "custom_name" | "loading">("choose");
  const [selectedAccount, setSelectedAccount] = useState<{ name: string; email: string; avatarType: "shikari" | "dark" | "custom" } | null>(null);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");

  const handleSelectAccount = (name: string, email: string, avatarType: "shikari" | "dark" | "custom") => {
    setSelectedAccount({ name, email, avatarType });
    setStep("signing_back_in");
  };

  const handleContinue = () => {
    if (!selectedAccount) return;
    setStep("loading");
    setTimeout(() => {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "GOOGLE_AUTH_SUCCESS",
            name: selectedAccount.name,
            email: selectedAccount.email,
            picture: selectedAccount.avatarType === "shikari" 
              ? "S" 
              : selectedAccount.avatarType === "dark" 
                ? "D" 
                : "U",
          },
          window.location.origin
        );
      }
      window.close();
    }, 1500);
  };

  const handleCustomNext = () => {
    if (step === "custom_email") {
      if (!customEmail.includes("@")) {
        alert("Please enter a valid email address");
        return;
      }
      setStep("custom_name");
    } else if (step === "custom_name") {
      if (!customName.trim()) {
        alert("Please enter your name");
        return;
      }
      handleSelectAccount(customName, customEmail, "custom");
    }
  };

  return (
    <div className="min-h-screen bg-[#131314] text-[#e3e3e3] font-sans flex flex-col justify-between p-6 select-none md:items-center md:justify-center">
      {/* Top Container */}
      <div className="w-full md:max-w-[400px] flex flex-col flex-1 justify-between md:min-h-[500px]">
        <div>
          {/* Google Header */}
          <div className="flex items-center gap-3 mb-8">
            <svg viewBox="0 0 24 24" className="h-[20px] w-[20px]" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
            </svg>
            <span className="text-sm font-medium text-[#e3e3e3] tracking-wide">Sign in with Google</span>
          </div>

          {/* STEP 1: CHOOSE AN ACCOUNT */}
          {step === "choose" && (
            <div className="flex flex-col">
              {/* App Logo - Orange rounded icon similar to Claude style but for FishFarm OS */}
              <div className="h-12 w-12 rounded-xl bg-orange-600 flex items-center justify-center text-white mb-6">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.722 17.56c-.66.864-1.636 1.44-2.722 1.44H7c-1.657 0-3-1.343-3-3s1.343-3 3-3h10c1.086 0 2.062.576 2.722 1.44m0 3.12a2.987 2.987 0 010-3.12M12 10V4m0 0L9 7m3-3l3 3" />
                </svg>
              </div>

              <h1 className="text-3xl font-normal text-[#e3e3e3] leading-tight tracking-tight">Choose an account</h1>
              <p className="text-sm text-[#c4c7c5] mt-2 mb-6">to continue to <span className="text-[#a8c7fa]">FishFarm OS</span></p>

              {/* Accounts list */}
              <div className="divide-y divide-[#444746] border-y border-[#444746]">
                {/* Account 1: SHIKARI */}
                <button
                  onClick={() => handleSelectAccount("SHIKARI", "zenithzone18@gmail.com", "shikari")}
                  className="w-full py-4 flex items-center gap-4 hover:bg-[#202124]/40 transition-colors text-left group"
                >
                  <div className="h-8 w-8 rounded-full bg-[#3c4043] text-white flex items-center justify-center font-semibold text-sm border border-[#5f6368]">
                    {/* Dark/grey grid avatar */}
                    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#e3e3e3] group-hover:text-white truncate">SHIKARI</p>
                    <p className="text-xs text-[#c4c7c5] truncate">zenithzone18@gmail.com</p>
                  </div>
                </button>

                {/* Account 2: DARK */}
                <button
                  onClick={() => handleSelectAccount("DARK", "darkai2026@gmail.com", "dark")}
                  className="w-full py-4 flex items-center gap-4 hover:bg-[#202124]/40 transition-colors text-left group"
                >
                  <div className="h-8 w-8 rounded-full bg-red-950 text-red-500 flex items-center justify-center font-bold text-xs border border-red-900/60 overflow-hidden">
                    {/* Game Controller/Red style placeholder */}
                    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-red-500 fill-current">
                      <path d="M19 6H5a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3zm-8 7H9v2H8v-2H6v-1h2V9h1v3h2v1zm7-1a1 1 0 1 1-1-1 1 1 0 0 1 1 1zm-2 2a1 1 0 1 1-1-1 1 1 0 0 1 1 1z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#e3e3e3] group-hover:text-white truncate">DARK</p>
                    <p className="text-xs text-[#c4c7c5] truncate">darkai2026@gmail.com</p>
                  </div>
                </button>

                {/* Use another account */}
                <button
                  onClick={() => setStep("custom_email")}
                  className="w-full py-4 flex items-center gap-4 hover:bg-[#202124]/40 transition-colors text-left"
                >
                  <div className="h-8 w-8 rounded-full border border-[#444746] flex items-center justify-center text-[#c4c7c5]">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[#e3e3e3]">Use another account</p>
                </button>
              </div>

              {/* Terms warning */}
              <p className="text-xs text-[#c4c7c5] mt-8 leading-relaxed">
                Before using this app, you can review FishFarm OS's{" "}
                <a href="#" className="text-[#a8c7fa] hover:underline">Privacy Policy</a> and{" "}
                <a href="#" className="text-[#a8c7fa] hover:underline">Terms of Service</a>.
              </p>
            </div>
          )}

          {/* STEP 2: YOU'RE SIGNING BACK IN */}
          {step === "signing_back_in" && selectedAccount && (
            <div className="flex flex-col">
              {/* App Logo */}
              <div className="h-12 w-12 rounded-xl bg-orange-600 flex items-center justify-center text-white mb-6">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.722 17.56c-.66.864-1.636 1.44-2.722 1.44H7c-1.657 0-3-1.343-3-3s1.343-3 3-3h10c1.086 0 2.062.576 2.722 1.44m0 3.12a2.987 2.987 0 010-3.12M12 10V4m0 0L9 7m3-3l3 3" />
                </svg>
              </div>

              <h1 className="text-3xl font-normal text-[#e3e3e3] leading-tight tracking-tight">You're signing back in to FishFarm OS</h1>

              {/* Chosen account dropdown pill */}
              <div className="mt-6 self-start flex items-center gap-2 border border-[#444746] rounded-full pl-2 pr-3 py-1 bg-transparent text-sm">
                <div className="h-5 w-5 rounded-full bg-[#3c4043] flex items-center justify-center text-[10px] font-bold">
                  {selectedAccount.avatarType === "shikari" ? "S" : selectedAccount.avatarType === "dark" ? "D" : "U"}
                </div>
                <span className="text-[#e3e3e3] text-xs font-medium">{selectedAccount.email}</span>
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[#c4c7c5]">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>

              {/* Agreement text */}
              <div className="text-sm text-[#c4c7c5] mt-8 space-y-4 leading-relaxed font-sans">
                <p>
                  Review FishFarm OS's{" "}
                  <a href="#" className="text-[#a8c7fa] hover:underline">privacy policy</a> and{" "}
                  <a href="#" className="text-[#a8c7fa] hover:underline">Terms of Service</a> to understand how FishFarm OS will process and protect your data.
                </p>
                <p>
                  To make changes at any time, go to your{" "}
                  <a href="#" className="text-[#a8c7fa] hover:underline">Google Account</a>.
                </p>
                <p>
                  Learn more about{" "}
                  <a href="#" className="text-[#a8c7fa] hover:underline">Sign in with Google</a>.
                </p>
              </div>

              {/* Bottom buttons for Step 2 */}
              <div className="flex gap-3 justify-end mt-12">
                <button
                  onClick={() => setStep("choose")}
                  className="border border-[#747775] text-[#a8c7fa] font-semibold text-sm rounded-full px-6 py-2.5 hover:bg-[#3c4043]/30 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleContinue}
                  className="bg-[#a8c7fa] hover:bg-[#c2e7ff] text-[#0b0b0b] font-semibold text-sm rounded-full px-6 py-2.5 active:scale-95 transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CUSTOM EMAIL INPUT */}
          {step === "custom_email" && (
            <div className="flex flex-col">
              <h1 className="text-3xl font-normal text-[#e3e3e3] tracking-tight">Sign in</h1>
              <p className="text-sm text-[#c4c7c5] mt-1 mb-6">Use your Google Account</p>

              <div className="space-y-6">
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="Email or phone"
                  className="w-full bg-[#131314] px-4 py-4 rounded border border-[#747775] outline-none focus:border-[#a8c7fa] text-base placeholder:text-[#c4c7c5] text-white transition-colors"
                  required
                />
                <p className="text-xs text-[#c4c7c5]">
                  Not your computer? Use Guest mode to sign in privately.{" "}
                  <a href="#" className="text-[#a8c7fa] hover:underline">Learn more</a>
                </p>
              </div>

              <div className="flex justify-between items-center mt-12">
                <button
                  onClick={() => setStep("choose")}
                  className="text-sm font-semibold text-[#a8c7fa] hover:underline"
                >
                  Back
                </button>
                <button
                  onClick={handleCustomNext}
                  className="bg-[#a8c7fa] hover:bg-[#c2e7ff] text-[#0b0b0b] font-semibold text-sm rounded-full px-6 py-2.5 active:scale-95 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CUSTOM NAME INPUT */}
          {step === "custom_name" && (
            <div className="flex flex-col">
              <h1 className="text-3xl font-normal text-[#e3e3e3] tracking-tight">Welcome</h1>
              <p className="text-sm text-[#c4c7c5] mt-1 mb-6 truncate">{customEmail}</p>

              <div className="space-y-6">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full bg-[#131314] px-4 py-4 rounded border border-[#747775] outline-none focus:border-[#a8c7fa] text-base placeholder:text-[#c4c7c5] text-white transition-colors"
                  required
                />
                <p className="text-xs text-[#c4c7c5]">
                  Google will retrieve your name to configure your FishFarm OS profile dashboard parameters.
                </p>
              </div>

              <div className="flex justify-between items-center mt-12">
                <button
                  onClick={() => setStep("custom_email")}
                  className="text-sm font-semibold text-[#a8c7fa] hover:underline"
                >
                  Back
                </button>
                <button
                  onClick={handleCustomNext}
                  className="bg-[#a8c7fa] hover:bg-[#c2e7ff] text-[#0b0b0b] font-semibold text-sm rounded-full px-6 py-2.5 active:scale-95 transition-all"
                >
                  Sign in
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: LOADING */}
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="relative h-14 w-14">
                <div className="absolute inset-0 rounded-full border-4 border-slate-700/30" />
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-red-500 border-b-yellow-500 border-l-green-500 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-white">Signing in with Google...</p>
                <p className="text-xs text-[#c4c7c5] mt-1">Please wait while we sync your profile metadata</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Bar */}
      <div className="w-full md:max-w-[400px] flex items-center justify-between text-xs text-[#c4c7c5] border-t border-[#444746]/50 pt-4 mt-8 md:mt-12">
        <div className="flex items-center gap-1 cursor-pointer hover:text-white">
          <span>English (United Kingdom)</span>
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white">Help</a>
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
        </div>
      </div>
    </div>
  );
}
