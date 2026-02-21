import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, CheckCircle, Clock } from "lucide-react";

interface Game {
  id: string;
  game_id: string;
  name: string;
  bio: string | null;
  image_url: string | null;
  video_url: string | null;
  rules: string | null;
  game_date: string | null;
  game_time: string | null;
  game_datetime: string | null;
  status: string;
}

interface GameRanking {
  rank: number;
  players: { name: string; player_id: string } | null;
}

interface GamePalette {
  primary: string;
  secondary: string;
  accent: string;
}

const DEFAULT_PALETTE: GamePalette = {
  primary: "#59d6ff",
  secondary: "#6b7dff",
  accent: "#6dffe2",
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("")}`;

const brighten = (color: string, amount: number) => {
  const v = color.replace("#", "");
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return rgbToHex(r + amount, g + amount, b + amount);
};

const darken = (color: string, amount: number) => brighten(color, -amount);

const colorDistance = (a: [number, number, number], b: [number, number, number]) => {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

const pickPaletteFromImage = async (url: string): Promise<GamePalette> => {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("image-load"));
  });

  const canvas = document.createElement("canvas");
  const size = 36;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return DEFAULT_PALETTE;
  ctx.drawImage(img, 0, 0, size, size);

  const data = ctx.getImageData(0, 0, size, size).data;
  const buckets = new Map<string, { count: number; rgb: [number, number, number] }>();
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 100) continue;
    const r = Math.floor(data[i] / 24) * 24;
    const g = Math.floor(data[i + 1] / 24) * 24;
    const b = Math.floor(data[i + 2] / 24) * 24;
    const key = `${r}-${g}-${b}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      buckets.set(key, { count: 1, rgb: [r, g, b] });
    }
  }

  const sorted = Array.from(buckets.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((x) => x.rgb);

  if (sorted.length === 0) return DEFAULT_PALETTE;

  const base = sorted[0];
  let second = sorted.find((c) => colorDistance(c, base) > 45) || sorted[Math.min(1, sorted.length - 1)] || base;
  let third = sorted.find((c) => colorDistance(c, second) > 40) || sorted[Math.min(2, sorted.length - 1)] || second;

  const primary = brighten(rgbToHex(base[0], base[1], base[2]), 40);
  const secondary = darken(rgbToHex(second[0], second[1], second[2]), 10);
  const accent = brighten(rgbToHex(third[0], third[1], third[2]), 55);

  return { primary, secondary, accent };
};

