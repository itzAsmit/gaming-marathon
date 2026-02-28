export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ error: "Supabase environment variables are missing" });
    }

    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          apikey: supabaseAnonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = typeof json?.msg === "string"
          ? json.msg
          : typeof json?.error_description === "string"
            ? json.error_description
            : typeof json?.error === "string"
              ? json.error
              : "Authentication failed";
        return res.status(response.status).json({ error: message });
      }

      const accessToken = json?.access_token;
      const refreshToken = json?.refresh_token;

      if (!accessToken || !refreshToken) {
        return res.status(502).json({ error: "Invalid auth response" });
      }

      return res.status(200).json({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login request failed";
    return res.status(500).json({ error: message });
  }
}
