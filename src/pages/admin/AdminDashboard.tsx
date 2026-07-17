import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { raceDataFetch } from "@/lib/raceDataFetch";
import { adminMutation } from "@/lib/adminMutation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Player { id: string; player_id: string; name: string; is_active?: boolean; }
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
  try {
    await adminMutation.insert("activity_logs", { action, target });
  } catch {
    // Non-critical
  }
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
    const fetchPlayers = async () => {
      try {
        const data = await raceDataFetch<Array<Pick<Player, "id" | "player_id" | "name" | "is_active">>>(
          () => supabase.from("players").select("id, player_id, name, is_active").order("player_id"),
          "admin_players",
        );
        const activePlayers = data.filter((player) => player.is_active !== false);
        setPlayers(activePlayers);
      } catch {
        toast.error("Failed to load players");
      }
    };
    fetchPlayers();
  }, []);

  const selectPlayer = async (player: Player) => {
    setSelected(player);
    try {
      const allEntries = await raceDataFetch<LeaderboardEntry[]>(
        () => supabase.from("leaderboard").select("*"),
        "leaderboard",
      );
      const data = allEntries.find((entry: any) => entry.player_id === player.id);
      if (data) {
        setStats({ ...data });
        return;
      }
    } catch {
      // fallback to zero state
    }

    setStats({ player_id: player.id, games_played: 0, events_completed: 0, wins: 0, seconds: 0, thirds: 0, points: 0 });
  };

  const saveStats = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const payload = {
        player_id: selected.id,
        games_played: Number(stats.games_played),
        events_completed: Number(stats.events_completed),
        wins: Number(stats.wins),
        seconds: Number(stats.seconds),
        thirds: Number(stats.thirds),
        points: Number(stats.points),
        updated_at: new Date().toISOString(),
      };

      const existingEntries = await raceDataFetch<{ id: string; player_id: string }[]>(
        () => supabase.from("leaderboard").select("id, player_id"),
        "leaderboard",
      );
      const existing = existingEntries.find((entry) => entry.player_id === selected.id);

      if (existing) {
        await adminMutation.update("leaderboard", payload, { player_id: selected.id });
      } else {
        await adminMutation.insert("leaderboard", payload);
      }

      // Recalculate ranks
      const allEntries = await raceDataFetch<{ id: string; points: number }[]>(
        () => supabase.from("leaderboard").select("id, points").order("points", { ascending: false }),
        "leaderboard",
      );
      for (let i = 0; i < allEntries.length; i++) {
        await adminMutation.update("leaderboard", { rank: i + 1 }, { id: allEntries[i].id });
      }

      await logActivity("UPDATE_LEADERBOARD", selected.name);
      toast.success(`Stats updated for ${selected.name}`);
    } catch {
      toast.error("Failed to save stats");
    } finally {
      setSaving(false);
    }
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
      <div className="p-4 md:p-8 pb-12 min-h-full">
        <h1 className="text-2xl  font-bold mb-1" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}>
          Update Leaderboard
        </h1>
        <p className="text-sm mb-8" style={{ color: "hsl(var(--brown-light))" }}>Search a player and edit their stats</p>

        <div className="grid md:grid-cols-2 gap-5 md:gap-8">
          {/* Player search */}
          <div>
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--brown-light))" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search player..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }}
              />
            </div>
            <div className="rounded-2xl p-3 overflow-hidden" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}>
            <div className="relative md:max-h-[calc(100dvh-14rem)] overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-7 scroll-fade-edge" style={{ background: "linear-gradient(180deg, hsl(var(--card)), transparent)" }} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-7 scroll-fade-edge" style={{ background: "linear-gradient(0deg, hsl(var(--card)), transparent)" }} />
              <div className="space-y-2 max-h-none md:max-h-[calc(100dvh-14rem)] overflow-y-visible md:overflow-y-auto animated-scroll-area py-1 pr-1">
                {filtered.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectPlayer(p)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all animated-scroll-item"
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
            </div>
          </div>

          {/* Stats editor */}
          <div>
            {selected ? (
              <div className="rounded-2xl p-6" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs  tracking-widest" style={{ color: "hsl(var(--brown-light))", fontFamily: "Electrolize, sans-serif" }}>{selected.player_id}</p>
                    <h3 className="text-lg  font-bold" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}>{selected.name}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {fields.map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs  tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Electrolize, sans-serif" }}>
                        {f.label.toUpperCase()}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={stats[f.key] as number}
                        onFocus={(e) => e.currentTarget.select()}
                        onChange={(e) => setStats((s) => ({ ...s, [f.key]: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }}
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={saveStats}
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl  text-sm tracking-widest flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--brown)), hsl(var(--brown-light)))",
                    color: "hsl(var(--cream))",
                    fontFamily: "Electrolize, sans-serif",
                  }}
                >
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? "SAVING..." : "SAVE STATS"}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl p-12 text-center" style={{ background: "hsl(var(--card))", border: "1px dashed hsl(var(--cream-dark))" }}>
                <p className="text-sm" style={{ color: "hsl(var(--brown-light) / 0.5)" }}>Select a player to edit their stats</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

