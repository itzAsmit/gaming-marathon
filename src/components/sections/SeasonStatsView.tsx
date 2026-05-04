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
    points: number;
  }>;
  allPlayers: Array<{
    name: string;
    player_id: string;
    points: number;
    wins: number;
    gamesPlayed: number;
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
    size: "w-20 h-20",
    zIndex: "z-30",
    baseHeight: 80,
  },
  2: {
    label: "2ND",
    emoji: "🥈",
    color: "hsl(var(--silver))",
    size: "w-16 h-16",
    zIndex: "z-20",
    baseHeight: 60,
  },
  3: {
    label: "3RD",
    emoji: "🥉",
    color: "hsl(var(--bronze))",
    size: "w-16 h-16",
    zIndex: "z-20",
    baseHeight: 40,
  },
};

export default function SeasonStatsView({ stats }: { stats: SeasonStats }) {
  if (!stats) return null;

  return (
    <div className="space-y-12">
      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 md:gap-8">
        {[2, 1, 3].map((rank) => {
          const topPlayer = stats.topPlayers.find((p) => p.rank === rank);
          if (!topPlayer) return null;

          const cfg = RANK_CONFIG[rank as 1 | 2 | 3];
          return (
            <motion.div
              key={rank}
              className={`flex flex-col items-center ${cfg.zIndex} relative`}
              animate={{ y: [0, rank === 1 ? -10 : -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: rank * 0.5 }}
            >
              {/* Avatar */}
              <div
                className={`${cfg.size} rounded-full overflow-hidden mb-3`}
                style={{ border: `2px solid ${cfg.color}` }}
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
                    <span className="text-xl">{cfg.emoji}</span>
                  </div>
                )}
              </div>

              {/* Info card */}
              <div
                className="glass-card rounded-xl px-3 py-2 text-center min-w-[90px]"
                style={{ border: `1px solid ${cfg.color}30` }}
              >
                <p
                  className="text-sm font-bold mb-0.5"
                  style={{ color: cfg.color, fontFamily: "Electrolize, sans-serif" }}
                >
                  {cfg.emoji} {cfg.label}
                </p>
                <p
                  className="text-xs font-semibold"
                  style={{ color: "hsl(var(--cream))", fontFamily: "Electrolize, sans-serif" }}
                >
                  {topPlayer.player.name}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: cfg.color, opacity: 0.7 }}
                >
                  {topPlayer.points} pts
                </p>
              </div>

              {/* Podium base */}
              <div
                className="w-full mt-2 rounded-t-xl flex items-center justify-center py-1"
                style={{
                  background: `linear-gradient(135deg, ${cfg.color}20, ${cfg.color}10)`,
                  border: `1px solid ${cfg.color}30`,
                  borderBottom: "none",
                  minWidth: 100,
                  height: cfg.baseHeight,
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Players & Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* All Players */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--cream-dark))",
          }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{
              color: "hsl(var(--gold))",
              fontFamily: "Electrolize, sans-serif",
            }}
          >
            SEASON PLAYERS
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {stats.allPlayers.length > 0 ? (
              stats.allPlayers.map((player, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{
                    background: "hsl(var(--input) / 0.5)",
                    border: "1px solid hsl(var(--cream-dark) / 0.3)",
                  }}
                >
                  <div className="flex-1">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "hsl(var(--cream))" }}
                    >
                      {player.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "hsl(var(--brown-light))" }}
                    >
                      {player.gamesPlayed} games • {player.wins}W
                    </p>
                  </div>
                  <div
                    className="text-right"
                    style={{ color: "hsl(var(--gold))" }}
                  >
                    <p className="text-sm font-bold">{player.points}</p>
                    <p className="text-xs">points</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "hsl(var(--cream-dark) / 0.5)" }}>
                No players yet
              </p>
            )}
          </div>
        </div>

        {/* Season Games */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--cream-dark))",
          }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{
              color: "hsl(var(--gold))",
              fontFamily: "Electrolize, sans-serif",
            }}
          >
            SEASON GAMES
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {stats.games.length > 0 ? (
              stats.games.map((game, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{
                    background: "hsl(var(--input) / 0.5)",
                    border: "1px solid hsl(var(--cream-dark) / 0.3)",
                  }}
                >
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "hsl(var(--cream))" }}
                    >
                      {game.name}
                    </p>
                    {game.date && (
                      <p
                        className="text-xs"
                        style={{ color: "hsl(var(--brown-light))" }}
                      >
                        {new Date(game.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: "hsl(var(--gold))" }}
                  />
                </div>
              ))
            ) : (
              <p style={{ color: "hsl(var(--cream-dark) / 0.5)" }}>
                No games yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
