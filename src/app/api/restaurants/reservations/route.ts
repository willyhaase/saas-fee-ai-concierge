import { createHash } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type RateLimitEntry = { count: number; resetAt: number };

const reservationRateLimitStore = globalThis as typeof globalThis & {
  __reservationRateLimitStore?: Map<string, RateLimitEntry>;
};

type ReservationPayload = {
  restaurantName?: unknown;
  reservationDate?: unknown;
  reservationTime?: unknown;
  partySize?: unknown;
  guestName?: unknown;
  guestContact?: unknown;
  specialRequests?: unknown;
  conversationId?: unknown;
  context?: unknown;
};

type RestaurantContact = {
  restaurant_name: string | null;
  whatsapp_phone: string | null;
  accepts_whatsapp_reservations: boolean | null;
};

type PropertyContext = {
  propertyId: string | null;
  propertyName: string | null;
};

export const runtime = "nodejs";

function getEnv(name: string, fallback?: string) {
  return process.env[name] || (fallback ? process.env[fallback] : undefined);
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const firstIp = forwardedFor?.split(",")[0]?.trim();

  return (
    firstIp ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-vercel-forwarded-for") ||
    "unknown"
  );
}

function checkReservationRateLimit(req: Request) {
  const limit = 5;
  const windowSeconds = 600;
  const key = `reservation:${createHash("sha256").update(getClientIp(req)).digest("hex")}`;
  const now = Date.now();
  const resetAt = now + windowSeconds * 1000;
  const store =
    reservationRateLimitStore.__reservationRateLimitStore ??
    new Map<string, RateLimitEntry>();
  reservationRateLimitStore.__reservationRateLimitStore = store;

  for (const [storedKey, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(storedKey);
    }
  }

  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt });

    return { allowed: true, retryAfter: 0 };
  }

  existing.count += 1;
  store.set(key, existing);

  if (existing.count > limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  return { allowed: true, retryAfter: 0 };
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

function asPartySize(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 30) {
    return null;
  }

  return parsed;
}

function hashAccessToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getPayloadContext(payload: ReservationPayload) {
  return payload.context &&
    typeof payload.context === "object" &&
    !Array.isArray(payload.context)
    ? (payload.context as Record<string, unknown>)
    : {};
}

function normalizeLookup(value: string | null | undefined) {
  return value
    ?.normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeWhatsAppPhone(phone: string | null | undefined) {
  if (!phone) {
    return null;
  }

  const cleaned = phone.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+")) {
    return cleaned.slice(1);
  }

  return cleaned || null;
}

function formatTwilioWhatsAppAddress(phone: string) {
  if (phone.startsWith("whatsapp:")) {
    return phone;
  }

  const normalized = normalizeWhatsAppPhone(phone);
  return normalized ? `whatsapp:+${normalized}` : null;
}

async function resolvePropertyContext(
  supabase: SupabaseClient,
  context: Record<string, unknown>
): Promise<PropertyContext> {
  const propertySlug = asOptionalString(context.propertySlug);
  const propertyId = asOptionalString(context.propertyId);
  const guestAccessToken =
    asOptionalString(context.guestAccessToken) || asOptionalString(context.access);

  if (!guestAccessToken) {
    return { propertyId: null, propertyName: null };
  }

  const tokenHash = hashAccessToken(guestAccessToken);
  const { data: accessData, error: accessError } = await supabase
    .from("guest_property_access")
    .select("property_id, active, valid_from, valid_until")
    .eq("access_token_hash", tokenHash)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (accessError || !accessData) {
    return { propertyId: null, propertyName: null };
  }

  const access = accessData as Record<string, unknown>;
  const resolvedPropertyId = asOptionalString(access.property_id);
  const now = Date.now();
  const validFrom = asOptionalString(access.valid_from);
  const validUntil = asOptionalString(access.valid_until);

  if (
    !resolvedPropertyId ||
    (propertyId && propertyId !== resolvedPropertyId) ||
    (validFrom && Date.parse(validFrom) > now) ||
    (validUntil && Date.parse(validUntil) < now)
  ) {
    return { propertyId: null, propertyName: null };
  }

  let propertyQuery = supabase
    .from("properties")
    .select("id, name, slug")
    .eq("id", resolvedPropertyId)
    .limit(1);

  if (propertySlug) {
    propertyQuery = propertyQuery.eq("slug", propertySlug);
  }

  const { data: propertyData, error: propertyError } =
    await propertyQuery.maybeSingle();

  if (propertyError || !propertyData) {
    return { propertyId: null, propertyName: null };
  }

  const property = propertyData as Record<string, unknown>;

  return {
    propertyId: asOptionalString(property.id),
    propertyName: asOptionalString(property.name),
  };
}

