import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
  const [location] = useLocation();
  const showNav = !NO_NAV_ROUTES.has(location);

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

    const interval = setInterval(() => {
      // Pick next alert from the pool
      const alert = alertsPool[currentAlertIndex];
      currentAlertIndex = (currentAlertIndex + 1) % alertsPool.length;

      // Add to local storage
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
      
      // Dispatch custom event to let components know notifications updated in real-time
      window.dispatchEvent(new Event("notifications_updated"));

      // Trigger standard browser push notification if permitted
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
    }, 15 * 60 * 1000); // Send at most one alert every 15 minutes

    return () => clearInterval(interval);
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
