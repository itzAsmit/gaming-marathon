"use client";

import React, { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, animate, type PanInfo } from "framer-motion";
import { Check, Loader2, SendHorizontal, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";

type SlideButtonStatus = "idle" | "loading" | "success" | "error";

type SlideButtonProps = ButtonProps & {
  status?: SlideButtonStatus;
  onSlideComplete?: () => void;
  label?: string;
  completedLabel?: string;
  resetSignal?: number;
};

const DRAG_TRIGGER = 0.85;
const HANDLE_SIZE = 40;
const TRACK_PADDING = 4;

function StatusIcon({ status }: { status: SlideButtonStatus }) {
  const iconMap = useMemo(
    () => ({
      loading: <Loader2 className="animate-spin" size={18} />,
      success: <Check size={18} />,
      error: <X size={18} />,
      idle: <SendHorizontal size={18} />,
    }),
    []
  );

  return <>{iconMap[status]}</>;
}

const SlideButton = forwardRef<HTMLButtonElement, SlideButtonProps>(
  ({ className, status = "idle", onSlideComplete, label = "SLIDE TO ENTER ARENA", completedLabel = "AUTHENTICATING...", disabled, resetSignal, ...props }, ref) => {
    const trackRef = useRef<HTMLDivElement | null>(null);
    const [trackWidth, setTrackWidth] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const dragX = useMotionValue(0);
    const maxDrag = Math.max(0, trackWidth - HANDLE_SIZE - TRACK_PADDING * 2);
    const dragProgress = useTransform(dragX, [0, maxDrag || 1], [0, 1]);

    useEffect(() => {
      const el = trackRef.current;
      if (!el) return;

      const updateWidth = () => setTrackWidth(el.getBoundingClientRect().width);
      updateWidth();

      const observer = new ResizeObserver(updateWidth);
      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    const handleDragStart = useCallback(() => {
      if (completed || disabled) return;
      setIsDragging(true);
    }, [completed, disabled]);

    const resetDrag = useCallback(() => {
      animate(dragX, 0, { type: "spring", stiffness: 420, damping: 36, mass: 0.8 });
      setIsDragging(false);
    }, [dragX]);

    const handleDragEnd = useCallback(() => {
      if (completed || disabled) return;
      setIsDragging(false);

      if (maxDrag > 0 && dragProgress.get() >= DRAG_TRIGGER) {
        setCompleted(true);
        onSlideComplete?.();
        return;
      }

      resetDrag();
    }, [completed, disabled, dragProgress, maxDrag, onSlideComplete, resetDrag]);

    const trackFillWidth = useTransform(dragX, (x) => Math.min(x + HANDLE_SIZE, maxDrag + HANDLE_SIZE));

    useLayoutEffect(() => {
      if (status === "error") {
        setCompleted(false);
        resetDrag();
      }
    }, [resetDrag, status]);

    useLayoutEffect(() => {
      if (resetSignal) {
        setCompleted(false);
        resetDrag();
      }
    }, [resetDrag, resetSignal]);

    return (
      <motion.div
        ref={trackRef}
        animate={{ width: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 40, mass: 0.8 }}
        className={cn(
          "relative flex h-12 w-full items-center justify-center overflow-hidden rounded-full bg-white shadow-inner ring-1 ring-black/10",
          className
        )}
      >
        {!completed && (
          <motion.div
            style={{ width: trackFillWidth }}
            className="absolute inset-y-1 left-1 rounded-full bg-black"
          />
        )}

        {!completed && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-14 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white mix-blend-difference z-20">
            {label}
          </div>
        )}

        {!completed && (
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: maxDrag }}
            dragElastic={0.05}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{ x: dragX }}
            className="absolute left-1 top-1 z-10 flex h-10 w-10 cursor-grab items-center justify-center rounded-full bg-black text-white shadow-lg active:cursor-grabbing"
          >
            <Button
              ref={ref}
              type="button"
              variant="secondary"
              size="icon"
              disabled={disabled || status === "loading"}
              className={cn(
                "h-10 w-10 rounded-full bg-black text-white hover:bg-black/90",
                isDragging && "scale-105 transition-transform"
              )}
              {...props}
            >
              <SendHorizontal className="size-4" />
            </Button>
          </motion.div>
        )}

        <AnimatePresence>
          {completed && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Button
                ref={ref}
                type="button"
                disabled={disabled || status === "loading"}
                variant="default"
                className="size-full rounded-full text-white transition-all duration-300"
                {...props}
              >
                <span className="inline-flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.35em]">
                  <StatusIcon status={status} />
                  {status === "loading" ? completedLabel : label}
                </span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

SlideButton.displayName = "SlideButton";

export default SlideButton;