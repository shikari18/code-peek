import { useState, useEffect } from "react";

export default function AppleChooser() {
  const [step, setStep] = useState<"faceid" | "password" | "loading">("faceid");
  const [email, setEmail] = useState("zenithzone18@gmail.com");
  const [password, setPassword] = useState("");
  const [scanning, setScanning] = useState(true);
  const [scanSuccess, setScanSuccess] = useState(false);

  useEffect(() => {
    if (step === "faceid" && scanning) {
      const timer1 = setTimeout(() => {
        setScanSuccess(true);
        const timer2 = setTimeout(() => {
          handleSuccess("SHIKARI", email);
        }, 1200);
        return () => clearTimeout(timer2);
      }, 2500);
      return () => clearTimeout(timer1);
    }
  }, [step, scanning]);

  const handleSuccess = (name: string, selectedEmail: string) => {
    setStep("loading");
    setTimeout(() => {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "APPLE_AUTH_SUCCESS",
            name: name,
            email: selectedEmail,
          },
          window.location.origin
        );
      }
      window.close();
    }, 1000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    handleSuccess("Apple User", email);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff] font-sans flex flex-col justify-between p-6 select-none md:items-center md:justify-center">
      <div className="w-full md:max-w-[400px] flex flex-col flex-1 justify-between md:min-h-[500px] items-center text-center">
        
        {/* Apple Header */}
        <div className="w-full flex justify-center mt-6 mb-8">
          <svg viewBox="0 0 18 18" className="h-9 w-9 fill-current text-white">
            <path d="M15.56 10.12c-.04-2.18 1.78-3.23 1.86-3.28-1.02-1.49-2.6-1.69-3.16-1.74-1.34-.14-2.62.79-3.3.79-.68 0-1.74-.77-2.86-.75-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.6 1.09 8.74.72 1.04 1.58 2.21 2.7 2.17 1.08-.04 1.49-.7 2.8-.7s1.68.7 2.8.68c1.14-.02 1.9-.1 2.62-1.15.84-1.23 1.18-2.42 1.2-2.48-.02-.02-2.3-1-2.32-3.63zM13.2 2.38c.6-.73.98-1.74.88-2.75-.86.04-1.92.58-2.54 1.3-.54.62-.92 1.65-.8 2.64.96.08 1.94-.48 2.46-1.19z"/>
          </svg>
        </div>

        {/* STEP 1: FACE ID PROMPT */}
        {step === "faceid" && (
          <div className="flex-1 flex flex-col justify-center items-center w-full px-4">
            <div className="relative h-28 w-28 flex items-center justify-center mb-8">
              {/* Circular Border */}
              <div className="absolute inset-0 rounded-3xl border border-white/20" />
              
              {/* Face ID Icon */}
              <svg viewBox="0 0 24 24" className={`h-16 w-16 transition-all duration-500 ${scanSuccess ? 'text-emerald-500 scale-110' : 'text-blue-500 animate-pulse'}`} fill="none" stroke="currentColor" strokeWidth={1.5}>
                {scanSuccess ? (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </>
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9V6a3 3 0 013-3h3m7-3h3a3 3 0 013 3v3m0 6v3a3 3 0 01-3 3h-3M9 21H6a3 3 0 01-3-3v-3M8 11a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2zm-8 4a4 4 0 008 0H8z" />
                  </>
                )}
              </svg>
            </div>

            <h1 className="text-xl font-semibold text-[#ffffff] tracking-tight">Sign in with Face ID</h1>
            <p className="text-sm text-slate-400 mt-2 max-w-[280px] leading-relaxed">
              Double-click side button to sign in to <span className="font-semibold text-white">FishFarm OS</span> as <span className="font-semibold text-white">zenithzone18@gmail.com</span>.
            </p>

            <div className="w-full mt-16 space-y-3">
              <button
                onClick={() => setStep("password")}
                className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-sm font-semibold transition-colors active:scale-95 cursor-pointer"
              >
                Use Password
              </button>
              <button
                onClick={() => window.close()}
                className="w-full py-3 text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PASSWORD FORM */}
        {step === "password" && (
          <div className="flex-1 flex flex-col justify-center items-center w-full px-4 text-left">
            <h1 className="text-2xl font-semibold text-white mb-2 self-start">Sign in with Apple ID</h1>
            <p className="text-sm text-neutral-400 mb-8 self-start">Enter your password for {email}</p>

            <form onSubmit={handlePasswordSubmit} className="w-full space-y-4">
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-[#1c1c1e] text-white px-4 py-3.5 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 border border-neutral-800 text-base placeholder:text-neutral-500"
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-between items-center pt-8">
                <button
                  type="button"
                  onClick={() => setStep("faceid")}
                  className="text-sm text-blue-500 hover:underline"
                >
                  Use Face ID
                </button>
                <button
                  type="submit"
                  disabled={!password}
                  className="px-6 py-2.5 bg-white text-black disabled:opacity-40 disabled:scale-100 rounded-xl font-semibold text-sm hover:bg-neutral-200 transition-all shadow-sm active:scale-95"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: LOADING */}
        {step === "loading" && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-10 w-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-sm text-neutral-400">Connecting to iCloud...</p>
          </div>
        )}
      </div>

      {/* Apple Footer */}
      <div className="w-full md:max-w-[400px] flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-900 pt-4 mt-8">
        <span>Apple ID & Privacy</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-neutral-300">Help</a>
          <a href="#" className="hover:text-neutral-300">Privacy</a>
        </div>
      </div>
    </div>
  );
}
