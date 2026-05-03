import { withTimeout } from "@/lib/withTimeout";

type Resource = "leaderboard" | "players" | "games" | "hall_of_fame" | "rankings" | "admin_players" | "admin_games" | "admin_items" | "admin_hall_of_fame" | "admin_activity_logs" | "admin_players_with_items";

export async function fetchPublicData<T>(resource: Resource, params?: Record<string, string>) {
  const search = new URLSearchParams({ resource, ...(params ?? {}) });
  const response = await withTimeout(
    fetch(`/api/public-data?${search.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    }),
    12000,
    "Public API proxy timed out",
  );

  if (!response.ok) {
    throw new Error(`Proxy request failed (${response.status})`);
  }

  const json = (await response.json()) as { data?: T; error?: string };
  if (json.error) throw new Error(json.error);
  return json.data as T;
}
