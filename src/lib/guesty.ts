import { createHash, createHmac } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

type GuestyTokenResponse = {
  access_token?: unknown;
  expires_in?: unknown;
};

type GuestyReservation = {
  id: string;
  listingId: string | null;
  guestId: string | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  status: string | null;
  checkIn: string | null;
  checkOut: string | null;
  raw: Record<string, unknown>;
};

type GuestySyncProperty = {
  id: string;
  slug: string | null;
  property_type: string | null;
  guesty_listing_id: string | null;
};

export type GuestySyncOptions = {
  dryRun?: boolean;
};

export type GuestySyncResult = {
  dryRun: boolean;
  fetched: number;
  matched: number;
  upserted: number;
  skipped: Array<{
    reservationId: string | null;
    listingId: string | null;
    reason: string;
  }>;
  guestLinks: Array<{
    reservationId: string;
    propertyId: string;
    propertySlug: string | null;
    guestName: string | null;
    validFrom: string | null;
    validUntil: string | null;
    url: string | null;
  }>;
};

let cachedToken: { token: string; expiresAt: number } | null = null;

function getEnv(name: string, fallback?: string) {
  return process.env[name] || (fallback ? process.env[fallback] : undefined);
}

function requireEnv(name: string, fallback?: string) {
  const value = getEnv(name, fallback);

  if (!value) {
    throw new Error(`Missing ${name}${fallback ? ` or ${fallback}` : ""}.`);
  }

  return value;
}

function asOptionalString(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    const stringValue = asOptionalString(value);

    if (stringValue) {
      return stringValue;
    }
  }

  return null;
}

function getNestedString(
  object: Record<string, unknown>,
  ...paths: string[][]
) {
  for (const path of paths) {
    let current: unknown = object;

    for (const segment of path) {
      const record = asRecord(current);
      current = record?.[segment];
    }

    const value = asOptionalString(current);

    if (value) {
      return value;
    }
  }

  return null;
}

function getGuestName(guest: Record<string, unknown> | null) {
  if (!guest) {
    return null;
  }

  const fullName = firstString(guest.fullName, guest.name);

  if (fullName) {
    return fullName;
  }

  const firstName = asOptionalString(guest.firstName);
  const lastName = asOptionalString(guest.lastName);

  return [firstName, lastName].filter(Boolean).join(" ") || null;
}

function getGuestEmail(guest: Record<string, unknown> | null) {
  if (!guest) {
    return null;
  }

  const email = firstString(guest.email, guest.mail);

  if (email) {
    return email;
  }

  const emails = Array.isArray(guest.emails) ? guest.emails : [];
  return firstString(...emails);
}

function getGuestPhone(guest: Record<string, unknown> | null) {
  if (!guest) {
    return null;
  }

  const phone = firstString(
    guest.phone,
    guest.phoneNumber,
    guest.mobile,
    guest.mobilePhone
  );

  if (phone) {
    return phone;
  }

  const phones = Array.isArray(guest.phones) ? guest.phones : [];
  return firstString(...phones);
}

