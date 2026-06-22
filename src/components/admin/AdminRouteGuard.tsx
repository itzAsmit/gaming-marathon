import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { verifyAdminSession } from "@/lib/authToken";

export default function AdminRouteGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    verifyAdminSession().then((isAdmin) => {
      if (active) setAllowed(isAdmin);
    });

    return () => {
      active = false;
    };
  }, []);

  if (allowed === null) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: "hsl(var(--input))" }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "hsl(var(--brown))", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
