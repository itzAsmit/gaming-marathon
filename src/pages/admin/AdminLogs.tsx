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
      <div className="flex flex-col h-full">
        <div className="p-4 md:p-8 pb-0 shrink-0">
          <h1 className="text-2xl  font-bold mb-1" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}>Activity Logs</h1>
          <p className="text-sm mb-8" style={{ color: "hsl(var(--brown-light))" }}>Permanent record of all admin actions</p>
        </div>

        <div className="flex-1 p-4 md:p-8 pt-0 min-h-0">
          {loading ? (
            <div className="flex justify-center py-20"><RefreshCw size={24} className="animate-spin" style={{ color: "hsl(var(--brown-light))" }} /></div>
          ) : (
            <div className="rounded-2xl overflow-hidden h-full flex flex-col" style={{ border: "1px solid hsl(var(--cream-dark))" }}>
              <div className="grid grid-cols-4 gap-4 px-6 py-3 text-xs  tracking-widest shrink-0" style={{ background: "hsl(var(--input))", color: "hsl(var(--brown))", fontFamily: "Electrolize, sans-serif" }}>
                <div>ACTION</div><div>TARGET</div><div>DATE</div><div>TIME</div>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar" style={{ background: "hsl(var(--card))" }}>
                {logs.map((log) => {
                  const d = new Date(log.created_at);
                  return (
                    <div key={log.id} className="grid grid-cols-4 gap-4 px-6 py-3 text-sm border-t" style={{ borderColor: "hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }}>
                      <div className="font-semibold text-xs " style={{ color: "hsl(var(--brown))", fontFamily: "Electrolize, sans-serif" }}>{log.action}</div>
                      <div className="truncate text-xs" style={{ color: "hsl(var(--brown-light))" }}>{log.target ?? "—"}</div>
                      <div className="text-xs" style={{ color: "hsl(var(--brown-light))" }}>{d.toLocaleDateString()}</div>
                      <div className="text-xs" style={{ color: "hsl(var(--brown-light))" }}>{d.toLocaleTimeString()}</div>
                    </div>
                  );
                })}
                {logs.length === 0 && <div className="px-6 py-12 text-center text-sm" style={{ color: "hsl(var(--brown-light) / 0.5)" }}>No activity yet</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

