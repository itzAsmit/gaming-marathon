import { useRef, useState, useEffect, type ReactNode } from "react";

interface LazyMountProps {
  /** Extra pixels beyond the viewport to trigger mount early */
  rootMargin?: string;
  /** Fallback shown before the section mounts */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Defers mounting its children until the placeholder scrolls within
 * `rootMargin` of the viewport.  Once mounted, stays mounted forever.
 *
 * This prevents below-the-fold sections from issuing network requests
 * when the page first loads, which is critical on slow mobile networks.
 */
export default function LazyMount({
  rootMargin = "400px",
  fallback,
  children,
}: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If IntersectionObserver isn't available, mount immediately
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  if (visible) return <>{children}</>;

  return (
    <div ref={ref} style={{ minHeight: "50vh" }}>
      {fallback ?? null}
    </div>
  );
}
