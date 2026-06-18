import { createClient } from "@supabase/supabase-js";

type AnalyticsRow = {
  property_id: string | null;
  category: string | null;
  intent: string | null;
  guest_message: string | null;
  detected_restaurants: string[] | null;
  detected_activities: string[] | null;
  detected_entities: string[] | null;
  created_at: string | null;
};

type PropertyOption = {
  id: string;
  slug: string | null;
  name: string | null;
  address: string | null;
};

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

function isAuthorized(req: Request) {
  const expected = process.env.STATS_ACCESS_TOKEN;

  if (!expected) {
    return true;
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const authorization = req.headers.get("authorization");

  return token === expected || authorization === `Bearer ${expected}`;
}

function increment(map: Map<string, number>, key: string | null | undefined) {
  const normalized = key?.trim() || "Unknown";
  map.set(normalized, (map.get(normalized) ?? 0) + 1);
}

function topEntries(map: Map<string, number>, limit = 10) {
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

function recentQuestions(
  rows: AnalyticsRow[],
  predicate: (row: AnalyticsRow) => boolean,
  limit = 8
) {
  return rows
    .filter(predicate)
    .slice(0, limit)
    .map((row) => ({
      question: row.guest_message,
      category: row.category,
      intent: row.intent,
      createdAt: row.created_at,
    }));
}

function buildStats(rows: AnalyticsRow[], days: number) {
  const categories = new Map<string, number>();
  const intents = new Map<string, number>();
  const restaurants = new Map<string, number>();
  const restaurantIntents = new Map<string, number>();
  const activities = new Map<string, number>();
  const activityIntents = new Map<string, number>();
  const otherCategories = new Map<string, number>();
  const entities = new Map<string, number>();

  for (const row of rows) {
    increment(categories, row.category);
    increment(intents, row.intent);

    for (const entity of row.detected_entities ?? []) {
      increment(entities, entity);
    }

    if (row.category === "restaurants") {
      increment(restaurantIntents, row.intent);
      for (const restaurant of row.detected_restaurants ?? []) {
        increment(restaurants, restaurant);
      }
    } else if (row.category === "activities") {
      increment(activityIntents, row.intent);
      for (const activity of row.detected_activities ?? []) {
        increment(activities, activity);
      }
    } else {
      increment(otherCategories, row.category);
    }
  }

  const restaurantRows = rows.filter((row) => row.category === "restaurants");
  const activityRows = rows.filter((row) => row.category === "activities");

  return {
    range: {
      days,
      from: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
    },
    total: rows.length,
    categories: topEntries(categories),
    intents: topEntries(intents),
    topEntities: topEntries(entities),
    restaurants: {
      total: restaurantRows.length,
      topRestaurants: topEntries(restaurants),
      topIntents: topEntries(restaurantIntents),
      recentQuestions: recentQuestions(
        rows,
        (row) => row.category === "restaurants"
      ),
    },
    activities: {
      total: activityRows.length,
      topActivities: topEntries(activities),
      topIntents: topEntries(activityIntents),
      recentQuestions: recentQuestions(
        rows,
        (row) => row.category === "activities"
      ),
    },
    otherQuestions: {
      total: rows.length - restaurantRows.length - activityRows.length,
      topCategories: topEntries(otherCategories),
      recentQuestions: recentQuestions(
        rows,
        (row) => row.category !== "restaurants" && row.category !== "activities"
      ),
    },
    recentQuestions: recentQuestions(rows, () => true, 12),
  };
}

async function getPropertyBySlugOrId(
  supabase: ReturnType<typeof getSupabase>,
  propertySlug: string | null,
  propertyId: string | null
) {
  if (!propertySlug && !propertyId) {
    return null;
  }

  const query = supabase
    .from("properties")
    .select("id, slug, name, address")
    .limit(1);

  const { data, error } = propertySlug
    ? await query.eq("slug", propertySlug).maybeSingle()
    : await query.eq("id", propertyId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as PropertyOption | null;
}

async function getPropertyOptions(supabase: ReturnType<typeof getSupabase>) {
  const { data, error } = await supabase
    .from("properties")
    .select("id, slug, name, address")
    .order("name", { ascending: true })
    .limit(500);

  if (error) {
    if (error.message.includes("Could not find the table")) {
      return [];
    }

    throw new Error(error.message);
  }

  return (data ?? []) as PropertyOption[];
}

function addPropertyCounts(
  properties: PropertyOption[],
  rows: AnalyticsRow[]
) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    if (row.property_id) {
      counts.set(row.property_id, (counts.get(row.property_id) ?? 0) + 1);
    }
  }

  return properties.map((property) => ({
    ...property,
    count: counts.get(property.id) ?? 0,
  }));
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const daysParam = Number(url.searchParams.get("days") ?? "30");
    const days = Number.isFinite(daysParam)
      ? Math.min(Math.max(Math.round(daysParam), 1), 365)
      : 30;
    const since = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000
    ).toISOString();
    const supabase = getSupabase();
    const propertySlug = url.searchParams.get("propertySlug");
    const propertyId = url.searchParams.get("propertyId");
    const property = await getPropertyBySlugOrId(
      supabase,
      propertySlug,
      propertyId
    );

    if ((propertySlug || propertyId) && !property) {
      return Response.json({ error: "Property not found." }, { status: 404 });
    }

    const query = supabase
      .from("query_analytics")
      .select(
        "property_id, category, intent, guest_message, detected_restaurants, detected_activities, detected_entities, created_at"
      )
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(2000);
    const { data, error } = property
      ? await query.eq("property_id", property.id)
      : await query;

    if (error) {
      throw new Error(error.message);
    }

    const rows = (data ?? []) as AnalyticsRow[];
    const stats = buildStats(rows, days);
    const properties = property ? [] : addPropertyCounts(await getPropertyOptions(supabase), rows);

    return Response.json({
      ...stats,
      property,
      properties,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected stats route error.";
    console.error(message);

    return Response.json({ error: message }, { status: 500 });
  }
}
