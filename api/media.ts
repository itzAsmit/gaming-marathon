export default async function handler(req: any, res: any) {
  try {
    const rawUrl = String(req.query.url ?? "").trim();
    if (!rawUrl) {
      return res.status(400).json({ error: "Missing url" });
    }

    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") {
      return res.status(400).json({ error: "Only https media URLs are allowed" });
    }

    const response = await fetch(parsed.toString(), {
      headers: {
        "User-Agent": "gaming-marathon-media-proxy",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Upstream media fetch failed (${response.status})` });
    }

    const contentType = response.headers.get("content-type") ?? "application/octet-stream";
    const cacheControl = response.headers.get("cache-control") ?? "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";
    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", cacheControl);
    return res.status(200).send(buffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return res.status(500).json({ error: message });
  }
}
