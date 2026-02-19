import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "sonner";

const SEASONS = [1, 2, 3];

export default function AdminHallOfFame() {
  const [players, setPlayers] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    const [{ data: p }, { data: h }] = await Promise.all([
      supabase.from("players").select("id, name, player_id"),
      supabase.from("hall_of_fame").select("*"),
    ]);
    if (p) setPlayers(p);
    if (h) setEntries(h);
  };

  useEffect(() => { fetch(); }, []);

  const getEntry = (season: number, rank: number) =>
    entries.find((e) => e.season === season && e.rank === rank);

  const setEntry = async (season: number, rank: number, playerId: string) => {
    setSaving(true);
    const existing = getEntry(season, rank);
    if (existing) {
      if (playerId) await supabase.from("hall_of_fame").update({ player_id: playerId }).eq("id", existing.id);
      else await supabase.from("hall_of_fame").delete().eq("id", existing.id);
    } else if (playerId) {
      await supabase.from("hall_of_fame").insert({ season, rank, player_id: playerId });
    }
    await supabase.from("activity_logs").insert({ action: "UPDATE_HALL_OF_FAME", target: `Season ${season} Rank ${rank}` });
    toast.success("Hall of Fame updated!");
    await fetch();
    setSaving(false);
  };

  const RANK_LABELS = ["🥇 1st Place", "🥈 2nd Place", "🥉 3rd Place"];

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-cinzel font-bold mb-1" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Cinzel, serif" }}>Hall of Fame</h1>
        <p className="text-sm mb-8" style={{ color: "hsl(var(--brown-light))" }}>Set top 3 players for each season</p>

        <div className="space-y-8">
          {SEASONS.map((season) => (
            <div key={season} className="rounded-2xl p-6" style={{ background: "white", border: "1px solid hsl(var(--cream-dark))" }}>
              <h2 className="font-cinzel font-bold text-lg mb-4" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Cinzel, serif" }}>Season {season}</h2>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((rank) => {
                  const entry = getEntry(season, rank);
                  return (
                    <div key={rank}>
                      <label className="block text-xs font-cinzel tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>{RANK_LABELS[rank - 1]}</label>
                      <select
                        value={entry?.player_id ?? ""}
                        onChange={(e) => setEntry(season, rank, e.target.value)}
                        disabled={saving}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }}
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
