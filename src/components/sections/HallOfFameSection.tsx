import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import { motion } from "framer-motion";

interface HofEntry {
  id: string;
  season: number;
  rank: number;
  player_id: string | null;
  players: { name: string; player_id: string; portrait_url: string | null } | null;
}

const SEASON_LABELS = ["Season I", "Season II", "Season III"];

const RANK_CONFIG = {
  1: { label: "1ST", glow: "glow-rank-1", color: "hsl(var(--gold))", emoji: "👑", size: "w-24 h-24", zIndex: "z-30", mt: "" },
  2: { label: "2ND", glow: "glow-rank-2", color: "hsl(var(--silver))", emoji: "🥈", size: "w-20 h-20", zIndex: "z-20", mt: "mt-8" },
  3: { label: "3RD", glow: "glow-rank-3", color: "hsl(var(--bronze))", emoji: "🥉", size: "w-20 h-20", zIndex: "z-20", mt: "mt-8" },
};

export default function HallOfFameSection() {
  const [entries, setEntries] = useState<HofEntry[]>([]);
  const [activeSeason, setActiveSeason] = useState(1);

  useEffect(() => {
    supabase.from("hall_of_fame").select("*, players(name, player_id, portrait_url)").then(({ data }) => {
      if (data) setEntries(data as any);
    });
  }, []);

  const seasonEntries = entries.filter((e) => e.season === activeSeason);
  const rank1 = seasonEntries.find((e) => e.rank === 1);
  const rank2 = seasonEntries.find((e) => e.rank === 2);
  const rank3 = seasonEntries.find((e) => e.rank === 3);

  const PodiumCard = ({ entry, rank }: { entry: HofEntry | undefined; rank: 1 | 2 | 3 }) => {
    const cfg = RANK_CONFIG[rank];
    return (
      <motion.div
        className={`flex flex-col items-center ${cfg.mt} ${cfg.zIndex} relative`}
        animate={{ y: [0, rank === 1 ? -10 : -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: rank * 0.5 }}
      >
        {/* Avatar */}
        <div
          className={`${cfg.size} rounded-full overflow-hidden mb-3 ${cfg.glow}`}
          style={{ border: `2px solid ${cfg.color}` }}
        >
          {entry?.players?.portrait_url ? (
            <img src={entry.players.portrait_url} alt={entry.players.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--brown-deep)), hsl(var(--brown)))" }}>
              <span className="text-2xl">{cfg.emoji}</span>
            </div>
          )}
        </div>

        {/* Info card */}
        <div
          className="glass-card rounded-xl px-4 py-3 text-center min-w-[100px]"
          style={{ border: `1px solid ${cfg.color}30` }}
        >
          <p className="text-lg font-cinzel font-bold mb-1" style={{ color: cfg.color, fontFamily: "Cinzel, serif" }}>
            {cfg.emoji} {cfg.label}
          </p>
          <p className="text-sm font-cinzel font-semibold" style={{ color: "hsl(var(--cream))", fontFamily: "Cinzel, serif" }}>
            {entry?.players?.name ?? "—"}
          </p>
          {entry?.players?.player_id && (
            <p className="text-xs mt-0.5" style={{ color: cfg.color, opacity: 0.7 }}>{entry.players.player_id}</p>
          )}
        </div>

        {/* Podium base */}
        <div
          className="w-full mt-3 rounded-t-xl flex items-center justify-center py-2"
          style={{
            background: `linear-gradient(135deg, ${cfg.color}20, ${cfg.color}10)`,
            border: `1px solid ${cfg.color}30`,
            borderBottom: "none",
            minWidth: 120,
            height: rank === 1 ? 80 : rank === 2 ? 60 : 40,
          }}
        />
      </motion.div>
    );
  };

  return (
    <section id="hall-of-fame" className="relative min-h-screen py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <SectionHeader title="HALL OF FAME" accent="LEGACY" subtitle="The champions who stood atop the Gaming Marathon podium" />
        </ScrollReveal>

        {/* Season tabs */}
        <ScrollReveal delay={0.2}>
          <div className="flex justify-center gap-3 mb-16">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => setActiveSeason(s)}
                className="px-6 py-2 rounded-full font-cinzel text-sm tracking-widest transition-all duration-300"
                style={{
                  fontFamily: "Cinzel, serif",
                  background: activeSeason === s ? "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-light)))" : "hsla(var(--cream) / 0.1)",
                  color: activeSeason === s ? "hsl(var(--brown-deep))" : "hsl(var(--cream))",
                  border: `1px solid ${activeSeason === s ? "transparent" : "hsla(var(--cream) / 0.2)"}`,
                  boxShadow: activeSeason === s ? "0 0 20px hsla(var(--gold) / 0.4)" : "none",
                }}
              >
                {SEASON_LABELS[s - 1]}
              </button>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          {seasonEntries.length === 0 ? (
            <div className="text-center py-20 font-cinzel text-sm tracking-widest" style={{ color: "hsl(var(--cream-dark) / 0.4)", fontFamily: "Cinzel, serif" }}>
              SEASON RECORDS NOT YET WRITTEN
            </div>
          ) : (
            <div className="flex items-end justify-center gap-6">
              <PodiumCard entry={rank2} rank={2} />
              <PodiumCard entry={rank1} rank={1} />
              <PodiumCard entry={rank3} rank={3} />
            </div>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}
