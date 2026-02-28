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
  const [preferProxyNetwork, setPreferProxyNetwork] = useState(false);

  const directSrc = toMediaSrc(url);
  const proxySrc = toProxiedMediaSrc(url);
  const activeSrc = useProxy ? proxySrc : directSrc;

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const connection = (navigator as any).connection;
    const effectiveType = String(connection?.effectiveType ?? "").toLowerCase();
    const rtt = Number(connection?.rtt ?? 0);
    const downlink = Number(connection?.downlink ?? 0);
    const type = String(connection?.type ?? "").toLowerCase();
    const constrainedNetwork =
      Boolean(connection?.saveData) ||
      effectiveType.includes("2g") ||
      effectiveType.includes("3g") ||
      type === "cellular" ||
      (rtt > 0 && rtt >= 300) ||
      (downlink > 0 && downlink <= 3);

    setPreferProxyNetwork(constrainedNetwork);
  }, []);

  useEffect(() => {
    setLoaded(false);
    const shouldStartProxy = Boolean(proxySrc) && proxyFirstOnMobile && preferProxyNetwork;
    setUseProxy(shouldStartProxy);
  }, [directSrc, proxySrc, proxyFirstOnMobile, preferProxyNetwork]);

  // Arm / disarm the stall-detection timer
  useEffect(() => {
    // Nothing to do if there's no URL or already loaded/proxy
    if (!directSrc || loaded || useProxy) return;

    const effectiveTimeout = preferProxyNetwork ? Math.min(timeoutMs, 900) : timeoutMs;

    timerRef.current = setTimeout(() => {
      if (proxySrc && !loaded) {
        setUseProxy(true);
      }
    }, effectiveTimeout);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [directSrc, proxySrc, loaded, useProxy, timeoutMs, preferProxyNetwork]);

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