async function getRestaurantContact(
  supabase: SupabaseClient,
  restaurantName: string
) {
  const { data, error } = await supabase
    .from("restaurant_contacts")
    .select("restaurant_name, whatsapp_phone, accepts_whatsapp_reservations")
    .eq("is_active", true)
    .limit(300);

  if (error || !data) {
    return null;
  }

  const normalized = normalizeLookup(restaurantName);

  return (
    (data as RestaurantContact[]).find((contact) => {
      const contactName = normalizeLookup(contact.restaurant_name);

      if (!contactName || !normalized) {
        return false;
      }

      return (
        contactName === normalized ||
        contactName.includes(normalized) ||
        normalized.includes(contactName)
      );
    }) ?? null
  );
}

function isWhatsAppConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      (process.env.TWILIO_WHATSAPP_FROM ||
        process.env.TWILIO_MESSAGING_SERVICE_SID)
  );
}

function buildReservationMessage({
  restaurantName,
  reservationDate,
  reservationTime,
  partySize,
  guestName,
  guestContact,
  specialRequests,
  propertyName,
}: {
  restaurantName: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  guestName: string;
  guestContact: string;
  specialRequests: string | null;
  propertyName: string | null;
}) {
  return [
    "Guten Tag",
    "",
    "wir möchten eine Reservierungsanfrage senden:",
    "",
    `Restaurant: ${restaurantName}`,
    `Datum: ${reservationDate}`,
    `Uhrzeit: ${reservationTime}`,
    `Personen: ${partySize}`,
    `Name: ${guestName}`,
    `Kontakt: ${guestContact}`,
    propertyName ? `Unterkunft: ${propertyName}` : null,
    specialRequests
      ? `Besondere Wünsche: ${specialRequests}`
      : "Besondere Wünsche: keine",
    "",
    "Bitte bestätigen Sie die Verfügbarkeit. Vielen Dank.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

function getTwilioContentVariables({
  restaurantName,
  reservationDate,
  reservationTime,
  partySize,
  guestName,
  guestContact,
  specialRequests,
  propertyName,
  reservationId,
}: {
  restaurantName: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  guestName: string;
  guestContact: string;
  specialRequests: string | null;
  propertyName: string | null;
  reservationId: string | null;
}) {
  return {
    "1": restaurantName,
    "2": reservationDate,
    "3": reservationTime,
    "4": String(partySize),
    "5": guestName,
    "6": guestContact,
    "7": propertyName ?? "-",
    "8": specialRequests ?? "-",
    "9": reservationId ?? "-",
  };
}

async function sendTwilioReservation({
  toPhone,
  body,
  contentVariables,
}: {
  toPhone: string;
  body: string;
  contentVariables: Record<string, string>;
}) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN.");
  }

  const params = new URLSearchParams();
  const to = formatTwilioWhatsAppAddress(toPhone);

  if (!to) {
    throw new Error("Invalid restaurant WhatsApp phone number.");
  }

  params.set("To", to);

  if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
    params.set("MessagingServiceSid", process.env.TWILIO_MESSAGING_SERVICE_SID);
  } else if (process.env.TWILIO_WHATSAPP_FROM) {
    const from = formatTwilioWhatsAppAddress(process.env.TWILIO_WHATSAPP_FROM);

    if (!from) {
      throw new Error("Invalid TWILIO_WHATSAPP_FROM.");
    }

    params.set("From", from);
  }

  if (process.env.TWILIO_RESERVATION_CONTENT_SID) {
    params.set("ContentSid", process.env.TWILIO_RESERVATION_CONTENT_SID);
    params.set("ContentVariables", JSON.stringify(contentVariables));
  } else {
    params.set("Body", body);
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
      signal: AbortSignal.timeout(8000),
    }
  );
  const responseText = await response.text();
  const data = responseText
    ? (JSON.parse(responseText) as Record<string, unknown>)
    : {};

  if (!response.ok) {
    const message =
      typeof data.message === "string"
        ? data.message
        : `Twilio returned ${response.status}`;
    const code = typeof data.code === "number" ? ` (${data.code})` : "";
    throw new Error(`${message}${code}`);
  }

  return typeof data.sid === "string" ? data.sid : null;
}

async function insertReservation(
  supabase: SupabaseClient,
  payload: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from("restaurant_reservations")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return asOptionalString((data as Record<string, unknown>).id);
}

