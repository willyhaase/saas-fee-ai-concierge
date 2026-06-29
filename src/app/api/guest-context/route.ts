import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";

type GuestContextResponse = {
  propertyId: string | null;
  propertySlug: string | null;
  propertyName: string | null;
  propertyType: string | null;
  localAccessGranted: boolean;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  checkIn: string | null;
  checkOut: string | null;
  guestyReservationId: string | null;
};

export const runtime = "nodejs";

function getEnv(name: string, fallback?: string) {
  return process.env[name] || (fallback ? process.env[fallback] : undefined);
}

function getSupabase() {
  const url = getEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
  const key =
    getEnv("SUPABASE_SERVICE_ROLE_KEY") || getEnv("SUPABASE_SERVICE_KEY");

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function asOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function hashAccessToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function resolvePropertyId(
  requestedPropertyId: string | null,
  requestedPropertySlug: string | null,
  guestAccessToken: string | null
) {
  const supabase = getSupabase();

  if (!guestAccessToken) {
    return {
      propertyId: null,
      localAccessGranted: false,
      guestName: null,
      guestEmail: null,
      guestPhone: null,
      checkIn: null,
      checkOut: null,
      guestyReservationId: null,
    };
  }

  const tokenHash = hashAccessToken(guestAccessToken);
  const { data, error } = await supabase
    .from("guest_property_access")
    .select(
      "property_id, active, valid_from, valid_until, guest_name, guest_email, guest_phone, guesty_reservation_id, metadata"
    )
    .eq("access_token_hash", tokenHash)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return {
      propertyId: null,
      localAccessGranted: false,
      guestName: null,
      guestEmail: null,
      guestPhone: null,
      checkIn: null,
      checkOut: null,
      guestyReservationId: null,
    };
  }

  const access = data as Record<string, unknown>;
  const now = Date.now();
  const validFrom = asOptionalString(access.valid_from);
  const validUntil = asOptionalString(access.valid_until);
  const startsOk = !validFrom || Date.parse(validFrom) <= now;
  const endsOk = !validUntil || Date.parse(validUntil) >= now;
  const propertyId = asOptionalString(access.property_id);

  if (!startsOk || !endsOk || !propertyId) {
    return {
      propertyId: null,
      localAccessGranted: false,
      guestName: null,
      guestEmail: null,
      guestPhone: null,
      checkIn: null,
      checkOut: null,
      guestyReservationId: null,
    };
  }

  if (requestedPropertyId && requestedPropertyId !== propertyId) {
    return {
      propertyId: null,
      localAccessGranted: false,
      guestName: null,
      guestEmail: null,
      guestPhone: null,
      checkIn: null,
      checkOut: null,
      guestyReservationId: null,
    };
  }

  if (requestedPropertySlug) {
    const { data: propertyData, error: propertyError } = await supabase
      .from("properties")
      .select("id, slug")
      .eq("id", propertyId)
      .eq("slug", requestedPropertySlug)
      .limit(1)
      .maybeSingle();

    if (propertyError || !propertyData) {
      return {
        propertyId: null,
        localAccessGranted: false,
        guestName: null,
        guestEmail: null,
        guestPhone: null,
        checkIn: null,
        checkOut: null,
        guestyReservationId: null,
      };
    }
  }

  const metadata =
    access.metadata &&
    typeof access.metadata === "object" &&
    !Array.isArray(access.metadata)
      ? (access.metadata as Record<string, unknown>)
      : {};

  return {
    propertyId,
    localAccessGranted: true,
    guestName: asOptionalString(access.guest_name),
    guestEmail: asOptionalString(access.guest_email),
    guestPhone: asOptionalString(access.guest_phone),
    checkIn: asOptionalString(metadata.checkIn),
    checkOut: asOptionalString(metadata.checkOut),
    guestyReservationId: asOptionalString(access.guesty_reservation_id),
  };
}

function isApartmentMode(value: string | null) {
  return value === "apartment" || value === "hotel" || value === "property";
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const accessMode = asOptionalString(url.searchParams.get("accessMode"));
    const requestedPropertyId = asOptionalString(
      url.searchParams.get("propertyId")
    );
    const requestedPropertySlug = asOptionalString(
      url.searchParams.get("propertySlug")
    );
    const guestAccessToken =
      asOptionalString(url.searchParams.get("access")) ||
      asOptionalString(url.searchParams.get("guestAccessToken"));
    const response: GuestContextResponse = {
      propertyId: null,
      propertySlug: null,
      propertyName: null,
      propertyType: null,
      localAccessGranted: false,
      guestName: null,
      guestEmail: null,
      guestPhone: null,
      checkIn: null,
      checkOut: null,
      guestyReservationId: null,
    };

    if (!isApartmentMode(accessMode)) {
      return Response.json(response);
    }

    const supabase = getSupabase();
    const resolved = await resolvePropertyId(
      requestedPropertyId,
      requestedPropertySlug,
      guestAccessToken
    );

    if (!resolved.propertyId) {
      return Response.json(response);
    }

    const { data, error } = await supabase
      .from("properties")
      .select("id, slug, name, property_type")
      .eq("id", resolved.propertyId)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return Response.json(response);
    }

    const property = data as Record<string, unknown>;

    return Response.json({
      propertyId: asOptionalString(property.id),
      propertySlug: asOptionalString(property.slug),
      propertyName: asOptionalString(property.name),
      propertyType: asOptionalString(property.property_type),
      localAccessGranted: resolved.localAccessGranted,
      guestName: resolved.guestName,
      guestEmail: resolved.guestEmail,
      guestPhone: resolved.guestPhone,
      checkIn: resolved.checkIn,
      checkOut: resolved.checkOut,
      guestyReservationId: resolved.guestyReservationId,
    } satisfies GuestContextResponse);
  } catch (error) {
    console.error(
      `Could not load guest context: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );

    return Response.json(
      { error: "Could not load guest context." },
      { status: 500 }
    );
  }
}
