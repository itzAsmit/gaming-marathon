import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Users, Gamepad2, Sword, History, LogOut, ChevronRight, Trophy } from "lucide-react";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Players", icon: Users, path: "/admin/players" },
  { label: "Games", icon: Gamepad2, path: "/admin/games" },
  { label: "Assign Items", icon: Sword, path: "/admin/items" },
  { label: "Hall of Fame", icon: Trophy, path: "/admin/hall-of-fame" },
  { label: "Activity Logs", icon: History, path: "/admin/logs" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate("/admin/login");
      setChecking(false);
    });
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(var(--cream))" }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "hsl(var(--brown))", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "hsl(var(--cream))" }}>
      {/* Sidebar */}
      <aside className="w-60 flex flex-col" style={{ background: "white", borderRight: "1px solid hsl(var(--cream-dark))" }}>
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: "hsl(var(--cream-dark))" }}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--brown)), hsl(var(--brown-light)))" }}>
              <Gamepad2 size={16} style={{ color: "hsl(var(--cream))" }} />
            </div>
            <div>
              <p className="text-xs font-cinzel font-bold" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Cinzel, serif" }}>MARATHON</p>
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
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm transition-all duration-200"
            style={{ color: "hsl(var(--destructive))" }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
