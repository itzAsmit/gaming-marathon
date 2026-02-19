import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import { motion } from "framer-motion";

const ITEMS = [
  {
    name: "Dagger",
    emoji: "🗡️",
    description: "A sharp blade that eliminates one player from an event — swift and lethal.",
    color: "0 70% 50%",
  },
  {
    name: "Shield",
    emoji: "🛡️",
    description: "Protects the holder from being eliminated or penalized in one round.",
    color: "220 70% 55%",
  },
  {
    name: "Mirror",
    emoji: "🪞",
    description: "Reflects any negative item or action back to the sender.",
    color: "180 60% 50%",
  },
  {
    name: "Red Flag",
    emoji: "🚩",
    description: "Marks a player for suspicion — others may vote them out.",
    color: "0 80% 55%",
  },
  {
    name: "VISA",
    emoji: "🎫",
    description: "Grants free entry to any event without using a slot.",
    color: "45 90% 50%",
  },
  {
    name: "Immunity Seal",
    emoji: "🔰",
    description: "Absolute immunity from elimination for one full event.",
    color: "130 60% 45%",
  },
];

export default function SpecialItemsSection() {
  return (
    <section id="items" className="relative min-h-screen py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <SectionHeader title="SPECIAL ITEMS" accent="POWER UPS" subtitle="Rare artifacts that can change the course of the game" />
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {ITEMS.map((item, i) => (
            <ScrollReveal key={item.name} delay={i * 0.1}>
              <motion.div
                className="glass-card rounded-2xl p-6 text-center group"
                whileHover={{ scale: 1.05, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="text-5xl mb-4 block"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                >
                  {item.emoji}
                </motion.div>
                <h3
                  className="text-base font-cinzel font-bold mb-2 tracking-wider"
                  style={{
                    fontFamily: "Cinzel, serif",
                    color: `hsl(${item.color})`,
                    textShadow: `0 0 20px hsla(${item.color} / 0.5)`,
                  }}
                >
                  {item.name}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--cream-dark) / 0.8)" }}>
                  {item.description}
                </p>

                {/* Glow border on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ boxShadow: `inset 0 0 20px hsla(${item.color} / 0.15), 0 0 20px hsla(${item.color} / 0.1)` }}
                />
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
