import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import FeatureGrid, { FeatureItem } from "@/components/ui/feature-grid-enterprise-grade";
import {
  Flag,
  Shield,
  ShieldCheck,
  Swords,
  Ticket,
  WandSparkles,
  Dices,
  Hourglass,
  Briefcase,
  Target,
  Coins,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Flame,
  Scale,
  Snowflake,
} from "lucide-react";

const ITEMS: FeatureItem[] = [
  {
    id: "red-flag",
    icon: Flag,
    title: "Red Flag",
    description: "Use on a player to prevent them from playing a particular game, or exchange it for 7 points. (Cannot be used in Skribbl or Among Us.)",
  },
  {
    id: "dagger",
    icon: Swords,
    title: "Dagger",
    description: "Deducts 20 points from any player (including the Host) at any time. Ownership is secret until used, and Host cannot acquire it.",
  },
  {
    id: "visa",
    icon: Ticket,
    title: "VISA",
    description: "Skip any game and secure the equivalent points of 3rd place for that game.",
  },
  {
    id: "shield",
    icon: Shield,
    title: "Shield",
    description: "Protects you from any form of point deduction or threat.",
  },
  {
    id: "mirror",
    icon: WandSparkles,
    title: "Mirror",
    description: "Choose a player before a game starts. You receive the exact same number of points they earn, regardless of your performance.",
  },
  {
    id: "immunity-seal",
    icon: ShieldCheck,
    title: "Immunity Seal",
    description: "Freeze your points for a game. The player below you on the leaderboard cannot surpass your overall points, locking your position.",
  },
  {
    id: "double-or-nothing",
    icon: Dices,
    title: "Double or Nothing",
    description: "Spin a Wheel of Luck to double your points or reset them to 0. Can only be used during the first five games.",
  },
  {
    id: "time-capsule",
    icon: Hourglass,
    title: "Time Capsule",
    description: "Rewind points of any two players after an event, keeping their scores unchanged even if they scored high in that event.",
  },
  {
    id: "insurance",
    icon: Briefcase,
    title: "Insurance",
    description: "Avoid penalties for a particular event. Can be used up to twice.",
  },
  {
    id: "bounty",
    icon: Target,
    title: "Bounty",
    description: "Bet on a player to finish on top. Earn +10 points if they succeed.",
  },
  {
    id: "jackpot-chip",
    icon: Coins,
    title: "Jackpot Chip",
    description: "Spin a Wheel of Luck with your name on it three times. Gain +15 points if your name is drawn.",
  },
  {
    id: "ladder",
    icon: TrendingUp,
    title: "Ladder",
    description: "Immediately move up 2 positions on the leaderboard.",
  },
  {
    id: "pitfall",
    icon: TrendingDown,
    title: "Pitfall",
    description: "Immediately pull a player directly below you down by 1 position.",
  },
  {
    id: "trade-licence",
    icon: RefreshCw,
    title: "Trade License",
    description: "Trade 5 of your points to take any item from another player.",
  },
  {
    id: "market-crash",
    icon: Flame,
    title: "Market Crash",
    description: "Deducts 15 points immediately from the 3 players directly above you on the leaderboard.",
  },
  {
    id: "equilibrium",
    icon: Scale,
    title: "Equilibrium",
    description: "Average your points with the player directly above you, splitting the difference equally between both.",
  },
  {
    id: "ice-cream",
    icon: Snowflake,
    title: "Ice Cream",
    description: "Freeze points for an event (no gain/loss). If you choose not to play, you suffer a -7 point penalty instead.",
  },
];

export default function SpecialItemsSection() {
  return (
    <section id="items" className="relative min-h-[100svh] md:min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <SectionHeader title="SPECIAL ITEMS" accent="POWER UPS" subtitle="Rare artifacts that can change the course of the game" />
        </ScrollReveal>

        <div className="relative mt-6 max-w-6xl mx-auto px-2 md:px-6">
          <FeatureGrid
            features={ITEMS}
            className="py-0 bg-transparent"
          />
        </div>
      </div>
    </section>
  );
}
