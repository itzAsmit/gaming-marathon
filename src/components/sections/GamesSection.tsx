import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { raceDataFetch } from "@/lib/raceDataFetch";
import { toMediaSrc, toProxiedMediaSrc } from "@/lib/mediaUrl";
import SmartImage from "@/components/SmartImage";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, CheckCircle, Clock, Play } from "lucide-react";

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
  points: number | null;
  players: { name: string; player_id: string } | null;
}

export default function GamesSection() {
  const [games, setGames] = useState<Game[]>([]);
  const [selected, setSelected] = useState<Game | null>(null);
  const [rankings, setRankings] = useState<GameRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useProxyForSelectedVideo, setUseProxyForSelectedVideo] = useState(false);
  const [selectedVideoFailed, setSelectedVideoFailed] = useState(false);
  const [selectedVideoLoaded, setSelectedVideoLoaded] = useState(false);

  const fetchGames = async () => {
    try {
      setError(null);
      const data = await raceDataFetch<Game[]>(
        () => supabase.from("games").select("*").order("game_id"),
        "games",
      );

      const getGameOrder = (game: Game): number => {
        const match = game.game_id?.match(/\d+/);
        return match ? parseInt(match[0], 10) : Number.MAX_SAFE_INTEGER;
      };

      const sorted = [...data].sort((a, b) => {
        const aCompleted = a.status === "completed";
        const bCompleted = b.status === "completed";
        if (aCompleted !== bCompleted) return aCompleted ? -1 : 1;
        return getGameOrder(a) - getGameOrder(b);
      });

      setGames(sorted);
    } catch {
      setError("Connection issue. Please tap retry.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRankings = async (gameId: string) => {
    try {
      const data = await raceDataFetch<GameRanking[]>(
        () =>
          supabase
            .from("player_game_stats")
            .select("rank, points, players(name, player_id)")
            .eq("game_id", gameId)
            .order("rank"),
        "rankings",
        { gameId },
      );
      setRankings(data);
    } catch {
      setRankings([]);
    }
  };

  useEffect(() => { fetchGames(); }, []);

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
    let preferProxy = false;
    if (typeof navigator !== "undefined") {
      const connection = (navigator as any).connection;
      const effectiveType = String(connection?.effectiveType ?? "").toLowerCase();
      const rtt = Number(connection?.rtt ?? 0);
      const downlink = Number(connection?.downlink ?? 0);
      const type = String(connection?.type ?? "").toLowerCase();
      preferProxy =
        Boolean(connection?.saveData) ||
        effectiveType.includes("2g") ||
        effectiveType.includes("3g") ||
        type === "cellular" ||
        (rtt > 0 && rtt >= 300) ||
        (downlink > 0 && downlink <= 3);
    }

    setUseProxyForSelectedVideo(preferProxy);
    setSelectedVideoFailed(false);
    setSelectedVideoLoaded(false);
    setSelected(game);
    if (game.status === "completed") fetchRankings(game.id);
  };

  useEffect(() => {
    if (!selected?.video_url) return;
    if (selectedVideoLoaded || selectedVideoFailed) return;

    const timeout = setTimeout(() => {
      if (!useProxyForSelectedVideo && toProxiedMediaSrc(selected.video_url)) {
        setUseProxyForSelectedVideo(true);
        return;
      }
      setSelectedVideoFailed(true);
    }, 5500);

    return () => clearTimeout(timeout);
  }, [selected?.id, selected?.video_url, selectedVideoLoaded, selectedVideoFailed, useProxyForSelectedVideo]);
  const selectedGameDateTime = selected ? getGameDateTime(selected) : null;
  const getRankBadge = (rank: number) => {
    if (rank === 1) return "👑 #1";
    if (rank === 2) return "🥈 #2";
    if (rank === 3) return "🥉 #3";
    return `🎯 #${rank}`;
  };

  return (
    <section id="games" className="relative min-h-[100svh] md:min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <SectionHeader title="GAMES" accent="THE ARENA" subtitle="Battlegrounds where every match tests a different skill" />
        </ScrollReveal>

        {loading ? (
          <p className="text-center mt-10 text-sm tracking-widest" style={{ color: "hsl(var(--cream-dark) / 0.7)", fontFamily: "Electrolize, sans-serif" }}>
            LOADING GAMES...
          </p>
        ) : error ? (
          <div className="text-center mt-10" style={{ color: "hsl(var(--cream-dark) / 0.85)" }}>
            <p className="text-sm mb-4 tracking-widest" style={{ fontFamily: "Electrolize, sans-serif" }}>{error}</p>
            <button
              className="px-4 py-2 rounded-full text-xs  tracking-widest"
              style={{
                color: "hsl(var(--gold))",
                border: "1px solid hsla(var(--gold) / 0.45)",
                background: "hsla(var(--gold) / 0.12)",
                fontFamily: "Electrolize, sans-serif",
              }}
              onClick={() => {
                setLoading(true);
                fetchGames();
              }}
            >
              RETRY
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {games.map((game, i) => (
                <ScrollReveal key={game.id} delay={i * 0.04}>
                  <motion.div
                    className="electric-card rounded-2xl p-[1.5px] overflow-hidden cursor-pointer group w-full max-w-[220px] mx-auto"
                    whileHover={{ scale: 1.05, y: -6 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => openGame(game)}
                  >
                    <div className="glass-card rounded-2xl overflow-hidden relative">
                      <div className="aspect-[3/4] overflow-hidden relative">
                        {toMediaSrc(game.image_url) ? (
                          <SmartImage
                            url={game.image_url}
                            alt={game.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : toMediaSrc(game.video_url) ? (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, hsl(var(--brown-deep)), hsl(var(--brown)))" }}
                          >
                            <div className="flex flex-col items-center gap-2" style={{ color: "hsl(var(--cream-dark))" }}>
                              <Play size={24} />
                              <span className="text-xs tracking-widest">VIDEO</span>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, hsl(var(--brown-deep)), hsl(${(i * 30) % 360} 30% 20%))` }}
                          >
                            <span className="text-sm tracking-widest" style={{ color: "hsl(var(--cream-dark))" }}>NO MEDIA</span>
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-3" style={{ background: "linear-gradient(to top, rgba(10, 8, 20, 0.85), rgba(10, 8, 20, 0))" }}>
                          <p className="text-xs tracking-widest mb-1" style={{ color: "#d8dce8", fontFamily: "Electrolize, sans-serif" }}>
                            {game.game_id}
                          </p>
                          <p
                            className="text-lg md:text-xl font-semibold leading-none"
                            style={{
                              color: "#f7f6f2",
                              fontFamily: "'ROWAN', serif",
                              letterSpacing: "0.12em",
                              WebkitTextStroke: "1px rgba(214, 211, 254, 0.9)",
                              textShadow: "0 0 12px rgba(255,255,255,0.3)",
                            }}
                          >
                            {game.name.toUpperCase()}
                          </p>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs  tracking-wider flex items-center gap-1"
                            style={{
                              background: game.status === "completed" ? "hsla(120 60% 35% / 0.8)" : "hsla(var(--gold) / 0.2)",
                              color: game.status === "completed" ? "hsl(120 80% 75%)" : "hsl(var(--gold))",
                              border: `1px solid ${game.status === "completed" ? "hsla(120 60% 50% / 0.5)" : "hsla(var(--gold) / 0.4)"}`,
                              fontFamily: "Electrolize, sans-serif",
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
          </>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-14 md:pt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "hsla(var(--brown-deep) / 0.4)", backdropFilter: "blur(12px)" }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="glass-card no-scrollbar rounded-3xl overflow-hidden max-w-4xl w-full max-h-[calc(100dvh-6rem)] md:max-h-[calc(100dvh-7rem)] overflow-y-auto relative"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              style={{ background: "hsla(var(--brown-deep) / 0.8)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-[52vh] min-h-[320px] max-h-[520px] overflow-hidden">
                {(() => {
                  const selectedVideoSrc = useProxyForSelectedVideo
                    ? toProxiedMediaSrc(selected.video_url)
                    : toMediaSrc(selected.video_url);
                  const selectedImageSrc = toMediaSrc(selected.image_url);

                  if (selectedVideoSrc && !selectedVideoFailed) {
                    return (
                  <video
                    src={selectedVideoSrc ?? undefined}
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={toMediaSrc(selected.image_url) ?? undefined}
                    preload="metadata"
                    className="w-full h-full object-cover"
                    onLoadStart={() => setSelectedVideoLoaded(false)}
                    onCanPlay={() => setSelectedVideoLoaded(true)}
                    onLoadedData={() => setSelectedVideoLoaded(true)}
                    onError={(event) => {
                      setSelectedVideoLoaded(false);
                      const proxySrc = toProxiedMediaSrc(selected.video_url);
                      if (!proxySrc) {
                        setSelectedVideoFailed(true);
                        return;
                      }
                      const video = event.currentTarget;
                      if (!useProxyForSelectedVideo && video.src !== proxySrc) {
                        setUseProxyForSelectedVideo(true);
                        video.src = proxySrc;
                        video.load();
                        return;
                      }
                      setSelectedVideoFailed(true);
                    }}
                  />
                    );
                  }

                  if (selectedImageSrc) {
                    return (
                  <SmartImage
                    url={selected.image_url}
                    alt={selected.name}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                    );
                  }

                  return (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--brown-deep)), hsl(var(--brown)))" }}>
                    <span className="text-sm tracking-widest" style={{ color: "hsl(var(--cream-dark))" }}>NO MEDIA</span>
                  </div>
                  );
                })()}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, hsla(var(--brown-deep) / 0.95), hsla(var(--brown-deep) / 0.25))" }} />
                <div className="absolute bottom-4 left-6">
                  <p
                    className="text-xs  tracking-widest"
                    style={{
                      color: "#d4dae8",
                      fontFamily: "Electrolize, sans-serif",
                      textShadow: "0 0 10px rgba(236,241,255,0.45)",
                    }}
                  >
                    {selected.game_id}
                  </p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <h3
                    className="font-semibold uppercase px-6 md:px-10 leading-none whitespace-nowrap text-center text-[clamp(2.25rem,8vw,5.5rem)]"
                    style={{
                      color: "#f2f5fb",
                      fontFamily: "'ROWAN', serif",
                      letterSpacing: "0.08em",
                      WebkitTextStroke: "2px rgba(255, 184, 43, 0.9)",
                      textShadow: "0 0 12px rgba(248, 148, 115, 0.6), 0 0 28px rgba(247, 213, 149, 0.73)",
                    }}
                  >
                    {selected.name}
                  </h3>
                </div>
                <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "hsla(var(--brown-deep) / 0.6)", color: "hsl(var(--cream))" }}>
                  <X size={16} />
                </button>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6 items-start">
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs  tracking-widest mb-2" style={{ color: "hsl(var(--gold))", fontFamily: "Electrolize, sans-serif" }}>STATS</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className="px-3 py-1 rounded-full text-xs  tracking-widest"
                          style={{
                            background: selected.status === "completed" ? "hsla(120 60% 35% / 0.3)" : "hsla(var(--gold) / 0.15)",
                            color: selected.status === "completed" ? "hsl(120 80% 70%)" : "hsl(var(--gold))",
                            border: `1px solid ${selected.status === "completed" ? "hsla(120 60% 50% / 0.4)" : "hsla(var(--gold) / 0.3)"}`,
                            fontFamily: "Electrolize, sans-serif",
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
                        <p className="text-xs  tracking-widest mb-2" style={{ color: "hsl(var(--gold))", fontFamily: "Electrolize, sans-serif" }}>ABOUT</p>
                        <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--cream-dark))" }}>{selected.bio}</p>
                      </div>
                    )}

                    {selected.status === "completed" && rankings.length > 0 && (
                      <div>
                        <p className="text-xs  tracking-widest mb-3" style={{ color: "hsl(var(--gold))", fontFamily: "Electrolize, sans-serif" }}>RANKINGS</p>
                        <div className="space-y-2">
                          {rankings.map((r) => (
                            <div key={`${r.rank}-${r.players?.player_id ?? "na"}`} className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ background: "hsla(var(--gold) / 0.05)", border: "1px solid hsla(var(--gold) / 0.15)" }}>
                              <span className="text-xs px-2.5 py-1 rounded-full  tracking-wide" style={{ color: "hsl(var(--gold))", border: "1px solid hsla(var(--gold) / 0.35)", background: "hsla(var(--gold) / 0.08)", fontFamily: "Electrolize, sans-serif" }}>
                                {getRankBadge(r.rank)}
                              </span>
                              <span className="text-sm" style={{ color: "hsl(var(--cream))", fontFamily: "'ROWAN', serif" }}>{r.players?.name ?? "-"}</span>
                              <span className="text-xs ml-auto" style={{ color: "hsl(var(--cream-dark) / 0.8)" }}>
                                {(r.points ?? 0)} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="md:pt-0">
                    {selected.rules && (
                      <div>
                        <p className="text-xs  tracking-widest mb-2" style={{ color: "hsl(var(--gold))", fontFamily: "Electrolize, sans-serif" }}>RULES</p>
                        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "hsl(var(--cream-dark))" }}>{selected.rules}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}



