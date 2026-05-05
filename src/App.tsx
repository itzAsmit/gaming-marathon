import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ArrowUp } from "lucide-react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AnimatedCursor from "./components/AnimatedCursor";
import ClickSpark from "./components/ClickSpark";

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
      <p className="text-sm  tracking-widest" style={{ color: "hsl(var(--brown))", fontFamily: "Electrolize, sans-serif" }}>LOADING...</p>
    </div>
  </div>
);

function AppShell() {
  return (
    <>
      <AnimatedCursor />
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
      <ClickSpark sparkColor="#111111" sparkSize={12} sparkRadius={18} sparkCount={8} duration={450}>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-4 right-4 z-[120] md:bottom-6 md:right-6 w-12 h-12 md:w-14 md:h-14 rounded-full border border-black/20 bg-white/85 backdrop-blur-sm text-black flex items-center justify-center transition-all duration-200 hover:border-black/45 hover:bg-white"
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <ArrowUp size={18} />
        </button>
      </ClickSpark>
      <Analytics />
      <SpeedInsights />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
