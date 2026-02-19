import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Player { id: string; player_id: string; name: string; }
interface LeaderboardEntry {
  id?: string;
  player_id: string;
  games_played: number;
  events_completed: number;
  wins: number;
  seconds: number;
  thirds: number;
  points: number;
}

const logActivity = async (action: string, target: string) => {
  await supabase.from("activity_logs").insert({ action, target });
};

export default function AdminDashboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Player | null>(null);
  const [stats, setStats] = useState<LeaderboardEntry>({
    player_id: "", games_played: 0, events_completed: 0, wins: 0, seconds: 0, thirds: 0, points: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("players").select("id, player_id, name").order("player_id").then(({ data }) => {
      if (data) setPlayers(data);
    });
  }, []);

  const selectPlayer = async (player: Player) => {
    setSelected(player);
    const { data } = await supabase.from("leaderboard").select("*").eq("player_id", player.id).single();
    if (data) {
      setStats({ ...data });
    } else {
      setStats({ player_id: player.id, games_played: 0, events_completed: 0, wins: 0, seconds: 0, thirds: 0, points: 0 });
    }
  };

  const saveStats = async () => {
    if (!selected) return;
    setSaving(true);
    const payload = { ...stats, player_id: selected.id, updated_at: new Date().toISOString() };

    const { data: existing } = await supabase.from("leaderboard").select("id").eq("player_id", selected.id).single();

    if (existing) {
      await supabase.from("leaderboard").update(payload).eq("player_id", selected.id);
    } else {
      await supabase.from("leaderboard").insert(payload);
    }

    // Recalculate ranks
    const { data: allEntries } = await supabase.from("leaderboard").select("id, points").order("points", { ascending: false });
    if (allEntries) {
      for (let i = 0; i < allEntries.length; i++) {
        await supabase.from("leaderboard").update({ rank: i + 1 }).eq("id", allEntries[i].id);
      }
    }

    await logActivity("UPDATE_LEADERBOARD", selected.name);
    toast.success(`Stats updated for ${selected.name}`);
    setSaving(false);
  };

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.player_id.toLowerCase().includes(search.toLowerCase())
  );

  const fields: { key: keyof LeaderboardEntry; label: string }[] = [
    { key: "games_played", label: "Games Played" },
    { key: "events_completed", label: "Events Completed" },
    { key: "wins", label: "Wins" },
    { key: "seconds", label: "2nds" },
    { key: "thirds", label: "3rds" },
    { key: "points", label: "Points" },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-cinzel font-bold mb-1" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Cinzel, serif" }}>
          Update Leaderboard
        </h1>
        <p className="text-sm mb-8" style={{ color: "hsl(var(--brown-light))" }}>Search a player and edit their stats</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Player search */}
          <div>
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--brown-light))" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search player..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }}
              />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectPlayer(p)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all"
                  style={{
                    background: selected?.id === p.id ? "hsl(var(--cream-dark))" : "white",
                    border: "1px solid hsl(var(--cream-dark))",
                    color: "hsl(var(--brown-deep))",
                  }}
                >
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-xs ml-auto" style={{ color: "hsl(var(--brown-light))" }}>{p.player_id}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-center py-8 text-sm" style={{ color: "hsl(var(--brown-light) / 0.5)" }}>No players found</p>
              )}
            </div>
          </div>

          {/* Stats editor */}
          <div>
            {selected ? (
              <div className="rounded-2xl p-6" style={{ background: "white", border: "1px solid hsl(var(--cream-dark))" }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-cinzel tracking-widest" style={{ color: "hsl(var(--brown-light))", fontFamily: "Cinzel, serif" }}>{selected.player_id}</p>
                    <h3 className="text-lg font-cinzel font-bold" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Cinzel, serif" }}>{selected.name}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {fields.map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-cinzel tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>
                        {f.label.toUpperCase()}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={stats[f.key] as number}
                        onChange={(e) => setStats((s) => ({ ...s, [f.key]: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }}
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={saveStats}
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl font-cinzel text-sm tracking-widest flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--brown)), hsl(var(--brown-light)))",
                    color: "hsl(var(--cream))",
                    fontFamily: "Cinzel, serif",
                  }}
                >
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? "SAVING..." : "SAVE STATS"}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl p-12 text-center" style={{ background: "white", border: "1px dashed hsl(var(--cream-dark))" }}>
                <p className="text-sm" style={{ color: "hsl(var(--brown-light) / 0.5)" }}>Select a player to edit their stats</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
