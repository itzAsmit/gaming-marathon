import { CSSProperties, PropsWithChildren, ReactNode, useMemo } from "react";

type GradualBlurProps = PropsWithChildren<{
  position?: "top" | "bottom" | "left" | "right";
  strength?: number;
  height?: string;
  width?: string;
  divCount?: number;
  exponential?: boolean;
  zIndex?: number;
  opacity?: number;
  curve?: "linear" | "bezier" | "ease-in" | "ease-out" | "ease-in-out";
  target?: "parent" | "page";
  className?: string;
  style?: CSSProperties;
}>;

const CURVE_FUNCTIONS: Record<string, (p: number) => number> = {
  linear: (p) => p,
  bezier: (p) => p * p * (3 - 2 * p),
  "ease-in": (p) => p * p,
  "ease-out": (p) => 1 - (1 - p) ** 2,
  "ease-in-out": (p) => (p < 0.5 ? 2 * p * p : 1 - ((-2 * p + 2) ** 2) / 2),
};

function getGradientDirection(position: string): string {
  if (position === "top") return "to top";
  if (position === "left") return "to left";
  if (position === "right") return "to right";
  return "to bottom";
}

export default function GradualBlur({
  position = "bottom",
  strength = 2,
  height = "6rem",
  width,
  divCount = 5,
  exponential = false,
  zIndex = 5,
  opacity = 1,
  curve = "bezier",
  target = "parent",
  className = "",
  style = {},
}: GradualBlurProps) {
  const blurDivs = useMemo(() => {
    const divs: ReactNode[] = [];
    const increment = 100 / divCount;
    const curveFn = CURVE_FUNCTIONS[curve] ?? CURVE_FUNCTIONS.linear;
    const direction = getGradientDirection(position);

    for (let i = 1; i <= divCount; i++) {
      let progress = curveFn(i / divCount);
      const blurValue = exponential
        ? ((2 ** (progress * 4)) * 0.0625 * strength)
        : (0.0625 * (progress * divCount + 1) * strength);

      const p1 = Math.round((increment * i - increment) * 10) / 10;
      const p2 = Math.round(increment * i * 10) / 10;
      const p3 = Math.round((increment * i + increment) * 10) / 10;
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

      let maskGradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) maskGradient += `, black ${p3}%`;
      if (p4 <= 100) maskGradient += `, transparent ${p4}%`;

      const tintAlpha = Math.min(0.42, 0.08 + progress * 0.34);

      divs.push(
        <div
          key={i}
          className="absolute inset-0"
          style={{
            maskImage: `linear-gradient(${direction}, ${maskGradient})`,
            WebkitMaskImage: `linear-gradient(${direction}, ${maskGradient})`,
            backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
            WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
            background: `hsla(0 0% 0% / ${tintAlpha})`,
            opacity,
          }}
        />
      );
    }

    return divs;
  }, [curve, divCount, exponential, opacity, position, strength]);

  const isVertical = position === "top" || position === "bottom";
  const isPageTarget = target === "page";

  const containerStyle: CSSProperties = {
    position: isPageTarget ? "fixed" : "absolute",
    pointerEvents: "none",
    zIndex,
    ...style,
  };

  if (isVertical) {
    containerStyle.height = height;
    containerStyle.width = width || "100%";
    containerStyle.left = 0;
    containerStyle.right = 0;
    containerStyle[position] = 0;
  } else {
    containerStyle.width = width || height;
    containerStyle.height = "100%";
    containerStyle.top = 0;
    containerStyle.bottom = 0;
    containerStyle[position] = 0;
  }

  return (
    <div className={`relative isolate ${className}`} style={containerStyle}>
      <div className="relative w-full h-full">{blurDivs}</div>
    </div>
  );
}
