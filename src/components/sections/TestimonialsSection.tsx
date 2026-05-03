import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { raceDataFetch } from "@/lib/raceDataFetch";
import { toMediaSrc, toProxiedMediaSrc } from "@/lib/mediaUrl";
import { motion } from "motion/react";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { defaultTestimonials, fallbackTestimonial } from "@/lib/testimonials-data";
import { useConstrainedNetwork } from "@/hooks/use-constrained-network";

interface Player {
  id: string;
  player_id: string;
  name: string;
  image_url: string | null;
  is_active: boolean;
}

export default function TestimonialsSection() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const isConstrained = useConstrainedNetwork();

  const fetchPlayers = async () => {
    try {
      const rawData = await raceDataFetch<Player[]>(
        () => supabase.from("players").select("id, player_id, name, image_url, is_active"),
        "players",
        {}
      );

      const activePlayers = (rawData || []).filter((p) => p.is_active);
      setPlayers(activePlayers);
    } catch {
      // Ignore error for testimonials, just don't show or show loading
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
    if (isConstrained) return;

    const channel = supabase
      .channel("testimonials-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "players" }, fetchPlayers)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isConstrained]);

  if (loading) return null; // or empty state
  if (players.length === 0) return null;

  // Convert players into testimonials format
  const testimonials = players.map(player => ({
    name: player.name,
    role: `Player ${player.player_id}`,
    image: player.image_url ? (isConstrained ? toProxiedMediaSrc(player.image_url) : toMediaSrc(player.image_url)) : "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
    text: defaultTestimonials[player.player_id] || fallbackTestimonial
  }));

  // Distribute testimonials
  // Shuffle array or divide
  const len = testimonials.length;
  const chunk1 = Math.ceil(len / 3);
  const chunk2 = Math.ceil((len - chunk1) / 2);
  
  const firstColumn = testimonials.slice(0, chunk1);
  const secondColumn = testimonials.slice(chunk1, chunk1 + chunk2);
  const thirdColumn = testimonials.slice(chunk1 + chunk2);

  // Fallback for empty chunks if very few players
  const col1 = firstColumn.length ? firstColumn : testimonials;
  const col2 = secondColumn.length ? secondColumn : testimonials;
  const col3 = thirdColumn.length ? thirdColumn : testimonials;

  return (
    <section className="bg-background my-20 relative">
      <div className="container z-10 mx-auto px-4 md:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto text-center"
        >
          <div className="flex justify-center">
            <div className="border border-primary/20 py-1 px-4 rounded-lg tracking-widest text-xs font-cinzel text-primary mb-2">TESTIMONIALS</div>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 font-cinzel text-primary">
            WHAT OUR PLAYERS SAY
          </h2>
          <p className="text-center mt-5 opacity-75 font-inter text-secondary/80">
            Hear from the competitors who bring the marathon to life.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={col1} duration={25} />
          <TestimonialsColumn testimonials={col2} className="hidden md:block" duration={35} />
          <TestimonialsColumn testimonials={col3} className="hidden lg:block" duration={30} />
        </div>
      </div>
    </section>
  );
}