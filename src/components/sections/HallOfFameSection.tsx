import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { raceDataFetch } from "@/lib/raceDataFetch";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import SeasonStatsView from "@/components/sections/SeasonStatsView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        const latest = Math.max(...sData.map((s) => s.number));
        setActiveSeason(latest);
      } else {
        setSeasonsList([{ id: "default", number: 1, name: "Season 01" }]);
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
      const { data: hofData } = await supabase
        .from("hall_of_fame")
        .select("rank, players(name, player_id, portrait_url)")
        .eq("season", season)
        .order("rank");

      // @ts-ignore
      const { data: gameData }: { data: Array<{ name: string; game_date: string | null }> | null } =
        await supabase.from("games").select("name, game_date").eq("season", season);

      const topPlayers = (hofData || [])
        .filter((entry: any) => entry.rank <= 3)
        .map((entry: any) => ({
          rank: entry.rank,
          player: {
            name: entry.players?.name || "—",
            player_id: entry.players?.player_id || "—",
            portrait_url: entry.players?.portrait_url,
          },
        }));

      const allPlayers = (hofData || [])
        .filter((entry: any) => entry.rank >= 4)
        .map((entry: any) => ({
          rank: entry.rank,
          name: entry.players?.name || "—",
          player_id: entry.players?.player_id || "—",
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

  // Re-fetch when the browser tab regains focus so admin edits show immediately
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        fetchSeasonStats(activeSeason);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [activeSeason]);

  // The index of the active season in the list (for the gooey tab)
  const activeIndex = seasonsList.findIndex((s) => s.number === activeSeason);

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

        {seasonsList.length > 0 && (
          <ScrollReveal delay={0.2}>
            <Tabs 
              value={`season-${activeSeason}`} 
              onValueChange={(val) => setActiveSeason(Number(val.replace('season-', '')))}
              className="w-full flex flex-col items-center"
            >
              <div className="flex justify-center mb-16 w-full">
                <TabsList className="h-auto gap-2 rounded-none border-b border-border bg-transparent px-0 py-1 text-foreground overflow-x-auto max-w-full justify-start md:justify-center">
                  {seasonsList.map((s) => (
                    <TabsTrigger
                      key={s.number}
                      value={`season-${s.number}`}
                      className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 flex-shrink-0 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
                    >
                      {s.name || `Season ${String(s.number).padStart(2, "0")}`}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {seasonsList.map((s) => (
                <TabsContent key={s.number} value={`season-${s.number}`} className="w-full">
                  {loading ? (
                    <div
                      className="text-center py-20 text-sm tracking-widest"
                      style={{ color: "hsl(var(--brown-light))", fontFamily: "Electrolize, sans-serif" }}
                    >
                      LOADING HALL OF FAME...
                    </div>
                  ) : error ? (
                    <div
                      className="text-center py-20"
                      style={{ color: "hsl(var(--brown-light))", fontFamily: "Electrolize, sans-serif" }}
                    >
                      <p className="mb-4 text-sm tracking-widest">{error}</p>
                      <button
                        className="px-4 py-2 rounded-full text-xs tracking-widest transition-transform hover:scale-105"
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
                  ) : seasonStats && activeSeason === s.number ? (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSeason}
                        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -24, filter: "blur(8px)" }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                      >
                        <SeasonStatsView stats={seasonStats} />
                      </motion.div>
                    </AnimatePresence>
                  ) : null}
                </TabsContent>
              ))}
            </Tabs>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
