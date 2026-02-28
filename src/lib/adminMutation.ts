import { supabase } from "@/integrations/supabase/client";
import { getAccessToken } from "@/lib/authToken";

type AllowedTable = "players" | "games" | "items" | "hall_of_fame" | "leaderboard" | "player_proficiencies" | "player_items" | "player_game_stats" | "activity_logs";
type Operation = "insert" | "update" | "delete" | "upsert";

/**
 * Race direct Supabase mutation against proxy.
 * On WiFi, direct wins. On cellular where Supabase is blocked, proxy wins.
 */
export async function raceMutation<T = any>(
  table: AllowedTable,
  operation: Operation,
  options: {
    data?: any;
    filters?: Record<string, any>;
  },
): Promise<T[]> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  // Direct Supabase mutation
  const directPromise = (async () => {
    let result: { data: any; error: any };

    switch (operation) {
      case "insert":
        result = await supabase.from(table).insert(options.data).select();
        break;
      case "update": {
        let q: any = supabase.from(table).update(options.data);
        for (const [k, v] of Object.entries(options.filters ?? {})) {
          q = q.eq(k, v);
        }
        result = await q.select();
        break;
      }
      case "delete": {
        let q: any = supabase.from(table).delete();
        for (const [k, v] of Object.entries(options.filters ?? {})) {
          q = q.eq(k, v);
        }
        result = await q.select();
        break;
      }
      case "upsert":
        result = await supabase.from(table).upsert(options.data).select();
        break;
      default:
        throw new Error("Invalid operation");
    }

    if (result.error) throw new Error(result.error.message);
    return result.data as T[];
  })();

  // Proxy mutation
  const proxyPromise = (async () => {
    const response = await fetch("/api/admin-mutation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        table,
        operation,
        data: options.data,
        filters: options.filters,
      }),
    });

    const json = await response.json();
    if (!response.ok || json.error) {
      throw new Error(json.error || "Proxy mutation failed");
    }
    return json.data as T[];
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
          reject(new Error(msg || "All mutations failed"));
        }
      });
    });
  });
}

/**
 * Simpler helper for common operations
 */
export const adminMutation = {
  insert: <T = any>(table: AllowedTable, data: any) =>
    raceMutation<T>(table, "insert", { data }),

  update: <T = any>(table: AllowedTable, data: any, filters: Record<string, any>) =>
    raceMutation<T>(table, "update", { data, filters }),

  delete: <T = any>(table: AllowedTable, filters: Record<string, any>) =>
    raceMutation<T>(table, "delete", { filters }),

  upsert: <T = any>(table: AllowedTable, data: any) =>
    raceMutation<T>(table, "upsert", { data }),
};
