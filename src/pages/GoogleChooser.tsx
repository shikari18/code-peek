import { useState } from "react";

export default function GoogleChooser() {
  const [step, setStep] = useState<"choose" | "custom_email" | "custom_name" | "loading">("choose");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSelectAccount = (selectedName: string, selectedEmail: string, selectedPic?: string) => {
    setStep("loading");
    setTimeout(() => {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "GOOGLE_AUTH_SUCCESS",
            name: selectedName,
            email: selectedEmail,
            picture: selectedPic || "",
          },
          window.location.origin
        );
      }
      window.close();
    }, 1500);
  };

  const handleCustomNext = () => {
    if (step === "custom_email") {
      if (!email.includes("@")) {
        alert("Please enter a valid email address");
        return;
      }
      setStep("custom_name");
    } else if (step === "custom_name") {
      if (!name.trim()) {
        alert("Please enter your name");
        return;
      }
      handleSelectAccount(name, email);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-[450px] bg-white border border-slate-200 rounded-lg p-8 shadow-md flex flex-col min-h-[500px]">
        {/* Google Colored Logo */}
        <div className="flex justify-center mb-6 mt-2">
          <svg viewBox="0 0 74 24" className="h-7" fill="currentColor">
            <path fill="#4285F4" d="M10.24 12.3v-2.31h9.19c.09.48.14.97.14 1.54 0 2.4-.64 4.8-2.2 6.36-1.52 1.56-3.48 2.4-5.99 2.4a9.98 9.98 0 0 1-9.98-9.98A9.98 9.98 0 0 1 11.38 0c2.72 0 4.96.99 6.64 2.58l-1.68 1.68A7.2 7.2 0 0 0 11.38 2.4a7.58 7.58 0 0 0-7.58 7.58 7.58 7.58 0 0 0 7.58 7.58c1.94 0 3.52-.77 4.54-1.8.84-.84 1.34-2.07 1.48-3.46h-7.16Z"/>
            <path fill="#EA4335" d="M29.56 5.86c3.2 0 5.76 2.56 5.76 5.76s-2.56 5.76-5.76 5.76-5.76-2.56-5.76-5.76 2.56-5.76 5.76-5.76m0 9.22c1.92 0 3.46-1.54 3.46-3.46s-1.54-3.46-3.46-3.46-3.46 1.54-3.46 3.46 1.54 3.46 3.46 3.46"/>
            <path fill="#FBBC05" d="M42.36 5.86c3.2 0 5.76 2.56 5.76 5.76s-2.56 5.76-5.76 5.76-5.76-2.56-5.76-5.76 2.56-5.76 5.76-5.76m0 9.22c1.92 0 3.46-1.54 3.46-3.46s-1.54-3.46-3.46-3.46-3.46 1.54-3.46 3.46 1.54 3.46 3.46 3.46"/>
            <path fill="#4285F4" d="M55.16 5.86c3.07 0 5.57 2.43 5.57 5.76a5.53 5.53 0 0 1-5.57 5.76c-1.8 0-3.04-.84-3.52-1.68h-.06v6.62H49.1V6.16h2.24v1.24h.06c.48-.84 1.72-1.54 3.76-1.54m-.48 9.22c1.92 0 3.26-1.54 3.26-3.46s-1.34-3.46-3.26-3.46-3.26 1.54-3.26 3.46 1.34 3.46 3.26 3.46"/>
            <path fill="#34A853" d="M64.6 1.1h2.24v16.14H64.6z"/>
            <path fill="#EA4335" d="M72.28 12.38c1.38 0 2.46-.7 3.01-1.74L70.4 8.78c0-1.74 1.32-2.92 3.16-2.92 1.9 0 3.1 1.22 3.56 2.16l.24.58-6.1 2.52a2.38 2.38 0 0 0 2.22 2.2c1.28 0 2.06-.64 2.62-1.42l1.8 1.2c-.84 1.28-2.6 2.64-4.82 2.64-3.2 0-5.76-2.56-5.76-5.76 0-3.2 2.56-5.76 5.76-5.76s3.04 1.62 3.04 3.08v.86h-8.8Z"/>
          </svg>
        </div>

        {step === "choose" && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-2xl font-normal text-center text-slate-900 font-sans tracking-tight">Choose an account</h2>
            <p className="text-sm text-center text-slate-600 mt-1 mb-6">to continue to FishFarm OS</p>

            <div className="divide-y divide-slate-100 border-y border-slate-100 flex-1">
              {/* Account 1 */}
              <button
                onClick={() => handleSelectAccount("Emmanuel Darko", "darka.farm@gmail.com")}
                className="w-full py-4 px-2 hover:bg-slate-50 flex items-center gap-3 transition-colors text-left"
              >
                <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-sm border border-blue-200">
                  ED
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">Emmanuel Darko</p>
                  <p className="text-xs text-slate-500 truncate">darka.farm@gmail.com</p>
                </div>
              </button>

              {/* Account 2 */}
              <button
                onClick={() => handleSelectAccount("Volta Farm Admin", "admin@voltafarm.gh")}
                className="w-full py-4 px-2 hover:bg-slate-50 flex items-center gap-3 transition-colors text-left"
              >
                <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center justify-center text-sm border border-emerald-200">
                  VA
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">Volta Farm Admin</p>
                  <p className="text-xs text-slate-500 truncate">admin@voltafarm.gh</p>
                </div>
              </button>

              {/* Use another account option */}
              <button
                onClick={() => setStep("custom_email")}
                className="w-full py-4 px-2 hover:bg-slate-50 flex items-center gap-3 transition-colors text-left"
              >
                <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-700">Use another account</p>
              </button>
            </div>
            
            <p className="text-xs text-slate-400 mt-6 leading-relaxed text-center px-4">
              To lay down proper authentication terms, Google will share your profile image, name, and email with FishFarm OS.
            </p>
          </div>
        )}

        {step === "custom_email" && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-2xl font-normal text-slate-900 tracking-tight">Sign in</h2>
            <p className="text-sm text-slate-600 mt-1 mb-6">Use your Google Account</p>

            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-6 pt-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email or phone"
                    className="w-full px-4 py-4 rounded border border-slate-300 outline-none focus:border-blue-600 text-base placeholder:text-slate-400 transition-colors"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  Not your computer? Use Guest mode to sign in privately. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                </p>
              </div>

              <div className="flex justify-between items-center mt-8 pt-4">
                <button
                  onClick={() => setStep("choose")}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCustomNext}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded font-semibold text-sm hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "custom_name" && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-2xl font-normal text-slate-900 tracking-tight">Welcome</h2>
            <p className="text-sm text-slate-600 mt-1 mb-6 truncate">{email}</p>

            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-6 pt-4">
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full px-4 py-4 rounded border border-slate-300 outline-none focus:border-blue-600 text-base placeholder:text-slate-400 transition-colors"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  Google will retrieve your name to configure your FishFarm OS profile dashboard parameters.
                </p>
              </div>

              <div className="flex justify-between items-center mt-8 pt-4">
                <button
                  onClick={() => setStep("custom_email")}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCustomNext}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded font-semibold text-sm hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "loading" && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-6">
            {/* Google-like colored circular spinner */}
            <div className="relative h-14 w-14">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-red-500 border-b-yellow-500 border-l-green-500 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-800">Signing in with Google...</p>
              <p className="text-xs text-slate-500 mt-1">Please wait while we sync your profile metadata</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
