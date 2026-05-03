import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { raceDataFetch } from "@/lib/raceDataFetch";
import { toMediaSrc, toProxiedMediaSrc } from "@/lib/mediaUrl";
import { motion } from "motion/react";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { customQuotes, fallbackTestimonial } from "@/lib/testimonials-config";
import { useConstrainedNetwork } from "@/hooks/use-constrained-network";
import SectionHeader from "@/components/SectionHeader";
import ScrollReveal from "@/components/ScrollReveal";

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

  // Convert valid players into testimonials format
  const testimonials = players.map((player) => {
    // Use the exact ID from the database (e.g. "#P01")
    const idStr = String(player.player_id).trim();
    const quote = customQuotes[idStr] || fallbackTestimonial;

    return {
      name: player.name,
      role: idStr, // Will display exactly as "#P01"
      image: player.image_url
        ? isConstrained
          ? toProxiedMediaSrc(player.image_url)
          : toMediaSrc(player.image_url)
        : "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
      text: quote,
    };
  });

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
        <ScrollReveal>
          <SectionHeader 
            title="WHAT OUR PLAYERS SAY" 
            subtitle="Hear from the competitors who bring the marathon to life." 
            titleClassName="text-2xl sm:text-3xl md:text-4xl"
          />
        </ScrollReveal>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden relative">
          <TestimonialsColumn testimonials={col1} duration={25} />
          <TestimonialsColumn testimonials={col2} className="hidden md:block" duration={35} />
          <TestimonialsColumn testimonials={col3} className="hidden lg:block" duration={30} />
        </div>

        {/* Footer */}
        <div
          className="mt-20 text-center border-t pt-8"
          style={{ borderColor: "hsla(var(--gold) / 0.2)" }}
        >
          <p
            className="font-jura text-xs tracking-[0.5em]"
            style={{
              color: "hsl(var(--gold) / 0.5)",
              fontFamily: "Jura, sans-serif",
            }}
          >
            GAMING MARATHON © 2026 — ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </section>
  );
}