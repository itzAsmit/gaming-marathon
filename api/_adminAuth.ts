import { createClient } from "@supabase/supabase-js";

type VerifiedAdmin = {
  accessToken: string;
  user: {
    id: string;
    email?: string;
  };
};

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function parseList(value?: string) {
  return new Set(
    (value ?? "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
}

const allowedEmails = parseList(process.env.ADMIN_EMAILS);
const allowedUserIds = parseList(process.env.ADMIN_USER_IDS);
const allowAnyAuthenticatedAdmin =
  process.env.ALLOW_ANY_AUTHENTICATED_ADMIN === "true" &&
  process.env.NODE_ENV !== "production";

export function getBearerToken(req: any) {
  const authHeader = String(req.headers.authorization ?? "");
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
}

export async function verifyAdminRequest(req: any): Promise<VerifiedAdmin> {
  const accessToken = getBearerToken(req);

  if (!accessToken) {
    const error = new Error("Missing authorization token");
    (error as any).status = 401;
    throw error;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    const error = new Error("Missing Supabase auth environment variables");
    (error as any).status = 500;
    throw error;
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });

  const { data, error } = await authClient.auth.getUser(accessToken);
  const user = data?.user;

  if (error || !user) {
    const authError = new Error("Invalid or expired token");
    (authError as any).status = 401;
    throw authError;
  }

  const hasAllowList = allowedEmails.size > 0 || allowedUserIds.size > 0;
  const email = user.email?.toLowerCase();
  const id = user.id.toLowerCase();

  if (!hasAllowList && !allowAnyAuthenticatedAdmin) {
    const configError = new Error("Admin allowlist is not configured");
    (configError as any).status = 500;
    throw configError;
  }

  if (hasAllowList && !(email && allowedEmails.has(email)) && !allowedUserIds.has(id)) {
    const forbidden = new Error("User is not allowed to access admin");
    (forbidden as any).status = 403;
    throw forbidden;
  }

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
    },
  };
}

export function sendAuthError(res: any, error: unknown) {
  const status = typeof (error as any)?.status === "number" ? (error as any).status : 500;
  const message = error instanceof Error ? error.message : "Authentication failed";
  return res.status(status).json({ error: message });
}
