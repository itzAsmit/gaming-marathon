import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { raceDataFetch } from "@/lib/raceDataFetch";
import { adminMutation } from "@/lib/adminMutation";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import { Trash2, AlertTriangle, PlayCircle } from "lucide-react";

export default function AdminHallOfFame() {
  const [players, setPlayers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]); // hall_of_fame table
  const [seasons, setSeasons] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"rankings" | "seasons">("rankings");
  const [selectedSeasonForScores, setSelectedSeasonForScores] = useState(1);
  const [showEndSeasonModal, setShowEndSeasonModal] = useState(false);
  const [showDeleteSeasonModal, setShowDeleteSeasonModal] = useState<{ id: string, name: string } | null>(null);

  const fetchData = async () => {
    try {
      const [p, g, h, s] = await Promise.all([
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
      ]);
      
      // Sort players by player_id ascending
      const sortedPlayers = (p || []).sort((a, b) => {
        // e.g. player_id: "001", "002"
        return String(a.player_id).localeCompare(String(b.player_id), undefined, { numeric: true });
      });
      setPlayers(sortedPlayers);
      setGames(g || []);
      setEntries(h || []);
      
      const seasonsData = s || [];
      setSeasons(seasonsData);

      if (seasonsData.length > 0) {
        const latest = Math.max(...seasonsData.map(s => s.number));
        // Only set it once on load if not already set or if it's the first time
        setSelectedSeasonForScores(prev => prev === 1 && latest !== 1 ? latest : prev);
      }
    } catch {
      toast.error("Failed to load data");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const availableSeasons = useMemo(() => {
    if (seasons.length === 0) return [1];
    return seasons.map(s => s.number).sort((a, b) => a - b);
  }, [seasons]);

  const currentSeasonNumber = useMemo(() => {
    return Math.max(...availableSeasons);
  }, [availableSeasons]);

  const pastSeasons = useMemo(() => {
    return availableSeasons.filter(s => s < currentSeasonNumber).sort((a, b) => b - a);
  }, [availableSeasons, currentSeasonNumber]);

  // Rankings logic
  const getPlayerRank = (playerId: string, season: number) => {
    const entry = entries.find(e => e.player_id === playerId && e.season === season);
    return entry ? entry.rank : null;
  };

  const isRankTaken = (rank: number, season: number, excludePlayerId?: string) => {
    return entries.some(e => e.season === season && e.rank === rank && e.player_id !== excludePlayerId);
  };

  const updatePlayerRank = async (playerId: string, season: number, rankStr: string) => {
    setSaving(true);
    const newRank = rankStr === "unranked" ? null : parseInt(rankStr);

    try {
      const existingEntry = entries.find(e => e.player_id === playerId && e.season === season);
      
      if (newRank === null) {
        if (existingEntry) {
          const removedRank = existingEntry.rank;
          await adminMutation.delete("hall_of_fame", { id: existingEntry.id });
          
          // Shift up remaining ranks
          const toShift = entries
            .filter(e => e.season === season && e.rank > removedRank)
            .sort((a, b) => a.rank - b.rank); // Sort ascending to avoid unique constraint issues if any
            
          for (const entry of toShift) {
            await adminMutation.update("hall_of_fame", { rank: entry.rank - 1 }, { id: entry.id });
          }
          
          toast.success("Player unranked and ranks adjusted");
        }
      } else {
        if (existingEntry) {
          await adminMutation.update("hall_of_fame", { rank: newRank }, { id: existingEntry.id });
          toast.success(`Rank updated to ${newRank}`);
        } else {
          await adminMutation.insert("hall_of_fame", { season, rank: newRank, player_id: playerId });
          toast.success(`Assigned Rank ${newRank}`);
        }
      }
      await adminMutation.insert("activity_logs", { action: "UPDATE_HALL_OF_FAME", target: `Season ${season} Player ${playerId} Rank ${newRank || "Unranked"}` });
      await fetchData();
    } catch {
      toast.error("Failed to update rank");
    } finally {
      setSaving(false);
    }
  };

  const updateGameSeason = async (gameId: string, season: number | null) => {
    setSaving(true);
    // Optimistic UI update
    setGames(prev => prev.map(g => g.id === gameId ? { ...g, season } : g));
    
    try {
      await adminMutation.update("games", { season }, { id: gameId });
      toast.success(season ? `Game added to Season ${season}` : "Game removed from season");
      await fetchData();
    } catch {
      toast.error("Failed to update game season");
      await fetchData(); // Revert on failure
    } finally {
      setSaving(false);
    }
  };

  const endSeasonAndStartNew = async () => {
    setShowEndSeasonModal(false);
    
    setSaving(true);
    try {
      const nextNumber = currentSeasonNumber + 1;
      const newSeasonName = `Season ${nextNumber.toString().padStart(2, '0')}`;
      await adminMutation.insert("seasons", {
        number: nextNumber,
        name: newSeasonName,
      });
      await adminMutation.insert("activity_logs", { 
        action: "CREATE_SEASON", 
        target: newSeasonName 
      });
      toast.success(`${newSeasonName} has begun!`);
      await fetchData();
    } catch (e) {
      console.error("Error creating season:", e);
      toast.error("Failed to start new season");
    } finally {
      setSaving(false);
    }
  };

  const deleteSeason = async (seasonId: string, seasonName: string) => {
    setShowDeleteSeasonModal(null);
    setSaving(true);
    try {
      await adminMutation.delete("seasons", { id: seasonId });
      await adminMutation.insert("activity_logs", { 
        action: "DELETE_SEASON", 
        target: seasonName 
      });
      toast.success("Season deleted!");
      await fetchData();
    } catch (e) {
      console.error("Error deleting season:", e);
      toast.error("Failed to delete season");
    } finally {
      setSaving(false);
    }
  };

  const renderSeasonGamesSection = (seasonNum: number, label: string) => {
    const seasonGames = games.filter(g => g.season === seasonNum);
    
    return (
      <div className="bg-white/50 rounded-xl p-4 border border-[hsl(var(--cream-dark))]">
        <h4 className="text-sm font-bold mb-3 flex items-center justify-between" style={{ color: "hsl(var(--brown-deep))" }}>
          <span>{label} Season Games ({seasonGames.length})</span>
        </h4>
        
        <div className="space-y-2 mb-4">
          {seasonGames.length > 0 ? (
            seasonGames.map((game: any) => (
              <div 
                key={game.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white/80 text-sm border border-[hsl(var(--cream-dark))]"
              >
                <div>
                  <span className="font-semibold" style={{ color: "hsl(var(--brown-deep))" }}>{game.name}</span>
                  {game.game_date && (
                    <span className="text-xs ml-2" style={{ color: "hsl(var(--brown-light))" }}>
                      {new Date(game.game_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => updateGameSeason(game.id, null)}
                  disabled={saving}
                  className="p-2 rounded-lg"
                  style={{ background: "hsl(0 80% 96%)", color: "hsl(var(--destructive))" }}
                  title="Remove from Season"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm italic" style={{ color: "hsl(var(--brown-light))" }}>No games assigned to this season.</p>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[hsl(var(--cream-dark))]">
          <select 
            id={`add-game-season-${seasonNum}`}
            className="flex-1 px-3 py-2 rounded-lg text-sm bg-white border border-[hsl(var(--cream-dark))]"
            style={{ color: "hsl(var(--brown-deep))", outlineColor: "hsl(var(--gold))" }}
            defaultValue=""
          >
            <option value="" disabled>Add a game to this season...</option>
            {games.filter(g => g.season !== seasonNum).map(g => (
              <option key={g.id} value={g.id}>{g.name} {g.season ? `(Currently S${g.season})` : ''}</option>
            ))}
          </select>
          <button
            onClick={() => {
              const sel = document.getElementById(`add-game-season-${seasonNum}`) as HTMLSelectElement;
              if (sel && sel.value) {
                updateGameSeason(sel.value, seasonNum);
                sel.value = "";
              }
            }}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-xs font-bold transition-transform hover:scale-105 active:scale-95"
            style={{ background: "hsl(var(--gold))", color: "hsl(var(--brown-deep))" }}
          >
            Add Game
          </button>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 space-y-8">
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl  font-bold" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}>Hall of Fame & Seasons</h1>
              <p className="text-sm mt-1" style={{ color: "hsl(var(--brown-light))" }}>Manage player rankings and season lifecycles</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("rankings")}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 ${activeTab === "rankings" ? "shadow-sm" : "hover:bg-black/5"}`}
            style={{
              background: activeTab === "rankings" ? "hsl(var(--gold))" : "transparent",
              color: activeTab === "rankings" ? "hsl(var(--brown-deep))" : "hsl(var(--brown))",
              border: activeTab === "rankings" ? "1px solid transparent" : "1px solid hsl(var(--brown-light))",
            }}
          >
            Player Rankings
          </button>
          <button
            onClick={() => setActiveTab("seasons")}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 ${activeTab === "seasons" ? "shadow-sm" : "hover:bg-black/5"}`}
            style={{
              background: activeTab === "seasons" ? "hsl(var(--gold))" : "transparent",
              color: activeTab === "seasons" ? "hsl(var(--brown-deep))" : "hsl(var(--brown))",
              border: activeTab === "seasons" ? "1px solid transparent" : "1px solid hsl(var(--brown-light))",
            }}
          >
            Manage Seasons
          </button>
        </div>

        {/* Player Rankings Tab */}
        {activeTab === "rankings" && (
          <div className="space-y-6">
            {/* Season selector */}
            <div 
              className="rounded-2xl p-4 md:p-6" 
              style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}
            >
              <label 
                className="block text-sm font-semibold mb-3" 
                style={{ color: "hsl(var(--brown))", fontFamily: "Electrolize, sans-serif" }}
              >
                Select Season
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSeasons.map((season) => (
                  <button
                    key={season}
                    onClick={() => setSelectedSeasonForScores(season)}
                    className="px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    style={{
                      background: selectedSeasonForScores === season 
                        ? "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-light)))" 
                        : "hsl(var(--input))",
                      color: selectedSeasonForScores === season 
                        ? "hsl(var(--brown-deep))" 
                        : "hsl(var(--brown))",
                      border: selectedSeasonForScores !== season ? "1px solid hsl(var(--cream-dark))" : "none"
                    }}
                  >
                    Season {season}
                    {season === currentSeasonNumber && (
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Player Rankings List */}
            <div 
              className="rounded-2xl p-4 md:p-6" 
              style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}
            >
              <h3 
                className="text-lg font-bold mb-4 flex justify-between items-center" 
                style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}
              >
                <span>Season {selectedSeasonForScores} Player Rankings</span>
                <span className="text-sm font-normal" style={{ color: "hsl(var(--brown))" }}>{players.length} Players</span>
              </h3>
              <div className="space-y-3">
                {players.map((player) => {
                  const currentRank = getPlayerRank(player.id, selectedSeasonForScores);

                  return (
                    <div 
                      key={player.id}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ 
                        background: "hsl(var(--input) / 0.8)", 
                        border: "1px solid hsl(var(--cream-dark) / 0.4)" 
                      }}
                    >
                      <div className="flex-1">
                        <p style={{ color: "hsl(var(--brown-deep))", fontWeight: "600" }}>{player.name}</p>
                        <p className="text-xs font-medium mt-0.5" style={{ color: "hsl(var(--brown-light))" }}>
                          ID: {player.player_id}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={currentRank === null ? "unranked" : currentRank.toString()}
                          onChange={(e) => updatePlayerRank(player.id, selectedSeasonForScores, e.target.value)}
                          disabled={saving}
                          className="w-32 px-2 py-1.5 rounded-lg text-sm outline-none font-bold cursor-pointer"
                          style={{ 
                            background: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--cream-dark))", 
                            color: "hsl(var(--brown-deep))" 
                          }}
                        >
                          <option value="unranked">Unranked</option>
                          {players.map((_, i) => {
                            const rankVal = i + 1;
                            const taken = isRankTaken(rankVal, selectedSeasonForScores, player.id);
                            if (taken) return null; // hide if taken
                            return (
                              <option key={rankVal} value={rankVal}>Rank {rankVal}</option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Manage Seasons Tab */}
        {activeTab === "seasons" && (
          <div className="space-y-8">
            {/* End current season */}
            <div 
              className="rounded-2xl p-6 relative overflow-hidden" 
              style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 
                    className="text-xl font-bold mb-2 flex items-center gap-2" 
                    style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}
                  >
                    Current: Season {currentSeasonNumber}
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse ml-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                  </h3>
                  <p className="text-sm font-medium" style={{ color: "hsl(var(--brown-light))" }}>
                    When you are ready, end the current season to archive its data and begin Season {currentSeasonNumber + 1}.
                  </p>
                </div>
                <button
                  onClick={() => setShowEndSeasonModal(true)}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-light)))",
                    color: "hsl(var(--brown-deep))",
                    boxShadow: "0 4px 15px hsla(var(--gold) / 0.4)",
                    whiteSpace: "nowrap"
                  }}
                >
                  <PlayCircle size={18} /> End Season & Start New
                </button>
              </div>
            </div>

            {/* Current Season Games Section */}
            {renderSeasonGamesSection(currentSeasonNumber, "Current")}

            {/* Existing/Past seasons */}
            {pastSeasons.length > 0 && (
              <div className="mt-12 pt-8 border-t" style={{ borderColor: "hsl(var(--cream-dark))" }}>
                <h3 
                  className="text-xl font-bold mb-6 flex items-center gap-2" 
                  style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}
                >
                  Past Seasons Archive
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pastSeasons.map((seasonNum) => (
                    <div 
                      key={seasonNum} 
                      className="rounded-2xl p-5"
                      style={{ 
                        background: "hsl(var(--input) / 0.3)", 
                        border: "1px dashed hsl(var(--cream-dark))" 
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 
                          className="font-bold text-lg" 
                          style={{ color: "hsl(var(--brown))", fontFamily: "Electrolize, sans-serif" }}
                        >
                          Season {seasonNum}
                        </h4>
                        <button
                          onClick={() => {
                            const target = seasons.find(s => s.number === seasonNum);
                            if (target) setShowDeleteSeasonModal({ id: target.id, name: target.name });
                          }}
                          disabled={saving}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors hover:bg-red-100"
                          style={{ background: "hsl(0 80% 96%)", color: "hsl(var(--destructive))" }}
                          title="Delete Season"
                        >
                          <AlertTriangle size={14} /> Delete
                        </button>
                      </div>
                      
                      {/* Games for this past season */}
                      {renderSeasonGamesSection(seasonNum, "Past")}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* End Season Modal */}
      {showEndSeasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "hsla(var(--brown-deep) / 0.5)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-8 max-w-sm w-full text-center" style={{ background: "hsl(var(--card))" }}>
            <PlayCircle size={32} className="mx-auto mb-4" style={{ color: "hsl(var(--gold))" }} />
            <h3 className="font-bold text-lg mb-2" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}>End Current Season?</h3>
            <p className="text-sm mb-6" style={{ color: "hsl(var(--brown-light))" }}>Are you sure you want to archive Season {currentSeasonNumber} and begin Season {currentSeasonNumber + 1}?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowEndSeasonModal(false)} className="flex-1 py-2.5 rounded-xl text-sm" style={{ background: "hsl(var(--input))", color: "hsl(var(--brown))", border: "1px solid hsl(var(--cream-dark))" }}>Cancel</button>
              <button onClick={endSeasonAndStartNew} className="flex-1 py-2.5 rounded-xl text-sm font-bold" style={{ background: "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-light)))", color: "hsl(var(--brown-deep))" }}>End & Start</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Season Modal */}
      {showDeleteSeasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "hsla(var(--brown-deep) / 0.5)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-8 max-w-sm w-full text-center" style={{ background: "hsl(var(--card))" }}>
            <AlertTriangle size={32} className="mx-auto mb-4" style={{ color: "hsl(var(--destructive))" }} />
            <h3 className="font-bold text-lg mb-2" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}>Delete Season?</h3>
            <p className="text-sm mb-6" style={{ color: "hsl(var(--brown-light))" }}>CRITICAL WARNING: This will permanently delete <strong>{showDeleteSeasonModal.name}</strong>. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteSeasonModal(null)} className="flex-1 py-2.5 rounded-xl text-sm" style={{ background: "hsl(var(--input))", color: "hsl(var(--brown))", border: "1px solid hsl(var(--cream-dark))" }}>Cancel</button>
              <button onClick={() => deleteSeason(showDeleteSeasonModal.id, showDeleteSeasonModal.name)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "hsl(var(--destructive))", color: "white" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
