import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import { motion } from "framer-motion";

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

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from("leaderboard")
      .select("*, players(name, player_id)")
      .order("points", { ascending: false });
    if (data) setEntries(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();

    const channel = supabase
      .channel("leaderboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "leaderboard" }, fetchLeaderboard)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const cols = ["RANK", "PLAYER", "PLAYED", "EVENTS", "WINS", "2NDS", "3RDS", "POINTS"];

  return (
    <section id="leaderboard" className="relative min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <SectionHeader title="LEADERBOARD" accent="STANDINGS" subtitle="Live rankings updated in real time" />
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="glass-card rounded-2xl overflow-hidden">
            {/* Header */}
            <div
              className="grid grid-cols-9 gap-2 px-6 py-4 text-xs font-cinzel tracking-widest"
              style={{
                background: "hsla(var(--gold) / 0.15)",
                borderBottom: "1px solid hsla(var(--gold) / 0.3)",
                color: "hsl(var(--gold))",
                fontFamily: "Cinzel, serif",
              }}
            >
              {cols.map((c) => (
                <div key={c} className="text-center">
                  {c}
                </div>
              ))}
            </div>

            {/* Rows */}
            {loading ? (
              <div className="py-20 text-center" style={{ color: "hsl(var(--cream-dark))" }}>
                <div className="w-8 h-8 border-2 rounded-full mx-auto animate-spin mb-4" style={{ borderColor: "hsl(var(--gold))", borderTopColor: "transparent" }} />
                Loading...
              </div>
            ) : entries.length === 0 ? (
              <div className="py-20 text-center font-cinzel text-sm tracking-widest" style={{ color: "hsl(var(--cream-dark) / 0.5)", fontFamily: "Cinzel, serif" }}>
                NO ENTRIES YET — ARENA AWAITS
              </div>
            ) : (
              entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  className="grid grid-cols-9 gap-2 px-6 py-4 text-sm text-center items-center transition-all duration-300"
                  style={{
                    borderBottom: "1px solid hsla(var(--cream) / 0.1)",
                    background: i < 3 ? `hsla(var(--gold) / ${0.08 - i * 0.02})` : "transparent",
                    color: "hsl(var(--cream))",
                  }}
                  whileHover={{ backgroundColor: "hsla(var(--gold) / 0.1)" }}
                >
                  <div className="font-cinzel font-bold" style={{ fontFamily: "Cinzel, serif", color: i < 3 ? "hsl(var(--gold))" : "hsl(var(--cream-dark))" }}>
                    {i < 3 ? CROWN[i] : `#${i + 1}`}
                  </div>
                  <div className="font-cinzel font-semibold col-span-1" style={{ fontFamily: "Cinzel, serif", color: "hsl(var(--cream))" }}>
                    {entry.players?.name ?? "—"}
                  </div>
                  <div>{entry.games_played}</div>
                  <div>{entry.events_completed}</div>
                  <div style={{ color: "hsl(var(--gold))", fontWeight: 600 }}>{entry.wins}</div>
                  <div>{entry.seconds}</div>
                  <div>{entry.thirds}</div>
                  <div className="font-bold text-base" style={{ color: "hsl(var(--gold))", fontFamily: "Cinzel, serif" }}>
                    {entry.points}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
