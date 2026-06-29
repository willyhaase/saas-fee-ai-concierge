import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getVerifyToken() {
  return process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
}

async function verifyMetaSignature(
  request: Request,
  rawBody: string
): Promise<boolean> {
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  if (!appSecret) {
    return false;
  }

  const signature = request.headers.get("x-hub-signature-256");

  if (!signature || !signature.startsWith("sha256=")) {
    return false;
  }

  const receivedHex = signature.slice(7);
  const expectedHex = createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");

  const received = Buffer.from(receivedHex, "hex");
  const expected = Buffer.from(expectedHex, "hex");

  if (received.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(received, expected);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expectedToken = getVerifyToken();

  if (!expectedToken) {
    return NextResponse.json(
      { error: "Missing WHATSAPP_WEBHOOK_VERIFY_TOKEN." },
      { status: 500 }
    );
  }

  if (mode === "subscribe" && token === expectedToken && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json(
    { error: "Invalid WhatsApp webhook verification token." },
    { status: 403 }
  );
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const isValid = await verifyMetaSignature(request, rawBody);

  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: Record<string, unknown> | null = null;

  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const entries = Array.isArray(payload?.entry) ? payload.entry.length : 0;

  console.log("WhatsApp webhook received", {
    object: payload?.object ?? null,
    entries,
  });

  return NextResponse.json({ success: true });
}
