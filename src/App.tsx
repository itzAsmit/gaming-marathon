import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPlayers from "./pages/admin/AdminPlayers";
import AdminGames from "./pages/admin/AdminGames";
import AdminItems from "./pages/admin/AdminItems";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminHallOfFame from "./pages/admin/AdminHallOfFame";
import AnimatedCursor from "./components/AnimatedCursor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedCursor />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/players" element={<AdminPlayers />} />
          <Route path="/admin/games" element={<AdminGames />} />
          <Route path="/admin/items" element={<AdminItems />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
          <Route path="/admin/hall-of-fame" element={<AdminHallOfFame />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