export default function GamesSection() {
  const [games, setGames] = useState<Game[]>([]);
  const [selected, setSelected] = useState<Game | null>(null);
  const [rankings, setRankings] = useState<GameRanking[]>([]);
  const [palettes, setPalettes] = useState<Record<string, GamePalette>>({});

  const fetchGames = async () => {
    const { data } = await supabase.from("games").select("*").order("game_id");
    if (data) setGames(data);
  };

  const fetchRankings = async (gameId: string) => {
    const { data } = await supabase
      .from("player_game_stats")
      .select("rank, players(name, player_id)")
      .eq("game_id", gameId)
      .order("rank");
    if (data) setRankings(data as any);
  };

  useEffect(() => { fetchGames(); }, []);

  useEffect(() => {
    let cancelled = false;
    const hydratePalettes = async () => {
      const next: Record<string, GamePalette> = {};
      await Promise.all(
        games.map(async (game) => {
          if (!game.image_url) {
            next[game.id] = DEFAULT_PALETTE;
            return;
          }
          try {
            next[game.id] = await pickPaletteFromImage(game.image_url);
          } catch {
            next[game.id] = DEFAULT_PALETTE;
          }
        })
      );
      if (!cancelled) setPalettes(next);
    };
    if (games.length > 0) void hydratePalettes();
    return () => {
      cancelled = true;
    };
  }, [games]);

  const formatGameTime = (rawTime: string) => {
    const normalized = rawTime.trim().toUpperCase().replace(/\s+/g, " ");
    return /^([1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/.test(normalized) ? normalized : rawTime;
  };

  const getGameDateTime = (game: Game) => {
    if (game.game_datetime) {
      const parsed = new Date(game.game_datetime);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    if (!game.game_date) return null;
    const base = new Date(`${game.game_date}T00:00:00`);
    if (Number.isNaN(base.getTime())) return null;
    if (!game.game_time) return base;
    const match = game.game_time.trim().toUpperCase().match(/^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/);
    if (!match) return base;
    const [, hourRaw, minute, period] = match;
    const hour12 = parseInt(hourRaw, 10);
    base.setHours((hour12 % 12) + (period === "PM" ? 12 : 0), parseInt(minute, 10), 0, 0);
    return base;
  };

  const openGame = (game: Game) => {
    setSelected(game);
    if (game.status === "completed") fetchRankings(game.id);
  };
  const selectedGameDateTime = selected ? getGameDateTime(selected) : null;

  return (
    <section id="games" className="relative min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <SectionHeader title="GAMES" accent="THE ARENA" subtitle="Battlegrounds where every match tests a different skill" />
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {games.map((game, i) => (
            <ScrollReveal key={game.id} delay={i * 0.04}>
              <motion.div
                className="electric-card rounded-2xl p-[1px] overflow-hidden cursor-pointer group"
                style={{
                  ["--e1" as any]: palettes[game.id]?.primary ?? DEFAULT_PALETTE.primary,
                  ["--e2" as any]: palettes[game.id]?.secondary ?? DEFAULT_PALETTE.secondary,
                  ["--e3" as any]: palettes[game.id]?.accent ?? DEFAULT_PALETTE.accent,
                }}
                whileHover={{ scale: 1.05, y: -6 }}
                transition={{ duration: 0.3 }}
                onClick={() => openGame(game)}
              >
                <div className="glass-card rounded-2xl overflow-hidden relative">
                  <div className="aspect-[3/4] overflow-hidden relative">
                    {game.image_url ? (
                      <img src={game.image_url} alt={game.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : game.video_url ? (
                      <video src={game.video_url} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, hsl(var(--brown-deep)), hsl(${(i * 30) % 360} 30% 20%))` }}
                      >
                        <span className="text-sm tracking-widest" style={{ color: "hsl(var(--cream-dark))" }}>NO MEDIA</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-3" style={{ background: "linear-gradient(to top, rgba(10, 8, 20, 0.85), rgba(10, 8, 20, 0))" }}>
                      <p className="text-xs tracking-widest mb-1" style={{ color: palettes[game.id]?.accent ?? DEFAULT_PALETTE.accent, fontFamily: "Cinzel, serif" }}>
                        {game.game_id}
                      </p>
                      <p className="text-sm font-cinzel font-semibold" style={{ color: "hsl(var(--cream))", fontFamily: "Cinzel, serif", letterSpacing: "0.08em" }}>
                        {game.name.toUpperCase()}
                      </p>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-cinzel tracking-wider flex items-center gap-1"
                        style={{
                          background: game.status === "completed" ? "hsla(120 60% 35% / 0.8)" : "hsla(var(--gold) / 0.2)",
                          color: game.status === "completed" ? "hsl(120 80% 75%)" : "hsl(var(--gold))",
                          border: `1px solid ${game.status === "completed" ? "hsla(120 60% 50% / 0.5)" : "hsla(var(--gold) / 0.4)"}`,
                          fontFamily: "Cinzel, serif",
                          fontSize: "0.6rem",
                        }}
                      >
                        {game.status === "completed" ? <CheckCircle size={8} /> : <Clock size={8} />}
                        {game.status === "completed" ? "DONE" : "SOON"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
        {games.length === 0 && (
          <p className="text-center mt-10 text-sm" style={{ color: "hsl(var(--cream-dark) / 0.7)" }}>
            No games yet.
          </p>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "hsla(var(--brown-deep) / 0.9)", backdropFilter: "blur(12px)" }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="glass-card rounded-3xl overflow-hidden max-w-4xl w-full max-h-[92vh] overflow-y-auto relative"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-[52vh] min-h-[320px] max-h-[520px] overflow-hidden">
                {selected.video_url ? (
                  <video src={selected.video_url} autoPlay loop muted className="w-full h-full object-cover" />
                ) : selected.image_url ? (
                  <img src={selected.image_url} alt={selected.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--brown-deep)), hsl(var(--brown)))" }}>
                    <span className="text-sm tracking-widest" style={{ color: "hsl(var(--cream-dark))" }}>NO MEDIA</span>
                  </div>
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, hsla(var(--brown-deep) / 0.95), hsla(var(--brown-deep) / 0.25))" }} />
                <div className="absolute bottom-4 left-6">
                  <p
                    className="text-xs font-cinzel tracking-widest"
                    style={{
                      color: palettes[selected.id]?.accent ?? DEFAULT_PALETTE.accent,
                      fontFamily: "Cinzel, serif",
                      textShadow: `0 0 12px ${palettes[selected.id]?.accent ?? DEFAULT_PALETTE.accent}`,
                    }}
                  >
                    {selected.game_id}
                  </p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <h3
                    className="text-4xl md:text-6xl font-cinzel font-bold uppercase px-10"
                    style={{
                      color: "transparent",
                      fontFamily: "Cinzel, serif",
                      letterSpacing: "0.12em",
                      WebkitTextStroke: `1.6px ${palettes[selected.id]?.primary ?? DEFAULT_PALETTE.primary}`,
                      textShadow: `0 0 10px ${palettes[selected.id]?.primary ?? DEFAULT_PALETTE.primary}, 0 0 26px ${palettes[selected.id]?.accent ?? DEFAULT_PALETTE.accent}`,
                    }}
                  >
                    {selected.name}
                  </h3>
                </div>
                <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "hsla(var(--brown-deep) / 0.6)", color: "hsl(var(--cream))" }}>
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <p className="text-xs font-cinzel tracking-widest mb-2" style={{ color: "hsl(var(--gold))", fontFamily: "Cinzel, serif" }}>STATS</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-cinzel tracking-widest"
                      style={{
                        background: selected.status === "completed" ? "hsla(120 60% 35% / 0.3)" : "hsla(var(--gold) / 0.15)",
                        color: selected.status === "completed" ? "hsl(120 80% 70%)" : "hsl(var(--gold))",
                        border: `1px solid ${selected.status === "completed" ? "hsla(120 60% 50% / 0.4)" : "hsla(var(--gold) / 0.3)"}`,
                        fontFamily: "Cinzel, serif",
                      }}
                    >
                      {selected.status.toUpperCase()}
                    </span>
                    {selectedGameDateTime && (
                      <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full" style={{ color: "hsl(var(--cream-dark))", border: "1px solid hsla(var(--gold) / 0.2)", background: "hsla(var(--gold) / 0.06)" }}>
                        <Calendar size={12} /> {selectedGameDateTime.toLocaleDateString("en-GB")}
                      </span>
                    )}
                    {selectedGameDateTime && (
                      <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full" style={{ color: "hsl(var(--cream-dark))", border: "1px solid hsla(var(--gold) / 0.2)", background: "hsla(var(--gold) / 0.06)" }}>
                        <Clock size={12} /> {selectedGameDateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </span>
                    )}
                    {!selectedGameDateTime && selected.game_time && (
                      <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full" style={{ color: "hsl(var(--cream-dark))", border: "1px solid hsla(var(--gold) / 0.2)", background: "hsla(var(--gold) / 0.06)" }}>
                        <Clock size={12} /> {formatGameTime(selected.game_time)}
                      </span>
                    )}
                  </div>
                </div>

                {selected.bio && (
                  <div>
                    <p className="text-xs font-cinzel tracking-widest mb-2" style={{ color: "hsl(var(--gold))", fontFamily: "Cinzel, serif" }}>ABOUT</p>
                    <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--cream-dark))" }}>{selected.bio}</p>
                  </div>
                )}

                {selected.rules && (
                  <div>
                    <p className="text-xs font-cinzel tracking-widest mb-2" style={{ color: "hsl(var(--gold))", fontFamily: "Cinzel, serif" }}>RULES</p>
                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "hsl(var(--cream-dark))" }}>{selected.rules}</p>
                  </div>
                )}

                {selected.status === "completed" && rankings.length > 0 && (
                  <div>
                    <p className="text-xs font-cinzel tracking-widest mb-3" style={{ color: "hsl(var(--gold))", fontFamily: "Cinzel, serif" }}>RANKINGS</p>
                    <div className="space-y-2">
                      {rankings.map((r) => (
                        <div key={r.rank} className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ background: "hsla(var(--gold) / 0.05)", border: "1px solid hsla(var(--gold) / 0.15)" }}>
                          <span className="text-lg">{r.rank === 1 ? "1" : r.rank === 2 ? "2" : r.rank === 3 ? "3" : `#${r.rank}`}</span>
                          <span className="font-cinzel text-sm" style={{ color: "hsl(var(--cream))", fontFamily: "Cinzel, serif" }}>{r.players?.name ?? "-"}</span>
                          <span className="text-xs ml-auto" style={{ color: "hsl(var(--cream-dark) / 0.6)" }}>{r.players?.player_id}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
