import { createClient } from "@supabase/supabase-js";

type Resource = "leaderboard" | "players" | "games" | "hall_of_fame" | "rankings" | "admin_players" | "admin_games" | "admin_items" | "admin_hall_of_fame" | "admin_activity_logs" | "admin_players_with_items" | "admin_seasons" | "admin_season_scores";

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const isAllowedResource = (value: string): value is Resource => {
  return ["leaderboard", "players", "games", "hall_of_fame", "rankings", "admin_players", "admin_games", "admin_items", "admin_hall_of_fame", "admin_activity_logs", "admin_players_with_items", "admin_seasons", "admin_season_scores"].includes(value);
};

export default async function handler(req: any, res: any) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ error: "Supabase env vars missing on server" });
    }

    const resourceRaw = String(req.query.resource ?? "").trim();

    if (!isAllowedResource(resourceRaw)) {
      return res.status(400).json({ error: "Invalid resource" });
    }

    // Cache public responses for 30s on CDN. Do not cache admin responses.
    if (!resourceRaw.startsWith("admin_")) {
      res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    } else {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (resourceRaw === "leaderboard") {
      const { data, error } = await supabase
        .from("leaderboard")
        .select("*, players(name, player_id)")
        .order("points", { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data });
    }

    if (resourceRaw === "players") {
      const { data, error } = await supabase
        .from("players")
        .select("*, leaderboard(*), player_proficiencies(*), player_items(*, items(name, description)), player_game_stats(games(game_id))");
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data });
    }

    if (resourceRaw === "games") {
      const { data, error } = await supabase.from("games").select("*").order("game_id");
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data });
    }

    if (resourceRaw === "hall_of_fame") {
      const { data, error } = await supabase
        .from("hall_of_fame")
        .select("*, players(name, player_id, portrait_url)");
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data });
    }

    // Admin-specific queries (simpler selects for admin CRUD pages)
    if (resourceRaw === "admin_players") {
      const { data, error } = await supabase.from("players").select("*").order("player_id");
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data });
    }

    if (resourceRaw === "admin_games") {
      const { data, error } = await supabase.from("games").select("*").order("game_id");
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data });
    }

    if (resourceRaw === "admin_items") {
      const { data, error } = await supabase.from("items").select("*").order("name");
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data });
    }

    if (resourceRaw === "admin_hall_of_fame") {
      const { data, error } = await supabase.from("hall_of_fame").select("*").order("season", { ascending: false }).order("rank", { ascending: true });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data });
    }

    if (resourceRaw === "admin_activity_logs") {
      const { data, error } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data });
    }

    if (resourceRaw === "admin_players_with_items") {
      const { data, error } = await supabase
        .from("players")
        .select("id, name, player_id, is_active, player_items(id, item_id, items(id, name))")
        .eq("is_active", true)
        .order("player_id");
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data });
    }

    if (resourceRaw === "admin_seasons") {
      const { data, error } = await supabase.from("seasons").select("*").order("number");
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data });
    }

    if (resourceRaw === "admin_season_scores") {
      const { data, error } = await supabase.from("season_player_scores").select("*");
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data });
    }

    const gameId = String(req.query.gameId ?? "").trim();
    if (!gameId) return res.status(400).json({ error: "Missing gameId" });

    const { data, error } = await supabase
      .from("player_game_stats")
      .select("rank, points, players(name, player_id)")
      .eq("game_id", gameId)
      .order("rank");

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return res.status(500).json({ error: message });
  }
}
