import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AnimatedCursor from "./components/AnimatedCursor";
import SiteAudioOverlay from "./components/SiteAudioOverlay";

// Lazy-load admin pages so they don't inflate the homepage bundle
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminPlayers = lazy(() => import("./pages/admin/AdminPlayers"));
const AdminGames = lazy(() => import("./pages/admin/AdminGames"));
const AdminItems = lazy(() => import("./pages/admin/AdminItems"));
const AdminLogs = lazy(() => import("./pages/admin/AdminLogs"));
const AdminHallOfFame = lazy(() => import("./pages/admin/AdminHallOfFame"));

const queryClient = new QueryClient();

const AdminFallback = () => (
  <div className="flex items-center justify-center min-h-screen" style={{ background: "hsl(var(--background))" }}>
    <div className="text-center">
      <div className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: "hsl(var(--brown))", borderTopColor: "transparent" }} />
      <p className="text-sm font-jura tracking-widest" style={{ color: "hsl(var(--brown))", fontFamily: "Jura, sans-serif" }}>LOADING...</p>
    </div>
  </div>
);

function AppShell() {
  const location = useLocation();
  const hideAudioOverlay = location.pathname.startsWith("/admin");

  return (
    <>
      <AnimatedCursor />
      {!hideAudioOverlay && <SiteAudioOverlay />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin/login" element={<Suspense fallback={<AdminFallback />}><AdminLogin /></Suspense>} />
        <Route path="/admin/dashboard" element={<Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense>} />
        <Route path="/admin/players" element={<Suspense fallback={<AdminFallback />}><AdminPlayers /></Suspense>} />
        <Route path="/admin/games" element={<Suspense fallback={<AdminFallback />}><AdminGames /></Suspense>} />
        <Route path="/admin/items" element={<Suspense fallback={<AdminFallback />}><AdminItems /></Suspense>} />
        <Route path="/admin/logs" element={<Suspense fallback={<AdminFallback />}><AdminLogs /></Suspense>} />
        <Route path="/admin/hall-of-fame" element={<Suspense fallback={<AdminFallback />}><AdminHallOfFame /></Suspense>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
      <Analytics />
      <SpeedInsights />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
