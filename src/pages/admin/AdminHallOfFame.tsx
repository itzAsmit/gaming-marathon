import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { raceDataFetch } from "@/lib/raceDataFetch";
import { adminMutation } from "@/lib/adminMutation";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const SEASONS = [1, 2, 3];

export default function AdminHallOfFame() {
  const [players, setPlayers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"podium" | "seasons">("podium");

  const fetchData = async () => {
    try {
      const [p, g, h] = await Promise.all([
        raceDataFetch<any[]>(
          () => supabase.from("players").select("id, name, player_id"),
          "admin_players",
        ),
        raceDataFetch<any[]>(
          () => supabase.from("games").select("id, name, season, game_date").order("game_date"),
          "admin_games",
        ),
        raceDataFetch<any[]>(
          () => supabase.from("hall_of_fame").select("*"),
          "admin_hall_of_fame",
        ),
      ]);
      setPlayers(p);
      setGames(g);
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

  const updateGameSeason = async (gameId: string, season: number | null) => {
    setSaving(true);
    try {
      await adminMutation.update("games", { season }, { id: gameId });
      toast.success(`Game season updated to ${season || "None"}`);
      await fetchData();
    } catch {
      toast.error("Failed to update game season");
    } finally {
      setSaving(false);
    }
  };

  const RANK_LABELS = ["🥇 1st Place", "🥈 2nd Place", "🥉 3rd Place"];

  const gamesBySeason = {
    1: games.filter((g) => g.season === 1),
    2: games.filter((g) => g.season === 2),
    3: games.filter((g) => g.season === 3),
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}>
            Hall of Fame Management
          </h1>
          <p className="text-sm" style={{ color: "hsl(var(--brown-light))" }}>
            Manage top 3 players and season games
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b" style={{ borderColor: "hsl(var(--cream-dark))" }}>
          <button
            onClick={() => setActiveTab("podium")}
            className="px-4 py-2 font-semibold transition-colors"
            style={{
              fontFamily: "Electrolize, sans-serif",
              color: activeTab === "podium" ? "hsl(var(--gold))" : "hsl(var(--brown-light))",
              borderBottom: activeTab === "podium" ? "2px solid hsl(var(--gold))" : "none",
            }}
          >
            Top 3 Finishers
          </button>
          <button
            onClick={() => setActiveTab("seasons")}
            className="px-4 py-2 font-semibold transition-colors"
            style={{
              fontFamily: "Electrolize, sans-serif",
              color: activeTab === "seasons" ? "hsl(var(--gold))" : "hsl(var(--brown-light))",
              borderBottom: activeTab === "seasons" ? "2px solid hsl(var(--gold))" : "none",
            }}
          >
            Season Games
          </button>
        </div>

        {/* Top 3 Finishers Tab */}
        {activeTab === "podium" && (
          <div className="space-y-8">
            {SEASONS.map((season) => (
              <div 
                key={season} 
                className="rounded-2xl p-4 md:p-6" 
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}
              >
                <h2 
                  className="font-bold text-lg mb-4" 
                  style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}
                >
                  Season {season}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((rank) => {
                    const entry = getEntry(season, rank);
                    return (
                      <div key={rank}>
                        <label 
                          className="block text-xs font-semibold tracking-widest mb-1.5" 
                          style={{ color: "hsl(var(--brown))", fontFamily: "Electrolize, sans-serif" }}
                        >
                          {RANK_LABELS[rank - 1]}
                        </label>
                        <select
                          value={entry?.player_id ?? ""}
                          onChange={(e) => setEntry(season, rank, e.target.value)}
                          disabled={saving}
                          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                          style={{ 
                            background: "hsl(var(--input))", 
                            border: "1px solid hsl(var(--cream-dark))", 
                            color: "hsl(var(--brown-deep))" 
                          }}
                        >
                          <option value="">— None —</option>
                          {players.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.player_id})
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Season Games Tab */}
        {activeTab === "seasons" && (
          <div className="space-y-8">
            {SEASONS.map((season) => (
              <div 
                key={season} 
                className="rounded-2xl p-4 md:p-6" 
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}
              >
                <h2 
                  className="font-bold text-lg mb-4" 
                  style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}
                >
                  Season {season} Games
                </h2>
                <div className="space-y-2">
                  {gamesBySeason[season as 1 | 2 | 3].length > 0 ? (
                    gamesBySeason[season as 1 | 2 | 3].map((game: any) => (
                      <div 
                        key={game.id} 
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ 
                          background: "hsl(var(--input) / 0.5)", 
                          border: "1px solid hsl(var(--cream-dark) / 0.3)" 
                        }}
                      >
                        <div>
                          <p style={{ color: "hsl(var(--cream))" }}>{game.name}</p>
                          {game.game_date && (
                            <p className="text-xs" style={{ color: "hsl(var(--brown-light))" }}>
                              {new Date(game.game_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => updateGameSeason(game.id, null)}
                          disabled={saving}
                          className="p-2 rounded-lg"
                          style={{ background: "hsl(0 80% 96%)", color: "hsl(var(--destructive))" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "hsl(var(--cream-dark) / 0.5)" }}>No games assigned to this season</p>
                  )}
                </div>

                <div className="mt-6">
                  <label 
                    className="block text-sm font-semibold mb-2" 
                    style={{ color: "hsl(var(--brown))", fontFamily: "Electrolize, sans-serif" }}
                  >
                    Add Game to Season {season}
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        updateGameSeason(e.target.value, season);
                        e.target.value = "";
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ 
                      background: "hsl(var(--input))", 
                      border: "1px solid hsl(var(--cream-dark))", 
                      color: "hsl(var(--brown-deep))" 
                    }}
                  >
                    <option value="">— Select game —</option>
                    {games
                      .filter((g) => g.season !== season)
                      .map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

