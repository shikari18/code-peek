import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function SignIn() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPw, setShowPw] = useState(false);
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full flex justify-center">
      <div className="w-full max-w-md flex flex-col min-h-screen px-6 pt-14 pb-8">
        <p className="eyebrow">Fish Doctor</p>
        <h1 className="display-bold text-5xl mt-4 leading-none">
          {mode === "signin" ? (
            <>Welcome<br />back</>
          ) : (
            <>Create your<br />account</>
          )}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          {mode === "signin"
            ? "Sign in to continue managing your farm."
            : "Get started with smart aquaculture in minutes."}
        </p>

        <div className="mt-8 space-y-3">
          <button onClick={() => navigate("/onboarding")} className="w-full py-3.5 rounded-full bg-white border border-border/70 flex items-center justify-center gap-3 font-medium text-[15px] shadow-sm hover:bg-accent/40 transition-colors">
            <GoogleIcon />
            Continue with Google
          </button>
          <button onClick={() => navigate("/onboarding")} className="w-full py-3.5 rounded-full bg-black text-white flex items-center justify-center gap-3 font-medium text-[15px] shadow-sm">
            <AppleIcon />
            Continue with Apple
          </button>
        </div>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate("/onboarding");
          }}
          className="space-y-3"
        >
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.6} />
            <input
              type="email"
              required
              placeholder="Email address"
              className="w-full py-3.5 pl-11 pr-4 rounded-full bg-white border border-border/70 text-[15px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.6} />
            <input
              type={showPw ? "text" : "password"}
              required
              placeholder="Password"
              className="w-full py-3.5 pl-11 pr-11 rounded-full bg-white border border-border/70 text-[15px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {mode === "signin" && (
            <div className="flex justify-end pt-1">
              <button type="button" className="text-xs text-muted-foreground hover:text-foreground">
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-4 rounded-full bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 shadow-lg"
          >
            {mode === "signin" ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-auto pt-8 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-foreground font-medium underline underline-offset-4"
          >
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </p>
        <Link href="/welcome" className="block text-center mt-3 text-xs text-muted-foreground">
          Change language
        </Link>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.42 2.22-1.13 3.01-.77.85-2.04 1.51-3.05 1.43-.13-1.12.41-2.28 1.09-3.02.77-.84 2.11-1.47 3.09-1.42zM20.5 17.05c-.55 1.27-.81 1.83-1.52 2.95-.99 1.56-2.38 3.5-4.1 3.51-1.53.02-1.92-.99-4-1-2.08-.01-2.51 1.01-4.04.99-1.72-.02-3.04-1.77-4.03-3.32-2.77-4.34-3.06-9.42-1.35-12.13 1.21-1.93 3.13-3.07 4.93-3.07 1.83 0 2.98 1 4.49 1 1.47 0 2.36-1 4.47-1 1.6 0 3.29.87 4.5 2.38-3.96 2.17-3.32 7.83.65 9.69z"/>
    </svg>
  );
}
