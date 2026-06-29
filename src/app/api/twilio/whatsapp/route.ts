import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type ReservationRow = {
  id: string;
  restaurant_name: string | null;
  restaurant_whatsapp: string | null;
  guest_name: string | null;
  guest_contact: string | null;
  party_size: number | null;
  reservation_date: string | null;
  reservation_time: string | null;
};

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

function formatTwilioWhatsAppAddress(phone: string | null | undefined) {
  if (!phone) {
    return null;
  }

  if (phone.startsWith("whatsapp:")) {
    return phone;
  }

  const normalized = normalizeWhatsAppPhone(phone);
  return normalized ? `whatsapp:+${normalized}` : null;
}

function extractReservationId(params: URLSearchParams) {
  const candidates = [
    params.get("ButtonPayload"),
    params.get("Body"),
    params.get("button_payload"),
  ].filter((value): value is string => Boolean(value));
  const uuidPattern =
    /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

  for (const value of candidates) {
    const match = value.match(uuidPattern);

    if (match) {
      return match[0];
    }
  }

  return null;
}

function isConfirmation(params: URLSearchParams) {
  const text = [
    params.get("ButtonPayload"),
    params.get("ButtonText"),
    params.get("Body"),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    text.includes("confirm") ||
    text.includes("bestät") ||
    text.includes("bestaet") ||
    text.includes("zusag")
  );
}

function validateTwilioSignature(
  request: Request,
  params: URLSearchParams,
  authToken: string
) {
  const signature = request.headers.get("x-twilio-signature");

  if (!signature) {
    return false;
  }

  const sortedEntries = [...params.entries()].sort(([left], [right]) =>
    left.localeCompare(right)
  );
  const webhookUrl = process.env.TWILIO_WEBHOOK_PUBLIC_URL || request.url;
  const signedPayload = sortedEntries.reduce(
    (current, [key, value]) => `${current}${key}${value}`,
    webhookUrl
  );
  const expected = createHmac("sha1", authToken)
    .update(signedPayload)
    .digest("base64");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

async function sendGuestConfirmation(reservation: ReservationRow) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = formatTwilioWhatsAppAddress(process.env.TWILIO_WHATSAPP_FROM);
  const to = formatTwilioWhatsAppAddress(reservation.guest_contact);

  if (!accountSid || !authToken || !from) {
    throw new Error("Missing Twilio sender configuration.");
  }

  if (!to) {
    throw new Error("Guest WhatsApp contact is missing or invalid.");
  }

  const params = new URLSearchParams({
    From: from,
    To: to,
  });
  const contentSid = process.env.TWILIO_GUEST_CONFIRMATION_CONTENT_SID;

  if (contentSid) {
    params.set("ContentSid", contentSid);
    params.set(
      "ContentVariables",
      JSON.stringify({
        "1": reservation.guest_name ?? "Gast",
        "2": reservation.restaurant_name ?? "Restaurant",
        "3": reservation.reservation_date ?? "-",
        "4": reservation.reservation_time ?? "-",
        "5": String(reservation.party_size ?? "-"),
      })
    );
  } else {
    params.set(
      "Body",
      [
        `Hallo ${reservation.guest_name ?? ""}`.trim(),
        "",
        `Ihre Tischreservierung im Restaurant ${
          reservation.restaurant_name ?? "-"
        } am ${reservation.reservation_date ?? "-"} um ${
          reservation.reservation_time ?? "-"
        } Uhr für ${reservation.party_size ?? "-"} Personen wurde bestätigt.`,
        "",
        "Saas-Fee Concierge",
      ].join("\n")
    );
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

function twiml(status = 200) {
  return new Response("<Response></Response>", {
    status,
    headers: { "Content-Type": "text/xml" },
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const params = new URLSearchParams(body);
  const authToken =
    process.env.TWILIO_WEBHOOK_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN;

  if (!authToken) {
    return NextResponse.json(
      { error: "Missing TWILIO_WEBHOOK_AUTH_TOKEN or TWILIO_AUTH_TOKEN." },
      { status: 500 }
    );
  }

  if (!validateTwilioSignature(request, params, authToken)) {
    return NextResponse.json(
      { error: "Invalid Twilio webhook signature." },
      { status: 403 }
    );
  }

  if (!isConfirmation(params)) {
    return twiml();
  }

  const supabase = getSupabase();
  const reservationId = extractReservationId(params);
  let reservation: ReservationRow | null = null;

  if (reservationId) {
    const { data, error } = await supabase
      .from("restaurant_reservations")
      .select(
        "id, restaurant_name, restaurant_whatsapp, guest_name, guest_contact, party_size, reservation_date, reservation_time"
      )
      .eq("id", reservationId)
      .maybeSingle();

    if (error) {
      throw new Error(`Could not load reservation: ${error.message}`);
    }

    reservation = (data as ReservationRow | null) ?? null;
  } else {
    const fromPhone = normalizeWhatsAppPhone(params.get("From"));
    const { data, error } = await supabase
      .from("restaurant_reservations")
      .select(
        "id, restaurant_name, restaurant_whatsapp, guest_name, guest_contact, party_size, reservation_date, reservation_time"
      )
      .eq("restaurant_whatsapp", fromPhone)
      .eq("status", "sent_to_restaurant")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Could not find reservation by sender: ${error.message}`);
    }

    reservation = (data as ReservationRow | null) ?? null;
  }

  if (!reservation) {
    console.error("Twilio confirmation webhook did not match a reservation.", {
      from: params.get("From"),
      body: params.get("Body"),
      buttonText: params.get("ButtonText"),
    });
    return twiml();
  }

  let guestMessageId: string | null = null;
  let guestError: string | null = null;

  try {
    guestMessageId = await sendGuestConfirmation(reservation);
  } catch (error) {
    guestError =
      error instanceof Error ? error.message : "Unknown guest WhatsApp error.";
    console.error(`Guest confirmation send failed: ${guestError}`);
  }

  const { error: updateError } = await supabase
    .from("restaurant_reservations")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
      confirmed_by_phone: normalizeWhatsAppPhone(params.get("From")),
      guest_confirmation_message_id: guestMessageId,
      guest_confirmation_error: guestError,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reservation.id);

  if (updateError) {
    throw new Error(`Could not update reservation: ${updateError.message}`);
  }

  return twiml();
}
