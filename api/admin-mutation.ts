import { createClient } from "@supabase/supabase-js";
import { sendAuthError, verifyAdminRequest } from "./_adminAuth";

/**
 * Authenticated proxy for admin write operations (insert, update, delete).
 * Used on cellular networks where direct Supabase connections are blocked.
 */

type AllowedTable = "players" | "games" | "items" | "hall_of_fame" | "leaderboard" | "player_proficiencies" | "player_items" | "player_game_stats" | "activity_logs" | "seasons" | "season_player_scores";
type Operation = "insert" | "update" | "delete" | "upsert";

const ALLOWED_TABLES: AllowedTable[] = [
  "players", "games", "items", "hall_of_fame", "leaderboard",
  "player_proficiencies", "player_items", "player_game_stats", "activity_logs",
  "seasons", "season_player_scores"
];

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { accessToken } = await verifyAdminRequest(req);

    if (!supabaseUrl) {
      return res.status(500).json({ error: "Missing Supabase URL" });
    }

    // Parse request body
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body ?? {});
    const { table, operation, data, filters } = body as {
      table?: string;
      operation?: string;
      data?: any;
      filters?: Record<string, any>;
    };

    // Validate table
    if (!table || !ALLOWED_TABLES.includes(table as AllowedTable)) {
      return res.status(400).json({ error: "Invalid or missing table" });
    }

    // Validate operation
    if (!operation || !["insert", "update", "delete", "upsert"].includes(operation)) {
      return res.status(400).json({ error: "Invalid operation" });
    }

    if (!supabaseServiceKey && !supabaseAnonKey) {
      return res.status(500).json({ error: "Missing Supabase anon key" });
    }

    // Use service role only after the bearer token has been verified above.
    const supabase = supabaseServiceKey
      ? createClient(supabaseUrl, supabaseServiceKey)
      : createClient(supabaseUrl, supabaseAnonKey as string, {
          global: { headers: { Authorization: `Bearer ${accessToken}` } },
        });

    let result: { data: any; error: any };

    switch (operation as Operation) {
      case "insert":
        if (!data) return res.status(400).json({ error: "Missing data for insert" });
        result = await supabase.from(table).insert(data).select();
        break;

      case "update":
        if (!data || !filters) return res.status(400).json({ error: "Missing data or filters for update" });
        let updateQuery = supabase.from(table).update(data);
        for (const [key, value] of Object.entries(filters)) {
          updateQuery = updateQuery.eq(key, value);
        }
        result = await updateQuery.select();
        break;

      case "delete":
        if (!filters) return res.status(400).json({ error: "Missing filters for delete" });
        let deleteQuery = supabase.from(table).delete();
        for (const [key, value] of Object.entries(filters)) {
          deleteQuery = deleteQuery.eq(key, value);
        }
        result = await deleteQuery.select();
        break;

      case "upsert":
        if (!data) return res.status(400).json({ error: "Missing data for upsert" });
        result = await supabase.from(table).upsert(data).select();
        break;

      default:
        return res.status(400).json({ error: "Invalid operation" });
    }

    if (result.error) {
      return res.status(500).json({ error: result.error.message });
    }

    return res.status(200).json({ data: result.data });
  } catch (error) {
    if ([401, 403].includes(Number((error as any)?.status))) {
      return sendAuthError(res, error);
    }
    const message = error instanceof Error ? error.message : "Mutation failed";
    return res.status(500).json({ error: message });
  }
}
