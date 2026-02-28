function optimizeCloudinaryImage(url: string): string {
  if (!/res\.cloudinary\.com/i.test(url)) return url;
  if (!/\/image\/upload\//i.test(url)) return url;
  if (/\/image\/upload\/(?:[^/]*,)?(?:f_auto|q_auto)/i.test(url)) return url;

  const marker = "/image/upload/";
  const markerIndex = url.indexOf(marker);
  if (markerIndex < 0) return url;

  const head = url.slice(0, markerIndex + marker.length);
  const tail = url.slice(markerIndex + marker.length);
  return `${head}f_auto,q_auto:eco,c_limit,w_900/${tail}`;
}

export function toMediaSrc(url?: string | null): string | null {
  if (!url) return null;

  const normalized = url.trim();
  if (!normalized) return null;

  if (normalized.startsWith("/api/media?")) return normalized;
  if (normalized.startsWith("/")) return normalized;
  if (normalized.startsWith("data:")) return normalized;
  if (normalized.startsWith("//")) return `https:${normalized}`;
  if (/^https?:\/\//i.test(normalized)) {
    return optimizeCloudinaryImage(normalized.replace(/^http:\/\//i, "https://"));
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(normalized)) {
    return optimizeCloudinaryImage(`https://${normalized}`);
  }

  return optimizeCloudinaryImage(normalized);
}

export function toProxiedMediaSrc(url?: string | null): string | null {
  const direct = toMediaSrc(url);
  if (!direct) return null;
  if (direct.startsWith("/")) return direct;
  if (direct.startsWith("data:")) return direct;
  return `/api/media?url=${encodeURIComponent(direct)}`;
}

