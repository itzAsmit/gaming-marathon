import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import { motion, AnimatePresence } from "framer-motion";
import { X, Instagram, Twitter, Linkedin } from "lucide-react";

interface Player {
  id: string;
  player_id: string;
  name: string;
  bio: string | null;
  image_url: string | null;
  portrait_url: string | null;
  instagram: string | null;
  twitter: string | null;
  linkedin: string | null;
  leaderboard?: {
    wins: number;
    seconds: number;
    thirds: number;
    points: number;
    rank: number | null;
    games_played: number;
  };
  proficiencies?: { game_name: string; proficiency_percent: number }[];
  items?: { items: { name: string; description: string } }[];
}

export default function PlayersSection() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<Player | null>(null);

  const fetchPlayers = async () => {
    const { data } = await supabase
      .from("players")
      .select("*, leaderboard(*), player_proficiencies(*), player_items(*, items(name, description))");
    if (data) {
      setPlayers(
        data.map((p: any) => ({
          ...p,
          leaderboard: p.leaderboard?.[0] ?? p.leaderboard,
          proficiencies: p.player_proficiencies,
          items: p.player_items,
        }))
      );
    }
  };

  useEffect(() => {
    fetchPlayers();
    const channel = supabase
      .channel("players-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "players" }, fetchPlayers)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <section id="players" className="relative min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <SectionHeader title="MEET THE PLAYERS" accent="COMPETITORS" subtitle="The warriors who battle for the crown" />
        </ScrollReveal>

        {players.length === 0 ? (
          <div className="text-center py-20 font-cinzel text-sm tracking-widest" style={{ color: "hsl(var(--cream-dark) / 0.5)", fontFamily: "Cinzel, serif" }}>
            NO PLAYERS REGISTERED YET
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {players.map((player, i) => (
              <ScrollReveal key={player.id} delay={i * 0.05}>
                <motion.div
                  className="glass-card rounded-2xl overflow-hidden cursor-pointer group"
                  whileHover={{ scale: 1.04, y: -8 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelected(player)}
                >
                  <div className="aspect-[3/4] overflow-hidden relative">
                    {player.portrait_url ? (
                      <img
                        src={player.portrait_url}
                        alt={player.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, hsl(var(--brown-deep)), hsl(var(--brown)))" }}
                      >
                        <span className="text-4xl font-cinzel font-bold" style={{ color: "hsl(var(--gold))", fontFamily: "Cinzel, serif" }}>
                          {player.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3"
                      style={{ background: "linear-gradient(to top, hsla(var(--brown-deep) / 0.9), transparent)" }}
                    >
                      <span className="text-xs font-cinzel tracking-widest" style={{ color: "hsl(var(--gold))", fontFamily: "Cinzel, serif" }}>
                        VIEW PROFILE →
                      </span>
                    </div>
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-sm font-cinzel font-semibold truncate" style={{ color: "hsl(var(--cream))", fontFamily: "Cinzel, serif" }}>
                      {player.name}
                    </p>
                    <p className="text-xs tracking-wider mt-0.5" style={{ color: "hsl(var(--gold) / 0.8)" }}>
                      {player.player_id}
                    </p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>

      {/* Player Overlay */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "hsla(var(--brown-deep) / 0.85)", backdropFilter: "blur(12px)" }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="glass-card rounded-3xl overflow-hidden max-w-3xl w-full"
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]">
                <div className="grid md:grid-cols-2">
                {/* Left */}
                <div className="relative">
                  {selected.portrait_url ? (
                    <img src={selected.portrait_url} alt={selected.name} className="w-full h-full object-cover min-h-64" />
                  ) : (
                    <div
                      className="w-full min-h-64 flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, hsl(var(--brown-deep)), hsl(var(--brown)))" }}
                    >
                      <span className="text-7xl font-cinzel font-bold" style={{ color: "hsl(var(--gold))", fontFamily: "Cinzel, serif" }}>
                        {selected.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: "linear-gradient(to top, hsla(var(--brown-deep) / 0.95), transparent)" }}>
                    <p className="text-xs tracking-widest font-cinzel mb-1" style={{ color: "hsl(var(--gold))", fontFamily: "Cinzel, serif" }}>
                      {selected.player_id}
                    </p>
                    <h3 className="text-xl font-cinzel font-bold" style={{ color: "hsl(var(--cream))", fontFamily: "Cinzel, serif" }}>
                      {selected.name}
                    </h3>
                    <div className="flex gap-3 mt-2">
                      {selected.instagram && (
                        <a href={`${selected.instagram}`} target="_blank" rel="noreferrer" style={{ color: "hsl(var(--gold))" }}>
                          <Instagram size={16} />
                        </a>
                      )}
                      {selected.twitter && (
                        <a href={`${selected.twitter}`} target="_blank" rel="noreferrer" style={{ color: "hsl(var(--gold))" }}>
                          <Twitter size={16} />
                        </a>
                      )}
                      {selected.linkedin && (
                        <a href={`${selected.linkedin}`} target="_blank" rel="noreferrer" style={{ color: "hsl(var(--gold))" }}>
                          <Linkedin size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="relative p-6 space-y-5">
                  <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "hsla(var(--cream) / 0.1)", color: "hsl(var(--cream))" }}>
                    <X size={16} />
                  </button>

                  {selected.bio && (
                    <div>
                      <p className="text-xs font-cinzel tracking-widest mb-2" style={{ color: "hsl(var(--gold))", fontFamily: "Cinzel, serif" }}>BIO</p>
                      <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--cream-dark))" }}>{selected.bio}</p>
                    </div>
                  )}

                  {/* Stats */}
                  <div>
                    <p className="text-xs font-cinzel tracking-widest mb-3" style={{ color: "hsl(var(--gold))", fontFamily: "Cinzel, serif" }}>STATS</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "POINTS", value: selected.leaderboard?.points ?? 0 },
                        { label: "RANK", value: selected.leaderboard?.rank ? `#${selected.leaderboard.rank}` : "—" },
                        { label: "WINS", value: selected.leaderboard?.wins ?? 0 },
                        { label: "2NDS", value: selected.leaderboard?.seconds ?? 0 },
                        { label: "3RDS", value: selected.leaderboard?.thirds ?? 0 },
                        { label: "PLAYED", value: selected.leaderboard?.games_played ?? 0 },
                      ].map((s) => (
                        <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "hsla(var(--gold) / 0.08)", border: "1px solid hsla(var(--gold) / 0.2)" }}>
                          <p className="text-lg font-cinzel font-bold" style={{ color: "hsl(var(--gold))", fontFamily: "Cinzel, serif" }}>{s.value}</p>
                          <p className="text-xs font-cinzel tracking-wider" style={{ color: "hsl(var(--cream-dark) / 0.7)", fontFamily: "Cinzel, serif" }}>{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Items */}
                  {selected.items && selected.items.length > 0 && (
                    <div>
                      <p className="text-xs font-cinzel tracking-widest mb-2" style={{ color: "hsl(var(--gold))", fontFamily: "Cinzel, serif" }}>ITEMS HOLDING</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.items.map((pi: any) => (
                          <span key={pi.items.name} className="px-3 py-1 rounded-full text-xs font-cinzel" style={{ background: "hsla(var(--gold) / 0.15)", color: "hsl(var(--gold))", border: "1px solid hsla(var(--gold) / 0.3)", fontFamily: "Cinzel, serif" }}>
                            {pi.items.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Game Proficiency */}
                  {selected.proficiencies && selected.proficiencies.length > 0 && (
                    <div>
                      <p className="text-xs font-cinzel tracking-widest mb-3" style={{ color: "hsl(var(--gold))", fontFamily: "Cinzel, serif" }}>GAME PROFICIENCY</p>
                      <div className="space-y-3">
                        {selected.proficiencies.slice(0, 3).map((prof) => (
                          <div key={prof.game_name}>
                            <div className="flex justify-between text-xs mb-1">
                              <span style={{ color: "hsl(var(--cream))" }}>{prof.game_name}</span>
                              <span style={{ color: "hsl(var(--gold))" }}>{prof.proficiency_percent}%</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsla(var(--cream) / 0.1)" }}>
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: "linear-gradient(to right, hsl(var(--gold)), hsl(var(--gold-light)))" }}
                                initial={{ width: 0 }}
                                animate={{ width: `${prof.proficiency_percent}%` }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
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
