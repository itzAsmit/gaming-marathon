import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { raceDataFetch } from "@/lib/raceDataFetch";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import SeasonStatsView from "@/components/sections/SeasonStatsView";

interface HofEntry {
  id: string;
  season: number;
  rank: number;
  player_id: string | null;
  players: { name: string; player_id: string; portrait_url: string | null } | null;
}

export default function HallOfFameSection() {
  const [entries, setEntries] = useState<HofEntry[]>([]);
  const [seasonsList, setSeasonsList] = useState<any[]>([]);
  const [activeSeason, setActiveSeason] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seasonStats, setSeasonStats] = useState<any>(null);

  const fetchHallOfFame = async () => {
    try {
      setError(null);
      const data = await raceDataFetch<HofEntry[]>(
        () => supabase.from("hall_of_fame").select("*, players(name, player_id, portrait_url)"),
        "hall_of_fame",
      );
      setEntries(data);

      const sData = await raceDataFetch<any[]>(
        () => supabase.from("seasons").select("*").order("number"),
        "admin_seasons",
      ).catch(() => []);
      
      if (sData && sData.length > 0) {
        setSeasonsList(sData);
        const latest = Math.max(...sData.map(s => s.number));
        setActiveSeason(latest);
      } else {
        setSeasonsList([{ id: 'default', number: 1, name: 'Season 1' }]);
        setActiveSeason(1);
      }
    } catch {
      setError("Connection issue. Please tap retry.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasonStats = async (season: number) => {
    try {
      // Fetch top 3 from hall_of_fame
      const { data: hofData } = await supabase
        .from("hall_of_fame")
        .select("rank, players(name, player_id, portrait_url)")
        .eq("season", season)
        .order("rank");

      // Fetch all players who participated + their scores
      const { data: playerData } = await supabase
        .from("player_game_stats")
        .select("player_id, players(name, player_id), points")
        .neq("points", null);

      // Fetch games for this season (with proper typing)
      // @ts-ignore - season column will be added via migration
      const { data: gameData }: { data: Array<{ name: string; game_date: string | null }> | null } = await supabase
        .from("games")
        .select("name, game_date")
        .eq("season", season);

      // Aggregate player stats by season/player
      const playerStatsMap = new Map();
      playerData?.forEach((stat: any) => {
        const key = stat.players?.player_id;
        if (key) {
          if (!playerStatsMap.has(key)) {
            playerStatsMap.set(key, {
              name: stat.players?.name,
              points: 0,
              games: 0,
              wins: 0,
            });
          }
          const current = playerStatsMap.get(key);
          current.points += stat.points || 0;
          current.games += 1;
        }
      });

      const allPlayers = Array.from(playerStatsMap.entries())
        .map(([code, stats]) => ({
          name: stats.name,
          player_id: code,
          points: stats.points,
          wins: stats.wins,
          gamesPlayed: stats.games,
        }))
        .sort((a, b) => b.points - a.points);

      const topPlayers = (hofData || [])
        .map((entry: any) => ({
          rank: entry.rank,
          player: {
            name: entry.players?.name || "—",
            player_id: entry.players?.player_id || "—",
            portrait_url: entry.players?.portrait_url,
          },
          points: 0, // Would need to fetch from leaderboard if needed
        }));

      setSeasonStats({
        season,
        topPlayers,
        allPlayers,
        games: gameData || [],
      });
    } catch (e) {
      console.error("Error fetching season stats:", e);
    }
  };

  useEffect(() => {
    fetchHallOfFame();
  }, []);

  useEffect(() => {
    fetchSeasonStats(activeSeason);
  }, [activeSeason]);

  return (
    <section id="hall-of-fame" className="relative min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <SectionHeader 
            title="HALL OF FAME" 
            accent="LEGACY" 
            subtitle="The champions who stood atop the Gaming Marathon podium" 
          />
        </ScrollReveal>

        {/* Season tabs with curved button style */}
        <ScrollReveal delay={0.2}>
          <div className="flex justify-center gap-4 mb-16 flex-wrap">
            {seasonsList.map((s) => (
              <button
                key={s.id || s.number}
                onClick={() => setActiveSeason(s.number)}
                className="px-6 py-2.5 rounded-full text-sm font-semibold tracking-widest transition-all duration-300 uppercase"
                style={{
                  fontFamily: "Electrolize, sans-serif",
                  background: activeSeason === s.number 
                    ? "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-light)))" 
                    : "hsla(var(--brown-light) / 0.1)",
                  color: activeSeason === s.number 
                    ? "hsl(var(--brown-deep))" 
                    : "hsl(var(--brown))",
                  border: `2px solid ${
                    activeSeason === s.number 
                      ? "transparent" 
                      : "hsla(var(--brown-light) / 0.3)"
                  }`,
                  boxShadow: activeSeason === s.number 
                    ? "0 0 20px hsla(var(--gold) / 0.4)" 
                    : "none",
                }}
              >
                {s.name || `Season ${s.number}`}
              </button>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          {loading ? (
            <div 
              className="text-center py-20 text-sm tracking-widest"
              style={{ 
                color: "hsl(var(--brown-light))", 
                fontFamily: "Electrolize, sans-serif" 
              }}
            >
              LOADING HALL OF FAME...
            </div>
          ) : error ? (
            <div 
              className="text-center py-20"
              style={{ 
                color: "hsl(var(--brown-light))", 
                fontFamily: "Electrolize, sans-serif" 
              }}
            >
              <p className="mb-4 text-sm tracking-widest">{error}</p>
              <button
                className="px-4 py-2 rounded-full text-xs tracking-widest"
                style={{
                  color: "hsl(var(--gold))",
                  border: "1px solid hsla(var(--gold) / 0.45)",
                  background: "hsla(var(--gold) / 0.12)",
                  fontFamily: "Electrolize, sans-serif",
                }}
                onClick={() => {
                  setLoading(true);
                  fetchHallOfFame();
                }}
              >
                RETRY
              </button>
            </div>
          ) : seasonStats ? (
            <SeasonStatsView stats={seasonStats} />
          ) : null}
        </ScrollReveal>
      </div>
    </section>
  );
}
