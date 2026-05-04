import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { raceDataFetch } from "@/lib/raceDataFetch";
import { adminMutation } from "@/lib/adminMutation";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

const INITIAL_SEASONS = [1, 2, 3];

export default function AdminHallOfFame() {
  const [players, setPlayers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [seasonScores, setSeasonScores] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"podium" | "seasons" | "scores">("podium");
  const [selectedSeasonForScores, setSelectedSeasonForScores] = useState(1);
  const [newSeasonName, setNewSeasonName] = useState("");
  const [editingScores, setEditingScores] = useState<{ [key: string]: number }>({});

  const fetchData = async () => {
    try {
      const [p, g, h, s, ss] = await Promise.all([
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
        raceDataFetch<any[]>(
          () => supabase.from("seasons").select("*").order("number"),
          "admin_seasons",
        ).catch(() => []),
        raceDataFetch<any[]>(
          () => supabase.from("season_player_scores").select("*"),
          "admin_season_scores",
        ).catch(() => []),
      ]);
      setPlayers(p);
      setGames(g);
      setEntries(h);
      setSeasons(s);
      setSeasonScores(ss);
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

  const createSeason = async () => {
    if (!newSeasonName.trim()) {
      toast.error("Season name is required");
      return;
    }
    setSaving(true);
    try {
      const nextNumber = Math.max(...seasons.map((s) => s.number), 0) + 1;
      await adminMutation.insert("seasons", {
        number: nextNumber,
        name: newSeasonName,
      });
      await adminMutation.insert("activity_logs", { 
        action: "CREATE_SEASON", 
        target: `Season ${nextNumber}: ${newSeasonName}` 
      });
      toast.success("Season created!");
      setNewSeasonName("");
      await fetchData();
    } catch (e) {
      console.error("Error creating season:", e);
      toast.error("Failed to create season");
    } finally {
      setSaving(false);
    }
  };

  const deleteSeason = async (seasonId: string, seasonName: string) => {
    if (!confirm(`Delete ${seasonName}? This cannot be undone.`)) return;
    setSaving(true);
    try {
      await adminMutation.delete("seasons", { id: seasonId });
      await adminMutation.insert("activity_logs", { 
        action: "DELETE_SEASON", 
        target: seasonName 
      });
      toast.success("Season deleted!");
      await fetchData();
    } catch {
      toast.error("Failed to delete season");
    } finally {
      setSaving(false);
    }
  };

  const updatePlayerScore = async (playerId: string, points: number) => {
    setSaving(true);
    try {
      const existing = seasonScores.find(
        (s) => s.player_id === playerId && s.season === selectedSeasonForScores
      );

      if (existing) {
        if (points > 0) {
          await adminMutation.update("season_player_scores", { points }, { id: existing.id });
        } else {
          await adminMutation.delete("season_player_scores", { id: existing.id });
        }
      } else if (points > 0) {
        await adminMutation.insert("season_player_scores", {
          season: selectedSeasonForScores,
          player_id: playerId,
          points,
        });
      }

      toast.success("Score updated!");
      await fetchData();
      setEditingScores({});
    } catch (e) {
      console.error("Error updating score:", e);
      toast.error("Failed to update score");
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

  const getSeasonScores = () => {
    const scores = seasonScores.filter((s) => s.season === selectedSeasonForScores);
    const playerScoresMap = new Map<string, number>();

    scores.forEach((score: any) => {
      playerScoresMap.set(score.player_id, score.points);
    });

    return playerScoresMap;
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}>
            Hall of Fame Management
          </h1>
          <p className="text-sm" style={{ color: "hsl(var(--brown-light))" }}>
            Manage seasons, top 3 players, and player scores
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b overflow-x-auto" style={{ borderColor: "hsl(var(--cream-dark))" }}>
          <button
            onClick={() => setActiveTab("podium")}
            className="px-4 py-2 font-semibold transition-colors whitespace-nowrap"
            style={{
              fontFamily: "Electrolize, sans-serif",
              color: activeTab === "podium" ? "hsl(var(--gold))" : "hsl(var(--brown-light))",
              borderBottom: activeTab === "podium" ? "2px solid hsl(var(--gold))" : "none",
            }}
          >
            Top 3 Finishers
          </button>
          <button
            onClick={() => setActiveTab("scores")}
            className="px-4 py-2 font-semibold transition-colors whitespace-nowrap"
            style={{
              fontFamily: "Electrolize, sans-serif",
              color: activeTab === "scores" ? "hsl(var(--gold))" : "hsl(var(--brown-light))",
              borderBottom: activeTab === "scores" ? "2px solid hsl(var(--gold))" : "none",
            }}
          >
            Player Scores
          </button>
          <button
            onClick={() => setActiveTab("seasons")}
            className="px-4 py-2 font-semibold transition-colors whitespace-nowrap"
            style={{
              fontFamily: "Electrolize, sans-serif",
              color: activeTab === "seasons" ? "hsl(var(--gold))" : "hsl(var(--brown-light))",
              borderBottom: activeTab === "seasons" ? "2px solid hsl(var(--gold))" : "none",
            }}
          >
            Manage Seasons
          </button>
        </div>

        {/* Top 3 Finishers Tab */}
        {activeTab === "podium" && (
          <div className="space-y-8">
            {INITIAL_SEASONS.map((season) => (
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

        {/* Player Scores Tab */}
        {activeTab === "scores" && (
          <div className="space-y-6">
            {/* Season selector */}
            <div 
              className="rounded-2xl p-4 md:p-6" 
              style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}
            >
              <label 
                className="block text-sm font-semibold mb-2" 
                style={{ color: "hsl(var(--brown))", fontFamily: "Electrolize, sans-serif" }}
              >
                Select Season
              </label>
              <div className="flex gap-2">
                {INITIAL_SEASONS.map((season) => (
                  <button
                    key={season}
                    onClick={() => setSelectedSeasonForScores(season)}
                    className="px-4 py-2 rounded-lg font-semibold transition-colors"
                    style={{
                      background: selectedSeasonForScores === season 
                        ? "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-light)))" 
                        : "hsl(var(--input))",
                      color: selectedSeasonForScores === season 
                        ? "hsl(var(--brown-deep))" 
                        : "hsl(var(--cream))",
                    }}
                  >
                    Season {season}
                  </button>
                ))}
              </div>
            </div>

            {/* Player scores */}
            <div 
              className="rounded-2xl p-4 md:p-6" 
              style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}
            >
              <h3 
                className="text-lg font-bold mb-4" 
                style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}
              >
                Season {selectedSeasonForScores} Player Scores
              </h3>
              <div className="space-y-3">
                {players.map((player) => {
                  const playerScoresMap = getSeasonScores();
                  const currentScore = playerScoresMap.get(player.player_id) || 0;
                  const key = `${player.id}-score`;

                  return (
                    <div 
                      key={player.id}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ 
                        background: "hsl(var(--input) / 0.5)", 
                        border: "1px solid hsl(var(--cream-dark) / 0.3)" 
                      }}
                    >
                      <div className="flex-1">
                        <p style={{ color: "hsl(var(--cream))" }}>{player.name}</p>
                        <p className="text-xs" style={{ color: "hsl(var(--brown-light))" }}>
                          {player.player_id}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editingScores[key] !== undefined ? editingScores[key] : currentScore}
                          onChange={(e) => {
                            setEditingScores({ ...editingScores, [key]: parseInt(e.target.value) || 0 });
                          }}
                          className="w-20 px-2 py-1.5 rounded-lg text-sm outline-none"
                          style={{ 
                            background: "hsl(var(--input))", 
                            border: "1px solid hsl(var(--cream-dark))", 
                            color: "hsl(var(--brown-deep))" 
                          }}
                        />
                        <button
                          onClick={() => {
                            const newScore = editingScores[key] !== undefined ? editingScores[key] : currentScore;
                            updatePlayerScore(player.player_id, newScore);
                          }}
                          disabled={saving}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{
                            background: "hsl(var(--gold))",
                            color: "hsl(var(--brown-deep))",
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Manage Seasons Tab (part of seasons tab) */}
        {activeTab === "seasons" && (
          <div className="space-y-8">
            {/* Create new season */}
            <div 
              className="rounded-2xl p-4 md:p-6" 
              style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}
            >
              <h3 
                className="text-lg font-bold mb-4" 
                style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}
              >
                Create New Season
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newSeasonName}
                  onChange={(e) => setNewSeasonName(e.target.value)}
                  placeholder="e.g., Summer 2026"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ 
                    background: "hsl(var(--input))", 
                    border: "1px solid hsl(var(--cream-dark))", 
                    color: "hsl(var(--brown-deep))" 
                  }}
                />
                <button
                  onClick={createSeason}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2"
                  style={{
                    background: "hsl(var(--gold))",
                    color: "hsl(var(--brown-deep))",
                  }}
                >
                  <Plus size={16} /> Create
                </button>
              </div>
            </div>

            {/* Existing seasons */}
            <div 
              className="rounded-2xl p-4 md:p-6" 
              style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}
            >
              <h3 
                className="text-lg font-bold mb-4" 
                style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}
              >
                Existing Seasons
              </h3>
              <div className="space-y-2">
                {seasons.length > 0 ? (
                  seasons.map((season: any) => (
                    <div 
                      key={season.id}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ 
                        background: "hsl(var(--input) / 0.5)", 
                        border: "1px solid hsl(var(--cream-dark) / 0.3)" 
                      }}
                    >
                      <div>
                        <p style={{ color: "hsl(var(--cream))" }}>{season.name}</p>
                        <p className="text-xs" style={{ color: "hsl(var(--brown-light))" }}>
                          Season {season.number}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteSeason(season.id, season.name)}
                        disabled={saving}
                        className="p-2 rounded-lg"
                        style={{ background: "hsl(0 80% 96%)", color: "hsl(var(--destructive))" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "hsl(var(--cream-dark) / 0.5)" }}>No custom seasons yet</p>
                )}
              </div>
            </div>

            {/* Season Games Section */}
            <div className="mt-12 pt-8 border-t" style={{ borderColor: "hsl(var(--cream-dark))" }}>
              <h3 
                className="text-lg font-bold mb-6" 
                style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}
              >
                Assign Games to Seasons
              </h3>
              <div className="space-y-6">
                {INITIAL_SEASONS.map((season) => (
                  <div 
                    key={season} 
                    className="rounded-2xl p-4 md:p-6" 
                    style={{ background: "hsl(var(--input) / 0.3)", border: "1px solid hsl(var(--cream-dark))" }}
                  >
                    <h4 
                      className="font-bold mb-4" 
                      style={{ color: "hsl(var(--brown))", fontFamily: "Electrolize, sans-serif" }}
                    >
                      Season {season} Games
                    </h4>
                    <div className="space-y-2 mb-4">
                      {gamesBySeason[season as 1 | 2 | 3].length > 0 ? (
                        gamesBySeason[season as 1 | 2 | 3].map((game: any) => (
                          <div 
                            key={game.id} 
                            className="flex items-center justify-between p-2 rounded-lg"
                            style={{ 
                              background: "hsl(var(--input) / 0.5)", 
                              border: "1px solid hsl(var(--cream-dark) / 0.2)" 
                            }}
                          >
                            <div>
                              <p style={{ color: "hsl(var(--cream))" }}>{game.name}</p>
                            </div>
                            <button
                              onClick={() => updateGameSeason(game.id, null)}
                              disabled={saving}
                              className="p-2 rounded-lg"
                              style={{ background: "hsl(0 80% 96%)", color: "hsl(var(--destructive))" }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: "hsl(var(--cream-dark) / 0.5)" }} className="text-sm">No games assigned</p>
                      )}
                    </div>

                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          updateGameSeason(e.target.value, season);
                          e.target.value = "";
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ 
                        background: "hsl(var(--input))", 
                        border: "1px solid hsl(var(--cream-dark))", 
                        color: "hsl(var(--brown-deep))" 
                      }}
                    >
                      <option value="">+ Add game to season</option>
                      {games
                        .filter((g) => g.season !== season)
                        .map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

