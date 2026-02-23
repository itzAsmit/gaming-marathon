import { useRef, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import { motion, useInView } from "framer-motion";

interface Item {
  name: string;
  emoji: string;
  description: string;
  color: string;
}

const ITEMS: Item[] = [
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

interface AnimatedListItemProps {
  item: Item;
  index: number;
  selected: boolean;
  onHover: (index: number) => void;
  onClick: (index: number) => void;
}

function AnimatedListItem({ item, index, selected, onHover, onClick }: AnimatedListItemProps) {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(itemRef, { amount: 0.45, once: false });

  return (
    <motion.div
      ref={itemRef}
      data-index={index}
      onMouseEnter={() => onHover(index)}
      onClick={() => onClick(index)}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="mb-4 cursor-pointer"
    >
      <div
        className="relative overflow-hidden rounded-2xl p-4 md:p-5 transition-all duration-300"
        style={{
          background: selected
            ? "linear-gradient(145deg, hsla(var(--cream) / 0.34), hsla(var(--brown) / 0.34))"
            : "linear-gradient(145deg, hsla(var(--cream) / 0.24), hsla(var(--brown) / 0.24))",
          boxShadow: selected
            ? `0 0 0 1px hsla(${item.color} / 0.45), 0 12px 30px hsla(${item.color} / 0.25)`
            : "0 8px 22px hsla(var(--brown-deep) / 0.18)",
        }}
      >
        <div
          className="absolute -top-6 -left-8 h-24 w-24 rounded-full blur-2xl pointer-events-none"
          style={{ background: `radial-gradient(circle, hsla(${item.color} / 0.4), transparent 70%)` }}
        />
        <div
          className="absolute -bottom-8 right-8 h-20 w-20 rounded-full blur-2xl pointer-events-none"
          style={{ background: `radial-gradient(circle, hsla(${item.color} / 0.28), transparent 75%)` }}
        />
        <div className="flex items-start gap-4">
          <motion.div
            className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-2xl"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.3, repeat: Infinity, delay: index * 0.2 }}
            style={{ background: `radial-gradient(circle at 30% 30%, hsla(${item.color} / 0.5), hsla(${item.color} / 0.12))` }}
          >
            {item.emoji}
          </motion.div>

          <div className="min-w-0">
            <h3
              className="text-lg md:text-xl font-cinzel font-bold tracking-wide mb-1"
              style={{
                fontFamily: "Cinzel, serif",
                color: `hsl(${item.color})`,
                textShadow: `0 0 18px hsla(${item.color} / 0.45)`,
              }}
            >
              {item.name}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--cream))" }}>
              {item.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function SpecialItemsSection() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <section id="items" className="relative min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <SectionHeader title="SPECIAL ITEMS" accent="POWER UPS" subtitle="Rare artifacts that can change the course of the game" />
        </ScrollReveal>

        <div className="relative mt-10 max-w-5xl mx-auto px-2 md:px-6">
          <div className="py-5 md:py-7">
            {ITEMS.map((item, i) => (
              <AnimatedListItem
                key={item.name}
                item={item}
                index={i}
                selected={selectedIndex === i}
                onHover={setSelectedIndex}
                onClick={setSelectedIndex}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
