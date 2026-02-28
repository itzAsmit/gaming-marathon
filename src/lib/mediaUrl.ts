export function toMediaSrc(url?: string | null): string | null {
  if (!url) return null;

  const normalized = url.trim();
  if (!normalized) return null;

  if (normalized.startsWith("/")) return normalized;
  if (normalized.startsWith("data:")) return normalized;
  if (normalized.startsWith("/api/media?")) return normalized;

  return normalized.replace(/^http:\/\//i, "https://");
}

export function toProxiedMediaSrc(url?: string | null): string | null {
  const direct = toMediaSrc(url);
  if (!direct) return null;
  if (direct.startsWith("/")) return direct;
  if (direct.startsWith("data:")) return direct;
  return `/api/media?url=${encodeURIComponent(direct)}`;
}

