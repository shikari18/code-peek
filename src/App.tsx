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
