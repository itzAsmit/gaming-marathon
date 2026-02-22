import { useEffect, useRef, useState } from "react";
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
        className="rounded-2xl p-4 md:p-5 border transition-all duration-300"
        style={{
          background: selected
            ? "linear-gradient(145deg, hsla(var(--cream) / 0.22), hsla(var(--brown) / 0.42))"
            : "linear-gradient(145deg, hsla(var(--cream) / 0.12), hsla(var(--brown) / 0.32))",
          borderColor: selected ? `hsla(${item.color} / 0.65)` : "hsla(var(--cream) / 0.25)",
          boxShadow: selected
            ? `0 0 0 1px hsla(${item.color} / 0.35), 0 14px 34px hsla(${item.color} / 0.25)`
            : "0 10px 24px hsla(var(--brown-deep) / 0.22)",
        }}
      >
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
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    const bottomDistance = node.scrollHeight - (node.scrollTop + node.clientHeight);
    setBottomGradientOpacity(node.scrollHeight <= node.clientHeight ? 0 : Math.min(bottomDistance / 60, 1));
  }, []);

  const handleScroll = () => {
    const node = listRef.current;
    if (!node) return;
    const { scrollTop, scrollHeight, clientHeight } = node;
    setTopGradientOpacity(Math.min(scrollTop / 60, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 60, 1));
  };

  return (
    <section id="items" className="relative min-h-screen py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute -top-16 left-[8%] h-56 w-56 rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -16, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "radial-gradient(circle, hsla(48 85% 78% / 0.35), transparent 70%)" }}
        />
        <motion.div
          className="absolute top-[22%] right-[10%] h-72 w-72 rounded-full blur-3xl"
          animate={{ x: [0, -36, 0], y: [0, 18, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "radial-gradient(circle, hsla(210 75% 78% / 0.27), transparent 72%)" }}
        />
        <motion.div
          className="absolute bottom-[8%] left-[22%] h-64 w-64 rounded-full blur-3xl"
          animate={{ x: [0, 28, 0], y: [0, -24, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "radial-gradient(circle, hsla(32 85% 70% / 0.25), transparent 70%)" }}
        />
      </div>

      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <SectionHeader title="SPECIAL ITEMS" accent="POWER UPS" subtitle="Rare artifacts that can change the course of the game" />
        </ScrollReveal>

        <div className="relative mt-10 max-w-4xl mx-auto">
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="max-h-[520px] overflow-y-auto pr-1 rounded-3xl p-4 md:p-5"
            style={{
              background: "linear-gradient(180deg, hsla(var(--brown-deep) / 0.45), hsla(var(--brown-deep) / 0.58))",
              border: "1px solid hsla(var(--cream) / 0.2)",
              scrollbarWidth: "thin",
              scrollbarColor: "hsla(var(--gold) / 0.45) hsla(var(--brown-deep) / 0.5)",
            }}
          >
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

          <div
            className="absolute top-0 left-0 right-0 h-16 rounded-t-3xl pointer-events-none transition-opacity duration-300"
            style={{
              opacity: topGradientOpacity,
              background: "linear-gradient(to bottom, hsla(var(--brown-deep) / 0.8), transparent)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-24 rounded-b-3xl pointer-events-none transition-opacity duration-300"
            style={{
              opacity: bottomGradientOpacity,
              background: "linear-gradient(to top, hsla(var(--brown-deep) / 0.86), transparent)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
