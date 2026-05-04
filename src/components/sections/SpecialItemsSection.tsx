import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import FeatureGrid, { FeatureItem } from "@/components/ui/feature-grid-enterprise-grade";
import { Flag, Shield, ShieldCheck, Swords, Ticket, WandSparkles } from "lucide-react";

const ITEMS: FeatureItem[] = [
  {
    id: "dagger",
    icon: Swords,
    title: "Dagger",
    description: "Deducts 20 points from any player at any point in the marathon. Ownership stays secret (except to the holder) and is announced only when assigned and used.",
  },
  {
    id: "shield",
    icon: Shield,
    title: "Shield",
    description: "Protects you from any deduction threat.",
  },
  {
    id: "mirror",
    icon: WandSparkles,
    title: "Mirror",
    description: "Use before a game starts and choose one player. After the game, you receive exactly the same points as that player, regardless of your own performance.",
  },
  {
    id: "red-flag",
    icon: Flag,
    title: "Red Flag",
    description: "Either deduct 5 points from any player or stop a player from participating in one specific game. Can also be exchanged for 7 points. (Not usable in Skribbl and Among Us.)",
  },
  {
    id: "visa",
    icon: Ticket,
    title: "VISA",
    description: "Skip any game and secure the points of 3rd place for that game.",
  },
  {
    id: "immunity-seal",
    icon: ShieldCheck,
    title: "Immunity Seal",
    description: "Locks your leaderboard position for that game. Your points do not increase, but players below you cannot overtake your rank even if they earn more.",
  },
];

export default function SpecialItemsSection() {
  return (
    <section id="items" className="relative min-h-[100svh] md:min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <SectionHeader title="SPECIAL ITEMS" accent="POWER UPS" subtitle="Rare artifacts that can change the course of the game" />
        </ScrollReveal>

        <div className="relative mt-10 max-w-6xl mx-auto px-2 md:px-6">
          <FeatureGrid
            features={ITEMS}
            sectionTitle="Special Items"
            sectionSubtitle="Use these powers to shift momentum, lock ranks, and change the outcome of the marathon."
            className="py-0 bg-transparent"
          />
        </div>
      </div>
    </section>
  );
}
