import { motion } from "framer-motion";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  accent?: string;
}

export default function SectionHeader({ title, subtitle, accent }: SectionHeaderProps) {
  return (
    <div className="text-center mb-14 relative">
      {accent && (
        <p
          className="text-[0.62rem] sm:text-xs tracking-[0.5em] mb-4 uppercase"
          style={{ color: "hsl(var(--cream-dark))", fontFamily: "Orbitron, sans-serif" }}
        >
          {accent}
        </p>
      )}
      <h2
        className="text-3xl sm:text-5xl md:text-6xl font-semibold text-white uppercase tracking-[0.28em] pl-[0.28em] mb-4"
        style={{ fontFamily: "Orbitron, sans-serif" }}
      >
        {title}
      </h2>
      <div className="flex items-center justify-center gap-3 mb-5">
        <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
        <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>
      {subtitle && (
        <p
          className="text-sm sm:text-base tracking-wide max-w-2xl mx-auto"
          style={{ color: "hsl(var(--cream-dark))", fontFamily: "Rajdhani, sans-serif" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
