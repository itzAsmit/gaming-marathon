import { createClient } from "@supabase/supabase-js";

/**
 * Proxy for Supabase Storage uploads.
 * Used on cellular networks where direct Supabase connections are blocked.
 */

const ALLOWED_BUCKETS = ["avatars", "portraits", "game-images", "game-videos", "games-videos", "players", "games", "videos"];

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get user's access token
    const authHeader = String(req.headers.authorization ?? "");
    const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!accessToken) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    if (!supabaseUrl) {
      return res.status(500).json({ error: "Missing Supabase URL" });
    }

    const bucket = String(req.query.bucket ?? "").trim();
    const path = String(req.query.path ?? "").trim();

    if (!bucket || !ALLOWED_BUCKETS.includes(bucket)) {
      return res.status(400).json({ error: "Invalid bucket" });
    }

    if (!path) {
      return res.status(400).json({ error: "Missing path" });
    }

    // Get file from request body (base64 encoded)
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { fileBase64, contentType } = body;

    if (!fileBase64) {
      return res.status(400).json({ error: "Missing file data" });
    }

    // Decode base64 to buffer
    const fileBuffer = Buffer.from(fileBase64, "base64");

    // Use service key if available, otherwise use user's token
    const supabase = supabaseServiceKey
      ? createClient(supabaseUrl, supabaseServiceKey)
      : createClient(supabaseUrl, supabaseAnonKey || accessToken, {
          global: { headers: { Authorization: `Bearer ${accessToken}` } },
        });

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        upsert: true,
        contentType: contentType || "application/octet-stream",
      });

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

    return res.status(200).json({
      publicUrl: urlData.publicUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return res.status(500).json({ error: message });
  }
}
