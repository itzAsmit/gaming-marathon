import { supabase } from "@/integrations/supabase/client";

type AllowedBucket = "avatars" | "portraits" | "game-images" | "game-videos" | "games-videos" | "players" | "games" | "videos";

/**
 * Race direct Supabase storage upload against proxy.
 * On WiFi, direct wins. On cellular where Supabase is blocked, proxy wins.
 */
export async function raceUpload(
  bucket: AllowedBucket,
  path: string,
  file: File,
): Promise<string> {
  // Get current session for auth token
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;

  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  // Direct Supabase upload
  const directPromise = (async () => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  })();

  // Proxy upload (convert file to base64)
  const proxyPromise = (async () => {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    const response = await fetch(`/api/admin-upload?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        fileBase64: base64,
        contentType: file.type,
      }),
    });

    const json = await response.json();
    if (!response.ok || json.error) {
      throw new Error(json.error || "Proxy upload failed");
    }
    return json.publicUrl as string;
  })();

  // Race both - first success wins
  return raceAny([directPromise, proxyPromise]);
}

/**
 * Promise.any polyfill (ES2020 safe)
 */
function raceAny<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let pending = promises.length;
    const errors: unknown[] = [];

    if (pending === 0) return reject(new Error("No promises"));

    promises.forEach((p, i) => {
      p.then(resolve).catch((err) => {
        errors[i] = err;
        pending -= 1;
        if (pending === 0) {
          const msg = errors.map(e => e instanceof Error ? e.message : String(e)).join("; ");
          reject(new Error(msg || "All uploads failed"));
        }
      });
    });
  });
}
