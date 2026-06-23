import { createClient } from "@supabase/supabase-js";
import { syncGuestyReservations } from "@/lib/guesty";

export const runtime = "nodejs";

function getEnv(name: string, fallback?: string) {
  return process.env[name] || (fallback ? process.env[fallback] : undefined);
}

function getSupabase() {
  const url = getEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
  const key =
    getEnv("SUPABASE_SERVICE_ROLE_KEY") ||
    getEnv("SUPABASE_SERVICE_KEY") ||
    getEnv("SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url || !key) {
    throw new Error("Missing Supabase env vars.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim() || null;
}

function isAuthorized(request: Request) {
  const expected = process.env.GUESTY_SYNC_TOKEN;

  if (!expected) {
    return false;
  }

  const url = new URL(request.url);
  const provided =
    getBearerToken(request) || url.searchParams.get("token") || null;

  return provided === expected;
}

function isDryRun(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get("dryRun") === "true";
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const result = await syncGuestyReservations(getSupabase(), request.url, {
      dryRun: isDryRun(request),
    });

    return Response.json({ success: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Guesty sync failed.";
    console.error(message);

    return Response.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
