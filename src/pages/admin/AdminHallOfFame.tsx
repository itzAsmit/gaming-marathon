import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { raceDataFetch } from "@/lib/raceDataFetch";
import { adminMutation } from "@/lib/adminMutation";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "sonner";

const SEASONS = [1, 2, 3];

export default function AdminHallOfFame() {
  const [players, setPlayers] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [p, h] = await Promise.all([
        raceDataFetch<any[]>(
          () => supabase.from("players").select("id, name, player_id"),
          "admin_players",
        ),
        raceDataFetch<any[]>(
          () => supabase.from("hall_of_fame").select("*"),
          "admin_hall_of_fame",
        ),
      ]);
      setPlayers(p);
      setEntries(h);
    } catch {
      toast.error("Failed to load data");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getEntry = (season: number, rank: number) =>
    entries.find((e) => e.season === season && e.rank === rank);

  const setEntry = async (season: number, rank: number, playerId: string) => {
    setSaving(true);
    try {
      const existing = getEntry(season, rank);
      if (existing) {
        if (playerId) await adminMutation.update("hall_of_fame", { player_id: playerId }, { id: existing.id });
        else await adminMutation.delete("hall_of_fame", { id: existing.id });
      } else if (playerId) {
        await adminMutation.insert("hall_of_fame", { season, rank, player_id: playerId });
      }
      await adminMutation.insert("activity_logs", { action: "UPDATE_HALL_OF_FAME", target: `Season ${season} Rank ${rank}` });
      toast.success("Hall of Fame updated!");
      await fetchData();
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const RANK_LABELS = ["🥇 1st Place", "🥈 2nd Place", "🥉 3rd Place"];

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-jura font-bold mb-1" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Jura, sans-serif" }}>Hall of Fame</h1>
        <p className="text-sm mb-8" style={{ color: "hsl(var(--brown-light))" }}>Set top 3 players for each season</p>

        <div className="space-y-8">
          {SEASONS.map((season) => (
            <div key={season} className="rounded-2xl p-4 md:p-6" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}>
              <h2 className="font-jura font-bold text-lg mb-4" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Jura, sans-serif" }}>Season {season}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((rank) => {
                  const entry = getEntry(season, rank);
                  return (
                    <div key={rank}>
                      <label className="block text-xs font-jura tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Jura, sans-serif" }}>{RANK_LABELS[rank - 1]}</label>
                      <select
                        value={entry?.player_id ?? ""}
                        onChange={(e) => setEntry(season, rank, e.target.value)}
                        disabled={saving}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }}
                      >
                        <option value="">— None —</option>
                        {players.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.player_id})</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

