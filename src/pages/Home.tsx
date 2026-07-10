import { useState, useEffect } from "react";
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

  // Dynamic stats computed from onboarding data
  const stats = (() => {
    const fishCount = parseInt(localStorage.getItem("onboarding_fish_count") || "0", 10);
    const avgWeight = parseFloat(localStorage.getItem("onboarding_avg_weight") || "0"); // grams
    const species = (localStorage.getItem("onboarding_species") || "Tilapia").toLowerCase();

    const isTilapia = species.includes("tilapia");
    const targetWeight = isTilapia ? 500 : 700; // grams at harvest
    const totalCycleDays = isTilapia ? 180 : 240; // full grow-out cycle

    // Grow day: how far through the cycle based on current avg weight
    const weightRatio = avgWeight > 0 ? Math.min(avgWeight / targetWeight, 0.99) : 0;
    const growDay = Math.round(weightRatio * totalCycleDays);
    const daysLeft = Math.max(totalCycleDays - growDay, 0);

    // Projected revenue: fish × harvest weight × market price (GHS)
    const pricePerKg = isTilapia ? 32 : 45;
    const projectedRevenue = Math.round(fishCount * (targetWeight / 1000) * pricePerKg);

    const ready = fishCount > 0 && avgWeight > 0;

    return {
      growDay: ready ? growDay.toString() : "--",
      daysLeft: ready ? daysLeft.toString() : "--",
      projectedRevenue: ready ? `GH₵ ${projectedRevenue.toLocaleString()}` : "--",
    };
  })();

  const timeOfDay = (() => {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
  })();

  const fullName = localStorage.getItem("profile_full_name") || "Emmanuel Mensah";
  const firstName = fullName.split(" ")[0];

  return (
    <PhoneShell>
      <div className="px-6 pt-4">
        <h1 className="display text-5xl text-foreground">Good {timeOfDay},</h1>
        <h2 className="display-bold text-6xl text-foreground mt-1">{firstName}</h2>
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
          <Stat value={stats.growDay} label="Grow Day" />
          <Stat value={stats.daysLeft} label="Days Left" />
          <Stat value={stats.projectedRevenue} label="Projected Revenue" small />
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
  const [w, setW] = useState<Weather | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      let lat = 5.6037; // default Accra/Volta
      let lng = -0.1870;

      const saved = localStorage.getItem("onboarding_location");
      if (saved) {
        try {
          const coords = JSON.parse(saved);
          if (coords.lat && coords.lng) {
            lat = coords.lat;
            lng = coords.lng;
          }
        } catch {}
      }

      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
        if (!res.ok) throw new Error("Weather API failed");
        const data = await res.json();

        const temp = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;
        const wind = Math.round(data.current.wind_speed_10m);
        const humidity = data.current.relative_humidity_2m;

        let src = sunshineImg;
        let alt = "Sunny day";
        let headline = "Sunny Sky";
        let detail = "Feed early — warm and clear until noon.";

        const h = new Date().getHours();
        const isNight = h >= 18 || h < 6;

        if (code === 0) {
          src = isNight ? nightImg : sunshineImg;
          alt = isNight ? "Clear starry night sky" : "Bright sunny morning";
          headline = isNight ? "Clear Night" : "Clear Sunny Day";
          detail = isNight ? "Low winds. Good night conditions." : "Perfect sunlight. Ideal feeding parameters.";
        } else if (code >= 1 && code <= 3) {
          src = cloudyImg;
          alt = "Overcast skies over the lake";
          headline = code === 3 ? "Overcast" : "Partly Cloudy";
          detail = "Cloud cover is moderate. Feed normally.";
        } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
          src = stormImg;
          alt = "Rain clouds over the lake";
          headline = "Rainy Conditions";
          detail = `Precipitation active. Reduce feeding by 50% for oxygen safety. Wind: ${wind} km/h.`;
        } else if (code >= 95) {
          src = stormImg;
          alt = "Thunderstorm clouds";
          headline = "Thunderstorm Warning";
          detail = `Severe warnings. Turn on aerators and secure lake cages. Wind: ${wind} km/h.`;
        } else {
          src = cloudyImg;
          alt = "Cloudy weather";
          headline = "Cloudy Sky";
          detail = `Humidity at ${humidity}%. Mild wind speeds.`;
        }

        setW({ src, alt, headline, time: `${temp}°C`, detail });
      } catch (err) {
        console.error("Failed to fetch weather:", err);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000); // 10 min
    return () => clearInterval(interval);
  }, []);

  // Fallback to static briefing during loading or error
  const activeWeather = w || getWeather();

  return (
    <div className="mt-8 mx-4 rounded-2xl overflow-hidden relative border border-border/70 min-h-[180px]">
      <img
        src={activeWeather.src}
        alt={activeWeather.alt}
        width={768}
        height={512}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      <div className="relative z-10 p-6 pr-32 text-white">
        <p className="text-sm font-medium opacity-90">{activeWeather.headline}</p>
        <p className="display text-5xl mt-1">{activeWeather.time}</p>
        <p className="text-sm mt-3 opacity-80 max-w-[200px]">{activeWeather.detail}</p>
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
