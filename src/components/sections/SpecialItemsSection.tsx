import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import { motion } from "framer-motion";

const ITEMS = [
  {
    name: "Dagger",
    emoji: "🗡️",
    description: "Deducts 20 points from any player at any point in the marathon. Ownership stays secret (except to the holder) and is announced only when assigned and used.",
    color: "0 70% 50%",
  },
  {
    name: "Shield",
    emoji: "🛡️",
    description: "Protects you from any deduction threat.",
    color: "220 70% 55%",
  },
  {
    name: "Mirror",
    emoji: "🪞",
    description: "Use before a game starts and choose one player. After the game, you receive exactly the same points as that player, regardless of your own performance.",
    color: "180 60% 50%",
  },
  {
    name: "Red Flag",
    emoji: "🚩",
    description: "Either deduct 5 points from any player or stop a player from participating in one specific game. Can also be exchanged for 7 points. (Not usable in Skribbl and Among Us.)",
    color: "0 80% 55%",
  },
  {
    name: "VISA",
    emoji: "🎫",
    description: "Skip any game and secure the points of 3rd place for that game.",
    color: "45 90% 50%",
  },
  {
    name: "Immunity Seal",
    emoji: "🔰",
    description: "Locks your leaderboard position for that game. Your points do not increase, but players below you cannot overtake your rank even if they earn more.",
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
