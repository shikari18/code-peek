import { useState } from "react";
import { Link } from "wouter";
import { PhoneShell } from "@/components/PhoneShell";
import { Play, Calculator, Stethoscope, TrendingUp, Bell, ChevronRight, Users, ShoppingCart, BarChart2, Wifi, MessageSquare } from "lucide-react";
import stormImg from "@/assets/weather-storm.jpg";
import sunshineImg from "@/assets/weather-sunshine.jpg";
import nightImg from "@/assets/weather-night.jpg";
import cloudyImg from "@/assets/weather-cloudy.jpg";

type Weather = {
  src: string;
  alt: string;
  headline: string;
  time: string;
  detail: string;
};

function getWeather(now = new Date()): Weather {
  const h = now.getHours();
  // 12–17 → storm (matches the "storm arriving 3PM" briefing)
  if (h >= 12 && h < 18) {
    return {
      src: stormImg,
      alt: "Storm clouds over the lake",
      headline: "Storm arriving",
      time: "3PM",
      detail: "Heavy rain expected this afternoon.",
    };
  }
  // 19–5 → night
  if (h >= 19 || h < 6) {
    return {
      src: nightImg,
      alt: "Calm lake under a starry night sky",
      headline: "Calm night",
      time: "Clear",
      detail: "Low winds. Good conditions until dawn.",
    };
  }
  // 6–11 → sunshine (morning)
  if (h >= 6 && h < 10) {
    return {
      src: sunshineImg,
      alt: "Bright sunny morning over the lake",
      headline: "Bright morning",
      time: "Sunny",
      detail: "Feed early — warm and clear until noon.",
    };
  }
  // 10–12 → building clouds
  return {
    src: cloudyImg,
    alt: "Overcast skies over the lake",
    headline: "Cloud cover",
    time: "Mild",
    detail: "Overcast midday. Expect rain by afternoon.",
  };
}


const quickAccess = [
  { to: "/feed-calculator", icon: Calculator, title: "Feed Calculator", sub: "Calculate today's feed" },
  { to: "/fish-doctor", icon: Stethoscope, title: "Fish Doctor", sub: "AI diagnosis" },
  { to: "/market-prices", icon: TrendingUp, title: "Market Prices", sub: "Today's pricing" },
  { to: "/pond-alerts", icon: Bell, title: "Pond Alerts", sub: "View alerts" },
  { to: "/community-buying", icon: Users, title: "Community Buying", sub: "Buy feed cheaper together" },
  { to: "/harvest-marketplace", icon: ShoppingCart, title: "Harvest Marketplace", sub: "Sell directly to buyers" },
  { to: "/credit-score", icon: BarChart2, title: "Fish Credit Score", sub: "Unlock farm financing" },
  { to: "/pond-device", icon: Wifi, title: "Pond Device", sub: "Live sensor readings" },
  { to: "/farmer-chat", icon: MessageSquare, title: "Farmer Chat Room", sub: "Chat with all farmers live" },
] as const;

