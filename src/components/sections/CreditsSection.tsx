import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import { motion } from "framer-motion";

const CREDITS = [
  {
    role: "ORGANISER",
    name: "Marathon Admin",
    caption: "The mastermind behind the madness",
    emoji: "🏆",
  },
  {
    role: "DEVELOPER",
    name: "Built with Lovable",
    caption: "Crafted with passion & precision",
    emoji: "⚡",
  },
];

export default function CreditsSection() {
  return (
    <section id="credits" className="relative py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <SectionHeader title="CREDITS" accent="THE TEAM" />
        </ScrollReveal>

        <div className="flex flex-col sm:flex-row gap-8 justify-center">
          {CREDITS.map((credit, i) => (
            <ScrollReveal key={credit.role} delay={i * 0.2}>
              <motion.div
                className="glass-card rounded-2xl p-8 text-center flex-1"
                whileHover={{ scale: 1.03, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-5xl mb-4">{credit.emoji}</div>
                <p className="text-xs font-cinzel tracking-[0.4em] mb-3" style={{ color: "hsl(var(--gold))", fontFamily: "Cinzel, serif" }}>
                  {credit.role}
                </p>
                <h3 className="text-xl font-cinzel font-bold mb-2" style={{ color: "hsl(var(--cream))", fontFamily: "Cinzel, serif" }}>
                  {credit.name}
                </h3>
                <p className="text-sm" style={{ color: "hsl(var(--cream-dark) / 0.7)" }}>{credit.caption}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Footer */}
        <ScrollReveal delay={0.4}>
          <div className="mt-16 text-center border-t pt-8" style={{ borderColor: "hsla(var(--gold) / 0.2)" }}>
            <p className="font-cinzel text-xs tracking-[0.5em]" style={{ color: "hsl(var(--gold) / 0.5)", fontFamily: "Cinzel, serif" }}>
              GAMING MARATHON © 2024 — ALL RIGHTS RESERVED
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
