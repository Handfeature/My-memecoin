import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { AuthProvider } from "@/hooks/use-auth";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load pages to improve performance
const TradingPage = lazy(() => import("@/pages/TradingPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const RewardsPage = lazy(() => import("@/pages/RewardsPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const NewsPage = lazy(() => import("@/pages/NewsPage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/trade" component={TradingPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/rewards" component={RewardsPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/news" component={NewsPage} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
