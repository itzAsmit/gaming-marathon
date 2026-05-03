import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { hasStoredAccessToken } from "@/lib/authToken";
import { LayoutDashboard, Users, Gamepad2, Sword, History, LogOut, ChevronRight, Trophy, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Players", icon: Users, path: "/admin/players" },
  { label: "Games", icon: Gamepad2, path: "/admin/games" },
  { label: "Assign Items", icon: Sword, path: "/admin/items" },
  { label: "Hall of Fame", icon: Trophy, path: "/admin/hall-of-fame" },
  { label: "Activity Logs", icon: History, path: "/admin/logs" },
];

function SidebarContent({ onClose, logout }: { onClose?: () => void; logout: () => void }) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: "hsl(var(--cream-dark))" }}>
        <Link to="/" className="flex items-center gap-2" onClick={onClose}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--brown)), hsl(var(--brown-light)))" }}>
            <Gamepad2 size={16} style={{ color: "hsl(var(--cream))" }} />
          </div>
          <div>
            <p className="text-xs font-jura font-bold" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Jura, sans-serif" }}>MARATHON</p>
            <p className="text-xs" style={{ color: "hsl(var(--brown-light))" }}>Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group"
              style={{
                background: active ? "hsl(var(--cream))" : "transparent",
                color: active ? "hsl(var(--brown))" : "hsl(var(--brown-light))",
                fontWeight: active ? 600 : 400,
              }}
            >
              <item.icon size={16} />
              {item.label}
              {active && <ChevronRight size={12} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t" style={{ borderColor: "hsl(var(--cream-dark))" }}>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm transition-all duration-200 hover:opacity-90"
          style={{
            color: "hsl(var(--destructive))",
            background: "hsla(var(--destructive) / 0.08)",
            border: "1px solid hsla(var(--destructive) / 0.25)",
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;

      if (data.session) {
        setChecking(false);
        return;
      }

      if (hasStoredAccessToken()) {
        setChecking(false);
        return;
      }

      const waitForSession = window.setTimeout(async () => {
        const { data: retryData } = await supabase.auth.getSession();
        if (!active) return;
        if (!retryData.session && !hasStoredAccessToken()) {
          navigate("/admin/login");
        }
        setChecking(false);
      }, 900);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        if (session) {
          clearTimeout(waitForSession);
          setChecking(false);
          subscription.unsubscribe();
        }
      });
    };

    void checkAuth();

    return () => {
      active = false;
    };
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (checking) return (
    <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: "hsl(var(--input))" }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "hsl(var(--brown))", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div className="min-h-[100dvh] h-[100dvh] md:min-h-screen md:h-screen flex flex-col overflow-hidden" style={{ background: "hsl(var(--input))" }}>
      {/* Mobile Navbar */}
      <nav className="md:hidden sticky top-0 z-50 flex items-center justify-between p-4" style={{ background: "hsl(var(--card))", borderBottom: "1px solid hsl(var(--cream-dark))" }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--brown)), hsl(var(--brown-light)))" }}>
            <Gamepad2 size={14} style={{ color: "hsl(var(--cream))" }} />
          </div>
          <p className="text-xs font-jura font-bold" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Jura, sans-serif" }}>MARATHON</p>
        </Link>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="p-2 hover:rounded-lg transition-colors"
              style={{ color: "hsl(var(--brown))" }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0" style={{ background: "hsl(var(--card))" }}>
            <SidebarContent onClose={() => setMobileOpen(false)} logout={logout} />
          </SheetContent>
        </Sheet>
      </nav>

      {/* Desktop Layout */}
      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-60 md:shrink-0 flex-col h-full" style={{ background: "hsl(var(--card))", borderRight: "1px solid hsl(var(--cream-dark))" }}>
          <SidebarContent logout={logout} />
        </aside>

        {/* Content */}
        <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar overscroll-y-contain">
          {children}
        </main>
      </div>
    </div>
  );
}

