export function toMediaSrc(url?: string | null): string | null {
  if (!url) return null;

  const normalized = url.trim();
  if (!normalized) return null;

  if (normalized.startsWith("/api/media?")) return normalized;
  if (normalized.startsWith("/")) return normalized;
  if (normalized.startsWith("data:")) return normalized;
  if (normalized.startsWith("//")) return `https:${normalized}`;
  if (/^https?:\/\//i.test(normalized)) {
    return normalized.replace(/^http:\/\//i, "https://");
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(normalized)) {
    return `https://${normalized}`;
  }

  return normalized;
}

export function toProxiedMediaSrc(url?: string | null): string | null {
  const direct = toMediaSrc(url);
  if (!direct) return null;
  if (direct.startsWith("/")) return direct;
  if (direct.startsWith("data:")) return direct;
  return `/api/media?url=${encodeURIComponent(direct)}`;
}

