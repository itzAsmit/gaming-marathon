import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { raceDataFetch } from "@/lib/raceDataFetch";
import AdminLayout from "@/components/admin/AdminLayout";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    raceDataFetch<any[]>(
      () => supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(200),
      "admin_activity_logs",
    ).then((data) => {
      setLogs(data);
    }).catch(() => {
      toast.error("Failed to load logs");
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-jura font-bold mb-1" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Jura, sans-serif" }}>Activity Logs</h1>
        <p className="text-sm mb-8" style={{ color: "hsl(var(--brown-light))" }}>Permanent record of all admin actions</p>

        {loading ? (
          <div className="flex justify-center py-20"><RefreshCw size={24} className="animate-spin" style={{ color: "hsl(var(--brown-light))" }} /></div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(var(--cream-dark))" }}>
            <div className="grid grid-cols-4 gap-4 px-6 py-3 text-xs font-jura tracking-widest" style={{ background: "hsl(var(--input))", color: "hsl(var(--brown))", fontFamily: "Jura, sans-serif" }}>
              <div>ACTION</div><div>TARGET</div><div>DATE</div><div>TIME</div>
            </div>
            {logs.map((log) => {
              const d = new Date(log.created_at);
              return (
                <div key={log.id} className="grid grid-cols-4 gap-4 px-6 py-3 text-sm border-t" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }}>
                  <div className="font-semibold text-xs font-jura" style={{ color: "hsl(var(--brown))", fontFamily: "Jura, sans-serif" }}>{log.action}</div>
                  <div className="truncate text-xs" style={{ color: "hsl(var(--brown-light))" }}>{log.target ?? "—"}</div>
                  <div className="text-xs" style={{ color: "hsl(var(--brown-light))" }}>{d.toLocaleDateString()}</div>
                  <div className="text-xs" style={{ color: "hsl(var(--brown-light))" }}>{d.toLocaleTimeString()}</div>
                </div>
              );
            })}
            {logs.length === 0 && <div className="px-6 py-12 text-center text-sm" style={{ color: "hsl(var(--brown-light) / 0.5)" }}>No activity yet</div>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

