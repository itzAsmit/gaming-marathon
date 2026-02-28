/**
 * Race the direct Supabase query against the same-domain proxy.
 * Whichever resolves successfully first wins.
 *
 * On WiFi the direct call is typically faster; on mobile-carrier
 * networks the proxy often wins because the Supabase domain may
 * be throttled / blocked.  This eliminates the ~5-12 s dead-wait
 * of a sequential fallback approach.
 */

type Resource = "leaderboard" | "players" | "games" | "hall_of_fame" | "rankings" | "admin_players" | "admin_games" | "admin_items" | "admin_hall_of_fame" | "admin_activity_logs" | "admin_players_with_items";

interface SupabaseResult<T> {
  data: T | null;
  error: { message: string } | null;
}

/**
 * Promise.any polyfill-style helper (ES2020 safe).
 * Resolves with the first fulfilled promise; rejects when ALL reject.
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
        if (pending === 0) reject(new Error("All promises rejected"));
      });
    });
  });
}

/* ------------------------------------------------------------------ */

export async function raceDataFetch<T>(
  directFn: () => PromiseLike<SupabaseResult<T>>,
  resource: Resource,
  proxyParams?: Record<string, string>,
): Promise<T> {
  const directPromise = Promise.resolve(directFn()).then((res) => {
    if (res.error) throw new Error(res.error.message);
    if (!res.data) throw new Error("No data returned");
    return res.data;
  });

  const search = new URLSearchParams({ resource, ...(proxyParams ?? {}) });
  const proxyPromise = fetch(`/api/public-data?${search.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  }).then(async (response) => {
    if (!response.ok) throw new Error(`Proxy ${response.status}`);
    const json = (await response.json()) as { data?: T; error?: string };
    if (json.error) throw new Error(json.error);
    if (!json.data) throw new Error("No proxy data");
    return json.data;
  });

  // First successful settlement wins.
  // If BOTH fail, throw a readable error.
  try {
    return await raceAny([directPromise, proxyPromise]);
  } catch {
    throw new Error("Connection issue. Please tap retry.");
  }
}
