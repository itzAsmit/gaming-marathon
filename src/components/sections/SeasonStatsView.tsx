import React from "react";
import { motion } from "framer-motion";
import SmartImage from "@/components/SmartImage";
import { toMediaSrc } from "@/lib/mediaUrl";

interface SeasonStats {
  season: number;
  topPlayers: Array<{
    rank: number;
    player: {
      name: string;
      player_id: string;
      portrait_url: string | null;
    };
  }>;
  allPlayers: Array<{
    rank: number;
    name: string;
    player_id: string;
  }>;
  games: Array<{
    name: string;
    date?: string;
  }>;
}

const RANK_CONFIG = {
  1: {
    label: "1ST",
    emoji: "👑",
    color: "hsl(var(--gold))",
    zIndex: "z-30",
  },
  2: {
    label: "2ND",
    emoji: "🥈",
    color: "hsl(var(--silver))",
    zIndex: "z-20",
  },
  3: {
    label: "3RD",
    emoji: "🥉",
    color: "hsl(var(--bronze))",
    zIndex: "z-20",
  },
};

export default function SeasonStatsView({ stats }: { stats: SeasonStats }) {
  if (!stats) return null;

  return (
    <div className="space-y-16">
      {/* Top 3 Podium - Redesigned Layout */}
      <div className="flex items-end justify-center gap-4 md:gap-8 relative h-80 pt-8">
        {/* 2nd Place (Left) */}
        {(() => {
          const rank = 2;
          const topPlayer = stats.topPlayers.find((p) => p.rank === rank);
          if (!topPlayer) return null;

          const cfg = RANK_CONFIG[rank as 1 | 2 | 3];
          return (
            <motion.div
              key={rank}
              className={`flex flex-col items-center ${cfg.zIndex} relative group cursor-default`}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
            >
              {/* Avatar (Now ABOVE Name Card) */}
              <div
                className="w-24 h-24 rounded-2xl overflow-hidden mb-4 transition-transform duration-300 group-hover:scale-105"
                style={{ border: `3px solid ${cfg.color}`, boxShadow: `0 0 15px ${cfg.color}40` }}
              >
                {toMediaSrc(topPlayer.player.portrait_url) ? (
                  <SmartImage
                    url={topPlayer.player.portrait_url}
                    alt={topPlayer.player.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(var(--brown-deep)), hsl(var(--brown)))",
                    }}
                  >
                    <span className="text-3xl">{cfg.emoji}</span>
                  </div>
                )}
              </div>

              {/* Info card (Now BELOW Avatar) */}
              <div
                className="glass-card rounded-lg px-2 py-2 text-center w-32 transition-all duration-300 group-hover:-translate-y-1"
                style={{ border: `1px solid ${cfg.color}40` }}
              >
                <p
                  className="text-xs font-bold mb-1"
                  style={{ color: cfg.color, fontFamily: "Electrolize, sans-serif" }}
                >
                  {cfg.emoji} {cfg.label}
                </p>
                <p
                  className="text-xs font-semibold truncate px-1"
                  style={{ color: "hsl(var(--cream))", fontFamily: "Electrolize, sans-serif" }}
                  title={topPlayer.player.name}
                >
                  {topPlayer.player.name}
                </p>
              </div>
            </motion.div>
          );
        })()}

        {/* 1st Place (Center) - LARGER */}
        {(() => {
          const rank = 1;
          const topPlayer = stats.topPlayers.find((p) => p.rank === rank);
          if (!topPlayer) return null;

          const cfg = RANK_CONFIG[rank as 1 | 2 | 3];
          return (
            <motion.div
              key={rank}
              className={`flex flex-col items-center ${cfg.zIndex} relative scale-110 md:scale-125 group cursor-default`}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
            >
              {/* Avatar */}
              <div
                className="w-28 h-28 rounded-full overflow-hidden mb-5 transition-transform duration-300 group-hover:scale-105"
                style={{ border: `4px solid ${cfg.color}`, boxShadow: `0 0 25px ${cfg.color}60` }}
              >
                {toMediaSrc(topPlayer.player.portrait_url) ? (
                  <SmartImage
                    url={topPlayer.player.portrait_url}
                    alt={topPlayer.player.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(var(--brown-deep)), hsl(var(--brown)))",
                    }}
                  >
                    <span className="text-5xl">{cfg.emoji}</span>
                  </div>
                )}
              </div>

              {/* Info card */}
              <div
                className="glass-card rounded-xl px-4 py-3 text-center w-40 transition-all duration-300 group-hover:-translate-y-1"
                style={{ border: `2px solid ${cfg.color}50` }}
              >
                <p
                  className="text-sm font-bold mb-1.5"
                  style={{ color: cfg.color, fontFamily: "Electrolize, sans-serif" }}
                >
                  {cfg.emoji} {cfg.label}
                </p>
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: "hsl(var(--cream))", fontFamily: "Electrolize, sans-serif" }}
                  title={topPlayer.player.name}
                >
                  {topPlayer.player.name}
                </p>
              </div>
            </motion.div>
          );
        })()}

        {/* 3rd Place (Right) */}
        {(() => {
          const rank = 3;
          const topPlayer = stats.topPlayers.find((p) => p.rank === rank);
          if (!topPlayer) return null;

          const cfg = RANK_CONFIG[rank as 1 | 2 | 3];
          return (
            <motion.div
              key={rank}
              className={`flex flex-col items-center ${cfg.zIndex} relative group cursor-default`}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 1.5 }}
            >
              {/* Avatar */}
              <div
                className="w-24 h-24 rounded-2xl overflow-hidden mb-4 transition-transform duration-300 group-hover:scale-105"
                style={{ border: `3px solid ${cfg.color}`, boxShadow: `0 0 15px ${cfg.color}40` }}
              >
                {toMediaSrc(topPlayer.player.portrait_url) ? (
                  <SmartImage
                    url={topPlayer.player.portrait_url}
                    alt={topPlayer.player.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(var(--brown-deep)), hsl(var(--brown)))",
                    }}
                  >
                    <span className="text-3xl">{cfg.emoji}</span>
                  </div>
                )}
              </div>

              {/* Info card */}
              <div
                className="glass-card rounded-lg px-2 py-2 text-center w-32 transition-all duration-300 group-hover:-translate-y-1"
                style={{ border: `1px solid ${cfg.color}40` }}
              >
                <p
                  className="text-xs font-bold mb-1"
                  style={{ color: cfg.color, fontFamily: "Electrolize, sans-serif" }}
                >
                  {cfg.emoji} {cfg.label}
                </p>
                <p
                  className="text-xs font-semibold truncate px-1"
                  style={{ color: "hsl(var(--cream))", fontFamily: "Electrolize, sans-serif" }}
                  title={topPlayer.player.name}
                >
                  {topPlayer.player.name}
                </p>
              </div>
            </motion.div>
          );
        })()}
      </div>

      {/* Players & Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* All Players (4th and below) */}
        <div
          className="rounded-2xl p-6 relative group"
          style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--cream-dark))",
          }}
        >
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: "0 0 30px hsla(var(--gold)/0.05)" }} />
          <h3
            className="text-lg font-semibold mb-4"
            style={{
              color: "hsl(var(--gold))",
              fontFamily: "Electrolize, sans-serif",
            }}
          >
            LEADERBOARD
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {stats.allPlayers.length > 0 ? (
              stats.allPlayers.map((player, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: "white",
                    border: "1px solid hsl(var(--cream-dark))",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.03)"
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{ background: "hsla(var(--brown-light)/0.1)", color: "hsl(var(--brown-deep))" }}
                    >
                      {player.rank}
                    </div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "hsl(var(--brown-deep))" }}
                    >
                      {player.name}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="italic text-sm py-4" style={{ color: "hsl(var(--brown-light))" }}>
                No additional players ranked for this season yet.
              </p>
            )}
          </div>
        </div>

        {/* Season Games */}
        <div
          className="rounded-2xl p-6 relative group"
          style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--cream-dark))",
          }}
        >
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: "0 0 30px hsla(var(--gold)/0.05)" }} />
          <h3
            className="text-lg font-semibold mb-4"
            style={{
              color: "hsl(var(--gold))",
              fontFamily: "Electrolize, sans-serif",
            }}
          >
            SEASON GAMES
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {stats.games.length > 0 ? (
              stats.games.map((game, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: "white",
                    border: "1px solid hsl(var(--cream-dark))",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.03)"
                  }}
                >
                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "hsl(var(--brown-deep))" }}
                    >
                      {game.name}
                    </p>
                    {game.date && (
                      <p
                        className="text-xs font-medium mt-1"
                        style={{ color: "hsl(var(--brown-light))" }}
                      >
                        {new Date(game.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="italic text-sm py-4" style={{ color: "hsl(var(--brown-light))" }}>
                No games assigned to this season yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