function getDateWindow() {
  const pastDays = Number(process.env.GUESTY_SYNC_PAST_DAYS ?? 7);
  const futureDays = Number(process.env.GUESTY_SYNC_FUTURE_DAYS ?? 365);
  const from = new Date();
  const to = new Date();

  from.setUTCDate(from.getUTCDate() - (Number.isFinite(pastDays) ? pastDays : 7));
  to.setUTCDate(
    to.getUTCDate() + (Number.isFinite(futureDays) ? futureDays : 365)
  );

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

function getAllowedStatuses() {
  return (
    process.env.GUESTY_RESERVATION_STATUSES ??
    "confirmed,reserved,checked_in,checked-in"
  )
    .split(",")
    .map((status) => status.trim().toLowerCase())
    .filter(Boolean);
}

function hashAccessToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getReservationAccessToken(reservationId: string) {
  const secret = requireEnv("GUESTY_GUEST_LINK_SECRET");

  return createHmac("sha256", secret)
    .update(`guesty-reservation:${reservationId}`)
    .digest("hex");
}

function buildGuestUrl(
  requestUrl: string,
  property: GuestySyncProperty,
  accessToken: string
) {
  if (!property.slug) {
    return null;
  }

  const publicBaseUrl =
    getEnv("GUESTY_GUEST_LINK_BASE_URL", "NEXT_PUBLIC_SITE_URL") ||
    new URL(requestUrl).origin;
  const path =
    property.property_type === "hotel"
      ? `/hotels/${property.slug}`
      : `/apartments/${property.slug}`;
  const url = new URL(path, publicBaseUrl);
  url.searchParams.set("access", accessToken);

  return url.toString();
}

function getAuthEndpoints() {
  return {
    tokenUrl:
      process.env.GUESTY_TOKEN_URL ??
      "https://open-api.guesty.com/oauth2/token",
    apiBaseUrl:
      process.env.GUESTY_API_BASE_URL ?? "https://open-api.guesty.com/v1",
  };
}

async function getGuestyAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }

  const { tokenUrl } = getAuthEndpoints();
  const clientId = requireEnv("GUESTY_CLIENT_ID");
  const clientSecret = requireEnv("GUESTY_CLIENT_SECRET");
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });
  const scope = asOptionalString(process.env.GUESTY_OAUTH_SCOPE);

  if (scope) {
    body.set("scope", scope);
  }

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Guesty token request failed: ${response.status} ${text}`);
  }

  const payload = JSON.parse(text) as GuestyTokenResponse;
  const token = asOptionalString(payload.access_token);

  if (!token) {
    throw new Error("Guesty token response did not include access_token.");
  }

  const expiresIn =
    typeof payload.expires_in === "number" && payload.expires_in > 0
      ? payload.expires_in
      : 3600;

  cachedToken = {
    token,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  return token;
}

function getArrayPayload(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload;
  }

  const record = asRecord(payload);

  if (!record) {
    return [];
  }

  for (const key of ["results", "data", "items", "reservations"]) {
    if (Array.isArray(record[key])) {
      return record[key] as unknown[];
    }
  }

  return [];
}

function normalizeReservation(value: unknown): GuestyReservation | null {
  const reservation = asRecord(value);

  if (!reservation) {
    return null;
  }

  const listing = asRecord(reservation.listing);
  const guest =
    asRecord(reservation.guest) ||
    asRecord(reservation.guestDetails) ||
    asRecord(reservation.guestInfo);
  const id = firstString(reservation._id, reservation.id, reservation.uid);

  if (!id) {
    return null;
  }

  return {
    id,
    listingId: firstString(
      reservation.listingId,
      reservation.listing_id,
      reservation.listing,
      listing?._id,
      listing?.id
    ),
    guestId: firstString(
      reservation.guestId,
      reservation.guest_id,
      guest?._id,
      guest?.id
    ),
    guestName:
      getGuestName(guest) ||
      getNestedString(reservation, ["guest", "fullName"], ["guest", "name"]),
    guestEmail: getGuestEmail(guest),
    guestPhone: getGuestPhone(guest),
    status: firstString(reservation.status, reservation.confirmationStatus),
    checkIn: firstString(
      reservation.checkIn,
      reservation.check_in,
      reservation.arrivalDate,
      reservation.startDate,
      getNestedString(reservation, ["checkInDateLocalized"])
    ),
    checkOut: firstString(
      reservation.checkOut,
      reservation.check_out,
      reservation.departureDate,
      reservation.endDate,
      getNestedString(reservation, ["checkOutDateLocalized"])
    ),
    raw: reservation,
  };
}

async function fetchGuestyReservations() {
  const token = await getGuestyAccessToken();
  const { apiBaseUrl } = getAuthEndpoints();
  const reservationsPath = process.env.GUESTY_RESERVATIONS_PATH ?? "/reservations";
  const url = new URL(reservationsPath, apiBaseUrl);
  const { from, to } = getDateWindow();

  url.searchParams.set("limit", process.env.GUESTY_SYNC_LIMIT ?? "100");
  url.searchParams.set("checkInFrom", from);
  url.searchParams.set("checkOutTo", to);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `Guesty reservations request failed: ${response.status} ${text}`
    );
  }

  return getArrayPayload(JSON.parse(text))
    .map(normalizeReservation)
    .filter((reservation): reservation is GuestyReservation =>
      Boolean(reservation)
    );
}

async function getPropertiesByGuestyListingId(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("properties")
    .select("id, slug, property_type, guesty_listing_id")
    .not("guesty_listing_id", "is", null);

  if (error) {
    throw new Error(`Could not load Guesty-mapped properties: ${error.message}`);
  }

  const map = new Map<string, GuestySyncProperty>();

  for (const property of (data ?? []) as GuestySyncProperty[]) {
    if (property.guesty_listing_id) {
      map.set(property.guesty_listing_id, property);
    }
  }

  return map;
}

function getValidity(reservation: GuestyReservation) {
  const validFrom = reservation.checkIn
    ? new Date(reservation.checkIn)
    : new Date();
  const validUntil = reservation.checkOut
    ? new Date(reservation.checkOut)
    : new Date();

  validFrom.setUTCDate(validFrom.getUTCDate() - 1);
  validUntil.setUTCDate(validUntil.getUTCDate() + 1);

  return {
    validFrom: Number.isNaN(validFrom.getTime()) ? null : validFrom.toISOString(),
    validUntil: Number.isNaN(validUntil.getTime())
      ? null
      : validUntil.toISOString(),
  };
}

export async function syncGuestyReservations(
  supabase: SupabaseClient,
  requestUrl: string,
  options: GuestySyncOptions = {}
): Promise<GuestySyncResult> {
  const reservations = await fetchGuestyReservations();
  const propertiesByListingId = await getPropertiesByGuestyListingId(supabase);
  const allowedStatuses = getAllowedStatuses();
  const result: GuestySyncResult = {
    dryRun: options.dryRun === true,
    fetched: reservations.length,
    matched: 0,
    upserted: 0,
    skipped: [],
    guestLinks: [],
  };

  for (const reservation of reservations) {
    const status = reservation.status?.toLowerCase() ?? null;

    if (status && !allowedStatuses.includes(status)) {
      result.skipped.push({
        reservationId: reservation.id,
        listingId: reservation.listingId,
        reason: `status:${status}`,
      });
      continue;
    }

    if (!reservation.listingId) {
      result.skipped.push({
        reservationId: reservation.id,
        listingId: null,
        reason: "missing_listing_id",
      });
      continue;
    }

    const property = propertiesByListingId.get(reservation.listingId);

    if (!property) {
      result.skipped.push({
        reservationId: reservation.id,
        listingId: reservation.listingId,
        reason: "unmapped_listing_id",
      });
      continue;
    }

    result.matched += 1;

    const rawAccessToken = getReservationAccessToken(reservation.id);
    const { validFrom, validUntil } = getValidity(reservation);
    const guestLink = {
      reservationId: reservation.id,
      propertyId: property.id,
      propertySlug: property.slug,
      guestName: reservation.guestName,
      validFrom,
      validUntil,
      url: buildGuestUrl(requestUrl, property, rawAccessToken),
    };

    result.guestLinks.push(guestLink);

    if (options.dryRun) {
      continue;
    }

    const { error } = await supabase.from("guest_property_access").upsert(
      {
        property_id: property.id,
        access_token_hash: hashAccessToken(rawAccessToken),
        label: reservation.guestName
          ? `Guesty: ${reservation.guestName}`
          : `Guesty reservation ${reservation.id}`,
        active: true,
        valid_from: validFrom,
        valid_until: validUntil,
        guesty_reservation_id: reservation.id,
        guesty_guest_id: reservation.guestId,
        guest_name: reservation.guestName,
        guest_email: reservation.guestEmail,
        guest_phone: reservation.guestPhone,
        source: "guesty",
        metadata: {
          status: reservation.status,
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          listingId: reservation.listingId,
        },
        last_synced_at: new Date().toISOString(),
      },
      {
        onConflict: "guesty_reservation_id",
      }
    );

    if (error) {
      throw new Error(
        `Could not upsert Guesty access for ${reservation.id}: ${error.message}`
      );
    }

    result.upserted += 1;
  }

  return result;
}