export default function Home() {
  const completedSteps = (() => {
    let count = 0;
    if (localStorage.getItem("onboarding_location")) count++;
    if (localStorage.getItem("onboarding_pond_count")) count++;
    if (localStorage.getItem("onboarding_pond_images")) count++;
    if (localStorage.getItem("onboarding_fish_count")) count++;
    if (localStorage.getItem("onboarding_species")) count++;
    return count;
  })();

  const [showOnboardingBanner] = useState(() => {
    const completed = localStorage.getItem("onboarding_completed");
    return completed !== "true" || completedSteps < 5;
  });

  const locationText = (() => {
    const saved = localStorage.getItem("onboarding_location");
    if (!saved) return { farm: "Farm Setup Incomplete", region: "Location not configured" };
    try {
      const coords = JSON.parse(saved);
      return { 
        farm: "Volta Lake Farm", 
        region: `Lat: ${coords.lat.toFixed(2)}, Lng: ${coords.lng.toFixed(2)}` 
      };
    } catch {
      return { farm: "Volta Lake Farm", region: "Accra Region" };
    }
  })();

  return (
    <PhoneShell>
      <div className="px-6 pt-4">
        <h1 className="display text-5xl text-foreground">Good morning,</h1>
        <h2 className="display-bold text-6xl text-foreground mt-1">Emmanuel</h2>
        <div className="mt-5 text-sm text-muted-foreground">
          <p className="text-foreground/80 font-medium">{locationText.farm}</p>
          <p>{locationText.region}</p>
        </div>

        {/* Onboarding Incomplete Banner */}
        {showOnboardingBanner && (
          <div className="mt-6 rounded-2xl bg-white/70 backdrop-blur border border-border/70 p-5 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.08)]">
            <div className="flex justify-between items-start">
              <div>
                <p className="eyebrow">Setup Profile</p>
                <h3 className="mt-2 text-xl font-medium tracking-tight">Complete your farm profile</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Finish all setup steps to calibrate your AI Fish Doctor recommendations.
                </p>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full shrink-0">
                {completedSteps}/5 steps
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500" 
                style={{ width: `${(completedSteps / 5) * 100}%` }}
              />
            </div>

            <Link href="/onboarding" className="mt-5 flex items-center justify-center gap-1.5 w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-sm font-semibold shadow-md active:scale-95 transition-all">
              <span>Continue Onboarding</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        <div className="mt-7 rounded-2xl bg-white/70 backdrop-blur border border-border/70 p-5 flex items-start gap-4 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.08)]">
          <div className="flex-1">
            <p className="eyebrow">Today</p>
            <h3 className="mt-2 text-xl font-medium tracking-tight">Feed before 2PM</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Storm expected at 3PM.<br />Market prices increased in Kumasi.
            </p>
          </div>
          <button
            aria-label="Play briefing"
            className="h-11 w-11 shrink-0 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-lg"
          >
            <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Stat value={completedSteps < 5 ? "--" : "47"} label="Grow Day" />
          <Stat value={completedSteps < 5 ? "--" : "23"} label="Days Left" />
          <Stat value={completedSteps < 5 ? "--" : "24,560"} label="Projected Revenue" small />
        </div>

        <p className="mt-8 text-sm text-muted-foreground">Quick Access</p>
        <div className="mt-3 divide-y divide-border/70">
          {quickAccess.map((q) => (
            <Link key={q.to} href={q.to} className="flex items-center gap-4 py-4 group">
              <div className="h-11 w-11 rounded-full bg-surface border border-border/70 grid place-items-center shrink-0">
                <q.icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
              </div>
              <div className="flex-1">
                <p className="font-semibold tracking-tight">{q.title}</p>
                <p className="text-sm text-muted-foreground">{q.sub}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </div>
      </div>

      <WeatherHero />
    </PhoneShell>
  );
}

function WeatherHero() {
  const w = getWeather();
  return (
    <div className="mt-8 mx-4 rounded-2xl overflow-hidden relative border border-border/70 min-h-[180px]">
      <img
        src={w.src}
        alt={w.alt}
        width={768}
        height={512}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      <div className="relative z-10 p-6 pr-32 text-white">
        <p className="text-sm font-medium opacity-90">{w.headline}</p>
        <p className="display text-5xl mt-1">{w.time}</p>
        <p className="text-sm mt-3 opacity-80 max-w-[200px]">{w.detail}</p>
      </div>
    </div>
  );
}

function Stat({ value, label, small }: { value: string; label: string; small?: boolean }) {
  return (
    <div className="rounded-2xl px-3 py-4 text-center">
      <p className={`display-bold ${small ? "text-lg" : "text-3xl"} text-foreground`}>{value}</p>
      <p className="mt-1 text-[10px] text-muted-foreground whitespace-nowrap">{label}</p>
    </div>
  );
}
