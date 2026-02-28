import { useRef, useState, useEffect, type ImgHTMLAttributes } from "react";
import { toMediaSrc, toProxiedMediaSrc } from "@/lib/mediaUrl";

interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  /** Raw media URL (Cloudinary, Supabase storage, etc.) */
  url?: string | null;
  /** Milliseconds before switching from direct → proxy (default 3 000) */
  timeoutMs?: number;
  /** Start with proxy on constrained mobile networks */
  proxyFirstOnMobile?: boolean;
}

/**
 * An `<img>` that automatically falls back to the same-domain media proxy
 * when the direct URL stalls or errors.
 *
 * On mobile carrier networks, external domains (Cloudinary, Supabase storage)
 * often hang silently without firing `onError`.  This component arms a timer
 * and switches to `/api/media?url=…` if the image hasn't loaded in time.
 */
export default function SmartImage({
  url,
  timeoutMs = 3000,
  proxyFirstOnMobile = true,
  onLoad,
  onError,
  ...rest
}: SmartImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [useProxy, setUseProxy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isConstrainedMobile, setIsConstrainedMobile] = useState(false);

  const directSrc = toMediaSrc(url);
  const proxySrc = toProxiedMediaSrc(url);
  const activeSrc = useProxy ? proxySrc : directSrc;

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const connection = (navigator as any).connection;
    const effectiveType = String(connection?.effectiveType ?? "").toLowerCase();
    const constrained =
      Boolean(connection?.saveData) ||
      effectiveType.includes("2g") ||
      effectiveType.includes("3g") ||
      effectiveType.includes("4g");
    setIsConstrainedMobile(isMobileDevice && constrained);
  }, []);

  useEffect(() => {
    setLoaded(false);
    const shouldStartProxy = Boolean(proxySrc) && proxyFirstOnMobile && isConstrainedMobile;
    setUseProxy(shouldStartProxy);
  }, [directSrc, proxySrc, proxyFirstOnMobile, isConstrainedMobile]);

  // Arm / disarm the stall-detection timer
  useEffect(() => {
    // Nothing to do if there's no URL or already loaded/proxy
    if (!directSrc || loaded || useProxy) return;

    const effectiveTimeout = isConstrainedMobile ? Math.min(timeoutMs, 1500) : timeoutMs;

    timerRef.current = setTimeout(() => {
      if (proxySrc && !loaded) {
        setUseProxy(true);
      }
    }, effectiveTimeout);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [directSrc, proxySrc, loaded, useProxy, timeoutMs, isConstrainedMobile]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setLoaded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // If direct failed, try proxy
    if (!useProxy && proxySrc) {
      setUseProxy(true);
      return;
    }

    // Proxy also failed — bubble up
    onError?.(e);
  };

  if (!activeSrc) return null;

  return (
    <img
      ref={imgRef}
      src={activeSrc}
      onLoad={handleLoad}
      onError={handleError}
      {...rest}
    />
  );
}
