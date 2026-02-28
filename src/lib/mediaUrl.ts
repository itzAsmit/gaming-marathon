export function toMediaSrc(url?: string | null): string | null {
  if (!url) return null;

  const normalized = url.trim();
  if (!normalized) return null;

  if (normalized.startsWith("/")) return normalized;
  if (normalized.startsWith("data:")) return normalized;
  if (normalized.startsWith("/api/media?")) return normalized;

  const httpsUrl = normalized.replace(/^http:\/\//i, "https://");
  return `/api/media?url=${encodeURIComponent(httpsUrl)}`;
}
