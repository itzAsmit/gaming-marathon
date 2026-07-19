import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { raceDataFetch } from "@/lib/raceDataFetch";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import { motion } from "framer-motion";
import { useConstrainedNetwork } from "@/hooks/use-constrained-network";
import { Download, RefreshCw } from "lucide-react";
import { toJpeg } from "html-to-image";
import { toast } from "sonner";

interface LeaderboardEntry {
  id: string;
  player_id: string;
  games_played: number;
  events_completed: number;
  wins: number;
  seconds: number;
  thirds: number;
  points: number;
  rank: number | null;
  players: { name: string; player_id: string } | null;
}

const CROWN = ["🥇", "🥈", "🥉"];

export default function LeaderboardSection() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isConstrained = useConstrainedNetwork();
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const leaderboardContainerRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setError(null);
      const [data, players] = await Promise.all([
        raceDataFetch<LeaderboardEntry[]>(
          () =>
            supabase
              .from("leaderboard")
              .select("*, players(name, player_id)")
              .order("points", { ascending: false }),
          "leaderboard",
        ),
        raceDataFetch<{ id: string; is_active?: boolean }[]>(
          () => supabase.from("players").select("id, is_active"),
          "players",
        ),
      ]);
      const activePlayerIds = new Set(players.filter((p) => p.is_active !== false).map((p) => p.id));
      setEntries(data.filter((entry) => activePlayerIds.has(entry.player_id)));
    } catch {
      setError("Connection issue. Please tap retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const element = leaderboardContainerRef.current || leaderboardRef.current;
    if (!element) return;
    setIsDownloading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const table = leaderboardRef.current || element;
      const paddingX = window.innerWidth >= 768 ? 48 : 24;
      const paddingY = window.innerWidth >= 768 ? 48 : 24;

      const width = table.scrollWidth + paddingX;
      const height = table.scrollHeight + paddingY;

      const dataUrl = await toJpeg(element, {
        width,
        height,
        style: {
          transform: "none",
          width: `${width}px`,
          height: `${height}px`,
          overflow: "visible",
        },
        backgroundColor: "#0d0c0f",
        quality: 0.95,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `leaderboard-${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
      toast.success("Leaderboard downloaded successfully!");
    } catch (err) {
      console.error("Failed to generate image", err);
      toast.error("Failed to download leaderboard screenshot.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Fetch data on mount; only subscribe to realtime on non-constrained networks
  // where direct Supabase WebSocket connections won't be blocked/throttled.
  useEffect(() => {
    fetchLeaderboard();

    // Skip realtime on cellular/slow networks to prevent WebSocket timeouts
    if (isConstrained) return;

    const channel = supabase
      .channel("leaderboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "leaderboard" }, fetchLeaderboard)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isConstrained]);

  const cols = ["RANK", "PLAYER", "PLAYED", "EVENTS", "WINS", "2NDS", "3RDS", "POINTS"];

  return (
    <section id="leaderboard" className="relative min-h-[100svh] md:min-h-screen py-16 px-4 scroll-mt-64 md:scroll-mt-72">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <SectionHeader title="LEADERBOARD" accent="STANDINGS" subtitle="Live rankings updated in real time" />
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div
            ref={leaderboardContainerRef}
            className="relative p-3 md:p-6 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Layer 0: Background Image */}
            <img
              src="/assets/leaderboard-bg.jpeg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
            />

            {/* Layer 1: Semi-transparent Dark Tint / Glass Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none z-10" />

            {/* Layer 2: Points Table */}
            <div ref={leaderboardRef} className="relative z-20 glass-card rounded-2xl overflow-x-auto md:overflow-hidden">
              {/* Header */}
              <div
                className="grid gap-1 md:gap-2 px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-sm  tracking-widest"
                style={{
                  background: "hsla(var(--gold) / 0.15)",
                  borderBottom: "1px solid hsla(var(--gold) / 0.3)",
                  color: "hsl(var(--gold))",
                  fontFamily: "Electrolize, sans-serif",
                  gridTemplateColumns: "repeat(auto-fit, minmax(0, 1fr))",
                  minWidth: "min-content",
                }}
              >
                {cols.map((c) => (
                  <div key={c} className="text-center whitespace-nowrap">
                    <span className="hidden sm:inline">{c}</span>
                    <span className="sm:hidden text-[9px] leading-none">
                      {c === "RANK" && "RANK"}
                      {c === "PLAYER" && "PLAYER"}
                      {c === "PLAYED" && "PL"}
                      {c === "EVENTS" && "EC"}
                      {c === "WINS" && "WINS"}
                      {c === "2NDS" && "2NDS"}
                      {c === "3RDS" && "3RDS"}
                      {c === "POINTS" && "PTS"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Rows */}
              {loading ? (
                <div className="py-20 text-center" style={{ color: "hsl(var(--cream-dark))" }}>
                  <div className="w-8 h-8 border-2 rounded-full mx-auto animate-spin mb-4" style={{ borderColor: "hsl(var(--gold))", borderTopColor: "transparent" }} />
                  Loading...
                </div>
              ) : error ? (
                <div className="py-12 text-center" style={{ color: "hsl(var(--cream-dark))" }}>
                  <p className="mb-4">{error}</p>
                  <button
                    className="px-4 py-2 rounded-full text-xs  tracking-widest"
                    style={{
                      fontFamily: "Electrolize, sans-serif",
                      color: "hsl(var(--gold))",
                      border: "1px solid hsla(var(--gold) / 0.45)",
                      background: "hsla(var(--gold) / 0.12)",
                    }}
                    onClick={() => {
                      setLoading(true);
                      fetchLeaderboard();
                    }}
                  >
                    RETRY
                  </button>
                </div>
              ) : entries.length === 0 ? (
                <div className="py-20 text-center  text-[10px] md:text-sm tracking-widest" style={{ color: "hsl(var(--cream-dark) / 0.5)", fontFamily: "Electrolize, sans-serif" }}>
                  NO ENTRIES YET — ARENA AWAITS
                </div>
              ) : (
                entries.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    className="grid gap-1 md:gap-2 px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-sm text-center items-center transition-all duration-300"
                    style={{
                      borderBottom: "1px solid hsla(var(--cream) / 0.1)",
                      background: i < 3 ? `hsla(var(--gold) / ${0.08 - i * 0.02})` : "transparent",
                      color: "hsl(var(--cream))",
                      gridTemplateColumns: "repeat(auto-fit, minmax(0, 1fr))",
                      minWidth: "min-content",
                    }}
                  >
                    <div className=" font-bold whitespace-nowrap" style={{ fontFamily: "Electrolize, sans-serif", color: i < 3 ? "hsl(var(--gold))" : "hsl(var(--cream-dark))" }}>
                      {i < 3 ? CROWN[i] : `#${i + 1}`}
                    </div>
                    <div className="font-semibold truncate" style={{ fontFamily: "'ROWAN', serif", color: "hsl(var(--cream))" }}>
                      <span className="sm:hidden">{entry.players?.name?.split(" ")[0] ?? "—"}</span>
                      <span className="hidden sm:inline">{entry.players?.name ?? "—"}</span>
                    </div>
                    <div className="whitespace-nowrap">{entry.games_played}</div>
                    <div className="whitespace-nowrap">{entry.events_completed}</div>
                    <div className="whitespace-nowrap" style={{ color: "hsl(var(--gold))", fontWeight: 600 }}>{entry.wins}</div>
                    <div className="whitespace-nowrap">{entry.seconds}</div>
                    <div className="whitespace-nowrap">{entry.thirds}</div>
                    <div className="font-bold whitespace-nowrap" style={{ color: "hsl(var(--gold))", fontFamily: "Electrolize, sans-serif" }}>
                      {entry.points}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="flex justify-center">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="mt-8 px-6 py-3 rounded-xl text-xs tracking-widest font-bold flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
              style={{
                background: "hsla(var(--gold) / 0.12)",
                border: "1px solid hsla(var(--gold) / 0.45)",
                color: "hsl(var(--gold))",
                fontFamily: "Electrolize, sans-serif",
              }}
            >
              {isDownloading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {isDownloading ? "GENERATING JPG..." : "DOWNLOAD LEADERBOARD"}
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
