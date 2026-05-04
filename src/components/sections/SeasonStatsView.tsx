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
      {/* Top 3 Podium - Redesigned Layout */}
      <div className="flex items-end justify-center gap-2 md:gap-6 relative h-80">
        {/* 2nd Place (Left) */}
        {(() => {
          const rank = 2;
          const topPlayer = stats.topPlayers.find((p) => p.rank === rank);
          if (!topPlayer) return null;

          const cfg = RANK_CONFIG[rank as 1 | 2 | 3];
          return (
            <motion.div
              key={rank}
              className={`flex flex-col items-center ${cfg.zIndex} relative`}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
            >
              {/* Avatar */}
              <div
                className="w-24 h-24 rounded-2xl overflow-hidden mb-2"
                style={{ border: `3px solid ${cfg.color}` }}
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
                className="glass-card rounded-lg px-2 py-1 text-center w-28"
                style={{ border: `1px solid ${cfg.color}40` }}
              >
                <p
                  className="text-xs font-bold"
                  style={{ color: cfg.color, fontFamily: "Electrolize, sans-serif" }}
                >
                  {cfg.emoji} {cfg.label}
                </p>
                <p
                  className="text-xs font-semibold truncate"
                  style={{ color: "hsl(var(--cream))", fontFamily: "Electrolize, sans-serif" }}
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
              className={`flex flex-col items-center ${cfg.zIndex} relative scale-125`}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
            >
              {/* Avatar */}
              <div
                className="w-28 h-28 rounded-full overflow-hidden mb-3"
                style={{ border: `4px solid ${cfg.color}` }}
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
                className="glass-card rounded-xl px-4 py-2.5 text-center w-36"
                style={{ border: `2px solid ${cfg.color}50` }}
              >
                <p
                  className="text-sm font-bold mb-0.5"
                  style={{ color: cfg.color, fontFamily: "Electrolize, sans-serif" }}
                >
                  {cfg.emoji} {cfg.label}
                </p>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "hsl(var(--cream))", fontFamily: "Electrolize, sans-serif" }}
                >
                  {topPlayer.player.name}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: cfg.color, opacity: 0.8 }}
                >
                  {topPlayer.points} pts
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
              className={`flex flex-col items-center ${cfg.zIndex} relative`}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 1.5 }}
            >
              {/* Avatar */}
              <div
                className="w-24 h-24 rounded-2xl overflow-hidden mb-2"
                style={{ border: `3px solid ${cfg.color}` }}
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
                className="glass-card rounded-lg px-2 py-1 text-center w-28"
                style={{ border: `1px solid ${cfg.color}40` }}
              >
                <p
                  className="text-xs font-bold"
                  style={{ color: cfg.color, fontFamily: "Electrolize, sans-serif" }}
                >
                  {cfg.emoji} {cfg.label}
                </p>
                <p
                  className="text-xs font-semibold truncate"
                  style={{ color: "hsl(var(--cream))", fontFamily: "Electrolize, sans-serif" }}
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
