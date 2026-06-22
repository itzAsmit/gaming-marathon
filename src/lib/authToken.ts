import { supabase } from "@/integrations/supabase/client";

type StoredSessionLike = {
  access_token?: string;
  currentSession?: {
    access_token?: string;
  };
};

function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("sb-") || !key.endsWith("-auth-token")) continue;

      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        const parsed = JSON.parse(raw) as StoredSessionLike | StoredSessionLike[];

        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item?.access_token) return item.access_token;
            if (item?.currentSession?.access_token) return item.currentSession.access_token;
          }
          continue;
        }

        if (parsed?.access_token) return parsed.access_token;
        if (parsed?.currentSession?.access_token) return parsed.currentSession.access_token;
      } catch {
        // ignore malformed storage entries
      }
    }
  } catch {
    // localStorage might be unavailable
  }

  return null;
}

export async function getAccessToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) return token;
  } catch {
    // fallback to storage parsing
  }

  return getStoredAccessToken();
}

export function hasStoredAccessToken(): boolean {
  return Boolean(getStoredAccessToken());
}

export async function getAdminSessionStatus(): Promise<{ ok: boolean; error?: string }> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: "Missing authorization token" };

  try {
    const response = await fetch("/api/admin-session", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (response.ok) return { ok: true };

    const json = (await response.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: json.error || `Admin verification failed (${response.status})` };
  } catch {
    return { ok: false, error: "Admin verification request failed" };
  }
}

export async function verifyAdminSession(): Promise<boolean> {
  const status = await getAdminSessionStatus();
  return status.ok;
}
