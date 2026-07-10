import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { BottomNav } from "@/components/BottomNav";
import Home from "@/pages/Home";
import Assistant from "@/pages/Assistant";
import FeedCalculator from "@/pages/FeedCalculator";
import FishDoctor from "@/pages/FishDoctor";
import MarketPrices from "@/pages/MarketPrices";
import Notifications from "@/pages/Notifications";
import PondAlerts from "@/pages/PondAlerts";
import Profile from "@/pages/Profile";
import SignIn from "@/pages/SignIn";
import Welcome from "@/pages/Welcome";
import Onboarding from "@/pages/Onboarding";
import CommunityBuying from "@/pages/CommunityBuying";
import HarvestMarketplace from "@/pages/HarvestMarketplace";
import CreditScore from "@/pages/CreditScore";
import PondDevice from "@/pages/PondDevice";
import FarmerChat from "@/pages/FarmerChat";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

const NO_NAV_ROUTES = new Set(["/", "/welcome", "/signin", "/onboarding"]);

function wrap(Component: React.ComponentType) {
  return function WrappedPage() {
    return (
      <AnimatedPage>
        <Component />
      </AnimatedPage>
    );
  };
}

function AppShell() {
  const [location, navigate] = useLocation();
  const showNav = !NO_NAV_ROUTES.has(location);

  // Redirect to Welcome if no language chosen, or to SignIn if onboarding not complete
  useEffect(() => {
    const hasLang = localStorage.getItem("selected_language");
    const onboardingCompleted = localStorage.getItem("onboarding_completed") === "true";
    
    if (!hasLang) {
      if (location !== "/" && location !== "/welcome") {
        navigate("/", { replace: true });
      }
    } else if (!onboardingCompleted) {
      if (location !== "/" && location !== "/welcome" && location !== "/signin" && location !== "/onboarding") {
        navigate("/signin", { replace: true });
      }
    }
  }, [location, navigate]);

  const [isBlocked, setIsBlocked] = useState(false);
  const [promptCount, setPromptCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);

  const checkBlockStatus = () => {
    const onboardingCompleted = localStorage.getItem("onboarding_completed") === "true";
    if (!onboardingCompleted || NO_NAV_ROUTES.has(location)) {
      setIsBlocked(false);
      return;
    }

    const currentTier = localStorage.getItem("subscription_tier") || "Free Plan";
    const isPremium = currentTier === "Pro Plan" || currentTier === "Enterprise Plan";
    if (isPremium) {
      setIsBlocked(false);
      return;
    }

    const pCount = parseInt(localStorage.getItem("usage_prompts_count") || "0", 10);
    const nCount = parseInt(localStorage.getItem("usage_notifications_count") || "0", 10);
    setPromptCount(pCount);
    setNotifCount(nCount);

    if (pCount >= 19 || nCount >= 6) {
      setIsBlocked(true);
    } else {
      setIsBlocked(false);
    }
  };

  useEffect(() => {
    checkBlockStatus();
  }, [location]);

  useEffect(() => {
    const handleUsageUpdated = () => checkBlockStatus();
    window.addEventListener("usage_updated", handleUsageUpdated);
    window.addEventListener("subscription_updated", handleUsageUpdated);
    return () => {
      window.removeEventListener("usage_updated", handleUsageUpdated);
      window.removeEventListener("subscription_updated", handleUsageUpdated);
    };
  }, []);

  const handlePayGHS = () => {
    localStorage.setItem("subscription_tier", "Pro Plan");
    localStorage.setItem("usage_prompts_count", "0");
    localStorage.setItem("usage_notifications_count", "0");
    window.dispatchEvent(new Event("subscription_updated"));
    setIsBlocked(false);
  };

  const handleSignOutPaywall = () => {
    const langPref = localStorage.getItem("selected_language");
    localStorage.clear();
    if (langPref) localStorage.setItem("selected_language", langPref);
    setIsBlocked(false);
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new Event("popstate"));
  };

  useEffect(() => {
    // Request notification permission on startup
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Schedule background simulated alerts (rain warning, feeding reminder, oxygen levels)
    const alertsPool = [
      {
        icon: "CloudRain",
        title: "Weather Warning: Rain arriving soon",
        body: "Rain lowers water temperature and oxygen. Reduce feeding by 50% for Pond 1.",
        time: "Just now"
      },
      {
        icon: "Droplet",
        title: "Pond Device Alert: Dissolved oxygen is dropping",
        body: "Pond 2 sensor reading is at 3.9 mg/L. Turn on aerators immediately.",
        time: "Just now"
      },
      {
        icon: "TrendingUp",
        title: "Market Price Alert: Tilapia prices have increased",
        body: "Tilapia wholesale prices in Accra increased by 12% today.",
        time: "Just now"
      },
      {
        icon: "Calculator",
        title: "Feeding Reminder: Time to calculate today's feed",
        body: "Schedule calculation complete: Feed 3 bags of 2mm pellets to Pond 3.",
        time: "Just now"
      }
    ];

    let currentAlertIndex = 0;

    const triggerAlert = () => {
      const alert = alertsPool[currentAlertIndex];
      currentAlertIndex = (currentAlertIndex + 1) % alertsPool.length;

      const stored = localStorage.getItem("app_notifications");
      const currentNotifications = stored ? JSON.parse(stored) : [];
      
      const newNotification = {
        id: Math.random().toString(),
        iconName: alert.icon,
        title: alert.title,
        body: alert.body,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: true
      };

      localStorage.setItem("app_notifications", JSON.stringify([newNotification, ...currentNotifications]));
      window.dispatchEvent(new Event("notifications_updated"));

      if ("Notification" in window && Notification.permission === "granted") {
        try {
          const instance = new Notification(alert.title, {
            body: alert.body,
            icon: "/fish-logo.png"
          });
          instance.onclick = () => {
            window.focus();
            window.history.pushState({}, "", "/notifications");
            window.dispatchEvent(new Event("popstate"));
          };
        } catch (e) {
          console.warn("Push notification failed to fire:", e);
        }
      }
    };

    setTimeout(triggerAlert, 2000);

    const interval = setInterval(triggerAlert, 45 * 1000);

    window.addEventListener("trigger_test_alert", triggerAlert);

    return () => {
      clearInterval(interval);
      window.removeEventListener("trigger_test_alert", triggerAlert);
    };
  }, []);

  return (
    <div className="h-screen w-full flex justify-center overflow-hidden">
      <div className="w-full max-w-md flex flex-col h-full overflow-hidden">
        <AnimatePresence mode="wait">
          <Switch key={location}>
            <Route path="/" component={wrap(Welcome)} />
            <Route path="/home" component={wrap(Home)} />
            <Route path="/assistant" component={wrap(Assistant)} />
            <Route path="/feed-calculator" component={wrap(FeedCalculator)} />
            <Route path="/fish-doctor" component={wrap(FishDoctor)} />
            <Route path="/market-prices" component={wrap(MarketPrices)} />
            <Route path="/notifications" component={wrap(Notifications)} />
            <Route path="/pond-alerts" component={wrap(PondAlerts)} />
            <Route path="/profile" component={wrap(Profile)} />
            <Route path="/signin" component={wrap(SignIn)} />
            <Route path="/welcome" component={wrap(Welcome)} />
            <Route path="/onboarding" component={wrap(Onboarding)} />
            <Route path="/community-buying" component={wrap(CommunityBuying)} />
            <Route path="/harvest-marketplace" component={wrap(HarvestMarketplace)} />
            <Route path="/credit-score" component={wrap(CreditScore)} />
            <Route path="/pond-device" component={wrap(PondDevice)} />
            <Route path="/farmer-chat" component={wrap(FarmerChat)} />
            <Route component={wrap(NotFound)} />
          </Switch>
        </AnimatePresence>
        {showNav && <BottomNav />}
        
        {/* ── Paywall Overlay ── */}
        {isBlocked && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-[100] flex flex-col justify-center px-6 text-center text-white animate-fade-in">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-6">
              <Shield className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Usage Limit Reached</h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              You have completed {promptCount}/19 assistant prompts or played {notifCount}/6 voice alerts on the Free Plan.
            </p>
            <div className="mt-8 p-5 rounded-2xl bg-white/5 border border-white/10 text-left">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-mono">Premium Subscription</p>
              <p className="text-xl font-bold text-white mt-1">120 GHS / month</p>
              <p className="text-xs text-slate-400 mt-2">Unlock unlimited calculations, premium weather forecasting, and persistent voice calls.</p>
            </div>
            <div className="mt-10 flex flex-col gap-3">
              <button
                onClick={handlePayGHS}
                className="w-full py-4 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 active:scale-95 transition-all text-sm cursor-pointer"
              >
                Pay 120 GHS
              </button>
              <button
                onClick={handleSignOutPaywall}
                className="w-full py-4 rounded-full border border-white/20 hover:bg-white/5 text-white font-medium active:scale-95 transition-all text-sm cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AppShell />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
