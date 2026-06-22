import { withTimeout } from "@/lib/withTimeout";
import { getAccessToken } from "@/lib/authToken";

type Resource = "leaderboard" | "players" | "games" | "hall_of_fame" | "rankings" | "seasons" | "admin_players" | "admin_games" | "admin_items" | "admin_hall_of_fame" | "admin_activity_logs" | "admin_players_with_items" | "admin_seasons" | "admin_season_scores";

export async function fetchPublicData<T>(resource: Resource, params?: Record<string, string>) {
  const search = new URLSearchParams({ resource, ...(params ?? {}) });
  const accessToken = resource.startsWith("admin_") ? await getAccessToken() : null;
  const response = await withTimeout(
    fetch(`/api/public-data?${search.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
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
