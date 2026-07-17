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
    <div className="space-y-6 md:space-y-10">
      {/* Top 3 Podium - Redesigned Layout */}
      {stats.topPlayers.length > 0 && (
        <div className="flex items-end justify-center gap-2 md:gap-8 relative h-56 md:h-64 pt-2">
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
                  className="w-16 h-16 md:w-24 md:h-24 rounded-t-2xl overflow-hidden transition-transform duration-300 group-hover:scale-105 z-10"
                  style={{ border: `3px solid ${cfg.color}`, borderBottom: "none", boxShadow: `0 -5px 15px ${cfg.color}40` }}
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
                      <span className="text-xl md:text-3xl">{cfg.emoji}</span>
                    </div>
                  )}
                </div>

                {/* Info card (Now BELOW Avatar) */}
                <div
                  className="glass-card rounded-b-lg px-1 md:px-2 py-1 md:py-2 text-center w-24 md:w-32 transition-all duration-300 z-20"
                  style={{ border: `1px solid ${cfg.color}40`, borderTop: `3px solid ${cfg.color}`, background: "hsl(var(--card))" }}
                >
                  <p
                    className="text-[9px] md:text-xs font-bold mb-0.5 md:mb-1"
                    style={{ color: cfg.color, fontFamily: "Electrolize, sans-serif" }}
                  >
                    {cfg.emoji} {cfg.label}
                  </p>
                  <p
                    className="text-[10px] md:text-xs font-semibold truncate px-1"
                    style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}
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
                className={`flex flex-col items-center ${cfg.zIndex} relative scale-105 md:scale-125 group cursor-default`}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
              >
                {/* Avatar */}
                <div
                  className="w-20 h-20 md:w-28 md:h-28 rounded-t-2xl overflow-hidden transition-transform duration-300 group-hover:scale-105 z-10"
                  style={{ border: `4px solid ${cfg.color}`, borderBottom: "none", boxShadow: `0 -5px 25px ${cfg.color}60` }}
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
                      <span className="text-3xl md:text-5xl">{cfg.emoji}</span>
                    </div>
                  )}
                </div>

                {/* Info card */}
                <div
                  className="glass-card rounded-b-xl px-2 md:px-4 py-1.5 md:py-3 text-center w-28 md:w-40 transition-all duration-300 z-20"
                  style={{ border: `2px solid ${cfg.color}50`, borderTop: `4px solid ${cfg.color}`, background: "hsl(var(--card))" }}
                >
                  <p
                    className="text-[10px] md:text-sm font-bold mb-1 md:mb-1.5"
                    style={{ color: cfg.color, fontFamily: "Electrolize, sans-serif" }}
                  >
                    {cfg.emoji} {cfg.label}
                  </p>
                  <p
                    className="text-xs md:text-sm font-semibold truncate px-1"
                    style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}
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
                  className="w-16 h-16 md:w-24 md:h-24 rounded-t-2xl overflow-hidden transition-transform duration-300 group-hover:scale-105 z-10"
                  style={{ border: `3px solid ${cfg.color}`, borderBottom: "none", boxShadow: `0 -5px 15px ${cfg.color}40` }}
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
                      <span className="text-xl md:text-3xl">{cfg.emoji}</span>
                    </div>
                  )}
                </div>

                {/* Info card */}
                <div
                  className="glass-card rounded-b-lg px-1 md:px-2 py-1 md:py-2 text-center w-24 md:w-32 transition-all duration-300 z-20"
                  style={{ border: `1px solid ${cfg.color}40`, borderTop: `3px solid ${cfg.color}`, background: "hsl(var(--card))" }}
                >
                  <p
                    className="text-[9px] md:text-xs font-bold mb-0.5 md:mb-1"
                    style={{ color: cfg.color, fontFamily: "Electrolize, sans-serif" }}
                  >
                    {cfg.emoji} {cfg.label}
                  </p>
                  <p
                    className="text-[10px] md:text-xs font-semibold truncate px-1"
                    style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}
                    title={topPlayer.player.name}
                  >
                    {topPlayer.player.name}
                  </p>
                </div>
              </motion.div>
            );
          })()}
        </div>
      )}

      {/* Players & Games Grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-8">
        {/* All Players (4th and below) */}
        <div
          className="rounded-2xl p-3 md:p-6 relative group"
          style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--cream-dark))",
          }}
        >
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: "0 0 30px hsla(var(--gold)/0.05)" }} />
          <h3
            className="text-xs md:text-lg font-semibold mb-2 md:mb-4"
            style={{
              color: "hsl(var(--gold))",
              fontFamily: "Electrolize, sans-serif",
            }}
          >
            LEADERBOARD
          </h3>
          <div className="space-y-2 md:space-y-3 pr-1 md:pr-2">
            {stats.allPlayers.length > 0 ? (
              stats.allPlayers.map((player, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-1.5 md:p-3.5 rounded-lg md:rounded-xl transition-all duration-300"
                  style={{
                    background: "white",
                    border: "1px solid hsl(var(--cream-dark))",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.03)"
                  }}
                >
                  <div className="flex items-center gap-1.5 md:gap-4 overflow-hidden w-full">
                    <div 
                      className="w-6 h-6 md:w-10 md:h-8 rounded-full flex items-center justify-center font-bold text-[10px] md:text-sm shrink-0"
                      style={{ background: "hsla(var(--brown-light)/0.1)", color: "hsl(var(--brown-deep))" }}
                    >
                      {player.rank}
                      <span className="text-[7px] md:text-[10px]">
                        {["st", "nd", "rd"][((player.rank + 90) % 100 - 10) % 10 - 1] || "th"}
                      </span>
                    </div>
                    <p
                      className="text-[10px] md:text-sm font-bold truncate"
                      style={{ color: "hsl(var(--brown-deep))" }}
                      title={player.name}
                    >
                      {player.name}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="italic text-[10px] md:text-sm py-4" style={{ color: "hsl(var(--brown-light))" }}>
                No additional players.
              </p>
            )}
          </div>
        </div>

        {/* Season Games */}
        <div
          className="rounded-2xl p-3 md:p-6 relative group"
          style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--cream-dark))",
          }}
        >
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: "0 0 30px hsla(var(--gold)/0.05)" }} />
          <h3
            className="text-xs md:text-lg font-semibold mb-2 md:mb-4"
            style={{
              color: "hsl(var(--gold))",
              fontFamily: "Electrolize, sans-serif",
            }}
          >
            SEASON GAMES
          </h3>
          <div className="space-y-2 md:space-y-3 pr-1 md:pr-2">
            {stats.games.length > 0 ? (
              stats.games.map((game, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-1.5 md:p-3.5 rounded-lg md:rounded-xl transition-all duration-300"
                  style={{
                    background: "white",
                    border: "1px solid hsl(var(--cream-dark))",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.03)"
                  }}
                >
                  <div className="truncate w-full">
                    <p
                      className="text-[10px] md:text-sm font-bold truncate"
                      style={{ color: "hsl(var(--brown-deep))" }}
                      title={game.name}
                    >
                      {game.name}
                    </p>
                    {game.date && (
                      <p
                        className="text-[8px] md:text-xs font-medium mt-0.5 md:mt-1"
                        style={{ color: "hsl(var(--brown-light))" }}
                      >
                        {new Date(game.date).toLocaleDateString(undefined, {month: 'numeric', day: 'numeric'})}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="italic text-[10px] md:text-sm py-4" style={{ color: "hsl(var(--brown-light))" }}>
                No games.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
