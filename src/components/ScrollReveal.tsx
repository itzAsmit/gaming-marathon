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
  hidden: (_direction: string) => ({
    opacity: 0,
  }),
  visible: {
    opacity: 1,
    transition: {
      duration: 0.7,
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
    hidden: (_dir: string) => ({
      opacity: 0,
    }),
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
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
