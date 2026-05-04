import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { raceDataFetch } from "@/lib/raceDataFetch";
import { adminMutation } from "@/lib/adminMutation";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import { Trash2, AlertTriangle, PlayCircle, Gamepad2, Calendar, Pencil, X, Check } from "lucide-react";

export default function AdminHallOfFame() {
  const [players, setPlayers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"rankings" | "games" | "seasons">("rankings");
  const [showEndSeasonModal, setShowEndSeasonModal] = useState(false);
  const [showDeleteSeasonModal, setShowDeleteSeasonModal] = useState<{ id: string; name: string } | null>(null);
  const [editingSeason, setEditingSeason] = useState<number | null>(null);

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

      const sortedPlayers = (p || []).sort((a, b) =>
        String(a.player_id).localeCompare(String(b.player_id), undefined, { numeric: true })
      );
      setPlayers(sortedPlayers);
      setGames(g || []);
      setEntries(h || []);
      setSeasons(s || []);
    } catch {
      toast.error("Failed to load data");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const availableSeasons = useMemo(() => {
    if (seasons.length === 0) return [1];
    return seasons.map((s) => s.number).sort((a, b) => a - b);
  }, [seasons]);

  const currentSeasonNumber = useMemo(() => Math.max(...availableSeasons), [availableSeasons]);

  const pastSeasons = useMemo(
    () => availableSeasons.filter((s) => s < currentSeasonNumber).sort((a, b) => a - b),
    [availableSeasons, currentSeasonNumber],
  );

  // Rankings logic
  const getPlayerRank = (playerId: string, season: number) => {
    const entry = entries.find((e) => e.player_id === playerId && e.season === season);
    return entry ? entry.rank : null;
  };

  const isRankTaken = (rank: number, season: number, excludePlayerId?: string) =>
    entries.some((e) => e.season === season && e.rank === rank && e.player_id !== excludePlayerId);

  const updatePlayerRank = async (playerId: string, season: number, rankStr: string) => {
    setSaving(true);
    const newRank = rankStr === "unranked" ? null : parseInt(rankStr);
    try {
      const existingEntry = entries.find((e) => e.player_id === playerId && e.season === season);
      if (newRank === null) {
        if (existingEntry) {
          const removedRank = existingEntry.rank;
          await adminMutation.delete("hall_of_fame", { id: existingEntry.id });
          const toShift = entries
            .filter((e) => e.season === season && e.rank > removedRank)
            .sort((a, b) => a.rank - b.rank);
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
      await adminMutation.insert("activity_logs", {
        action: "UPDATE_HALL_OF_FAME",
        target: `Season ${season} Player ${playerId} Rank ${newRank || "Unranked"}`,
      });
      await fetchData();
    } catch {
      toast.error("Failed to update rank");
    } finally {
      setSaving(false);
    }
  };

  const updateGameSeason = async (gameId: string, season: number | null) => {
    setSaving(true);
    setGames((prev) => prev.map((g) => (g.id === gameId ? { ...g, season } : g)));
    try {
      await adminMutation.update("games", { season }, { id: gameId });
      toast.success(season ? `Game added to Season ${season}` : "Game removed from season");
      await fetchData();
    } catch {
      toast.error("Failed to update game season");
      await fetchData();
    } finally {
      setSaving(false);
    }
  };

  const endSeasonAndStartNew = async () => {
    setShowEndSeasonModal(false);
    setSaving(true);
    try {
      const now = new Date().toISOString();

      // Mark current season as ended
      const currentSeason = seasons.find((s) => s.number === currentSeasonNumber);
      if (currentSeason) {
        await adminMutation.update("seasons", { ended_at: now }, { id: currentSeason.id });
      }

      const nextNumber = currentSeasonNumber + 1;
      const newSeasonName = `Season ${nextNumber.toString().padStart(2, "0")}`;
      await adminMutation.insert("seasons", { number: nextNumber, name: newSeasonName });
      await adminMutation.insert("activity_logs", { action: "CREATE_SEASON", target: newSeasonName });

      // Optimistically update local state so tabs refresh immediately
      setSeasons((prev) => {
        const updated = prev.map((s) =>
          s.number === currentSeasonNumber ? { ...s, ended_at: now } : s
        );
        updated.push({
          id: crypto.randomUUID(),
          number: nextNumber,
          name: newSeasonName,
          created_at: now,
          ended_at: null,
        });
        return updated;
      });

      toast.success(`${newSeasonName} has begun!`);

      // Background re-fetch to sync with DB (non-blocking)
      fetchData();
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
      await adminMutation.insert("activity_logs", { action: "DELETE_SEASON", target: seasonName });
      toast.success("Season deleted!");
      await fetchData();
    } catch (e) {
      console.error("Error deleting season:", e);
      toast.error("Failed to delete season");
    } finally {
      setSaving(false);
    }
  };

  // ── Reusable: player ranking list for a season ──
  const renderRankingsForSeason = (seasonNum: number) => (
    <div className="space-y-2.5">
      {players.map((player) => {
        const currentRank = getPlayerRank(player.id, seasonNum);
        return (
          <div
            key={player.id}
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ background: "hsl(var(--input) / 0.8)", border: "1px solid hsl(var(--cream-dark) / 0.4)" }}
          >
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: "hsl(var(--brown-deep))" }}>{player.name}</p>
              <p className="text-xs mt-0.5" style={{ color: "hsl(var(--brown-light))" }}>ID: {player.player_id}</p>
            </div>
            <select
              value={currentRank === null ? "unranked" : currentRank.toString()}
              onChange={(e) => updatePlayerRank(player.id, seasonNum, e.target.value)}
              disabled={saving}
              className="w-32 px-2 py-1.5 rounded-lg text-sm outline-none font-bold cursor-pointer"
              style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }}
            >
              <option value="unranked">Unranked</option>
              {players.map((_, i) => {
                const rankVal = i + 1;
                if (isRankTaken(rankVal, seasonNum, player.id)) return null;
                return <option key={rankVal} value={rankVal}>Rank {rankVal}</option>;
              })}
            </select>
          </div>
        );
      })}
    </div>
  );

  // ── Reusable: games list for a season ──
  const renderGamesForSeason = (seasonNum: number) => {
    const seasonGames = games.filter((g) => g.season === seasonNum);
    return (
      <div>
        <div className="space-y-2 mb-4">
          {seasonGames.length > 0 ? (
            seasonGames.map((game: any) => (
              <div
                key={game.id}
                className="flex items-center justify-between p-2.5 rounded-lg text-sm"
                style={{ background: "hsl(var(--input) / 0.8)", border: "1px solid hsl(var(--cream-dark) / 0.4)" }}
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
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm italic" style={{ color: "hsl(var(--brown-light))" }}>No games assigned to this season.</p>
          )}
        </div>
        <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: "hsl(var(--cream-dark))" }}>
          <select
            id={`add-game-season-${seasonNum}`}
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }}
            defaultValue=""
          >
            <option value="" disabled>Add a game to this season…</option>
            {games.filter((g) => g.season !== seasonNum).map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <button
            onClick={() => {
              const sel = document.getElementById(`add-game-season-${seasonNum}`) as HTMLSelectElement;
              if (sel && sel.value) { updateGameSeason(sel.value, seasonNum); sel.value = ""; }
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

  // ── Tab button helper ──
  const tabBtn = (key: typeof activeTab, label: string) => (
    <button
      onClick={() => setActiveTab(key)}
      className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 ${
        activeTab === key ? "shadow-sm" : "hover:bg-black/5"
      }`}
      style={{
        background: activeTab === key ? "hsl(var(--gold))" : "transparent",
        color: activeTab === key ? "hsl(var(--brown-deep))" : "hsl(var(--brown))",
        border: activeTab === key ? "1px solid transparent" : "1px solid hsl(var(--brown-light))",
      }}
    >
      {label}
    </button>
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 space-y-8">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}>
            Hall of Fame & Seasons
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--brown-light))" }}>Manage player rankings, season games, and season lifecycles</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {tabBtn("rankings", "Player Rankings")}
          {tabBtn("games", "Season Games")}
          {tabBtn("seasons", "Manage Seasons")}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            TAB 1: Player Rankings — all seasons listed vertically
           ═══════════════════════════════════════════════════════════ */}
        {activeTab === "rankings" && (
          <div className="space-y-8">
            {availableSeasons.map((seasonNum) => (
              <div
                key={seasonNum}
                className="rounded-2xl p-4 md:p-6"
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}
              >
                <h3
                  className="text-lg font-bold mb-4 flex justify-between items-center"
                  style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}
                >
                  <span className="flex items-center gap-2">
                    Season {seasonNum}
                    {seasonNum === currentSeasonNumber && (
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    )}
                  </span>
                  <span className="text-sm font-normal" style={{ color: "hsl(var(--brown))" }}>
                    {entries.filter((e) => e.season === seasonNum && e.rank != null).length} ranked
                  </span>
                </h3>
                {renderRankingsForSeason(seasonNum)}
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB 2: Season Games — all seasons listed vertically
           ═══════════════════════════════════════════════════════════ */}
        {activeTab === "games" && (
          <div className="space-y-8">
            {availableSeasons.map((seasonNum) => (
              <div
                key={seasonNum}
                className="rounded-2xl p-4 md:p-6"
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}
              >
                <h3
                  className="text-lg font-bold mb-4 flex justify-between items-center"
                  style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}
                >
                  <span className="flex items-center gap-2">
                    <Gamepad2 size={18} /> Season {seasonNum}
                    {seasonNum === currentSeasonNumber && (
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    )}
                  </span>
                  <span className="text-sm font-normal" style={{ color: "hsl(var(--brown))" }}>
                    {games.filter((g) => g.season === seasonNum).length} games
                  </span>
                </h3>
                {renderGamesForSeason(seasonNum)}
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB 3: Manage Seasons — end/create + past seasons timeline
           ═══════════════════════════════════════════════════════════ */}
        {activeTab === "seasons" && (
          <div className="space-y-8">
            {/* Current season card */}
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
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse ml-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  </h3>
                  <p className="text-sm font-medium" style={{ color: "hsl(var(--brown-light))" }}>
                    End the current season to archive it and begin Season {currentSeasonNumber + 1}.
                  </p>
                </div>
                <button
                  onClick={() => setShowEndSeasonModal(true)}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 shrink-0"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-light)))",
                    color: "hsl(var(--brown-deep))",
                    boxShadow: "0 4px 15px hsla(var(--gold) / 0.4)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <PlayCircle size={18} /> End Season & Start New
                </button>
              </div>
            </div>

            {/* Past seasons timeline */}
            {pastSeasons.length > 0 && (
              <div>
                <h3
                  className="text-xl font-bold mb-6"
                  style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}
                >
                  Previous Seasons
                </h3>
                <div className="space-y-4">
                  {[...pastSeasons].reverse().map((seasonNum) => {
                    const seasonObj = seasons.find((s) => s.number === seasonNum);
                    const createdAt = seasonObj?.created_at ? new Date(seasonObj.created_at) : null;
                    const endedAt = seasonObj?.ended_at ? new Date(seasonObj.ended_at) : null;

                    return (
                      <div
                        key={seasonNum}
                        className="rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--cream-dark))" }}
                          >
                            <Calendar size={16} style={{ color: "hsl(var(--brown))" }} />
                          </div>
                          <div>
                            <p className="font-bold text-base" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}>
                              {seasonObj?.name || `Season ${seasonNum}`}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                              {createdAt && (
                                <span className="text-xs" style={{ color: "hsl(var(--brown-light))" }}>
                                  Started: {createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              )}
                              {endedAt && (
                                <span className="text-xs" style={{ color: "hsl(var(--brown-light))" }}>
                                  Ended: {endedAt.toLocaleDateString()} {endedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              )}
                              <span className="text-xs font-medium" style={{ color: "hsl(var(--brown))" }}>
                                {entries.filter((e) => e.season === seasonNum).length} rankings · {games.filter((g) => g.season === seasonNum).length} games
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setEditingSeason(seasonNum)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors hover:bg-amber-50"
                            style={{ background: "hsl(var(--input))", color: "hsl(var(--brown))", border: "1px solid hsl(var(--cream-dark))" }}
                          >
                            <Pencil size={13} /> Edit
                          </button>
                          <button
                            onClick={() => {
                              if (seasonObj) setShowDeleteSeasonModal({ id: seasonObj.id, name: seasonObj.name });
                            }}
                            disabled={saving}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors hover:bg-red-100"
                            style={{ background: "hsl(0 80% 96%)", color: "hsl(var(--destructive))" }}
                          >
                            <AlertTriangle size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
            <p className="text-sm mb-6" style={{ color: "hsl(var(--brown-light))" }}>
              Are you sure you want to archive Season {currentSeasonNumber} and begin Season {currentSeasonNumber + 1}?
            </p>
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
            <p className="text-sm mb-6" style={{ color: "hsl(var(--brown-light))" }}>
              CRITICAL WARNING: This will permanently delete <strong>{showDeleteSeasonModal.name}</strong>. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteSeasonModal(null)} className="flex-1 py-2.5 rounded-xl text-sm" style={{ background: "hsl(var(--input))", color: "hsl(var(--brown))", border: "1px solid hsl(var(--cream-dark))" }}>Cancel</button>
              <button onClick={() => deleteSeason(showDeleteSeasonModal.id, showDeleteSeasonModal.name)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "hsl(var(--destructive))", color: "white" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Season Modal */}
      {editingSeason !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "hsla(var(--brown-deep) / 0.55)", backdropFilter: "blur(10px)" }}>
          <div
            className="w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))", maxHeight: "90dvh" }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "hsl(var(--cream-dark))" }}>
              <h2 className="text-lg font-bold" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}>
                Edit Season {editingSeason}
              </h2>
              <button onClick={() => setEditingSeason(null)} style={{ color: "hsl(var(--brown-light))" }}>
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
              {/* Player Rankings */}
              <div>
                <h3 className="text-base font-bold mb-4" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}>Player Rankings</h3>
                {renderRankingsForSeason(editingSeason)}
              </div>

              {/* Season Games */}
              <div>
                <h3 className="text-base font-bold mb-4" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}>Season Games</h3>
                {renderGamesForSeason(editingSeason)}
              </div>
            </div>

            <div className="px-6 py-4 border-t shrink-0 flex justify-end" style={{ borderColor: "hsl(var(--cream-dark))" }}>
              <button
                onClick={() => setEditingSeason(null)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, hsl(var(--brown)), hsl(var(--brown-light)))", color: "hsl(var(--cream))" }}
              >
                <Check size={16} /> Done
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
