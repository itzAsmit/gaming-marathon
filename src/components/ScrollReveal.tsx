import { useRef, ReactNode } from "react";
import { motion, useInView, Variants, useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
}

const variants: Variants = {
  hidden: (direction: string) => ({
    opacity: 0,
    y: direction === "up" ? 60 : 0,
    x: direction === "left" ? -60 : direction === "right" ? 60 : 0,
  }),
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const mobileVariants: Variants = {
    hidden: (dir: string) => ({
      opacity: 0,
      y: dir === "up" ? 24 : 0,
      x: dir === "left" ? -24 : dir === "right" ? 24 : 0,
    }),
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      custom={direction}
      variants={isMobile ? mobileVariants : variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