async function updateReservation(
  supabase: SupabaseClient,
  reservationId: string | null,
  payload: Record<string, unknown>
) {
  if (!reservationId) {
    return;
  }

  const { error } = await supabase
    .from("restaurant_reservations")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", reservationId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function POST(req: Request) {
  const rateLimit = checkReservationRateLimit(req);

  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      }
    );
  }

  try {
    const payload = (await req.json()) as ReservationPayload;
    const restaurantName = asOptionalString(payload.restaurantName);
    const reservationDate = asOptionalString(payload.reservationDate);
    const reservationTime = asOptionalString(payload.reservationTime);
    const partySize = asPartySize(payload.partySize);
    const guestName = asOptionalString(payload.guestName);
    const guestContact = asOptionalString(payload.guestContact);
    const specialRequests = asOptionalString(payload.specialRequests);
    const conversationId = asOptionalString(payload.conversationId);

    if (
      !restaurantName ||
      !reservationDate ||
      !reservationTime ||
      !partySize ||
      !guestName ||
      !guestContact
    ) {
      return Response.json(
        { error: "Missing required reservation fields." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const context = getPayloadContext(payload);
    const propertyContext = await resolvePropertyContext(supabase, context);

    if (!propertyContext.propertyId) {
      return Response.json(
        { error: "A valid guest access token is required." },
        { status: 401 }
      );
    }
    const contact = await getRestaurantContact(supabase, restaurantName);
    const restaurantWhatsapp = normalizeWhatsAppPhone(contact?.whatsapp_phone);
    const body = buildReservationMessage({
      restaurantName,
      reservationDate,
      reservationTime,
      partySize,
      guestName,
      guestContact,
      specialRequests,
      propertyName: propertyContext.propertyName,
    });
    const basePayload = {
      conversation_id: conversationId,
      property_id: propertyContext.propertyId,
      restaurant_name: restaurantName,
      restaurant_whatsapp: restaurantWhatsapp,
      guest_name: guestName,
      guest_contact: guestContact,
      party_size: partySize,
      reservation_date: reservationDate,
      reservation_time: reservationTime,
      special_requests: specialRequests,
      source: "reservation_form",
      whatsapp_message_body: body,
    };

    if (
      !contact ||
      !contact.accepts_whatsapp_reservations ||
      !restaurantWhatsapp
    ) {
      const reservationId = await insertReservation(supabase, {
        ...basePayload,
        status: "needs_restaurant_contact",
        whatsapp_message_id: null,
        whatsapp_error:
          "Restaurant WhatsApp contact is missing or not enabled for reservations.",
      });

      return Response.json({
        success: true,
        reservationId,
        status: "needs_restaurant_contact",
        message:
          "Die Reservierungsanfrage wurde gespeichert, aber fuer dieses Restaurant ist noch kein WhatsApp-Kontakt hinterlegt.",
      });
    }

    if (!isWhatsAppConfigured()) {
      const reservationId = await insertReservation(supabase, {
        ...basePayload,
        status: "pending_whatsapp_config",
        whatsapp_message_id: null,
        whatsapp_error: "Twilio WhatsApp env vars are missing.",
      });

      return Response.json({
        success: true,
        reservationId,
        status: "pending_whatsapp_config",
        message:
          "Die Reservierungsanfrage wurde gespeichert, aber WhatsApp ist noch nicht vollstaendig konfiguriert.",
      });
    }

    const reservationId = await insertReservation(supabase, {
      ...basePayload,
      status: "requested",
      whatsapp_message_id: null,
      whatsapp_error: null,
    });

    try {
      const messageId = await sendTwilioReservation({
        toPhone: restaurantWhatsapp,
        body,
        contentVariables: getTwilioContentVariables({
          restaurantName,
          reservationDate,
          reservationTime,
          partySize,
          guestName,
          guestContact,
          specialRequests,
          propertyName: propertyContext.propertyName,
          reservationId,
        }),
      });

      await updateReservation(supabase, reservationId, {
        status: "sent_to_restaurant",
        whatsapp_message_id: messageId,
        whatsapp_error: null,
      });

      return Response.json({
        success: true,
        reservationId,
        status: "sent_to_restaurant",
        whatsappMessageId: messageId,
        message:
          "Die Reservierungsanfrage wurde per WhatsApp an das Restaurant gesendet. Die Reservierung ist erst nach Bestaetigung verbindlich.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown WhatsApp error.";

      await updateReservation(supabase, reservationId, {
        status: "whatsapp_failed",
        whatsapp_message_id: null,
        whatsapp_error: message,
      });

      return Response.json({
        success: true,
        reservationId,
        status: "whatsapp_failed",
        message:
          "Die Reservierungsanfrage wurde gespeichert, aber der WhatsApp-Versand ist fehlgeschlagen.",
        whatsappError: message,
      });
    }
  } catch (error) {
    console.error(
      error instanceof Error
        ? error.message
        : "Could not create restaurant reservation."
    );

    return Response.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
