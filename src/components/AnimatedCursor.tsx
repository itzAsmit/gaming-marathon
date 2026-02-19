"use client";
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const GAMES = ["AMONG US", "BGMI", "SCRIBBL", "CARROM", "CHESS", "UNO", "LUDO", "SMASH KARTS", "STUMBLE GUYS", "BOBBLE LEAGUE", "CODENAMES"];

type CursorVariant = "default" | "hover" | "click";

export default function AnimatedCursor() {
  const isMobile = useIsMobile();
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [visible, setVisible] = useState(false);

  const pos = useRef({ x: 0, y: 0 });
  const followerPos = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (isMobile) return;

    const onMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      setVisible(true);
    };

    const onMouseLeave = () => setVisible(false);
    const onMouseDown = () => setVariant("click");
    const onMouseUp = () => setVariant("default");

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("button") ||
        target.closest("a") ||
        target.getAttribute("role") === "button" ||
        window.getComputedStyle(target).cursor === "pointer"
      ) {
        setVariant("hover");
      } else {
        setVariant("default");
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseover", onMouseOver);

    const animate = () => {
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      followerPos.current.x = lerp(followerPos.current.x, pos.current.x, 0.1);
      followerPos.current.y = lerp(followerPos.current.y, pos.current.y, 0.1);

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x - 6}px, ${pos.current.y - 6}px)`;
      }
      if (followerRef.current) {
        followerRef.current.style.transform = `translate(${followerPos.current.x - 20}px, ${followerPos.current.y - 20}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseover", onMouseOver);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      {/* Main cursor */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none will-change-transform"
        style={{
          width: variant === "click" ? "8px" : "12px",
          height: variant === "click" ? "8px" : "12px",
          backgroundColor: "hsl(var(--cream))",
          borderRadius: "50%",
          boxShadow: "0 0 10px hsl(var(--cream)), 0 0 20px hsla(var(--cream) / 0.5)",
          opacity: visible ? 1 : 0,
          transition: "width 0.2s, height 0.2s, opacity 0.3s, background-color 0.2s",
        }}
      />
      {/* Follower cursor */}
      <div
        ref={followerRef}
        className="fixed top-0 left-0 z-[9998] pointer-events-none will-change-transform"
        style={{
          width: variant === "hover" ? "50px" : "40px",
          height: variant === "hover" ? "50px" : "40px",
          borderRadius: "50%",
          border: `1.5px solid hsl(var(--${variant === "hover" ? "gold" : "cream"}))`,
          boxShadow:
            variant === "hover"
              ? "0 0 15px hsla(var(--gold) / 0.5)"
              : "0 0 15px hsla(var(--cream) / 0.3)",
          opacity: visible ? (variant === "hover" ? 0.9 : 0.5) : 0,
          transition: "width 0.3s ease, height 0.3s ease, opacity 0.3s, border-color 0.3s, box-shadow 0.3s",
          backgroundColor: variant === "hover" ? "hsla(var(--gold) / 0.05)" : "transparent",
        }}
      />
    </>
  );
}
