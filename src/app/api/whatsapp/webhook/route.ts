import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getVerifyToken() {
  return process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
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
  const payload = (await request.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  const entries = Array.isArray(payload?.entry) ? payload.entry.length : 0;

  console.log("WhatsApp webhook received", {
    object: payload?.object ?? null,
    entries,
  });

  return NextResponse.json({ success: true });
}
