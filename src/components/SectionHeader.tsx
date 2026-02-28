import { motion } from "framer-motion";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  accent?: string;
}

export default function SectionHeader({ title, subtitle, accent }: SectionHeaderProps) {
  return (
    <div className="text-center mb-16 relative">
      {accent && (
        <p
          className="text-sm font-cinzel tracking-[0.4em] mb-3"
          style={{ color: "hsl(var(--gold))", fontFamily: "Cinzel, serif" }}
        >
          {accent}
        </p>
      )}
      <h2
        className="text-4xl md:text-6xl font-cinzel font-bold gradient-text-gold mb-4"
        style={{ fontFamily: "Cinzel, serif" }}
      >
        {title}
      </h2>
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="h-px flex-1 max-w-24" style={{ background: "linear-gradient(to right, transparent, hsl(var(--gold)))" }} />
        <div className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--gold))" }} />
        <div className="h-px flex-1 max-w-24" style={{ background: "linear-gradient(to left, transparent, hsl(var(--gold)))" }} />
      </div>
      {subtitle && (
        <p
          className="text-base font-inter tracking-wide"
          style={{ color: "hsl(var(--cream-dark))" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
